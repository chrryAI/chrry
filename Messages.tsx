"use client"

import { forwardRef, useEffect, useState, useMemo } from "react"
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
import { CircleX, Loader, Sparkles, VideoIcon } from "./icons"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useChat,
  useNavigationContext,
  useApp,
} from "./context/providers"
import { Button, Div, useTheme, Video } from "./platform"
import CharacterProfile from "./CharacterProfile"
import { useWebSocket } from "./hooks/useWebSocket"
import { isOwner } from "./utils"
import { useMessagesStyles } from "./Messages.styles"
import { useStyles } from "./context/StylesContext"

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
    style?: React.CSSProperties
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
    style,
  },
  ref,
) {
  const styles = useMessagesStyles()
  const { utilities } = useStyles()
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
  const { threadId, scrollToBottom } = useChat()

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

  const showLoadingCharacterProfile =
    threadId &&
    !isStreaming &&
    characterProfilesEnabled &&
    loadingCharacterProfile?.threadId === threadId

  useEffect(() => {
    showLoadingCharacterProfile && scrollToBottom()
  }, [showLoadingCharacterProfile])

  if (!showEmptyState && messages?.length === 0) return null
  return (
    <Div style={{ ...styles.messagesContainer, ...style }} id={id} ref={ref}>
      {nextPage && (
        <Div style={{ ...styles.loadMoreContainer.style }}>
          <Button
            className="transparent"
            style={{ ...utilities.xSmall, ...utilities.transparent }}
            onClick={() => {
              setIsLoadingMore?.(true)
              setUntil?.((until || 1) + 1)
            }}
          >
            <Loader size={16} />
            {t("Load Older")}
          </Button>
        </Div>
      )}
      {messages?.length === 0 && showEmptyState && (
        <Div style={{ ...styles.emptyContainer.style }}>
          {emptyMessage || t("Nothing here yet")}
        </Div>
      )}
      <Div style={{ ...styles.messages.style }}>
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
      </Div>
      {appStatus?.part || suggestSaveApp ? (
        <Div
          style={{
            ...styles.enableCharacterProfilesContainer.style,
            display:
              messages?.filter((message) => message.message.agentId).length ===
              0
                ? "none"
                : "flex",
          }}
        >
          <Button
            disabled={isUpdating}
            className="inverted"
            onClick={async () => {
              addHapticFeedback()

              router.push("/?step=add&part=title")
            }}
            style={{ ...utilities.inverted.style }}
          >
            <Sparkles
              color="var(--accent-1)"
              fill="var(--accent-1)"
              size={16}
            />
            {t("Back to Agent Builder")}{" "}
          </Button>
        </Div>
      ) : (
        <>
          <Div style={{ ...styles.enableCharacterProfilesContainer.style }}>
            {!characterProfilesEnabled &&
            !isStreaming &&
            messages?.some((message) => !!message.message.agentId) ? (
              <Button
                disabled={isUpdating}
                onClick={async () => {
                  setShowCharacterProfiles(true)
                }}
                className="inverted"
                style={{ ...utilities.inverted.style }}
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
              </Button>
            ) : null}
          </Div>

          {showLoadingCharacterProfile ? (
            <Div
              style={{
                ...styles.characterProfileContainer.style,
                flexDirection: "row",
              }}
            >
              <Video
                style={{ ...styles.video.style }}
                src={`${FRONTEND_URL}/video/blob.mp4`}
                autoPlay
                loop
                muted
                playsInline
              />
              {t("Generating character tags...")}
            </Div>
          ) : characterProfile &&
            characterProfilesEnabled &&
            (isOwner(characterProfile, {
              userId: user?.id,
              guestId: guest?.id,
            }) ||
              characterProfile.visibility === "public") ? (
            <Div style={{ ...styles.characterProfileContainer.style }}>
              <Div style={{ ...styles.tags.style }}>
                {characterProfile.tags?.join(", ")}
              </Div>
              <CharacterProfile
                onCharacterProfileUpdate={() => {
                  onCharacterProfileUpdate?.()
                }}
                characterProfile={characterProfile}
                showActions={true}
              />
            </Div>
          ) : null}
        </>
      )}
    </Div>
  )
})
