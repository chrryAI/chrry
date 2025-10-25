import { forwardRef, useEffect, useState, useMemo } from "react"
import styles from "./Messages.module.scss"
import type {
  aiAgent,
  guest,
  message,
  thread,
  user,
  characterProfile,
  threadSummary,
} from "./types"
import Message from "./Message"
import clsx from "clsx"
import { CircleX, Loader, Sparkles } from "./icons"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useChat,
  useNavigationContext,
  useApp,
} from "./context/providers"
import { useTheme } from "./platform"
import CharacterProfile from "./CharacterProfile"
import { useWebSocket } from "./hooks/useWebSocket"
import { isOwner } from "./utils"

export default forwardRef<
  HTMLDivElement,
  {
    showEmptyState?: boolean
    emptyMessage?: string
    className?: string
    messages?: Array<{
      message: message & {
        isStreaming?: boolean
        isStreamingStop?: boolean
      }
      user?: user
      guest?: guest
      aiAgent?: aiAgent
      thread?: thread & {
        characterProfile?: characterProfile
        summary?: threadSummary
      }
    }>
    isHome?: boolean
    onPlayAudio?: () => void
    nextPage?: number
    setIsLoadingMore?: (isLoadingMore: boolean) => void
    setUntil?: (until: number) => void
    until?: number
    id?: string
    onDelete?: ({ id }: { id: string }) => Promise<void>
    onToggleLike?: (liked: boolean | undefined) => void
    thread?: thread & {
      characterProfile?: characterProfile
    }
    onCharacterProfileUpdate?: () => void
  }
>(function Messages(
  {
    emptyMessage,
    className,
    showEmptyState,
    messages,
    setIsLoadingMore,
    setUntil,
    until,
    nextPage,
    id,
    onDelete,
    onToggleLike,
    onPlayAudio,
    thread,
    isHome,
    onCharacterProfileUpdate,
  },
  ref,
) {
  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
  const {
    characterProfilesEnabled,
    token,
    deviceId,
    user,
    guest,
    setShowCharacterProfiles,
    FRONTEND_URL,
  } = useAuth()

  // Chat context
  const { threadId } = useChat()

  // Navigation context (router is the wrapper)
  const { router } = useNavigationContext()

  // App context
  const { appStatus, appFormWatcher, suggestSaveApp } = useApp()

  // Theme context
  const { addHapticFeedback } = useTheme()

  const [isUpdating, setIsUpdating] = useState(false)

  const [loadingCharacterProfile, setLoadingCharacterProfile] = useState<
    characterProfile | undefined
  >()

  const [characterProfile, setCharacterProfile] = useState<
    characterProfile | undefined
  >(thread?.characterProfile)

  // Memoize deps to prevent reconnection loop
  const webSocketDeps = useMemo(() => [threadId], [threadId])

  useWebSocket<{
    type: string
    data: characterProfile
  }>({
    onMessage: async ({ type, data }) => {
      if (type === "character_tag_created") {
        if (data?.threadId !== threadId) return
        onCharacterProfileUpdate?.()

        setCharacterProfile(data)
        setLoadingCharacterProfile(undefined)
      }
      if (type === "character_tag_creating") {
        onCharacterProfileUpdate?.()
        setLoadingCharacterProfile(data)
      }
    },
    token,
    deviceId,
    deps: webSocketDeps,
  })

  useEffect(() => {
    setCharacterProfile(thread?.characterProfile)
  }, [thread?.characterProfile])

  const isStreaming = messages?.some(
    (message) => message.message.isStreaming === true,
  )

  if (!showEmptyState && messages?.length === 0) return null
  return (
    <div
      className={clsx(styles.messagesContainer, className)}
      id={id}
      ref={ref}
    >
      {nextPage && (
        <div className={styles.loadMoreContainer}>
          <button
            className={clsx("xSmall transparent", styles.loadMoreButton)}
            onClick={() => {
              setIsLoadingMore?.(true)
              setUntil?.((until || 1) + 1)
            }}
          >
            <Loader size={16} className="spin" />
            Load Older
          </button>
        </div>
      )}
      {messages?.length === 0 && showEmptyState && (
        <div className={styles.emptyContainer}>
          {emptyMessage || t("Nothing here yet")}
        </div>
      )}
      <div className={styles.messages}>
        {messages
          ?.sort(
            (a, b) =>
              new Date(a.message.createdOn).getTime() -
              new Date(b.message.createdOn).getTime(),
          )
          ?.map((message) => {
            return (
              <Message
                onToggleLike={onToggleLike}
                onDelete={onDelete}
                onPlayAudio={onPlayAudio}
                key={message.message.id}
                message={message}
              />
            )
          })}
      </div>
      {appStatus?.part || suggestSaveApp ? (
        <div className={styles.enableCharacterProfilesContainer}>
          <button
            disabled={isUpdating}
            onClick={async () => {
              addHapticFeedback()

              router.push("/?step=add&part=title")
            }}
            className={clsx("inverted", styles.enableCharacterProfiles)}
          >
            <Sparkles
              color="var(--accent-1)"
              fill="var(--accent-1)"
              size={16}
            />
            {t("Back to Agent Builder")}{" "}
          </button>
        </div>
      ) : (
        <>
          <div className={styles.enableCharacterProfilesContainer}>
            {!characterProfilesEnabled &&
            !isStreaming &&
            messages?.some((message) => !!message.message.agentId) ? (
              <button
                disabled={isUpdating}
                onClick={async () => {
                  setShowCharacterProfiles(true)
                }}
                className={clsx("inverted", styles.enableCharacterProfiles)}
              >
                {isUpdating ? (
                  <CircleX size={16} color="var(--accent-6)" />
                ) : (
                  <Sparkles
                    color="var(--accent-1)"
                    fill="var(--accent-1)"
                    size={16}
                  />
                )}
                {t("Enable Character Profiles")}
              </button>
            ) : null}
          </div>

          {threadId &&
          !isStreaming &&
          characterProfilesEnabled &&
          loadingCharacterProfile?.threadId === threadId ? (
            <div
              className={clsx(styles.characterProfileContainer, styles.loading)}
            >
              <video
                className={styles.video}
                src={`${FRONTEND_URL}/video/blob.mp4`}
                autoPlay
                loop
                muted
                playsInline
              ></video>
              {t("Generating character tags...")}
            </div>
          ) : characterProfile &&
            characterProfilesEnabled &&
            (isOwner(characterProfile, {
              userId: user?.id,
              guestId: guest?.id,
            }) ||
              characterProfile.visibility === "public") ? (
            <div className={styles.characterProfileContainer}>
              <div className={styles.tags}>
                {characterProfile.tags?.join(", ")}
              </div>
              <CharacterProfile
                onCharacterProfileUpdate={() => {
                  onCharacterProfileUpdate?.()
                }}
                characterProfile={characterProfile}
                showActions={true}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  )
})
