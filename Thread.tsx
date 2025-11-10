"use client"

import React, { useEffect, useRef, useState } from "react"
import clsx from "clsx"
import styles from "./Thread.module.scss"
import {
  aiAgent,
  collaboration,
  guest,
  message,
  thread,
  user,
  messages,
  paginatedMessages,
} from "./types"
import { useAppContext } from "./context/AppContext"
import {
  useAuth,
  useChat,
  useData,
  useNavigationContext,
  useApp,
} from "./context/providers"
import { A, usePlatform, useTheme } from "./platform"
import { getThread } from "./lib"
import Loading from "./Loading"
import { FRONTEND_URL, isCollaborator, isOwner, pageSizes } from "./utils"
import { CircleX, Clock, ClockPlus, InfoIcon, ThumbsUp } from "./icons"
import Chat from "./Chat"
import Messages from "./Messages"
import Skeleton from "./Skeleton"
import DeleteThread from "./DeleteThread"
import Instructions from "./Instructions"
import EditThread from "./EditThread"
import { useRouter } from "./hooks/useWindowHistory"
import Share from "./Share"
import { useThreadPresence } from "./hooks/useThreadPresence"
import Bookmark from "./Bookmark"
import CollaborationStatus from "./CollaborationStatus"
import useSWR from "swr"
import EnableSound from "./EnableSound"
import MemoryConsent from "./MemoryConsent"
import Img from "./Img"
import { useHasHydrated } from "./hooks"
import { lazy, Suspense } from "react"

// Lazy load Focus only on web (not extension) to reduce bundle size
// This component includes timer, tasks, moods, and analytics - heavy dependencies
const Focus = lazy(() => import("./Focus"))

declare module "./hooks/useWindowHistory" {
  interface NavigateOptions {
    state?: {
      preservedThread?: thread & { likeCount: number }
    }
  }
}

let cycleIndex = 0

type ThreadWithLikeCount = thread & { likeCount: number }

const Thread = ({
  className,
  isHome,
  ...props
}: {
  className?: string
  isHome?: boolean
  threadId?: string
  threadData?: { thread: thread; messages: paginatedMessages }
}) => {
  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
  const {
    user,
    guest,
    track,
    memoriesEnabled,
    showFocus,
    setShowFocus,
    ...auth
  } = useAuth()

  // Chat context
  const {
    isWebSearchEnabled,
    selectedAgent,
    setSelectedAgent,
    aiAgents,
    hitHourlyLimit,
    debateAgent,
    isDebating,
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
  } = useChat()

  const { os } = usePlatform()

  const [isEmpty, setIsEmpty] = useState(true)

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
    isIncognito,
    goToCalendar,
    pathname,
  } = useNavigationContext()

  const { threadId, creditsLeft, setCreditsLeft } = useChat()

  const setMessages: typeof setMessagesInternal = (messages) => {
    setMessagesInternal(messages)
  }

  const { app, focus, appStatus, appFormWatcher, suggestSaveApp } = useApp()

  const { addHapticFeedback, isDrawerOpen } = useTheme()
  const { isExtension } = usePlatform()

  // Derived from thread

  const slugPath = slug ? `${slug}/` : "/"

  const iWillRemember = memoriesEnabled ? `, ${t("I will remember")} 💭` : ""

  const id = threadId

  // Track if we've already auto-selected an agent for this thread
  const shouldStopAutoScrollRef = useRef(false)

  // Track last processed threadData to prevent re-processing
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

  // useEffect(() => {
  //   if (!id || (!id && wasIncognito)) {
  //     setThread(undefined)
  //     setMessages([])
  //     setWasIncognito(false)
  //   }
  // }, [id, wasIncognito])

  // const [deleted, setDeleted] = useState<boolean | undefined>(undefined)

  const refetch = () => {
    return refetchThread()
  }

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

  const hasHydrated = useHasHydrated()

  const nameIsRequired = `👋 ${t("Name your app......")}`
  const titleIsRequired = `✍️ ${t("Give it a title...")}`

  // Only show app creation warnings when actually in app creation mode
  const appFormPlaceholder = !hasHydrated
    ? null
    : appStatus?.part
      ? !appFormWatcher.canSubmit || appFormWatcher.id
        ? !appFormWatcher.name
          ? nameIsRequired
          : appFormWatcher.title
            ? null
            : titleIsRequired
        : !appFormWatcher.highlights?.length
          ? `${t("You can go next, updating suggestions recommended.")} 🎯`
          : !appFormWatcher.systemPrompt
            ? `${t("Updating Description and Settings recommended.")} 🧠`
            : `${t("You can save it now!")} 🚀`
      : null

  const [isGame, setIsGame] = useState(false)

  const [collaborationVersion, setCollaborationVersion] = useState(0)

  useEffect(() => {
    setIsEmpty(!messages.length)
  }, [messages.length])

  const render = () => {
    return (
      <div
        data-thread-title={thread?.title}
        data-testid={id ? "thread" : isHome ? "home" : undefined}
        className={clsx(
          styles.thread,
          className,
          hitHourlyLimit && styles.hitHourlyLimit,
          isEmpty && styles.empty,
        )}
      >
        {!isVisitor && (
          <div className={styles.headers}>
            {thread && (
              <>
                <div className={styles.header}>
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
                      if (threads.threads.length === 1) {
                        setIsNewChat(true)
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
                      if (threads.threads.length === 1) {
                        setIsNewChat(true)
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
                </div>
              </>
            )}
          </div>
        )}

        {isLoading && !isLoadingMore && isEmpty ? (
          <div className={styles.loadingContainer}>
            <Loading />
          </div>
        ) : error ? (
          <div className={styles.errorContainer}>
            <CircleX color="var(--accent-0)" size={20} /> Something went wrong,
            please try again later
          </div>
        ) : status === 404 ? (
          <div className={styles.errorContainer}>
            <InfoIcon color="var(--accent-1)" size={20} /> Thread not found
          </div>
        ) : status === 401 ? (
          <div className={styles.errorContainer}>
            <InfoIcon color="var(--accent-1)" size={20} /> Unauthorized
          </div>
        ) : (
          <>
            {isGame ? null : (
              <Messages
                onCharacterProfileUpdate={() => {
                  !isChatFloating && scrollToBottom()
                }}
                isHome={isHome}
                thread={thread}
                onPlayAudio={() => {
                  shouldStopAutoScrollRef.current = true
                }}
                onToggleLike={(liked) => {
                  refetch()
                }}
                emptyMessage={
                  liked && messages.length === 0
                    ? t("No more liked messages")
                    : undefined
                }
                showEmptyState={!!thread}
                onDelete={async ({ id }) => {
                  if (messages.length === 1) {
                    await refetch().then(() => setMessages([]))
                  } else
                    await refetch().then(() =>
                      setMessages(messages.filter((m) => m.message.id !== id)),
                    )
                }}
                ref={messagesRef}
                className={styles.messages}
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
              <div
                className={clsx(
                  styles.chatContainer,
                  os && styles[os],
                  isDrawerOpen && styles.drawerOpen,
                  isEmpty && styles.empty,
                )}
              >
                {/* Typing indicator for collaborative threads */}

                <div className={styles.chatContainer}>
                  <Chat
                    requiresSignin={isVisitor && !activeCollaborator && !user}
                    compactMode={showFocus}
                    onTyping={notifyTyping}
                    disabled={isPendingCollaboration}
                    placeholder={
                      appFormPlaceholder
                        ? appFormPlaceholder
                        : !!appStatus?.part
                          ? `${t("Ask anything, I will explain")} 💭`
                          : (t(placeHolderText || "") ??
                            (selectedAgent?.capabilities.imageGeneration
                              ? t("Describe anything...")
                              : isWebSearchEnabled
                                ? `${t("Search anything")}${iWillRemember}`
                                : debateAgent && selectedAgent
                                  ? t(
                                      "Start the {{selectedAgent}} vs {{debateAgent}} debate...",
                                      {
                                        selectedAgent:
                                          selectedAgent.displayName,
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
                                        : `${t("Ask anything")}${iWillRemember}`))
                    }
                    Top={
                      thread && (
                        <div className={styles.chatTop}>
                          {suggestSaveApp ? (
                            <a
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
                              className={clsx(
                                "button link xSmall transparent",
                                styles.collaborateButton,
                              )}
                            >
                              <Img
                                showLoading={false}
                                src={`${FRONTEND_URL}/icons/plus-128.png`}
                                alt="Calendar"
                                width={16}
                                height={16}
                              />
                            </a>
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
                              className={clsx(
                                "button link xSmall transparent",
                                styles.collaborateButton,
                              )}
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
                          <button
                            data-testid={`${liked ? "unfilter" : "filter"}-liked-button`}
                            className={clsx("link", styles.likeButton)}
                            onClick={() => {
                              addHapticFeedback()
                              setLiked(!liked)
                            }}
                          >
                            {liked ? (
                              <ThumbsUp color="var(--accent-1)" size={16} />
                            ) : (
                              <ThumbsUp color="var(--shade-3)" size={16} />
                            )}
                            {t("Filter")}
                          </button>

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
                                setIsNewChat(true)
                                return
                              }

                              !collaborationStatus && refetchThreads()
                              refetch()
                            }}
                            className={styles.collaborationStatus}
                            thread={thread}
                          />
                          <span
                            data-testid="hourly-limit-info"
                            data-hourly-left={hourlyUsageLeft}
                            className={styles.hourlyLimit}
                          >
                            {!user?.subscription || !guest?.subscription ? (
                              <button
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
                                className="link"
                              >
                                <ClockPlus size={16} />
                              </button>
                            ) : (
                              <Clock color="var(--accent-1)" size={16} />
                            )}
                            {hitHourlyLimit && (
                              <span style={{ fontSize: "1rem" }}>😅</span>
                            )}
                            {user?.messagesLastHour ||
                              guest?.messagesLastHour ||
                              0}
                            /{hourlyLimit}"
                          </span>
                        </div>
                      )
                    }
                    thread={thread}
                    showSuggestions={
                      !showFocus && !isLoading && messages.length === 0
                    }
                    onToggleGame={(on) => setIsGame(on)}
                    showGreeting={isEmpty}
                    className={styles.chat}
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
                            setIsNewChat(false)
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
                    onStreamingUpdate={({
                      content,
                      clientId,
                      aiAgent,
                      isWebSearchEnabled,
                      isImageGenerationEnabled,
                    }) => {
                      if (!isLoadingMore && shouldAutoScroll(content)) {
                        scrollToBottom()
                      }

                      // Only update if content actually changed
                      setMessages((prev) => {
                        return prev.map((m) =>
                          m.message.id === clientId &&
                          !m.message.isStreamingStop
                            ? {
                                ...m,
                                message: {
                                  ...m.message,
                                  content,
                                  isStreaming: true,
                                  isWebSearchEnabled: !!isWebSearchEnabled,
                                  isImageGenerationEnabled:
                                    !!isImageGenerationEnabled,
                                },
                                aiAgent: aiAgent ?? m.aiAgent,
                              }
                            : m,
                        )
                      })
                    }}
                    onStreamingComplete={(message?: {
                      message: message
                      user?: user
                      guest?: guest
                      aiAgent?: aiAgent
                      thread?: thread & {
                        likeCount: number
                        collaborations?: {
                          collaboration: collaboration
                          user: user
                        }[]
                      }
                    }) => {
                      console.log("🤖 onStreamingComplete", {
                        message,
                      })
                      if (!message?.aiAgent?.id && !message?.message.agentId)
                        return

                      if (
                        isOwner(message.message, {
                          userId: user?.id,
                          guestId: guest?.id,
                        })
                      ) {
                        creditsLeft &&
                          setCreditsLeft(
                            creditsLeft -
                              (isDebating
                                ? debateAgent?.creditCost || 1
                                : selectedAgent?.creditCost || 1),
                          )
                      }
                      track({
                        name: "thread-message-agent",
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

                      if (!isIncognito && !id && message?.message.threadId) {
                        requestAnimationFrame(() => {
                          const navigationOptions = {
                            state: { preservedThread: thread } as {
                              preservedThread?: ThreadWithLikeCount
                            },
                          }
                          setIsNewChat(false)
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
                </div>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  // Only load Focus on web (not extension) and after hydration

  return showFocus ? (
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
