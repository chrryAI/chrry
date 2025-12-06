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
import { useTheme, Div, Button, Span, Video } from "./platform"
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

import { isOwner, apiFetch } from "./utils"
import Loading from "./Loading"
import ConfirmButton from "./ConfirmButton"

import { Check, Copy } from "./icons"

import { useCallback, useEffect, useMemo, useState, useRef } from "react"
import { updateMessage, updateThread } from "./lib"
import toast from "react-hot-toast"
import Img from "./Image"
import { useThreadPresence } from "./hooks/useThreadPresence"
import { useWebSocket } from "./hooks/useWebSocket"
import { Claude, DeepSeek, Flux, Gemini, OpenAI, Perplexity } from "./icons"
import { AudioPlayer } from "react-audio-play"
import { checkSpeechLimits } from "./lib/speechLimits"
import { stripMarkdown } from "./lib/stripMarkdown"
import { useMessageStyles } from "./Message.styles"
import { useStyles } from "./context/StylesContext"
import A from "./a/A"

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
  const { t } = useAppContext()
  const { utilities } = useStyles()

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

  const styles = useMessageStyles()

  const { setIsAccountVisible } = useNavigationContext()
  const { refetchThread } = useChat()
  const { addParams } = useNavigationContext()

  const { slug, apps, app } = useApp()

  const { captureException } = useError()

  const { addHapticFeedback, isMobileDevice } = useTheme()

  const ownerId = user?.id || guest?.id

  const threadId = message.message.threadId

  const { typingUsers, onlineUsers } = useThreadPresence({
    threadId,
  })

  const isTyping = typingUsers.some(
    (u) =>
      (u.userId && u.userId === message.user?.id) ||
      (u.guestId && u.guestId === message.guest?.id),
  )

  const agentImageLoader = useCallback(() => {
    return (
      <Div style={styles.agentMessageImages.style}>
        <Div style={agentImageStyle}>
          <Img logo="blossom" size={30} />
        </Div>
      </Div>
    )
  }, [])

  const [isAppSelectOpen, setIsAppSelectOpen] = useState(false)
  const [isUpdatingApp, setIsUpdatingApp] = useState(false)
  const [liked, setLiked] = useState<boolean | undefined>(undefined)
  const [disliked, setDisliked] = useState<boolean | undefined>(undefined)
  const [isSpeechActive, setIsSpeechActive] = useState(false)
  const [isSpeechLoading, setIsSpeechLoading] = useState(false)
  const [isReasoningExpanded, setIsReasoningExpanded] = useState(true)
  const [isReasoningStreaming, setIsReasoningStreaming] = useState(false)
  const reasoningScrollRef = useRef<HTMLDivElement>(null)

  // Parse reasoning from content if it has __REASONING__ markers
  const { content: cleanContent, reasoning } = useMemo(() => {
    const messageContent = message.message.content
    const reasoningMatches = messageContent.match(
      /__REASONING__(.*?)__\/REASONING__/gs,
    )

    if (reasoningMatches) {
      const extractedReasoning = reasoningMatches
        .map((match) => match.replace(/__REASONING__|__\/REASONING__/g, ""))
        .join("")
      const cleanedContent = messageContent.replace(
        /__REASONING__.*?__\/REASONING__/gs,
        "",
      )

      // Check if reasoning is still streaming (no closing tag yet or message is streaming)
      const isStreaming =
        message.message.isStreaming && messageContent.includes("__REASONING__")

      setIsReasoningStreaming(!!isStreaming)

      return { content: cleanedContent, reasoning: extractedReasoning }
    }

    // Also check if reasoning is stored separately in the message
    return {
      content: messageContent,
      reasoning: message.message.reasoning || null,
    }
  }, [
    message.message.content,
    message.message.reasoning,
    message.message.isStreaming,
  ])

  // Auto-scroll reasoning to bottom while streaming
  useEffect(() => {
    if (isReasoningStreaming && reasoningScrollRef.current) {
      reasoningScrollRef.current.scrollTop =
        reasoningScrollRef.current.scrollHeight
    }
  }, [reasoning, isReasoningStreaming])

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
    if (!token || !threadId) return
    addHapticFeedback()
    setIsAppSelectOpen(false)
    setIsUpdatingApp(true)

    try {
      const result = await updateThread({
        id: threadId,
        appId: app ? app.id : null,
        token,
      })

      if (result.error) {
        toast.error(result.error)
        setIsUpdatingApp(false)
        return
      }

      await refetchThread()

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

  const agentImageStyle = {
    ...styles.agentMessageImageContainer.style,
    width: isMobileDevice ? "100%" : "300px",
    height: isMobileDevice ? "100%" : "300px",
    display: "inline-flex",
  }
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
        data.message?.message.files?.length &&
          setFiles(data.message?.message.files)

        // await refetchThread()
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
      <Div style={styles.likeButtons.style}>
        <Button
          className="link"
          data-testid={`${liked ? "unlike-button" : "like-button"}`}
          title={liked ? t("Unlike") : t("Like")}
          style={utilities.link.style}
          onClick={toggleLike}
        >
          {liked ? (
            <ThumbsUp color="var(--accent-1)" size={16} />
          ) : (
            <ThumbsUp color="var(--shade-3)" size={16} />
          )}
        </Button>

        <Button
          className="link"
          data-testid={`${disliked ? "undislike-button" : "dislike-button"}`}
          title={disliked ? t("Unlike") : t("Dislike")}
          style={utilities.link.style}
          onClick={toggleDislike}
        >
          {disliked ? (
            <ThumbsDown color="var(--accent-1)" size={16} />
          ) : (
            <ThumbsDown color="var(--shade-3)" size={16} />
          )}
        </Button>
      </Div>
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

  const requiresLogin = !limitCheck.allowed && user && !user.subscription
  const requiresSubscription =
    !limitCheck.allowed && guest && !guest.subscription

  const [evenChance] = useState(Math.random() >= 0.5)

  const getDeleteMessage = () => {
    if (
      !canDelete ||
      remoteDeleted ||
      message.message.isStreamingStop ||
      !threadId
    ) {
      return null
    }

    const messageId = message.message.id

    if (message.message.isStreamingStop || !token) return null

    return (
      <ConfirmButton
        processing={isDeleting}
        data-testid="delete-message"
        className="link"
        style={utilities.link.style}
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
              toast.success(t("Deleted"))
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
      <Div style={styles.message.style} data-testid="message">
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
        <Div
          data-testid={user?.id ? "user-message" : "guest-message"}
          key={message.message.id}
          style={{
            ...styles.userMessageContainer.style,
            ...(owner
              ? styles.owner.style
              : { ...styles.owner.style, alignSelf: "flex-start" }),
            flexDirection: !isMobileDevice ? "row" : "column",
          }}
        >
          {isMobileDevice && (
            <Span
              style={{
                ...styles.userIcon.style,
                ...(owner && styles.owner.style),
              }}
            >
              {owner && (
                <Span style={styles.userMessageTime.style}>
                  {timeAgo(message.message.createdOn, language)}
                </Span>
              )}

              <Button
                onClick={() => {
                  if (user) {
                    setIsAccountVisible(true)

                    return
                  }

                  addParams({ subscribe: "true", plan: "member" })
                }}
                type="button"
                style={utilities.link.style}
              >
                {userImage ? (
                  <Img
                    style={styles.userImage.style}
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
              </Button>
              {!owner && (
                <Span style={styles.userMessageTime.style}>
                  {timeAgo(message.message.createdOn, language)}
                </Span>
              )}
            </Span>
          )}

          {!owner && !isMobileDevice && (
            <Span
              style={{
                ...styles.userIcon.style,
              }}
            >
              <Button
                onClick={() => {
                  if (user) {
                    setIsAccountVisible(true)
                    return
                  }

                  addParams({ subscribe: "true", plan: "member" })
                }}
                type="button"
                style={utilities.link.style}
              >
                {userImage ? (
                  <Img
                    style={styles.userImage.style}
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
              </Button>
            </Span>
          )}
          <Div
            style={{
              ...styles.userMessage.style,
              ...(owner && styles.owner.style),
            }}
          >
            <Span style={styles.name.style}>
              <Div
                style={{
                  ...styles.presenceIndicator.style,
                  ...(isTyping ||
                  message.user?.id === ownerId ||
                  message.guest?.id === ownerId ||
                  onlineUsers.some(
                    (u) =>
                      u.userId === message.user?.id ||
                      u.guestId === message.guest?.id,
                  )
                    ? styles.online.style
                    : styles.offline.style),
                }}
              />
              {
                <Span style={{ ...styles.nameWithPresence.style }}>
                  {owner
                    ? t("You")
                    : message.user?.name || message.user?.email || t("Guest")}
                </Span>
              }
              {isTyping && (
                <Div
                  className="typing"
                  data-testid="typing-indicator"
                  style={styles.dots.style}
                >
                  <Span style={styles.dotsSpan.style}></Span>
                  <Span style={styles.dotsSpan.style}></Span>
                  <Span style={styles.dotsSpan.style}></Span>
                </Div>
              )}
            </Span>
            {remoteDeleted ? (
              <Div style={{ ...styles.userMessageContent.style, marginTop: 5 }}>
                <Span>
                  {t(
                    !threadOwner
                      ? "Thread owner deleted this message"
                      : "Message deleted permanently",
                  )}
                </Span>
              </Div>
            ) : (
              <>
                {images?.length ? (
                  <Div
                    data-testid="user-message-images"
                    style={styles.userMessageImages.style}
                  >
                    {images.map((image) => (
                      <Img
                        style={styles.userMessageImage.style}
                        dataTestId="user-message-image"
                        key={image.id}
                        src={image.url}
                        alt={image.title}
                        width={200}
                        height={"auto"}
                      />
                    ))}
                  </Div>
                ) : null}
                {audio?.length ? (
                  <Div
                    data-testid="user-message-audios"
                    style={styles.userMessageAudio.style}
                  >
                    {audio.map((audio) => (
                      <Div data-testid="user-message-audio" key={audio.id}>
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
                      </Div>
                    ))}
                  </Div>
                ) : null}
                {video?.length ? (
                  <Div
                    data-testid="user-message-videos"
                    style={styles.userMessageVideo.style}
                  >
                    {video.map((video) => (
                      <Div data-testid="user-message-video" key={video.id}>
                        <Video
                          style={styles.userMessageVideoVideo.style}
                          controls
                          src={video.url}
                        />
                      </Div>
                    ))}
                  </Div>
                ) : null}
                {files?.length ? (
                  <Div
                    data-testid="user-message-files"
                    style={styles.userMessageFiles.style}
                  >
                    {files.map((file) => {
                      if (file.type === "pdf") {
                        return (
                          <A
                            data-testid="user-message-pdf"
                            key={file.id}
                            href={file.url}
                            target="_blank"
                            className="button inverted"
                            rel="noopener noreferrer"
                            style={{
                              ...utilities.button.style,
                              ...utilities.inverted.style,
                            }}
                          >
                            <FileText size={16} />
                            {file.name}
                          </A>
                        )
                      } else {
                        return (
                          <Button
                            className="button inverted"
                            data-testid="user-message-text"
                            style={{
                              ...utilities.button.style,
                              ...utilities.inverted.style,
                            }}
                            onClick={() => {
                              addHapticFeedback()
                              setSelectedFile(file)
                            }}
                            key={file.id}
                          >
                            <FileText size={16} /> {file.name}
                          </Button>
                        )
                      }
                    })}
                  </Div>
                ) : null}
                <MarkdownContent
                  data-testid="user-message-content"
                  style={styles.userMessageContent.style}
                  content={message.message.content}
                  webSearchResults={
                    message.message.webSearchResult || undefined
                  }
                />
              </>
            )}
            <Div style={styles.footer.style}>
              <Div style={styles.left.style}>
                <Button
                  className="link"
                  onClick={() => copyToClipboard(message.message.content)}
                  style={{
                    ...utilities.link.style,
                  }}
                  title="Copy code"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </Button>
                {getDeleteMessage()}
                <Span style={styles.userMessageTime.style}>
                  {timeAgo(message.message.createdOn, language)}
                </Span>
              </Div>
              {getLikeButtons()}
            </Div>
          </Div>
          {owner && !isMobileDevice && (
            <Span>
              <Button
                onClick={() => {
                  if (user) {
                    setIsAccountVisible(true)
                    return
                  }

                  addParams({ subscribe: "true", plan: "member" })
                }}
                type="button"
                className="link"
                style={{
                  ...utilities.link.style,
                }}
              >
                {userImage ? (
                  <Img
                    style={styles.userImage.style}
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
              </Button>
            </Span>
          )}
        </Div>
      </Div>
    )
  }

  const agent = message.aiAgent

  if (!agent) {
    return null
  }

  return (
    <Div style={styles.message.style} data-testid="message">
      <Modal
        isModalOpen={isAppSelectOpen}
        hasCloseButton={true}
        onToggle={(open) => {
          setIsAppSelectOpen(open)
        }}
        icon={"blob"}
        title={<Div>{t(isUpdatingApp ? "Updating..." : "Switch agent")}</Div>}
      >
        <Div style={styles.updateModalDescription.style}>
          {apps?.map((app) => (
            <Button
              key={app.id}
              className="card link border"
              disabled={isUpdatingApp}
              onClick={() => handleUpdateAgent(app)}
              style={{
                ...utilities.link.style,
                ...styles.updateModalDescriptionButton.style,
              }}
            >
              <Img app={app} showLoading={false} size={50} />
            </Button>
          ))}
        </Div>
      </Modal>
      <Div
        data-testid="agent-message"
        style={{
          ...styles.messageContainer.style,
          flexDirection: !isMobileDevice ? "row" : "column",
        }}
        key={message.message.id}
      >
        {isMobileDevice && (
          <Span style={styles.agentIcon.style}>
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
            <Span style={styles.agentMessageTime.style}>
              {timeAgo(message.message.createdOn, language)}
            </Span>
          </Span>
        )}
        {!isMobileDevice && (
          <Button
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
            className="link"
            style={{
              ...utilities.link.style,
              ...styles.agentIcon.style,
            }}
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
              <Span style={styles.appIcon.style}>
                <Img app={app} showLoading={false} size={35} />
                <Span>{app?.name || "Vex"}</Span>
              </Span>
            )}
          </Button>
        )}
        {message.message.isStreaming &&
        message.message.content.trim() === "" ? (
          <Div style={styles.thinking.style}>
            <Img
              src={`${FRONTEND_URL}/${evenChance ? "frog" : "hamster"}.png`}
              width={21}
              height={21}
            />
            <Span>
              {t(
                message.message.isImageGenerationEnabled
                  ? "Processing"
                  : "Thinking",
              )}
            </Span>
            <Div
              className="typing"
              data-testid="typing-indicator"
              style={styles.dots.style}
            >
              <Span style={styles.dotsSpan.style}></Span>
              <Span style={styles.dotsSpan.style}></Span>
              <Span style={styles.dotsSpan.style}></Span>
            </Div>
          </Div>
        ) : (
          <Div style={styles.agentMessage.style}>
            <Div style={styles.agentMessageContent.style}>
              {reasoning && (
                <Div
                  style={{
                    marginBottom: "0.3rem",
                    borderLeft: "0.75px solid var(--accent-1)",
                    paddingLeft: "0.7rem",
                  }}
                >
                  <Button
                    className="link"
                    onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
                    style={{
                      ...utilities.link.style,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                      color: "var(--accent-1)",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {t("Reasoning")}
                    {isReasoningExpanded && !isReasoningStreaming ? "." : "..."}
                  </Button>
                  {isReasoningExpanded && (
                    <Div
                      ref={reasoningScrollRef}
                      style={{
                        maxHeight: !isReasoningStreaming ? "200px" : "80px",
                        overflowY: "auto",
                        fontSize: "0.85rem",
                        color: "var(--shade-6)",
                        whiteSpace: "pre-wrap",
                        background: "var(--background-2)",
                      }}
                    >
                      {reasoning}
                    </Div>
                  )}
                </Div>
              )}
              <MarkdownContent
                content={cleanContent}
                webSearchResults={message.message.webSearchResult || undefined}
              />
              {message.message.isStreaming &&
              message.message.isImageGenerationEnabled ? (
                agentImageLoader()
              ) : message.message.images &&
                message.message.images?.length > 0 ? (
                <Div
                  style={{ ...styles.agentMessageImages.style, marginTop: 5 }}
                >
                  {message.message.images.map((image) => (
                    <Div key={image.url} style={agentImageStyle}>
                      <Img
                        style={agentImageStyle}
                        src={image.url}
                        alt=""
                        width={"100%"}
                        height={"100%"}
                      />
                      <Button
                        style={styles.downloadButton.style}
                        onClick={() =>
                          downloadImage(
                            image.url,
                            `${image.prompt?.slice(0, 30) || "image"}.webp`,
                          )
                        }
                        title={t("Download image")}
                      >
                        <Download size={16} />
                      </Button>
                    </Div>
                  ))}
                </Div>
              ) : null}
            </Div>
            {isSearchStart ||
            (message.message.isStreaming &&
              message.message.isWebSearchEnabled) ? (
              <Div style={styles.agentWebStreaming.style}>
                <Loading width={16} height={16} />{" "}
                <GlobeIcon color="var(--accent-1)" size={16} />{" "}
                {t("Analyzing...")}
              </Div>
            ) : (
              webSearchResult.length > 0 && (
                <Div
                  data-testid="web-search-results"
                  style={styles.webSearchResults.style}
                >
                  {webSearchResult.map((result) => (
                    <Div data-testid="web-search-result" key={result.url}>
                      <A
                        openInNewTab
                        style={styles.webSearchResultTitle.style}
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <GlobeIcon size={18} />
                        {result.title}
                      </A>
                      <Span style={styles.webSearchResultSnippet.style}>
                        {result.snippet}
                      </Span>
                    </Div>
                  ))}
                </Div>
              )
            )}
            <Div style={styles.footer.style}>
              <Div style={styles.left.style}>
                <Button
                  className="link"
                  onClick={() => copyToClipboard(message.message.content)}
                  style={{
                    ...utilities.link.style,
                  }}
                  title="Copy code"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </Button>

                {!message.message.debateAgentId && (
                  <Span style={styles.agent.style} title={agent?.displayName}>
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
                    ) : agent?.name === "sushi" ? (
                      <Img icon="sushi" showLoading={false} size={19} />
                    ) : null}
                  </Span>
                )}
                {getDeleteMessage()}

                <Span style={styles.agentMessageTime.style}>
                  {timeAgo(message.message.createdOn, language)}
                </Span>
              </Div>

              {getLikeButtons()}

              <Button
                disabled={isSpeechLoading}
                className="link"
                style={{
                  ...utilities.link.style,
                  ...styles.playButton.style,
                  color: message.message.images?.length
                    ? "var(--accent-1)"
                    : undefined,
                }}
                onClick={() => {
                  addHapticFeedback()
                  if (requiresLogin) {
                    addParams({ subscribe: "true", plan: "member" })
                  } else if (requiresSubscription) {
                    addParams({ subscribe: "true", plan: "plus" })
                  } else if (message.message.isStreaming) {
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
                      style={styles.sparklesButton.style}
                      fill="var(--accent-1)"
                      size={18}
                    />
                    {t("Play")}
                  </>
                ) : (
                  <Play size={18} />
                )}
              </Button>
            </Div>
          </Div>
        )}
      </Div>
    </Div>
  )
}
