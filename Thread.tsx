"use client"

import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react"
import Bookmark from "./Bookmark"
import Chat from "./Chat"
import CollaborationStatus from "./CollaborationStatus"
import { useAppContext } from "./context/AppContext"
import {
  useApp,
  useAuth,
  useChat,
  useNavigationContext,
} from "./context/providers"
import { useStyles } from "./context/StylesContext"
import DeleteThread from "./DeleteThread"
import EditThread from "./EditThread"
import EnableSound from "./EnableSound"
import Grapes from "./Grapes"
import { useHasHydrated, useThreadMetadata } from "./hooks"
import { useThreadPresence } from "./hooks/useThreadPresence"
import { useUserScroll } from "./hooks/useUserScroll"
import Img from "./Image"
import Instructions from "./Instructions"
import { CircleX, Clock, ClockPlus, InfoIcon, ThumbsUp } from "./icons"
import Loading from "./Loading"
import MemoryConsent from "./MemoryConsent"
import Messages from "./Messages"
import {
  A,
  Button,
  Div,
  H2,
  Input,
  Span,
  usePlatform,
  useTheme,
} from "./platform"
import Share from "./Share"
import Skeleton from "./Skeleton"
import { BREAKPOINTS } from "./styles/breakpoints"
import { useThreadStyles } from "./Thread.styles"
import Tribe from "./Tribe"
import type {
  aiAgent,
  guest,
  message,
  paginatedMessages,
  thread,
  user,
} from "./types"
import { FRONTEND_URL, isCollaborator, isE2E, isOwner } from "./utils"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"

// Lazy load Focus only on web (not extension) to reduce bundle size
// This component includes timer, tasks, moods, and analytics - heavy dependencies
const Focus = lazy(() => import("./Focus"))

type ThreadWithLikeCount = thread & { likeCount: number }

const Thread = ({
  isHome,
}: {
  isHome?: boolean
  threadId?: string

  threadData?: { thread: thread; messages: paginatedMessages }
}) => {
  // Initialize unified styles hook
  const styles = useThreadStyles()

  // Split contexts for better organization
  const { t, console } = useAppContext()

  // Auth context
  const {
    user,
    guest,
    plausible,
    threadIdRef,
    memoriesEnabled,
    setShowFocus,
    grapes,
    app,
    baseApp,
    setIsRetro,
    isRetro,
    advanceDailySection,
    dailyQuestionData,
    dailyQuestionIndex,
    setDailyQuestionIndex,
    minimize,
    postId,
    ...auth
  } = useAuth()

  const threadId = auth.threadId || threadIdRef.current

  // Chat context
  const {
    isWebSearchEnabled,
    selectedAgent,
    setSelectedAgent,
    aiAgents,
    hitHourlyLimit,
    debateAgent,
    hourlyLimit,
    hourlyUsageLeft,
    thread,
    setThread,
    messages,
    setMessages: setMessagesInternal,
    isChatFloating,
    refetchThread,
    isLoading,
    isLoadingMore,
    setIsLoadingMore,
    until,
    setUntil,
    error,
    scrollToBottom,
    nextPage,
    status,
    liked,
    setLiked,
    placeHolderText,
    isEmpty,
    ...chat
  } = useChat()

  const showTribe = !!chat.showTribe

  const hasHydrated = useHasHydrated()

  const showFocus = auth.showFocus && isEmpty && hasHydrated

  const { pathname } = useNavigationContext()

  const { isIDE, isStandalone } = usePlatform()

  // Navigation context
  const {
    router,
    setIsNewChat,
    isVisitor,
    collaborationStatus,
    setCollaborationStatus,
    threads,
    goToThreads,
    refetchThreads,
    addParams,
    slug,
    burn,
    goToCalendar,
  } = useNavigationContext()

  const { setShouldGetCredits } = useChat()

  // Use setMessagesInternal directly instead of wrapping it
  const setMessages = setMessagesInternal

  const { appStatus, appFormWatcher, suggestSaveApp } = useApp()

  const { addHapticFeedback, isMobileDevice, isSmallDevice } = useTheme()

  // Update thread metadata dynamically
  useThreadMetadata(thread)

  // Derived from thread

  const slugPath = slug ? `${slug}/` : "/"

  const iWillRemember = memoriesEnabled ? `, ${t("I will remember")} 💭` : ""

  const id = threadId

  // plausible if we've already auto-selected an agent for this thread
  const shouldStopAutoScrollRef = useRef(false)

  const refetch = () => {
    return refetchThread()
  }

  // ⚡ Bolt: Stable callbacks for Messages component to prevent re-renders
  const isChatFloatingRef = useRef(isChatFloating)
  isChatFloatingRef.current = isChatFloating

  const scrollToBottomRef = useRef(scrollToBottom)
  scrollToBottomRef.current = scrollToBottom

  const refetchRef = useRef(refetch)
  refetchRef.current = refetch

  const setMessagesRef = useRef(setMessages)
  setMessagesRef.current = setMessages

  const currentMessagesRef = useRef(messages)
  currentMessagesRef.current = messages

  const handlePlayAudio = useCallback(() => {
    shouldStopAutoScrollRef.current = true
  }, [])

  const handleCharacterProfileUpdate = useCallback(() => {
    !isChatFloating && scrollToBottom()
  }, [isChatFloating, scrollToBottom])

  const handleToggleLike = useCallback((liked: boolean | undefined) => {
    refetchRef.current()
  }, [])

  const handleDelete = useCallback(async ({ id }: { id: string }) => {
    if (currentMessagesRef.current.length === 1) {
      await refetchRef.current().then(() => setMessagesRef.current([]))
    } else {
      await refetchRef
        .current()
        .then(() =>
          setMessagesRef.current(
            currentMessagesRef.current.filter((m) => m.message.id !== id),
          ),
        )
    }
  }, [])

  // plausible last processed threadData to prevent re-processing
  // const lastProcessedThreadDataRef = useRef<any>(null)

  // Smart auto-scroll: only scroll for short responses
  const shouldAutoScroll = (currentMessage: string) => {
    if (currentMessage.length === 0) return true
    if (shouldStopAutoScrollRef.current) return false // Once stopped, stay stopped for this response

    const contentLength = currentMessage.length
    const wordCount = currentMessage.split(" ").length

    // Stop auto-scrolling if response gets too long
    if (contentLength > 500 || wordCount > 80) {
      shouldStopAutoScrollRef.current = true
      return false
    }

    return true
  }

  const messagesRef = useRef<HTMLDivElement>(null)

  const { notifyTyping } = useThreadPresence({
    threadId: id || "",
  })

  const isPendingCollaboration = thread?.collaborations?.some(
    (collaboration) =>
      collaboration.user.id === user?.id &&
      collaboration.collaboration.status !== "active",
  )

  const collaborator = thread && isCollaborator(thread, user?.id)
  const activeCollaborator =
    thread && isCollaborator(thread, user?.id, "active")

  const [autoSelectedAgent, setAutoSelectedAgent] = useState<boolean>(false)
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    // Only reset if not already in human mode
    if (lastMessage?.message.agentId && !autoSelectedAgent && !debateAgent) {
      const agent = aiAgents?.find(
        (agent) => agent.id === lastMessage?.message.agentId,
      )
      if (agent) {
        setSelectedAgent(agent)
        setAutoSelectedAgent(true)
      }
    }
  }, [messages, autoSelectedAgent, debateAgent])
  // aiAgents excluded to prevent loop, setSelectedAgent is stable

  const nameIsRequired = `👋 ${t("Name your app...")}`
  const titleIsRequired = `✍️ ${t("Give it a title...")}`

  // Only show app creation warnings when actually in app creation mode
  const appFormPlaceholder = appStatus?.part
    ? !appFormWatcher.canSubmit || appFormWatcher.id
      ? !appFormWatcher.name
        ? nameIsRequired
        : appFormWatcher.title
          ? null
          : titleIsRequired
      : !appFormWatcher?.highlights?.length
        ? `${t("You can go next, updating suggestions recommended.")} 🎯`
        : !appFormWatcher?.systemPrompt
          ? `${t("Updating Description and Settings recommended.")} 🧠`
          : `${t("You can save it now!")} 🚀`
    : null

  const [isGame, setIsGame] = useState(false)

  const [collaborationVersion, setCollaborationVersion] = useState(0)
  const { utilities } = useStyles()

  const { isUserScrolling, hasStoppedScrolling, resetScrollState } =
    useUserScroll()

  // Memoize the streaming update handler to prevent infinite loops
  const handleStreamingUpdate = useCallback(
    ({
      content,
      clientId,
      aiAgent,
      isWebSearchEnabled,
      isImageGenerationEnabled,
    }: {
      content: string
      clientId?: string
      aiAgent?: aiAgent
      isWebSearchEnabled?: boolean
      isImageGenerationEnabled?: boolean
    }) => {
      scrollToBottom()

      if (isE2E && content.length > 500) {
        const wordCount = content.split(/\s+/).length
        const hasReasoning = content.includes("__REASONING__")
        const preview = content.slice(0, 200).replace(/\n/g, " ")

        console.log("🤖 Streaming Update", {
          preview: `${preview}...`,
          stats: {
            chars: content.length,
            words: wordCount,
            hasReasoning,
          },
          agent: aiAgent?.displayName || aiAgent?.name || "unknown",
          features: {
            webSearch: !!isWebSearchEnabled,
            imageGen: !!isImageGenerationEnabled,
          },
          clientId: clientId?.slice(0, 8),
        })
      }

      // Only update if content actually changed and clientId exists
      if (!clientId) return

      setMessages((prev) => {
        const existingIndex = prev.findIndex(
          (m) => m.message.id === clientId && !m.message.isStreamingStop,
        )

        // If message exists, update it
        if (existingIndex >= 0) {
          return prev.map((m) =>
            m.message.id === clientId && !m.message.isStreamingStop
              ? {
                  ...m,
                  message: {
                    ...m.message,
                    content,
                    isStreaming: true,
                    isWebSearchEnabled: !!isWebSearchEnabled,
                    isImageGenerationEnabled: !!isImageGenerationEnabled,
                  },
                  aiAgent: aiAgent ?? m.aiAgent,
                }
              : m,
          )
        }

        if (threadId !== prev?.[0]?.message?.threadId) {
          return prev
        }

        // If message doesn't exist, add it (from other device/collaboration)
        return [
          ...prev,
          {
            message: {
              id: clientId,
              type: "chat" as const,
              content,
              createdOn: new Date(),
              updatedOn: new Date(),
              agentId: aiAgent?.id || null,
              agentVersion: aiAgent?.version || null,
              threadId: threadId || "",
              readOn: new Date(),
              userId: user?.id || null,
              guestId: guest?.id || null,
              searchContext: null,
              webSearchResult: null,
              metadata: null,
              originalContent: content,
              images: null,
              files: null,
              isWebSearchEnabled: !!isWebSearchEnabled,
              isImageGenerationEnabled: !!isImageGenerationEnabled,
              isStreaming: true,
              reasoning: null,
              like: null,
              dislike: null,
              creditCost: aiAgent?.creditCost || 1,
              task: "chat",
              reactions: null,
              clientId,
              audio: null,
              video: null,
              selectedAgentId: aiAgent?.id || null,
              debateAgentId: null,
              pauseDebate: false,
            },
            aiAgent: aiAgent,
            thread: thread,
          },
        ]
      })
    },
    [
      isLoadingMore,
      scrollToBottom,
      setMessages,
      shouldAutoScroll,
      resetScrollState,
      isUserScrolling,
      hasStoppedScrolling,
    ],
  )

  const render = () => {
    return (
      <Div
        data-thread-title={thread?.title}
        data-testid={id ? "thread" : isHome ? "home" : undefined}
        style={{
          // paddingTop: 0,
          // paddingRight: isMobileDevice ? 0 : 10,
          // paddingBottom: 195,
          // paddingLeft: isMobileDevice ? 0 : 10,
          ...styles.thread.style,
          ...(isEmpty &&
            !threadId &&
            hasHydrated && {
              ...styles.threadEmpty.style,
              zIndex: 10,
              paddingBottom:
                minimize && !showFocus && !showTribe
                  ? 30
                  : isStandalone
                    ? 200
                    : 195,
            }),
          ...{
            maxWidth: isSmallDevice ? BREAKPOINTS.tablet : BREAKPOINTS.desktop,
            marginBottom: isIDE ? 50 : undefined,
          },
        }}
      >
        {!isVisitor && thread && (
          <Div style={styles.headers.style}>
            <Div style={styles.header.style}>
              {thread.isMainThread ? (
                <Span
                  title={t("DNA thread")}
                  style={{ marginRight: 3, fontSize: 16 }}
                >
                  🧬
                </Span>
              ) : null}
              <Instructions
                onSave={(data) => {
                  setThread({
                    ...thread,
                    instructions: data.content,
                  })
                }}
                dataTestId="thread-instruction"
                className="small"
                thread={thread}
              />
              <DeleteThread
                id={thread.id}
                onDelete={() => {
                  if (threads?.threads?.length === 1) {
                    setIsNewChat({
                      value: true,
                    })
                  } else {
                    shouldStopAutoScrollRef.current = true
                    goToThreads()
                  }
                }}
              />
              <EditThread
                thread={thread}
                refetch={async () => {
                  await refetchThreads()
                }}
                onDelete={() => {
                  if (threads?.threads?.length === 1) {
                    setIsNewChat({
                      value: true,
                    })
                  } else {
                    shouldStopAutoScrollRef.current = true
                    goToThreads()
                  }
                }}
              />

              <Share
                dataTestId="thread"
                onCollaborationChange={() => {
                  setCollaborationVersion((v) => v + 1)
                  refetch()
                }}
                onChangeVisibility={(visibility) =>
                  setThread({ ...thread, visibility })
                }
                size={15}
                thread={thread}
              />
            </Div>
          </Div>
        )}

        {isLoading && !isLoadingMore && isEmpty ? (
          <Div style={styles.errorContainer.style}>
            <Loading />
          </Div>
        ) : error ? (
          <Div style={styles.errorContainer.style}>
            <CircleX color="var(--accent-0)" size={20} />{" "}
            {t("Something went wrong")}
          </Div>
        ) : status === 404 ? (
          <Div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "40px 20px",
              minHeight: "60vh",
              textAlign: "center",
            }}
          >
            <H2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Img logo="coder" size={32} />
              {t("Thread not found")}
            </H2>
            <A
              href="/tribe"
              className="button inverted"
              style={{
                ...utilities.button.style,
                ...utilities.inverted.style,
                ...utilities.small.style,
                marginTop: 10,
              }}
            >
              <Img icon="zarathustra" size={18} />
              {t("Back to feed")}
            </A>
          </Div>
        ) : status === 401 ? (
          <Div style={styles.errorContainer.style}>
            <InfoIcon color="var(--accent-1)" size={20} /> Unauthorized
          </Div>
        ) : (
          <>
            {showTribe ? null : (
              <Messages
                onCharacterProfileUpdate={handleCharacterProfileUpdate}
                isHome={isHome}
                thread={thread}
                onPlayAudio={handlePlayAudio}
                onToggleLike={handleToggleLike}
                emptyMessage={
                  liked && messages.length === 0
                    ? t("Nothing here yet")
                    : undefined
                }
                showEmptyState={!!thread}
                onDelete={handleDelete}
                ref={messagesRef}
                messages={messages}
                setIsLoadingMore={setIsLoadingMore}
                setUntil={setUntil}
                until={until}
                nextPage={nextPage}
              />
            )}
            {(!isVisitor ||
              collaborator ||
              thread?.visibility === "public") && (
              <Div>
                {/* Typing indicator for collaborative threads */}
                {thread?.placeHolder && (
                  <Input data-testid="thread-placeholder" type="hidden" />
                )}
                <Div>
                  <Chat
                    requiresSignin={isVisitor && !activeCollaborator && !user}
                    compactMode={showFocus || showTribe}
                    onTyping={notifyTyping}
                    disabled={isPendingCollaboration}
                    placeholder={
                      appFormPlaceholder
                        ? appFormPlaceholder
                        : appStatus?.part
                          ? `${t("Ask anything, I will explain")} 💭`
                          : debateAgent && selectedAgent
                            ? t(
                                "Start the {{selectedAgent}} vs {{debateAgent}} debate...",
                                {
                                  selectedAgent: selectedAgent.displayName,
                                  debateAgent: debateAgent.displayName,
                                },
                              )
                            : isPendingCollaboration
                              ? t("Accept collaboration to continue")
                              : selectedAgent === null
                                ? thread?.collaborations &&
                                  thread?.collaborations?.length > 0
                                  ? t(
                                      "Chatting with your team. Invite AI to conversation...",
                                    )
                                  : t("Message yourself...")
                                : collaborator
                                  ? t("Add AI to conversation...")
                                  : (t(placeHolderText || "") ??
                                    (selectedAgent?.capabilities.imageGeneration
                                      ? t("Describe anything...")
                                      : isWebSearchEnabled
                                        ? `${t("Search anything")}${iWillRemember}`
                                        : `${t("Ask anything")}${iWillRemember}`))
                    }
                    Top={
                      thread && (
                        <Div style={styles.chatTop.style}>
                          {suggestSaveApp ? (
                            <A
                              href={`${FRONTEND_URL}/?step=add&part=title`}
                              title={t("Build your app")}
                              onClick={(e) => {
                                addHapticFeedback()

                                if (e.metaKey || e.ctrlKey) {
                                  return
                                }
                                e.preventDefault()

                                router.push(`${slugPath}?step=add&part=title`)
                              }}
                              className="button transparent"
                              style={{
                                ...utilities.button.style,
                                ...utilities.transparent.style,
                                ...utilities.xSmall.style,
                              }}
                            >
                              <Img
                                showLoading={false}
                                src={`${FRONTEND_URL}/icons/plus-128.png`}
                                alt="Calendar"
                                width={16}
                                height={16}
                              />
                            </A>
                          ) : isRetro || user?.role === "admin" ? (
                            <>
                              <Button
                                onClick={() => setIsRetro(false)}
                                className="link"
                              >
                                <CircleX size={11} />
                              </Button>
                              <Button
                                data-testid="retro-button"
                                className="link"
                                style={{
                                  ...utilities.link.style,
                                }}
                                onClick={() => {
                                  if (isRetro) {
                                    // Advance to next question
                                    if (
                                      dailyQuestionData?.isLastQuestionOfSection
                                    ) {
                                      advanceDailySection()
                                    } else {
                                      setDailyQuestionIndex(
                                        dailyQuestionIndex + 1,
                                      )
                                    }
                                  } else {
                                    setIsRetro(true)
                                  }
                                }}
                              >
                                <Img size={16} app={app} />
                              </Button>
                            </>
                          ) : grapes?.length ? (
                            <Grapes
                              style={{
                                ...utilities.button.style,
                                ...utilities.transparent.style,
                                ...utilities.xSmall.style,
                                padding: 0,
                                border: "none",
                                backgroundColor: "transparent",
                              }}
                            />
                          ) : (
                            <A
                              href={`${FRONTEND_URL}/calendar${threadId ? `?threadId=${threadId}` : ""}`}
                              title={t("Organize your life")}
                              onClick={(e) => {
                                addHapticFeedback()

                                if (e.metaKey || e.ctrlKey) {
                                  return
                                }
                                e.preventDefault()

                                goToCalendar()
                              }}
                              className="button transparent"
                              style={{
                                ...utilities.button.style,
                                ...utilities.transparent.style,
                                ...utilities.xSmall.style,
                              }}
                            >
                              <Img
                                showLoading={false}
                                src={`${FRONTEND_URL}/icons/calendar-128.png`}
                                alt="Calendar"
                                width={16}
                                height={16}
                              />
                            </A>
                          )}
                          <Instructions
                            dataTestId="chat-instruction"
                            icon
                            thread={thread}
                          />
                          <EnableSound />
                          <Bookmark
                            size={16}
                            dataTestId="thread"
                            onSave={async () => {
                              refetchThreads()
                            }}
                            thread={thread}
                          ></Bookmark>
                          <Button
                            data-testid={`${liked ? "unfilter" : "filter"}-liked-button`}
                            className={"link"}
                            onClick={() => {
                              addHapticFeedback()
                              setLiked(!liked)
                            }}
                            style={{
                              ...utilities.xSmall.style,
                              padding: 0,
                            }}
                          >
                            {liked ? (
                              <ThumbsUp color="var(--accent-1)" size={16} />
                            ) : (
                              <ThumbsUp color="var(--shade-3)" size={16} />
                            )}
                          </Button>

                          {!isVisitor && (
                            <Share
                              dataTestId="chat"
                              onCollaborationChange={() => {
                                setCollaborationVersion((v) => v + 1)
                                refetch()
                              }}
                              onChangeVisibility={(visibility) =>
                                setThread({ ...thread, visibility })
                              }
                              size={16}
                              thread={thread}
                            />
                          )}

                          <Span
                            data-testid="hourly-limit-info"
                            data-hourly-left={hourlyUsageLeft}
                            style={styles.hourlyLimit.style}
                          >
                            {!user?.subscription || !guest?.subscription ? (
                              <Button
                                className="link"
                                onClick={() => {
                                  addHapticFeedback()
                                  if (guest) {
                                    addParams({
                                      subscribe: "true",
                                      plan: "member",
                                    })
                                    return
                                  }
                                  addParams({
                                    subscribe: "true",
                                  })
                                }}
                                style={utilities.link.style}
                              >
                                <ClockPlus size={16} />
                              </Button>
                            ) : (
                              <Clock color="var(--accent-1)" size={16} />
                            )}
                            {hitHourlyLimit && (
                              <Span style={{ fontSize: "1rem" }}>😅</Span>
                            )}
                            {user?.messagesLastHour ||
                              guest?.messagesLastHour ||
                              0}
                            /{hourlyLimit}"
                          </Span>
                          <CollaborationStatus
                            dataTestId="chat"
                            key={`${thread.id}-${collaborationVersion}`}
                            onSave={(status) => {
                              setCollaborationVersion((v) => v + 1)
                              collaborationStatus &&
                                setCollaborationStatus(undefined)
                              if (
                                status === "revoked" ||
                                (status === "rejected" &&
                                  (thread.userId !== user?.id ||
                                    thread.guestId !== user?.id))
                              ) {
                                setIsNewChat({
                                  value: true,
                                })
                                return
                              }

                              !collaborationStatus && refetchThreads()
                              refetch()
                            }}
                            thread={thread}
                          />
                        </Div>
                      )
                    }
                    thread={thread}
                    showSuggestions={
                      !showTribe &&
                      !showFocus &&
                      !isLoading &&
                      messages.length === 0
                    }
                    onToggleGame={(on) => setIsGame(on)}
                    showGreeting={isEmpty}
                    onStreamingStop={async (message) => {
                      message?.message?.clientId &&
                        setMessages((prev) => {
                          return prev.map((m) =>
                            m.message.id === message?.message?.clientId
                              ? {
                                  ...m,
                                  message: {
                                    ...m.message,
                                    isStreamingStop: true,
                                    isStreaming: false,
                                  },
                                }
                              : m,
                          )
                        })
                    }}
                    onMessage={(msg) => {
                      if (msg.isUser && msg.message) {
                        console.log("✅ Adding user message to state")
                        scrollToBottom(500, true)
                        resetScrollState()
                        shouldStopAutoScrollRef.current = false // Reset auto-scroll for new response

                        if (
                          !msg.message.message.selectedAgentId &&
                          isOwner(msg.message.message, {
                            userId: user?.id,
                            guestId: guest?.id,
                          }) &&
                          msg.message.message.threadId
                        ) {
                          if (!threadId) {
                            if (typeof window !== "undefined") {
                              window.history.pushState(
                                {},
                                "",
                                `/threads/${msg.message.message.threadId}`,
                              )
                            }
                            setIsNewChat({
                              value: false,
                            })
                          }
                        }
                        setMessages((prev) => {
                          const existingIndex = prev.findIndex(
                            (m) =>
                              m.message.clientId ===
                              msg.message?.message?.clientId,
                          )

                          const newMessage = {
                            message: msg.message?.message!,
                            aiAgent: undefined,
                            user: msg.message?.user ?? user ?? undefined,
                            guest: msg.message?.guest ?? guest ?? undefined,
                            thread: msg.message?.thread ?? thread ?? undefined,
                          }

                          if (existingIndex >= 0) {
                            const updated = [...prev]
                            updated[existingIndex] = newMessage
                            return updated
                          }

                          const newMessages = [newMessage, ...prev]
                          console.log(
                            "📝 Updated messages state:",
                            newMessages.length,
                            "messages",
                            "Added:",
                            newMessage.message.id,
                          )
                          return newMessages
                        })
                      } else if (msg.message) {
                        console.log("🤖 Adding AI message to state", {
                          messageId: msg.message?.message?.id,
                          content: msg.content,
                        })
                        setMessages((prev) => {
                          const messageId = msg.message?.message?.id
                          if (!messageId) return prev
                          const existingIndex = prev.findIndex(
                            (m) => m.message.id === messageId,
                          )

                          const newMessage = {
                            message: {
                              id: msg.message?.message?.id!,
                              type: "chat" as const, // Regular chat message
                              content: msg.content,
                              createdOn: msg?.message?.message?.createdOn!,
                              updatedOn: msg?.message?.message?.updatedOn!,
                              agentId:
                                msg?.message?.message?.agentId ||
                                msg?.message?.message?.selectedAgentId ||
                                null,
                              agentVersion: selectedAgent?.version || null,
                              threadId: "",
                              readOn: msg?.message?.message?.createdOn!,
                              userId: user?.id || null,
                              guestId: guest?.id || null,
                              searchContext:
                                msg?.message?.message?.searchContext!,
                              webSearchResult:
                                msg?.message?.message?.webSearchResult!,
                              metadata: msg?.message?.message?.metadata!,
                              originalContent: msg.content,
                              images: msg?.message?.message?.images!,
                              files: msg?.message?.message?.files!,
                              isWebSearchEnabled: msg?.isWebSearchEnabled!,
                              isImageGenerationEnabled:
                                msg?.isImageGenerationEnabled!,
                              isStreaming: true,
                              reasoning: msg?.message?.message?.reasoning!,
                              like: null,
                              dislike: null,
                              creditCost: selectedAgent?.creditCost || 1,
                              task: msg?.message?.message?.task!,
                              reactions: msg?.message?.message?.reactions!,
                              clientId: msg.message?.message?.clientId!,
                              audio: msg?.message?.message?.audio!,
                              video: msg?.message?.message?.video!,
                              selectedAgentId:
                                msg.message?.message?.selectedAgentId!,
                              debateAgentId:
                                msg.message?.message?.debateAgentId!,
                              pauseDebate: msg.message?.message?.pauseDebate!,
                            },
                            aiAgent: msg?.message?.aiAgent! || selectedAgent,
                            thread: thread,
                          }

                          if (existingIndex >= 0) {
                            const updated = [...prev]
                            updated[existingIndex] = newMessage
                            return updated
                          }

                          return [...prev, newMessage]
                        })
                      }
                    }}
                    onStreamingUpdate={handleStreamingUpdate}
                    onStreamingComplete={(message?: {
                      message: message
                      user?: user
                      guest?: guest
                      aiAgent?: aiAgent
                      thread?: thread
                    }) => {
                      console.log("🤖 onStreamingComplete", {
                        messageId: message?.message?.id,
                        content: message?.message?.content,
                      })
                      if (!message?.aiAgent?.id && !message?.message.agentId)
                        return

                      if (
                        isOwner(message.message, {
                          userId: user?.id,
                          guestId: guest?.id,
                        })
                      ) {
                        setShouldGetCredits(true)
                      }

                      plausible({
                        name: ANALYTICS_EVENTS.THREAD_MESSAGE_AGENT,
                        props: {
                          isStreaming: false,
                          agentId: selectedAgent?.id,
                          agentName: selectedAgent?.name,
                          agentVersion: selectedAgent?.version,
                        },
                      })

                      message?.thread &&
                        setThread({
                          ...message.thread,
                        })

                      // Mark last AI message as not streaming
                      message &&
                        setMessages((prev) =>
                          prev.map((m, i) => {
                            if (m.message.id === message.message.id) {
                              if (m.message.isStreamingStop) {
                                return {
                                  ...m,
                                }
                              }

                              return {
                                ...m,
                                message: {
                                  ...m.message,
                                  ...message.message,
                                  id: m.message.id,
                                  isStreaming: false,
                                },
                              }
                            }
                            return m
                          }),
                        )

                      if (!burn && !id && message?.message.threadId) {
                        requestAnimationFrame(() => {
                          const navigationOptions = {
                            state: { preservedThread: thread } as {
                              preservedThread?: ThreadWithLikeCount
                            },
                          }

                          // setIsNewChat(false)
                          // Update URL without triggering route change
                          if (typeof window !== "undefined") {
                            window.history.pushState(
                              navigationOptions.state,
                              "",
                              `/threads/${message.message.threadId}`,
                            )
                          }
                        })
                      }
                    }}
                  />
                </Div>
              </Div>
            )}
          </>
        )}
      </Div>
    )
  }

  // Only load Focus on web (not extension) and after hydration
  // Show Tribe for chrry app or /tribe routes

  return showTribe ? (
    <Tribe>{render()}</Tribe>
  ) : showFocus ? (
    <Suspense fallback={<Loading fullScreen />}>
      <Focus>{render()}</Focus>
    </Suspense>
  ) : (
    <Skeleton>
      <MemoryConsent />
      {render()}
    </Skeleton>
  )
}

export default Thread
