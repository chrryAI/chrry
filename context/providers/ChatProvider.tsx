"use client"

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useMemo,
} from "react"
import { useAuth } from "./AuthProvider"
import { useData } from "./DataProvider"
import {
  aiAgent,
  thread,
  session,
  app,
  collaboration,
  user,
  characterProfile,
  guest,
  message,
  messages,
  paginatedMessages,
  appWithStore,
} from "../../types"

import { pageSizes, isOwner } from "../../utils"
import { hasThreadNotification } from "../../utils/hasThreadNotification"
import { getThreadId } from "../../utils/url"
import {
  toast,
  useLocalStorage,
  useNavigation,
  usePlatform,
  useTheme,
} from "../../platform"
import { useApp } from "./AppProvider"
import { getHourlyLimit } from "../../utils/getHourlyLimit"
import useSWR from "swr"
import { useWebSocket } from "../../hooks/useWebSocket"
import { useError } from "./ErrorProvider"

interface placeHolder {
  // TODO: Define placeHolder type
  [key: string]: any
}

const ChatContext = createContext<
  | {
      shouldFetchThread: boolean
      setShouldFetchThread: (shouldFetchThread: boolean) => void
      shouldGetCredits: boolean
      setShouldGetCredits: (shouldGetCredits: boolean) => void
      fetchActiveCollaborationThreadsCount: () => Promise<void>
      fetchPendingCollaborationThreadsCount: () => Promise<void>
      setIsNewAppChat: (item: appWithStore | undefined) => void
      shouldFocus: boolean
      setShouldFocus: (shouldFocus: boolean) => void
      placeHolderText: string | undefined
      setPlaceHolderText: (placeHolderText: string | undefined) => void
      isImageGenerationEnabled: boolean
      setIsImageGenerationEnabled: (
        value: boolean,
        forAgent?: aiAgent | null,
      ) => void
      hasNotification: boolean
      nextPage: number | undefined
      setNextPage: (nextPage: number | undefined) => void
      scrollToBottom: (timeout?: number, force?: boolean) => void
      status: number | null
      error: any
      until: number
      setUntil: (until: number) => void
      liked?: boolean
      setLiked: (liked: boolean | undefined) => void
      isLoadingMore: boolean
      setIsLoadingMore: (isLoadingMore: boolean) => void
      isLoading: boolean
      setIsAgentModalOpenInternal: (isAgentModalOpen: boolean) => void
      isDebateAgentModalOpen: boolean
      setIsDebateAgentModalOpen: (isDebateAgentModalOpen: boolean) => void
      isAgentModalOpen: boolean
      setIsAgentModalOpen: (isAgentModalOpen: boolean) => void
      isAgentAuthorized: (agent: aiAgent | undefined | null) => boolean
      messages: messages
      setMessages: React.Dispatch<React.SetStateAction<messages>>
      perplexityAgent?: aiAgent
      deepSeekAgent?: aiAgent
      claudeAgent?: aiAgent
      favouriteAgent?: aiAgent
      setCreditsLeft: (creditsLeft: number) => void
      isWebSearchEnabled: boolean
      selectedAgent: aiAgent | undefined | null
      setSelectedAgent: (agent: aiAgent | undefined | null) => void
      aiAgents: aiAgent[]
      hitHourlyLimit: boolean
      debateAgent: aiAgent | undefined | null
      setDebateAgent: (agent: aiAgent | undefined | null) => void
      isDebating: boolean
      hourlyLimit: number
      hourlyUsageLeft: number
      isEmpty: boolean
      isChatFloating: boolean
      setIsChatFloating: (isChatFloating: boolean) => void
      input: string
      refetchThread: () => Promise<void>
      setIsWebSearchEnabled: (isWebSearchEnabled: boolean) => void
      setInput: (input: string) => void
      placeHolder: placeHolder | undefined
      setPlaceHolder: (placeHolder?: placeHolder) => void
      creditsLeft?: number
      thread?: thread
      threadId?: string
      setThread: (thread?: thread) => void
      userNameByUrl: string | undefined
      isLoadingThreads: boolean
      setIsLoadingThreads: (value: boolean) => void
      isIncognito: boolean
      threads?: {
        threads?: thread[]
        totalCount: number
      }
      setThreads: (value: { threads: thread[]; totalCount: number }) => void

      wasIncognito: boolean
      setWasIncognito: (value: boolean) => void
      isVisitor: boolean
      setIsVisitor: (value: boolean) => void
      collaborationStep: number
      setCollaborationStep: (step: number) => void
      isNewChat: boolean
      refetchThreads: () => Promise<void>
      activeCollaborationThreadsCount: number
      pendingCollaborationThreadsCount: number
      setCollaborationStatus: (
        status: "pending" | "active" | undefined | null,
      ) => void
      collaborationStatus: "pending" | "active" | undefined | null
      setIsNewChat: (value: boolean, to?: string) => void
    }
  | undefined
>(undefined)

export function ChatProvider({
  children,
}: {
  children: ReactNode
}): React.JSX.Element {
  // Get auth data
  const {
    setGuest,
    setUser,
    setApp,
    storeApps,
    app,
    chrry,
    track,
    aiAgents,
    token,
    setProfile,
    getAppSlug,
    deviceId,
    profile,
    fingerprint,
    user,
    guest,
    session,
    thread,
    setThread,
    sushiAgent,
    deepSeekAgent,
    perplexityAgent,
    claudeAgent,
    favouriteAgent,
    threadIdRef,
    migratedFromGuestRef,
    fetchSession,
    loadingApp,
    setLoadingApp,
    threads,
    setThreads,
    hasStoreApps,
    hasNotification,
    setHasNotification,
    ...auth
  } = useAuth()

  const threadId = threadIdRef.current

  const [isChatFloating, setIsChatFloating] = useState(false)

  // Chat state
  const [input, setInput] = useState<string>("")

  const [messages, setMessages] = useState<
    {
      message: message & {
        isStreaming?: boolean
        isStreamingStop?: boolean
      }
      user?: user
      guest?: guest
      aiAgent?: aiAgent
      thread?: thread
    }[]
  >(auth.threadData?.messages.messages || [])

  const isEmpty = !messages?.length

  const { isExtension, isMobile } = usePlatform()

  const [shouldFetchThreads, setShouldFetchThreads] = useState(!threads)

  let userNameByUrl: string | undefined = undefined

  const { pathname, searchParams, addParams, removeParams, ...router } =
    useNavigation()

  const pathSegments = pathname.split("/").filter(Boolean)

  if (pathSegments.length >= 1 && pathname.includes("/u/")) {
    // New pattern: /u/[locale]/[username] OR /u/[username]
    userNameByUrl = pathSegments[pathSegments.length - 1]
  }

  const [collaborationStatus, setCollaborationStatusInternal] = useState<
    "pending" | "active" | undefined | null
  >(
    user?.pendingCollaborationThreadsCount ||
      guest?.pendingCollaborationThreadsCount
      ? "pending"
      : undefined,
  )

  // Load cached threads immediately on mount

  useEffect(() => {
    if (user && migratedFromGuestRef.current) {
      migratedFromGuestRef.current = false
      fetchSession()
      refetchThreads()
    }
  }, [user])

  const {
    data: threadsSwr,
    mutate: refetchThreads,
    isLoading: isLoadingThreadsSwr,
    error: threadsError,
  } = useSWR(
    token && shouldFetchThreads
      ? ["contextThreads", thread?.id, app?.id, collaborationStatus]
      : null,
    async () => {
      try {
        const threads = await actions.getThreads({
          onError: (status) => {
            if (status === 429) {
              setShouldFetchThreads(false)
            }
          },
          appId: app?.id,
          userName: userNameByUrl,
          pageSize: pageSizes.menuThreads - (isMobile ? 2 : 0),
          sort: "bookmark",
          collaborationStatus:
            collaborationStatus === "pending" ? undefined : collaborationStatus,
          threadId:
            !thread?.collaborations?.some(
              (c) => user && c.user.id === user?.id,
            ) || guest
              ? thread?.id
              : undefined,
        })

        // Cache threads on successful fetch (30 min TTL)

        return threads
      } catch (error) {
        captureException(error)
      }
    },

    {
      onError: (error) => {
        // Stop retrying on rate limit errors
        if (error.message.includes("429")) {
          setShouldFetchThreads(false)
        }
      },
      // revalidateOnMount: true,
      // revalidateOnFocus: true,
    },
  )

  const [isLoadingThreads, setIsLoadingThreads] = useState(!threads)

  useEffect(() => {
    if (threadsError || !isLoadingThreadsSwr) {
      setIsLoadingThreads(false)
    }
  }, [threadsError, isLoadingThreadsSwr])

  const [activeCollaborationThreadsCount, setActiveCollaborationThreadsCount] =
    useState<number>(
      user?.activeCollaborationThreadsCount ||
        guest?.activeCollaborationThreadsCount ||
        0,
    )

  useEffect(() => {
    if (threadsSwr && Array.isArray(threadsSwr.threads)) {
      setThreads(threadsSwr)
      setIsLoadingThreads(false)
    }
  }, [threadsSwr])

  const fetchActiveCollaborationThreadsCount = async () => {
    const threads = await actions.getThreads({
      pageSize: 1,
      collaborationStatus: "active",
      appId: app?.id,
    })
    threads &&
      threads.totalCount &&
      setActiveCollaborationThreadsCount(threads.totalCount)
  }

  const [
    pendingCollaborationThreadsCount,
    setPendingCollaborationThreadsCount,
  ] = useState<number>(
    threads?.threads?.filter((t) =>
      t.collaborations?.some((c) => c.collaboration.status === "pending"),
    ).length || 0,
  )

  const fetchPendingCollaborationThreadsCount = async () => {
    const threads = await actions.getThreads({
      pageSize: 1,
      myPendingCollaborations: true,
      appId: app?.id,
    })
    threads &&
      threads.totalCount &&
      setPendingCollaborationThreadsCount(threads.totalCount)
  }

  const setCollaborationStatus = (
    newStatus: "pending" | "active" | undefined | null,
  ) => {
    if (newStatus === collaborationStatus) {
      return
    }
    setCollaborationStatusInternal(newStatus)
    fetchActiveCollaborationThreadsCount()
    fetchPendingCollaborationThreadsCount()
  }

  const [isNewChat, setIsNewChatInternal] = useState(false)

  const [collaborationStep, setCollaborationStep] = useState(0)

  const [isIncognito, setIsIncognito] = useState(
    searchParams.get("incognito") === "true",
  )

  useEffect(() => {
    if (isIncognito) {
      setWasIncognito(true)
      setIsNewChat(true, "/?incognito=true")
    } else {
      setWasIncognito(false)
    }
  }, [isIncognito])

  useEffect(() => {
    setIsIncognito(searchParams.get("incognito") === "true")
  }, [searchParams])

  const [wasIncognito, setWasIncognito] = useState(isIncognito)

  const [loading, setLoading] = useState<boolean>(false)

  const setIsNewAppChat = (item: appWithStore | undefined) => {
    if (!loadingApp && hasStoreApps(item) && item) {
      setIsNewChat(true, getAppSlug(item))
      setLoading(false)
      return
    }

    if (!loadingApp && item) {
      setLoading(true)
      setLoadingApp(item)
      return
    }
  }

  useEffect(() => {
    if (!loading) {
      return
    }

    if (hasStoreApps(loadingApp) && loadingApp) {
      setIsNewChat(true, getAppSlug(loadingApp))
      setLoading(false)
      return
    }
  }, [loading, storeApps, loadingApp])

  const setIsNewChat = (
    value: boolean,
    to = app?.slug ? getAppSlug(app) : "/",
  ) => {
    if (value) {
      setCollaborationStep(0)
      setThread(undefined)
      setProfile(undefined)
      setMessages([])
      setStatus(null)
      isIncognito && setWasIncognito(true)
      setCollaborationStatus(null)
      setIsChatFloating(false)

      router.push(to)

      refetchThreads()
    }

    setIsNewChatInternal(value)
  }

  const fetchThreads = async () => {
    setShouldFetchThreads(true)
    shouldFetchThreads && (await refetchThreads())
  }

  useEffect(() => {
    if (app) {
      fetchThreads()
    }
  }, [app])

  useEffect(() => {
    setWasIncognito(isIncognito)
    if (isIncognito) {
      // setThread(undefined)
      setProfile(undefined)
    }
  }, [isIncognito])

  const userOrGuest = user || guest

  const { isSmallDevice, isDrawerOpen, playNotification } = useTheme()

  const [shouldGetCredits, setShouldGetCredits] = useState(false)

  useEffect(() => {
    if (shouldGetCredits) {
      ;(async () => {
        try {
          if (user) {
            const item = await actions.getUser()

            if (item) {
              setCreditsLeft(item.creditsLeft)
            }
          }

          if (guest) {
            const item = await actions.getGuest()

            if (item) {
              setCreditsLeft(item.creditsLeft)
            }
          }
        } catch (error) {
          console.error(error)
        } finally {
          setShouldGetCredits(false)
        }
      })()
    }
  }, [shouldGetCredits, user, guest])

  const { notifyPresence, connected } = useWebSocket<{
    type: string
    data: {
      placeholders?: {
        home: placeHolder
        thread: placeHolder
        app?: app
      }
      message?: {
        message: message
        user?: user
        guest?: guest
        aiAgent?: aiAgent
      }
      collaboration?: collaboration
    }
  }>({
    token,
    deviceId,
    deps: [userOrGuest, token, deviceId],
    onMessage: async ({ type, data }) => {
      if (type === "suggestions_generated") {
        if (user) {
          const updatedUser = await actions.getUser()

          setUser(updatedUser)
        }

        if (guest) {
          const updatedGuest = await actions.getGuest()

          setGuest(updatedGuest)
        }

        await mutate()
      }
      if (
        type === "notification" &&
        data?.message?.message?.threadId !== threadId
      ) {
        playNotification()

        const title = `${
          data?.message?.message.content?.slice(0, 100) ||
          "You have a new message"
        } - Vex`

        if (isExtension) {
          // Extension notification using chrome.notifications
          if (typeof chrome !== "undefined" && chrome.notifications) {
            chrome.notifications.getPermissionLevel((level) => {
              if (level === "granted") {
                chrome.notifications.create({
                  type: "basic",
                  iconUrl: chrome.runtime.getURL("icons/icon-128.png"),
                  title,
                  message: title,
                  contextMessage: "Vex",
                  buttons: [{ title: "View" }],
                })
              } else {
                console.log(
                  "Extension notification permission not granted:",
                  level,
                )
              }
            })
          }
        }
        if (
          data?.collaboration?.status === "active" ||
          data?.collaboration?.status === "pending"
        ) {
          setCollaborationStatus(data.collaboration.status)
        }
      }
    },
  })

  useEffect(() => {
    const hasNotifications = !!threads?.threads?.some((thread: thread) =>
      hasThreadNotification({ thread }),
    )
    hasNotifications && setHasNotification(hasNotifications)
  }, [threads])

  const [isVisitor, setIsVisitor] = useState(false)

  useEffect(() => {
    threadId && setIsNewChat(false)
  }, [threadId])

  useEffect(() => {
    if (profile) {
      setIsVisitor(user?.id == profile.id)
      return
    } else if (userNameByUrl) {
      setIsVisitor(user?.userName == userNameByUrl)
      return
    }

    if (thread) {
      setIsVisitor(
        !isOwner(thread, {
          userId: user?.id,
          guestId: guest?.id,
        }),
      )
      return
    }

    setIsVisitor(false)
  }, [profile, guest, user, userNameByUrl, thread, isNewChat])

  useEffect(() => {
    if (!token || !fingerprint || !connected) return

    const heartbeatInterval = setInterval(() => {
      if (!connected) return
      notifyPresence?.({
        isOnline: navigator.onLine,
        threadId: threadId,
      })
    }, 30000) // 30 seconds

    return () => clearInterval(heartbeatInterval)
  }, [token, fingerprint, notifyPresence, threadId, connected])

  useEffect(() => {
    if (!token || !fingerprint || !connected) return
    // Listen for navigation messages from service worker
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "NAVIGATE_TO_URL") {
        window.location.href = event.data.url
      }
    }

    const handleNetworkChange = () => {
      notifyPresence?.({
        isOnline: navigator.onLine,
        threadId: threadId,
      })
    }
    const handleVisibilityChange = () => {
      notifyPresence?.({
        isOnline: document.visibilityState === "visible",
        threadId: threadId,
      })
    }
    const handleBeforeUnload = () => {
      notifyPresence?.({
        isOnline: false,
        threadId: threadId,
      })
    }

    if (user || guest) {
      // Initial online notification
      notifyPresence?.({
        isOnline: true,
        threadId: threadId,
      })

      // Platform-safe event listeners
      if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", handleVisibilityChange)
        document.addEventListener("pagehide", handleBeforeUnload)
      }

      if (typeof window !== "undefined" && window.addEventListener) {
        window.addEventListener("pageshow", () =>
          notifyPresence?.({ isOnline: true }),
        )

        window.addEventListener("offline", handleNetworkChange)

        // Add unload listener
        window.addEventListener("beforeunload", handleBeforeUnload)
        window.addEventListener("online", handleNetworkChange)
      }

      return () => {
        // Cleanup
        if (typeof window !== "undefined" && window.removeEventListener) {
          window.removeEventListener("offline", handleNetworkChange)
          window.removeEventListener("online", handleNetworkChange)
          window.removeEventListener("beforeunload", handleBeforeUnload)
        }
        if (typeof document !== "undefined" && document.removeEventListener) {
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          )
        }
        notifyPresence?.({
          isOnline: false,
          threadId: thread?.id,
        })
      }
    }
  }, [user, guest, threadId, connected])

  // Credits tracking
  const [creditsLeft, setCreditsLeft] = useState<number | undefined>(undefined)

  useEffect(() => {
    if (user?.creditsLeft || guest?.creditsLeft) {
      setCreditsLeft(user?.creditsLeft || guest?.creditsLeft)
    }
  }, [user?.creditsLeft, guest?.creditsLeft])

  // AI Agents

  const returnSelectedAgent = (
    agent: aiAgent | undefined | null,
  ): aiAgent | undefined | null => {
    if (!isAgentAuthorized(agent)) {
      const a = isWebSearchEnabled ? perplexityAgent : sushiAgent

      return a
    }

    return agent
  }

  const [debateAgent, setDebateAgentInternal] = useLocalStorage<
    aiAgent | undefined | null
  >("debateAgent", undefined)

  useEffect(() => {
    if (debateAgent) {
      track({
        name: "debate_agent_selected",
        props: { agent: debateAgent.displayName },
      })
    }
  }, [debateAgent])

  const isAgentAuthorized = (agent: aiAgent | undefined | null) => {
    if (!agent) return false
    if (user?.subscription || guest?.subscription) {
      return true
    }
    return user
      ? !["subscriber"].includes(agent.authorization)
      : ["guest", "all"].includes(agent.authorization)
  }

  const ph = thread?.placeHolder || app?.placeHolder

  const [placeHolder, setPlaceHolder] = useState<placeHolder | undefined>(
    ph || undefined,
  )

  useEffect(() => {
    setPlaceHolder(ph)
  }, [thread, app])

  const [placeHolderText, setPlaceHolderText] = React.useState<
    string | undefined
  >(placeHolder?.text)

  const [shouldFocus, setShouldFocus] = useState(false)

  useEffect(() => {
    if (placeHolder?.text) {
      setPlaceHolderText(placeHolder.text)
    } else if (app?.placeholder) {
      setPlaceHolderText(app?.placeholder)
    }
  }, [placeHolder, app])

  const { appStatus, baseApp } = useApp()

  const { captureException } = useError()

  useEffect(() => {
    if (appStatus?.part) {
      setSelectedAgent(sushiAgent)
    }
  }, [appStatus?.part])

  const [shouldFetchThread, setShouldFetchThread] = useState(true)

  const [until, setUntil] = useState<number>(1)
  const [liked, setLiked] = useState<boolean | undefined>(undefined)

  const [isLoading, setIsLoading] = useState(!!threadId)

  useEffect(() => {
    setIsLoading(!!threadId)
  }, [threadId])

  const [status, setStatus] = useState<number | null>(null)

  // Build cache key - only include values that affect the response

  const {
    data: threadSWR,
    mutate,
    error,
  } = useSWR(
    shouldFetchThread && token && threadId ? [threadId, liked, until] : null,
    async () => {
      if (!threadId) return

      const threadData = await actions.getThread({
        id: threadId,
        pageSize: until * pageSizes.threads,
        liked: !!liked,
        onError: (error: number) => {
          setIsLoading(false)
          setStatus(error)
        },
      })

      setIsLoading(false)

      return threadData
    },
    {
      // revalidateOnMount: true,
    },
  )

  const [agentName, setAgentName] = useState(session?.aiAgent?.name || "")

  const [isWebSearchEnabled, setIsWebSearchEnabledInternal] =
    useLocalStorage<boolean>("isWebSearchEnabled", agentName === "perplexity")

  const [isImageGenerationEnabled, setIsImageGenerationEnabledInternal] =
    useState(false)

  const isImageGenerationEnabledRef = useRef<boolean>(isImageGenerationEnabled)

  const setIsImageGenerationEnabled = (
    value: boolean,
    forAgent?: aiAgent | null,
  ) => {
    isImageGenerationEnabledRef.current = value
    setIsImageGenerationEnabledInternal(value)
    setSelectedAgentInternal(forAgent || sushiAgent)
    value && setDebateAgent(null)
  }

  const setSelectedAgent = (agent: aiAgent | undefined | null) => {
    if (selectedAgent?.name === agent?.name) return
    if (agent === null) {
      setAgentName("")
      setSelectedAgentInternal(null)
      setDebateAgent(null)
      return
    }

    setSelectedAgentInternal(agent)
    setAgentName(agent?.name || "")
    isImageGenerationEnabledRef.current &&
      setIsImageGenerationEnabledInternal(
        agent?.capabilities?.imageGeneration || false,
      )
    setIsWebSearchEnabledInternal(agent?.capabilities?.webSearch || false)
  }

  const defaultAgent =
    aiAgents.find((a) => app?.defaultModel && a.name === app?.defaultModel) ||
    favouriteAgent

  const [selectedAgent, setSelectedAgentInternal] = useLocalStorage<
    aiAgent | undefined | null
  >("selectedAgent", defaultAgent)

  useEffect(() => {
    !selectedAgent && setSelectedAgent(defaultAgent)
  }, [defaultAgent, selectedAgent])

  const setIsWebSearchEnabled = (value: boolean) => {
    value ? setSelectedAgent(perplexityAgent) : undefined
    setIsWebSearchEnabledInternal(value)
  }

  const setDebateAgent = (agent: aiAgent | undefined | null) => {
    setDebateAgentInternal(agent)
  }

  useEffect(() => {
    if (!user && !guest) return
    if (aiAgents?.length) {
      if (selectedAgent === null) return

      if (selectedAgent) {
        const currentAgent = aiAgents.find(
          (agent) => agent.name === selectedAgent.name,
        )
        setSelectedAgent(currentAgent)

        return
      }

      setSelectedAgent(undefined)
    }
  }, [aiAgents, selectedAgent, user, guest])

  const [isAgentModalOpen, setIsAgentModalOpenInternal] = useState(false)

  const [isDebateAgentModalOpen, setIsDebateAgentModalOpenInternal] =
    useState(false)

  const setIsAgentModalOpen = (open: boolean) => {
    setIsAgentModalOpenInternal(open)
    if (!open) {
      setIsDebateAgentModalOpenInternal(false)
    }
    open &&
      track({
        name: "agent-modal",
        props: {},
      })
  }

  const setIsDebateAgentModalOpen = (open: boolean) => {
    setIsDebateAgentModalOpenInternal(open)
    setIsAgentModalOpenInternal(open)
    open &&
      track({
        name: "debate-agent-modal",
        props: {},
      })
  }

  useEffect(() => {
    const a = aiAgents.find(
      (agent) =>
        app?.defaultModel &&
        app.onlyAgent &&
        agent.name.toLowerCase() === app?.defaultModel?.toLowerCase(),
    )
    if (!a) return

    setSelectedAgent(a)
    setDebateAgent(null)
  }, [app, aiAgents])

  const { isDevelopment, isE2E, actions } = useData()

  const hourlyLimit =
    isDevelopment && !isE2E
      ? 50000
      : getHourlyLimit({
          member: user,
          guest,
        })

  const hourlyUsageLeft = user
    ? hourlyLimit - (user?.messagesLastHour || 0)
    : hourlyLimit - (guest?.messagesLastHour || 0)

  const isDebating = !!debateAgent

  const hitHourlyLimit = hourlyUsageLeft <= 0

  // Auto-refresh hourly limits when timer expires
  useEffect(() => {
    if (!hitHourlyLimit) return

    const lastMessage = user?.lastMessage || guest?.lastMessage
    if (!lastMessage?.createdOn) return

    const lastMessageTime = new Date(lastMessage.createdOn)
    const oneHourLater = new Date(lastMessageTime.getTime() + 60 * 60 * 1000)
    const now = new Date()

    if (now >= oneHourLater) {
      // Hour has already passed, reset immediately
      if (user) {
        setUser({ ...user, messagesLastHour: 0 })
      }
      if (guest) {
        setGuest({ ...guest, messagesLastHour: 0 })
      }
      return
    }

    // Set timer for when hour expires
    const timeUntilReset = oneHourLater.getTime() - now.getTime()
    const timer = setTimeout(() => {
      if (user) {
        setUser({ ...user, messagesLastHour: 0 })
      }
      if (guest) {
        setGuest({ ...guest, messagesLastHour: 0 })
      }
    }, timeUntilReset)

    return () => clearTimeout(timer)
  }, [
    hitHourlyLimit,
    user?.lastMessage?.createdOn,
    guest?.lastMessage?.createdOn,
  ])

  const [nextPage, setNextPage] = useState<number | undefined>(undefined)

  const threadData = threadSWR || auth.threadData || undefined
  const lastProcessedThreadDataRef = useRef<any>(null)

  const shouldStopAutoScrollRef = useRef(false)

  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const scrollToBottom = (timeout = 500, force = false) => {
    if (isChatFloating || !force) return
    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })
    }, timeout)
  }

  useEffect(() => {
    isLoading && error && setIsLoading(false)
  }, [error, isLoading])

  useEffect(() => {
    if (!threadId) {
      status && setStatus(null)
      return
    }

    const serverMessages = threadData?.messages as paginatedMessages

    if (threadData?.thread && Array.isArray(serverMessages.messages)) {
      // Skip if we've already processed this exact threadData
      if (lastProcessedThreadDataRef.current === threadData) return
      lastProcessedThreadDataRef.current = threadData

      // Simple logic: If server has messages, use them. Otherwise keep client messages.
      if (liked) {
        setMessages(serverMessages.messages)
      } else if (serverMessages.messages.length > 0) {
        // Server has data - use it as source of truth
        setMessages(serverMessages.messages)
      } else if (isNewChat) {
        // New chat with no server messages - clear everything
        setMessages([])
      }
      // If server is empty but not a new chat, keep existing client messages (optimistic UI)

      setNextPage(threadData.messages.nextPage)
      setThread(threadData.thread)

      isNewChat && setStatus(null)

      !isNewChat &&
        threadData?.thread?.user &&
        threadData.thread.user.id !== user?.id &&
        setProfile(threadData.thread.user)

      collaborationStatus !== "pending" &&
        !shouldStopAutoScrollRef.current &&
        !isLoadingMore &&
        !(isSmallDevice && isDrawerOpen) &&
        !isChatFloating &&
        scrollToBottom(100)

      // return () => {
      //   setThread(undefined)
      //   setMessages([])
      // }
    }
  }, [
    threadData,
    isLoadingMore,
    aiAgents,
    user,
    setSelectedAgent,
    isNewChat,
    liked,
    shouldStopAutoScrollRef,
    collaborationStatus,
    isSmallDevice,
    isDrawerOpen,
    isChatFloating,
    threadId,
  ])

  return (
    <ChatContext.Provider
      value={{
        fetchActiveCollaborationThreadsCount,
        fetchPendingCollaborationThreadsCount,
        setIsNewAppChat,
        shouldFocus,
        setShouldFocus,
        placeHolderText,
        setPlaceHolderText,
        isImageGenerationEnabled,
        setIsImageGenerationEnabled,
        status,
        isLoadingMore,
        setIsLoadingMore,
        isLoading,
        shouldFetchThread,
        setShouldFetchThread,
        refetchThread: async () => {
          setShouldFetchThread(true)
          shouldFetchThread && (await mutate())
        },
        setIsWebSearchEnabled,
        input,
        setIsAgentModalOpen,
        isAgentModalOpen,
        creditsLeft,
        aiAgents,
        setInput,
        placeHolder,
        setPlaceHolder,
        isChatFloating,
        setIsChatFloating,
        thread,
        setThread,
        threadId,
        until,
        liked,
        setLiked,
        error,
        setUntil,
        isEmpty,
        scrollToBottom,
        isWebSearchEnabled,
        selectedAgent,
        setSelectedAgent,
        hitHourlyLimit,
        debateAgent,
        setDebateAgent,
        isDebating,
        hourlyLimit,
        hourlyUsageLeft,
        setCreditsLeft,
        claudeAgent,
        favouriteAgent,
        messages,
        setMessages,
        isAgentAuthorized,
        setIsDebateAgentModalOpen,
        isDebateAgentModalOpen,
        setIsAgentModalOpenInternal,
        nextPage,
        setNextPage,
        setIsNewChat,
        isNewChat,
        hasNotification,
        isLoadingThreads,
        setIsLoadingThreads,
        threads,
        setThreads,
        wasIncognito,
        setWasIncognito,
        isIncognito,
        pendingCollaborationThreadsCount,
        activeCollaborationThreadsCount,
        setCollaborationStatus,
        collaborationStatus,
        collaborationStep,
        setCollaborationStep,
        isVisitor,
        setIsVisitor,
        refetchThreads: fetchThreads,
        userNameByUrl,
        shouldGetCredits,
        setShouldGetCredits,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error("useChat must be used within ChatProvider")
  }
  return context
}
