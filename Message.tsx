import styles from "./Message.module.scss"
import clsx from "clsx"
import {
  Download,
  Globe as GlobeIcon,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  VolumeX,
  Play,
  FileText,
  LogIn,
  Coins,
  Sparkles,
} from "./icons"
import Modal from "./Modal"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useNavigationContext,
  useApp,
  useError,
  useData,
  useChat,
} from "./context/providers"
import { useTheme, usePlatform } from "./platform"
import type {
  message,
  aiAgent,
  user,
  guest,
  thread,
  app,
  webSearchResult,
} from "./types"
import MarkdownContent from "./MarkdownContent"

import { BrowserInstance, checkIsExtension, isOwner, apiFetch } from "./utils"
import Loading from "./Loading"
import ConfirmButton from "./ConfirmButton"

import { Check, Copy } from "./icons"

import { useEffect, useMemo, useState } from "react"
import { deleteMessage, updateMessage, updateThread } from "./lib"
import toast from "react-hot-toast"
import Img from "./Image"
import { useThreadPresence } from "./hooks/useThreadPresence"
import { useWebSocket } from "./hooks/useWebSocket"
import {
  Claude,
  DeepSeek,
  Flux,
  Gemini,
  OpenAI,
  Perplexity,
} from "@lobehub/icons"
import { AudioPlayer } from "react-audio-play"
import { checkSpeechLimits } from "./lib/speechLimits"
import { stripMarkdown } from "./lib/stripMarkdown"
import Logo from "./Logo"

export default function Message({
  onDelete,
  onToggleLike,
  message,
  onPlayAudio,
}: {
  message: {
    message: message & {
      isStreaming?: boolean
      isStreamingStop?: boolean
    }
    user?: user
    guest?: guest
    aiAgent?: aiAgent
    thread?: thread
    parentMessage?: message
  }
  onDelete?: ({ id }: { id: string }) => Promise<void>
  onToggleLike?: (liked: boolean | undefined) => void
  onPlayAudio?: () => void
}): React.ReactElement | null {
  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
  const {
    language,
    token,
    user,
    guest,
    API_URL,
    FRONTEND_URL,
    setUser,
    setGuest,
    deviceId,
    timeAgo,
  } = useAuth()

  const { isAccountVisible, setIsAccountVisible } = useNavigationContext()
  const { refetchThread, messages } = useChat()
  // Navigation context (router is the wrapper)
  const { router, addParams } = useNavigationContext()

  // App context
  const { slug, apps, setApp, app } = useApp()

  // Error context
  const { captureException } = useError()

  // Platform context
  const { os } = usePlatform()

  // Theme context
  const { addHapticFeedback } = useTheme()

  const ownerId = user?.id || guest?.id

  const { typingUsers, onlineUsers } = useThreadPresence({
    threadId: message.message.threadId,
  })

  const isTyping = typingUsers.some(
    (u) =>
      (u.userId && u.userId === message.user?.id) ||
      (u.guestId && u.guestId === message.guest?.id),
  )

  const [isAppSelectOpen, setIsAppSelectOpen] = useState(false)
  const [isUpdatingApp, setIsUpdatingApp] = useState(false)
  const [liked, setLiked] = useState<boolean | undefined>(undefined)
  const [disliked, setDisliked] = useState<boolean | undefined>(undefined)
  const [isSpeechActive, setIsSpeechActive] = useState(false)
  const [isSpeechLoading, setIsSpeechLoading] = useState(false)

  const limitCheck = useMemo(() => {
    return user || guest
      ? user
        ? checkSpeechLimits({
            user,
            textLength: message.message.content.length,
          })
        : guest
          ? checkSpeechLimits({
              guest,
              textLength: message.message.content.length,
            })
          : { allowed: false }
      : { allowed: false }
  }, [user, guest, message.message.content.length])

  const [speech, setSpeech] = useState<HTMLAudioElement | null>(null)

  const handleUpdateAgent = async (app?: app) => {
    if (!token) return
    addHapticFeedback()
    setIsAppSelectOpen(false)
    setIsUpdatingApp(true)

    try {
      const result = await updateThread({
        id: message.message.threadId,
        appId: app ? app.id : null,
        token,
      })

      if (result.error) {
        toast.error(result.error)
        setIsUpdatingApp(false)
        return
      }

      setApp(app)

      toast.success(t("Updated"))
    } catch (error) {
      console.error(error)
    } finally {
      setIsUpdatingApp(false)
    }
  }

  const playAIResponseWithTTS = async (text: string) => {
    if (speech) {
      speech.pause()
      speech.currentTime = 0
      setSpeech(null)
      setIsSpeechActive(false)
      return
    }
    setIsSpeechLoading(true)
    onPlayAudio?.()

    try {
      const response = await apiFetch(`${API_URL}/tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ text }),
      })

      const data = await response.json()

      if (data.usage) {
        user &&
          setUser({
            ...user,
            speechRequestsToday: data.usage.requestsToday,
            speechRequestsThisHour: data.usage.requestsThisHour,
            speechCharactersToday: data.usage.charactersToday,
          })

        guest &&
          setGuest({
            ...guest,
            speechRequestsToday: data.usage.requestsToday,
            speechRequestsThisHour: data.usage.requestsThisHour,
            speechCharactersToday: data.usage.charactersToday,
          })
      }

      if (data.error) {
        toast.error(data.error)
        return
      }

      if (data.audio) {
        setIsSpeechLoading(false)
        setIsSpeechActive(true)
        // Play ElevenLabs audio
        const audio = new Audio(data.audio)
        audio.onended = () => {
          setIsSpeechActive(false)
          setSpeech(null)
        }

        audio.onerror = () => {
          setIsSpeechActive(false)
          setSpeech(null)
        }

        try {
          setSpeech(audio)
          await audio.play()
        } catch (error) {
          captureException(error)
          console.error("Audio play failed, falling back to Web Speech:", error)
          // ios audio fallback to Web Speech API
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(text)
            utterance.onend = () => {}
            speechSynthesis.speak(utterance)
          }
        }
      }
    } catch (error) {
      captureException(error)
      console.error("TTS playback error:", error)
      // Continue conversation even if TTS fails
    }
  }
  useEffect(() => {
    setLiked(
      message.message?.reactions?.some(
        (r) =>
          isOwner(r, {
            userId: user?.id,
            guestId: guest?.id,
          }) && r.like,
      ),
    )
    setDisliked(
      message.message?.reactions?.some(
        (r) =>
          isOwner(r, {
            userId: user?.id,
            guestId: guest?.id,
          }) && r.dislike,
      ),
    )
  }, [message.message.reactions, user, guest])

  const [isSearchStart, setIsSearchStart] = useState(false)
  useEffect(() => {
    setIsSearchStart(
      !!message.parentMessage?.isWebSearchEnabled &&
        !!message.message.isStreaming,
    )
  }, [message.parentMessage?.isWebSearchEnabled, message.message.isStreaming])

  const [webSearchResult, setWebSearchResult] = useState<webSearchResult[]>(
    message.parentMessage?.webSearchResult || [],
  )

  const { actions } = useData()

  useEffect(() => {
    setWebSearchResult(message.parentMessage?.webSearchResult || [])
  }, [message.parentMessage?.webSearchResult])

  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text: string) => {
    addHapticFeedback()
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success(t("Copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy code")
    }
  }

  const [remoteDeleted, setRemoteDeleted] = useState(false)

  useWebSocket<{
    type: string
    data: {
      id?: string
      message?: {
        message: message
        user?: user
        guest?: guest
        aiAgent?: aiAgent
      }
    }
  }>({
    onMessage: async ({ type, data }) => {
      if (!token) return

      if (
        !owner &&
        type === "delete_message" &&
        data.id === message.message.id
      ) {
        setIsDeleting(true)

        setRemoteDeleted(true)
      }

      if (
        type === "message_update" &&
        data.message?.message.id === message.message.id
      ) {
        data.message?.message.images?.length &&
          setImages(data.message?.message.images)
        data.message?.message.video?.length &&
          setVideo(data.message?.message.video)
        data.message?.message.audio?.length &&
          setAudio(data.message?.message.audio)

        await refetchThread()
      }

      if (
        message?.message?.id &&
        message?.message?.id !== data?.message?.message?.clientId
      )
        return
    },
    token,
    deviceId,
  })

  const [isDeleting, setIsDeleting] = useState(false)

  const downloadImage = async (imageUrl: string, imageName?: string) => {
    addHapticFeedback()
    try {
      const response = await apiFetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = imageName || `vex-image-${Date.now()}.webp`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      captureException(error)
      console.error("Download failed:", error)
      toast.error(t("Failed to download image"))
    }
  }

  const toggleLike = async () => {
    addHapticFeedback()
    if (!token) return

    const newLiked = liked ? undefined : !liked
    setLiked(newLiked)
    setDisliked(false)

    await actions.updateMessage({
      messageId: message.message.id,
      like: newLiked ?? null,
    })

    onToggleLike?.(newLiked)
  }

  const [images, setImages] = useState<
    | {
        url: string
        prompt: string
        model?: string
        width?: number
        height?: number
        title?: string
        id: string
      }[]
    | null
  >(message.message.images)

  const [video, setVideo] = useState<
    | {
        url: string
        size?: number
        title?: string
        id: string
      }[]
    | null
  >(message.message.video || null)

  const [audio, setAudio] = useState<
    | {
        url: string
        size?: number
        title?: string
        id: string
      }[]
    | null
  >(message.message.audio)

  useEffect(() => {
    setVideo(message.message.video)
    setAudio(message.message.audio)
    setFiles(message.message.files)
  }, [message.message.video, message.message.audio, message.message.files])

  const [files, setFiles] = useState<
    | {
        type: string
        url?: string
        name: string
        size: number
        data?: string
        id: string
      }[]
    | null
  >(message.message.files)

  const toggleDislike = () => {
    addHapticFeedback()
    if (!token) return

    const newDisliked = disliked ? undefined : !disliked
    setDisliked(newDisliked)
    setLiked(false)
    updateMessage({
      token,
      messageId: message.message.id,
      like: newDisliked ? false : null,
    })

    onToggleLike?.(newDisliked)
  }

  const getLikeButtons = () => {
    if (message.message.isStreamingStop || message.message.isStreaming)
      return null

    return (
      <div className={styles.likeButtons}>
        <button
          data-testid={`${liked ? "unlike-button" : "like-button"}`}
          title={liked ? t("Unlike") : t("Like")}
          className={clsx("link", styles.likeButton)}
          onClick={toggleLike}
        >
          {liked ? (
            <ThumbsUp color="var(--accent-1)" size={16} />
          ) : (
            <ThumbsUp color="var(--shade-3)" size={16} />
          )}
        </button>

        <button
          data-testid={`${disliked ? "undislike-button" : "dislike-button"}`}
          title={disliked ? t("Unlike") : t("Dislike")}
          className={clsx("link", styles.dislikeButton)}
          onClick={toggleDislike}
        >
          {disliked ? (
            <ThumbsDown color="var(--accent-1)" size={16} />
          ) : (
            <ThumbsDown color="var(--shade-3)" size={16} />
          )}
        </button>
      </div>
    )
  }

  const owner = isOwner(message.message, {
    userId: user?.id,
    guestId: guest?.id,
  })

  // Don't render messages that have no user, guest, or agent association

  const threadOwner =
    message.thread &&
    isOwner(message.thread, {
      userId: user?.id,
      guestId: guest?.id,
    })

  const canDelete = owner || threadOwner

  const [selectedFile, setSelectedFile] = useState<{
    type: string
    url?: string
    name: string
    size: number
    data?: string
    id: string
  } | null>(null)

  const [requiresLogin, setRequiresLogin] = useState(false)
  const [requiresSubscription, setRequiresSubscription] = useState(false)

  useEffect(() => {
    if (!limitCheck.allowed) {
      user && !user.subscription
        ? setRequiresSubscription(true)
        : guest && !guest.subscription
          ? setRequiresSubscription(true)
          : setRequiresLogin(true)
    }
  }, [limitCheck, user, guest])

  const [evenChance] = useState(Math.random() >= 0.5)

  const getDeleteMessage = () => {
    if (
      !canDelete ||
      remoteDeleted ||
      message.message.isStreamingStop ||
      !message.message.threadId
    ) {
      return null
    }

    const messageId = message.message.id

    if (message.message.isStreaming || !token) return null

    return (
      <ConfirmButton
        data-testid="delete-message"
        className={clsx("link", styles.deleteButton)}
        confirm={
          <>
            {isDeleting ? (
              <Loading color="var(--accent-0)" width={18} height={16} />
            ) : (
              <Trash2 color="var(--accent-0)" size={18} />
            )}
            {t("Are you sure?")}
          </>
        }
        onConfirm={async function () {
          setIsDeleting(true)

          if (message.message.isStreamingStop) {
            await onDelete?.({ id: message.message.id })
            return
          }

          try {
            const response = await actions.deleteMessage(messageId)

            if (response.error) {
              toast.error(response.error)
            } else {
              await onDelete?.({ id: message.message.id })
              toast.success(t("Message deleted successfully"))
            }
          } catch (error) {
            captureException(error)
            console.error(error)
          } finally {
            setIsDeleting(false)
          }
        }}
      >
        <Trash2 color="var(--accent-1)" size={16} />
      </ConfirmButton>
    )
  }

  if (
    !message.message.guestId &&
    !message.message.userId &&
    !message.message.agentId
  ) {
    return null
  }

  const userImage =
    message.user?.id === user?.id
      ? (user?.image ?? message.user?.image)
      : message.user?.image

  if (!message.message.agentId) {
    return (
      <div className={styles.message} data-testid="message">
        {selectedFile && (
          <Modal
            hasCloseButton
            isModalOpen={!!selectedFile}
            icon={<FileText />}
            onToggle={() => {
              addHapticFeedback()
              setSelectedFile(null)
            }}
            title={selectedFile.name}
            scrollable
          >
            <div>{selectedFile.data}</div>
          </Modal>
        )}
        <div
          data-testid={user?.id ? "user-message" : "guest-message"}
          key={message.message.id}
          className={clsx(styles.userMessageContainer, owner && styles.owner)}
        >
          <span
            className={clsx(
              styles.userIcon,
              styles.mobile,
              owner && styles.owner,
            )}
          >
            {owner && (
              <span className={styles.userMessageTime}>
                {timeAgo(message.message.createdOn, language)}
              </span>
            )}

            <button
              onClick={() => {
                if (user) {
                  setIsAccountVisible(true)

                  return
                }

                addParams({ subscribe: "true", plan: "member" })
              }}
              type="button"
              className={"link"}
            >
              {userImage ? (
                <Img
                  className={styles.userImage}
                  src={userImage}
                  key={userImage}
                  width={40}
                  height={40}
                  alt={message.user?.name || ""}
                />
              ) : (
                <Img
                  showLoading={false}
                  src={`${FRONTEND_URL}/images/pacman/space-invader.png`}
                  alt="Space Invader"
                  width={35}
                  height={35}
                />
              )}
            </button>
            {!owner && (
              <span className={styles.userMessageTime}>
                {timeAgo(message.message.createdOn, language)}
              </span>
            )}
          </span>
          {!owner && (
            <span className={clsx(styles.userIcon, styles.tablet)}>
              <button
                onClick={() => {
                  if (user) {
                    setIsAccountVisible(true)
                    return
                  }

                  addParams({ subscribe: "true", plan: "member" })
                }}
                type="button"
                className={"link"}
              >
                {userImage ? (
                  <Img
                    className={styles.userImage}
                    src={userImage}
                    width={40}
                    height={40}
                    key={userImage}
                    alt={message.user?.name || ""}
                  />
                ) : (
                  <Img
                    showLoading={false}
                    src={`${FRONTEND_URL}/images/pacman/space-invader.png`}
                    alt="Space Invader"
                    width={35}
                    height={35}
                  />
                )}
              </button>
            </span>
          )}
          <div className={clsx(styles.userMessage, owner && styles.owner)}>
            <span className={styles.name}>
              <div
                className={clsx(
                  styles.presenceIndicator,
                  // Show online if: current user, actively typing, or in online users list
                  isTyping ||
                    message.user?.id === ownerId ||
                    message.guest?.id === ownerId ||
                    onlineUsers.some(
                      (u) =>
                        u.userId === message.user?.id ||
                        u.guestId === message.guest?.id,
                    )
                    ? styles.online
                    : styles.offline,
                )}
              />
              {
                <span className={styles.nameWithPresence}>
                  {owner
                    ? t("You")
                    : message.user?.name || message.user?.email || t("Guest")}
                </span>
              }
              {isTyping && (
                <div data-testid="typing-indicator" className={styles.dots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              )}
            </span>
            {remoteDeleted ? (
              <div
                style={{ marginTop: 5 }}
                className={styles.userMessageContent}
              >
                <span>
                  {t(
                    !threadOwner
                      ? "Thread owner deleted this message"
                      : "Message deleted permanently",
                  )}
                </span>
              </div>
            ) : (
              <>
                {images?.length ? (
                  <div
                    data-testid="user-message-images"
                    className={styles.userMessageImages}
                  >
                    {images.map((image) => (
                      <Img
                        dataTestId="user-message-image"
                        key={image.id}
                        src={image.url}
                        alt={image.title}
                        size={200}
                      />
                    ))}
                  </div>
                ) : null}
                {audio?.length ? (
                  <div
                    data-testid="user-message-audios"
                    className={styles.userMessageAudio}
                  >
                    {audio.map((audio) => (
                      <div data-testid="user-message-audio" key={audio.id}>
                        <AudioPlayer
                          src={audio.url}
                          color="var(--accent-1)"
                          sliderColor="var(--accent-1)"
                          style={{
                            background: "var(--background)",
                            borderRadius: "20px",
                            padding: "0 20px",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}
                {video?.length ? (
                  <div
                    data-testid="user-message-videos"
                    className={styles.userMessageVideo}
                  >
                    {video.map((video) => (
                      <div data-testid="user-message-video" key={video.id}>
                        <video controls src={video.url} />
                      </div>
                    ))}
                  </div>
                ) : null}
                {files?.length ? (
                  <div
                    data-testid="user-message-files"
                    className={styles.userMessageFiles}
                  >
                    {files.map((file) => {
                      if (file.type === "pdf") {
                        return (
                          <a
                            data-testid="user-message-pdf"
                            key={file.id}
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={clsx(
                              "button inverted",
                              styles.userMessageFile,
                            )}
                          >
                            <FileText size={16} />
                            {file.name}
                          </a>
                        )
                      } else {
                        return (
                          <button
                            data-testid="user-message-text"
                            className={clsx("inverted", styles.userMessageFile)}
                            onClick={() => {
                              addHapticFeedback()
                              setSelectedFile(file)
                            }}
                            key={file.id}
                          >
                            <FileText size={16} /> {file.name}
                          </button>
                        )
                      }
                    })}
                  </div>
                ) : null}
                <MarkdownContent
                  data-testid="user-message-content"
                  className={styles.userMessageContent}
                  content={message.message.content}
                  webSearchResults={
                    message.message.webSearchResult || undefined
                  }
                />
              </>
            )}
            <div className={styles.footer}>
              <div className={styles.left}>
                <button
                  onClick={() => copyToClipboard(message.message.content)}
                  className={clsx(
                    "link",
                    styles.copyButton,
                    copied && styles.copied,
                  )}
                  title="Copy code"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
                {getDeleteMessage()}
                <span className={clsx(styles.userMessageTime)}>
                  {timeAgo(message.message.createdOn, language)}
                </span>
              </div>
              {getLikeButtons()}
            </div>
          </div>
          {owner && (
            <span className={clsx(styles.userIcon, styles.tablet)}>
              <button
                onClick={() => {
                  if (user) {
                    setIsAccountVisible(true)
                    return
                  }

                  addParams({ subscribe: "true", plan: "member" })
                }}
                type="button"
                className={"link"}
              >
                {userImage ? (
                  <Img
                    className={styles.userImage}
                    src={userImage}
                    size={40}
                    key={userImage}
                    alt={message.user?.name || ""}
                  />
                ) : (
                  <Img
                    showLoading={false}
                    src={`${FRONTEND_URL}/images/pacman/space-invader.png`}
                    alt="Space Invader"
                    size={35}
                  />
                )}
              </button>
            </span>
          )}
        </div>
      </div>
    )
  }

  const agent = message.aiAgent

  return (
    <div className={styles.message} data-testid="message">
      <Modal
        isModalOpen={isAppSelectOpen}
        hasCloseButton={true}
        onToggle={(open) => {
          setIsAppSelectOpen(open)
        }}
        icon={
          <video
            className={styles.video}
            src={`${FRONTEND_URL}/video/blob.mp4`}
            autoPlay
            loop
            muted
            playsInline
          ></video>
        }
        title={
          <div className={styles.updateModalTitle}>
            {t(isUpdatingApp ? "Updating..." : "Switch agent")}
          </div>
        }
      >
        <div className={styles.updateModalDescription}>
          {apps?.map((app) => (
            <div className={styles.updateModalDescriptionItem} key={app.id}>
              <button
                disabled={isUpdatingApp}
                onClick={() => handleUpdateAgent(app)}
                className={clsx("link", styles.updateModalDescriptionButton)}
              >
                <Img app={app} showLoading={false} size={50} />
                <div>{app.name}</div>
              </button>
              <span>
                <span>{app.description}</span>
              </span>
            </div>
          ))}
        </div>
      </Modal>
      <div
        data-testid="agent-message"
        className={styles.messageContainer}
        key={message.message.id}
      >
        <span className={clsx(styles.agentIcon, styles.mobile)}>
          {agent && message.message.debateAgentId ? (
            <>
              {agent.name === "deepSeek" ? (
                <DeepSeek size={35} />
              ) : agent.name === "chatGPT" ? (
                <OpenAI size={35} />
              ) : agent.name === "claude" ? (
                <Claude size={35} />
              ) : agent.name === "gemini" ? (
                <Gemini size={35} />
              ) : agent.name === "flux" ? (
                <Flux size={35} />
              ) : agent.name === "perplexity" ? (
                <Perplexity size={35} />
              ) : null}
            </>
          ) : (
            <Img app={app} showLoading={false} size={35} />
          )}
          <span className={clsx(styles.agentMessageTime)}>
            {timeAgo(message.message.createdOn, language)}
          </span>
        </span>
        <button
          aria-label={t("Switch from {{slug}} to another agent", {
            slug,
          })}
          title={t("Switch from {{slug}} to another agent", {
            slug,
          })}
          onClick={() => {
            // if (message.message.isStreaming) {
            //   return
            // }

            setIsAppSelectOpen(true)
          }}
          className={clsx("link", styles.agentIcon, styles.tablet)}
        >
          {agent && message.message.debateAgentId ? (
            <>
              {agent.name === "deepSeek" ? (
                <DeepSeek size={35} />
              ) : agent.name === "chatGPT" ? (
                <OpenAI size={35} />
              ) : agent.name === "claude" ? (
                <Claude size={35} />
              ) : agent.name === "gemini" ? (
                <Gemini size={35} />
              ) : agent.name === "flux" ? (
                <Flux size={35} />
              ) : agent.name === "perplexity" ? (
                <Perplexity size={35} />
              ) : null}
            </>
          ) : (
            <span className={styles.appIcon}>
              <Img app={app} showLoading={false} size={35} />
              <span>{app?.name || "Vex"}</span>
            </span>
          )}
        </button>
        {message.message.isStreaming &&
        message.message.content.trim() === "" ? (
          <div className={styles.thinking}>
            <Img
              src={`${FRONTEND_URL}/${evenChance ? "frog" : "hamster"}.png`}
              width={21}
              height={21}
            />
            <span>
              {t(
                message.message.isImageGenerationEnabled
                  ? "Processing"
                  : "Thinking",
              )}
            </span>
            <div data-testid="typing-indicator" className={styles.dots}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        ) : (
          <div className={clsx(styles.agentMessage, os && styles[os])}>
            <div className={styles.agentMessageContent}>
              {message.message.isStreaming &&
              message.message.isImageGenerationEnabled ? (
                <div className={styles.agentMessageImages}>
                  <div className={styles.placeholder}>
                    <Loading />
                  </div>
                </div>
              ) : message.message.images &&
                message.message.images?.length > 0 ? (
                <div className={styles.agentMessageImages}>
                  {message.message.images.map((image) => (
                    <div key={image.url} className={styles.imageContainer}>
                      <Img
                        containerClass={styles.agentMessageImageContainer}
                        className={styles.agentMessageImage}
                        src={image.url}
                        alt=""
                        width={"100%"}
                        height={"100%"}
                      />
                      <button
                        className={styles.downloadButton}
                        onClick={() =>
                          downloadImage(
                            image.url,
                            `${image.prompt?.slice(0, 30) || "image"}.webp`,
                          )
                        }
                        title={t("Download image")}
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
              {message.message.content === "🐹 Done!" ? (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "2rem" }}
                >
                  <span>{t("🐹 Done!")}</span>
                </div>
              ) : (
                <MarkdownContent
                  content={message.message.content}
                  webSearchResults={
                    message.message.webSearchResult || undefined
                  }
                />
              )}
            </div>
            {isSearchStart ||
            (message.message.isStreaming &&
              message.message.isWebSearchEnabled) ? (
              <div className={styles.agentWebStreaming}>
                <Loading width={16} height={16} />{" "}
                <GlobeIcon color="var(--accent-1)" size={16} />{" "}
                {t("Analyzing...")}
              </div>
            ) : (
              webSearchResult.length > 0 && (
                <div
                  data-testid="web-search-results"
                  className={styles.webSearchResults}
                >
                  {webSearchResult.map((result) => (
                    <div
                      data-testid="web-search-result"
                      key={result.url}
                      className={styles.webSearchResult}
                    >
                      <a
                        onClick={(e) => {
                          addHapticFeedback()
                          if (checkIsExtension()) {
                            e.preventDefault()
                            BrowserInstance?.runtime?.sendMessage({
                              action: "openInSameTab",
                              url: result.url,
                            })
                          }
                        }}
                        className={styles.webSearchResultTitle}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GlobeIcon size={18} />
                        {result.title}
                      </a>
                      <p className={styles.webSearchResultSnippet}>
                        {result.snippet}
                      </p>
                    </div>
                  ))}
                </div>
              )
            )}
            <div className={styles.footer}>
              <div className={styles.left}>
                <button
                  onClick={() => copyToClipboard(message.message.content)}
                  className={clsx(
                    "link",
                    styles.copyButton,
                    copied && styles.copied,
                  )}
                  title="Copy code"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>

                {!message.message.debateAgentId && (
                  <span className={styles.agent} title={agent?.displayName}>
                    {agent?.name === "deepSeek" ? (
                      <DeepSeek color="var(--accent-6)" size={19} />
                    ) : agent?.name === "chatGPT" ? (
                      <OpenAI color="var(--accent-6)" size={19} />
                    ) : agent?.name === "claude" ? (
                      <Claude color="var(--accent-6)" size={19} />
                    ) : agent?.name === "gemini" ? (
                      <Gemini color="var(--accent-6)" size={19} />
                    ) : agent?.name === "flux" ? (
                      <Flux color="var(--accent-6)" size={19} />
                    ) : agent?.name === "perplexity" ? (
                      <Perplexity color="var(--accent-6)" size={19} />
                    ) : null}
                  </span>
                )}
                {getDeleteMessage()}

                <span className={clsx(styles.agentMessageTime)}>
                  {timeAgo(message.message.createdOn, language)}
                </span>
              </div>

              {getLikeButtons()}

              <button
                style={{
                  color: message.message.images?.length
                    ? "var(--accent-1)"
                    : undefined,
                }}
                disabled={isSpeechLoading}
                className={clsx("link", styles.playButton)}
                onClick={() => {
                  addHapticFeedback()
                  if (requiresLogin) {
                    router.push(
                      `/threads/${message.message.threadId}?signIn=register`,
                    )
                  } else if (requiresSubscription) {
                    router.push(
                      `/threads/${message.message.threadId}?subscribe=true`,
                    )
                  } else {
                    playAIResponseWithTTS(
                      stripMarkdown(message.message.content),
                    )
                  }
                }}
              >
                {requiresLogin ? (
                  <>
                    <LogIn size={18} />
                    <>{t("Login")}</>
                  </>
                ) : requiresSubscription ? (
                  <>
                    <Coins size={18} />
                    <>{t("Subscribe")}</>
                  </>
                ) : message.message.isStreaming ? null : isSpeechLoading ? (
                  <Loading width={18} height={18} />
                ) : isSpeechActive ? (
                  <VolumeX size={18} />
                ) : message.message.images?.length ? (
                  <>
                    <Sparkles
                      className={styles.sparklesButton}
                      fill="var(--accent-1)"
                      size={18}
                    />
                    {t("Play")}
                  </>
                ) : (
                  <Play size={18} />
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
