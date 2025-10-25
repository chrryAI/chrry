"use client"

/// <reference types="chrome" />

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from "react"
import {
  toast,
  useNavigation,
  usePlatform,
  useOnlineStatus,
  useTheme,
  NavigationParams,
  NavigationOptions,
} from "../../platform"
import { useApp } from "./AppProvider"
import { useChat } from "./ChatProvider"
import { useAuth } from "./AuthProvider"
import { useData } from "./DataProvider"

import useSWR, { SWRConfig } from "swr"
import {
  collaboration,
  thread,
  message,
  user,
  aiAgent,
  guest,
  placeHolder,
  app,
  session,
} from "../../types"
import { t } from "i18next"
import { useWebSocket } from "../../hooks/useWebSocket"
import { getSiteConfig } from "chrry/utils/siteConfig"

const NavigationContext = createContext<
  | {
      hasNotification: boolean
      userNameByUrl: string | undefined
      searchParams: ReturnType<typeof useNavigation>["searchParams"]
      pathname: ReturnType<typeof useNavigation>["pathname"]
      isLoadingThreads: boolean
      setIsLoadingThreads: (value: boolean) => void
      isSmallDevice: boolean
      isMobileDevice: boolean
      isIncognito: boolean
      addParams: ReturnType<typeof useNavigation>["addParams"]
      removeParams: ReturnType<typeof useNavigation>["removeParams"]
      threads: {
        threads: (thread & {
          lastMessage?: message
          collaborations?: { collaboration: collaboration; user: user }[]
        })[]
        totalCount: number
      }
      setThreads: (value: {
        threads: (thread & {
          lastMessage?: message
          collaborations?: { collaboration: collaboration; user: user }[]
        })[]
        totalCount: number
      }) => void

      wasIncognito: boolean
      setWasIncognito: (value: boolean) => void
      isDrawerOpen: boolean
      setIsDrawerOpen: (value: boolean) => void
      router: NavigationParams
      isAccountVisible: boolean
      setIsAccountVisible: (value: boolean) => void
      isMemoryConsentManageVisible: boolean
      setIsMemoryConsentManageVisible: (value: boolean) => void
      isHome: boolean
      setIsHome: (value: boolean) => void
      isSplash: boolean
      setIsSplash: (value: boolean) => void
      isVisitor: boolean
      setIsVisitor: (value: boolean) => void
      collaborationStep: number
      setCollaborationStep: (step: number) => void
      isNewChat: boolean
      isShowingCollaborate: boolean
      refetchThreads: () => Promise<void>
      setIsShowingCollaborate: (value: boolean) => void
      goToThreads: () => void
      goToThread: (threadId: string) => void
      goToApp: (slug: string) => void
      activeCollaborationThreadsCount: number
      pendingCollaborationThreadsCount: number
      setCollaborationStatus: (
        status: "pending" | "active" | undefined | null,
      ) => void
      collaborationStatus: "pending" | "active" | undefined | null
      setIsNewChat: (value: boolean, to?: string) => void
      setSlug: (slug?: string) => void
      slug?: "atlas" | "peach" | "vault" | "bloom" | string
      goToCalendar: () => void
      addParam: (key: string, value: string) => void
      removeParam: (key: string) => void
      showAddToHomeScreen: boolean
      setShowAddToHomeScreen: (value: boolean) => void
    }
  | undefined
>(undefined)

export function NavigationProvider({
  children,
  session,
}: {
  children: ReactNode
  session?: session
}) {
  // TODO: Move navigation logic here

  const addParam = (key: string, value: string) => {
    // TODO: Implement
  }

  const removeParam = (key: string) => {
    // TODO: Implement
  }

  const navigation = useNavigation()

  const { searchParams, pathname, ...router } = navigation
  const getSlugFromPathname = (path: string): string | null => {
    // Remove locale prefix if present (e.g., /ja/atlas -> /atlas)
    const pathWithoutLocale = path.replace(/^\/[a-z]{2}\//, "/")

    // Extract first path segment (could be slug or UUID)
    const match = pathWithoutLocale.match(/^\/([^\/]+)/)
    if (!match) return null

    const segment = match[1]

    // Exclude non-app routes
    const excludedRoutes = [
      "threads",
      "settings",
      "profile",
      "apps",
      "api",
      "_next",
      "signin",
      "signup",
      "onboarding",
      "lifeOS",
    ]
    if (segment && excludedRoutes.includes(segment)) return null

    return segment || null
  }
  const { app, apps, setApp } = useApp()

  const goToCalendar = () => {
    const url = threadId ? `/calendar?threadId=${threadId}` : "/calendar"
    router.push(url)
  }

  const goToThreads = () => {
    router.push(slug ? `/${slug.toLowerCase()}/threads` : "/threads")
  }

  const goToThread = (threadId: string) => {
    router.push(`/threads/${threadId}`)
  }

  const goToApp = (slug: string) => {
    router.push(`/${threadId}`)
  }

  const [isAccountVisible, setIsAccountVisible] = useState(
    searchParams.get("account") === "true",
  )

  const { isExtension, isMobile, viewPortWidth, os, device } = usePlatform()

  useEffect(() => {
    if (viewPortWidth) {
      const width = viewPortWidth
      const isMobileOS = os && ["ios", "android"].includes(os)
      setIsMobileDevice(width < 600 || !!(isMobileOS && device !== "desktop"))
    }
  }, [viewPortWidth, os, device])

  const {
    setProfile,
    fingerprint,
    user,
    guest,
    token,
    setUser,
    setGuest,
    deviceId,
    profile,
    isLoading,
    slug,
    setSlug,
    getAppSlug,
  } = useAuth()

  const [isShowingCollaborate, setIsShowingCollaborate] = useState(false)
  const [collaborationStep, setCollaborationStep] = useState(0)

  const [collaborationStatus, setCollaborationStatusInternal] = useState<
    "pending" | "active" | undefined | null
  >(
    (searchParams.get("collaborationStatus") as "pending" | "active") ??
      undefined,
  )

  const [activeCollaborationThreadsCount, setActiveCollaborationThreadsCount] =
    useState<number>(0)
  const { actions, pageSizes } = useData()

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

  useEffect(() => {
    if (!token) return
    fetchActiveCollaborationThreadsCount()
    fetchPendingCollaborationThreadsCount()
  }, [token])

  const [
    pendingCollaborationThreadsCount,
    setPendingCollaborationThreadsCount,
  ] = useState<number>(0)

  const [showAddToHomeScreen, setShowAddToHomeScreenInternal] = useState(
    searchParams.get("showInstall") === "true",
  )

  const setShowAddToHomeScreen = (value: boolean) => {
    if (typeof window === "undefined") return
    !value && removeParam("showInstall")
    if (value && os === "ios" && app && session?.app?.id !== app.id) {
      // Reload with query param to refresh manifest on ios
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.set("showInstall", "true")
      window.location.href = newUrl.toString()
    } else {
      setShowAddToHomeScreenInternal(value)
    }
  }

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

  const { theme, playNotification } = useTheme()

  const setCollaborationStatus = (
    status: "pending" | "active" | undefined | null,
  ) => {
    setCollaborationStatusInternal(status)
    fetchActiveCollaborationThreadsCount()
    fetchPendingCollaborationThreadsCount()
  }

  let userNameByUrl: string | undefined = undefined

  const pathSegments = pathname.split("/").filter(Boolean)

  if (pathSegments.length >= 1 && pathname.includes("/u/")) {
    // New pattern: /u/[locale]/[username] OR /u/[username]
    userNameByUrl = pathSegments[pathSegments.length - 1]
  }

  const [isLoadingThreads, setIsLoadingThreads] = useState(true)

  const siteConfig = getSiteConfig()

  const [shouldFetchThreads, setShouldFetchThreads] = useState(true)
  const {
    setThread,
    setThreadId,
    thread,
    threadId,
    setShouldRefetchThread,
    setMessages,
    messages,
  } = useChat()

  const {
    data: threadsData,
    mutate: refetchThreads,
    isLoading: isLoadingThreadsSwr,
    error: threadsError,
  } = useSWR(
    siteConfig.mode !== "chrryDev" && shouldFetchThreads
      ? ["contextThreads", thread?.id, app?.id]
      : null,
    () => {
      if (!(user || guest)) return
      return actions.getThreads({
        onError: (status) => {
          if (status === 429) {
            setShouldFetchThreads(false)
          }
        },
        appId: app?.id,
        userName: userNameByUrl,
        pageSize: pageSizes.menuThreads - (isMobile ? 2 : 0),
        sort: "bookmark", // Default to bookmarked threads first
        collaborationStatus: collaborationStatus ?? undefined,
        threadId:
          !thread?.collaborations?.some(
            (c) => user && c.user.id === user?.id,
          ) || guest
            ? thread?.id
            : undefined,
      })
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

  useEffect(() => {
    if (user && userNameByUrl && user.userName !== userNameByUrl) return
    if (guest && userNameByUrl) return

    if (token && !isLoading && thread?.id && (guest || user)) {
      const collab = thread?.collaborations?.find(
        (x) => user && x.user.id === user.id,
      )

      if (collab) {
        if (collab.collaboration.status === "pending") {
          setCollaborationStatus("pending")
        }
        if (collab.collaboration.status === "active") {
          setCollaborationStatus("active")
        }
      } else if (thread?.id) {
        refetchThreads()
      }
    }
  }, [token, isLoading, thread, guest, user, userNameByUrl, pathname])

  const isOnline = useOnlineStatus()

  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
      toast.error(t("You are offline"), {
        duration: 6000,
      })
    }
  }, [isOnline])

  useEffect(() => {
    if (isOnline && wasOffline) {
      setWasOffline(false)
      toast.success(t("You back online"), {
        duration: 6000,
      })
    }
  }, [isOnline])

  useEffect(() => {
    if (threadsError || !isLoadingThreadsSwr) {
      setIsLoadingThreads(false)
    }
  }, [threadsError, isLoadingThreadsSwr])

  const [newChatTrigger, setNewChatTrigger] = useState(0)

  const isIncognito = searchParams.get("incognito") === "true"

  const [wasIncognito, setWasIncognito] = useState(isIncognito)

  const [threads, setThreads] = useState<{
    threads: (thread & {
      lastMessage?: message
      collaborations?: { collaboration: collaboration; user: user }[]
    })[]
    totalCount: number
  }>({
    threads: [],
    totalCount: 0,
  })

  const [hasNotification, setHasNotification] = useState<boolean>(false)

  useEffect(() => {
    setWasIncognito(isIncognito)
    if (isIncognito) {
      setThread(undefined)
      setProfile(undefined)
    }
  }, [isIncognito])

  useEffect(() => {
    if (threadsData && Array.isArray(threadsData.threads)) {
      setThreads(threadsData)
      setIsLoadingThreads(false)
    }
  }, [threadsData])

  useEffect(() => {
    if (pathname !== "/") return

    if (!threadsData || !Array.isArray(threadsData.threads)) return
    if (pendingCollaborationThreadsCount > 0) {
      !hasNotification && setHasNotification(true)
      threadsData.threads.some(
        (thread: thread) => thread.userId === user?.id,
      ) &&
        collaborationStatus === undefined &&
        setCollaborationStatus("pending")
    }
  }, [
    pendingCollaborationThreadsCount,
    threadsData,
    collaborationStatus,
    hasNotification,
  ])

  const [isMemoryConsentManageVisible, setIsMemoryConsentManageVisible] =
    useState(false)

  const [isHome, setIsHome] = useState(pathname === "/")

  useEffect(() => {
    !messages.length && setIsHome(pathname === "/")
  }, [pathname, messages])

  const [isSplash, setIsSplash] = useState(true)

  const [isNewChat, setIsNewChatInternal] = useState(false)

  const setIsNewChat = (
    value: boolean,
    to = app?.slug ? getAppSlug(app) : "/",
  ) => {
    if (value) {
      // if (to === "/" || to.startsWith("/?")) {
      //   setSlug(undefined)
      //   setApp(undefined)
      // }

      setCollaborationStep(0)
      setThread(undefined)
      setProfile(undefined)
      refetchThreads()
      setThreadId(undefined)
      setMessages([])
      router.push(to)
      isIncognito && setWasIncognito(true)
      setCollaborationStatus(undefined)
    }

    if (value && isExtension) {
      // Increment trigger to force useEffect to run even if isNewChat was already true
      setNewChatTrigger((prev) => prev + 1)
    }
    setIsNewChatInternal(value)
  }

  const userOrGuest = user || guest

  // Memoize deps to prevent reconnection loop
  const webSocketDeps = useMemo(() => [userOrGuest], [userOrGuest])

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
    deps: webSocketDeps,
    onMessage: async ({ type, data }) => {
      if (type === "suggestions_generated") {
        if (!token) return
        if (user) {
          const updatedUser = await actions.getUser()
          updatedUser?.suggestions && setUser(updatedUser)
        }
        if (guest) {
          const updatedGuest = await actions.getGuest()
          updatedGuest?.suggestions && setGuest(updatedGuest)
        }

        // if (data.placeholders?.app) {
        //   setApp(data.placeholders.app)
        // }

        setShouldRefetchThread(true)
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
          !hasNotification && setHasNotification(false)
        }
      }
    },
  })

  useEffect(() => {
    threadId && setIsNewChat(false)
  }, [threadId])

  const [isVisitor, setIsVisitor] = useState(false)

  useEffect(() => {
    let visitor = false
    if (profile?.userName) {
      if (guest) visitor = true
      if (user?.userName !== profile.userName) visitor = true
    } else if (userNameByUrl) {
      if (guest) visitor = true
      if (user?.userName !== userNameByUrl) visitor = true
    }

    if (thread) {
      if (user && thread.userId === user?.id) {
        visitor = false
      } else if (guest && thread.guestId === guest?.id) {
        visitor = false
      } else {
        visitor = true
      }
    }

    if (isNewChat) {
      visitor = false
    }

    setIsVisitor(visitor)
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

      document.addEventListener("visibilitychange", handleVisibilityChange)
      document.addEventListener("pagehide", handleBeforeUnload)
      window.addEventListener("pageshow", () =>
        notifyPresence?.({ isOnline: true }),
      )

      window.addEventListener("offline", handleNetworkChange)

      // Add unload listener
      window.addEventListener("beforeunload", handleBeforeUnload)
      window.addEventListener("online", handleNetworkChange)

      return () => {
        // Cleanup
        window.removeEventListener("offline", handleNetworkChange)
        window.removeEventListener("online", handleNetworkChange)
        document.removeEventListener("visibilitychange", handleVisibilityChange)
        window.removeEventListener("beforeunload", handleBeforeUnload)
        notifyPresence?.({
          isOnline: false,
          threadId: thread?.id,
        })
      }
    }
  }, [user, guest, threadId, connected])

  // Device detection cookies (SSR-safe)
  const [isSmallDevice, setIsSmallDeviceInternal] = useState(
    viewPortWidth ? viewPortWidth < 960 : device !== "desktop",
  )

  const setIsSmallDevice = (isSmallDevice: boolean) => {
    setIsSmallDeviceInternal(isSmallDevice)
    setIsDrawerOpen(!isSmallDevice)
  }

  // Drawer state cookie (SSR-safe) - closed by default on server
  const [isDrawerOpen, setIsDrawerOpen] = useState(!isSmallDevice)

  // Update isSmallDevice when viewport changes
  useEffect(() => {
    if (viewPortWidth) {
      const width = viewPortWidth
      const newIsSmallDevice = width < 960
      // Only update if actually changed
      setIsSmallDeviceInternal((prev) => {
        if (prev !== newIsSmallDevice) {
          // Also update drawer state to match
          setIsDrawerOpen(!newIsSmallDevice)
          return newIsSmallDevice
        }
        return prev
      })
    }
  }, [viewPortWidth])

  const [isMobileDevice, setIsMobileDevice] = useState(
    (viewPortWidth && viewPortWidth < 600) ||
      (os && ["ios", "android"].includes(os) && device !== "desktop")
      ? true
      : false,
  )

  return (
    <NavigationContext.Provider
      value={{
        userNameByUrl,
        hasNotification,
        isLoadingThreads,
        setIsLoadingThreads,
        isSmallDevice,
        isMobileDevice,
        pathname: navigation.pathname,
        searchParams: navigation.searchParams,
        addParams: navigation.addParams,
        removeParams: navigation.removeParams,
        threads,
        setThreads,
        wasIncognito,
        setWasIncognito,
        isIncognito,
        router: navigation,
        isAccountVisible,
        setIsAccountVisible,
        isHome,
        setIsHome,
        isSplash,
        setIsSplash,
        goToCalendar,
        slug,
        addParam,
        removeParam,
        showAddToHomeScreen,
        isNewChat,
        isDrawerOpen,
        setIsDrawerOpen,
        setIsNewChat,
        setShowAddToHomeScreen,
        setSlug,
        goToThreads,
        goToApp,
        goToThread,
        pendingCollaborationThreadsCount,
        activeCollaborationThreadsCount,
        setCollaborationStatus,
        collaborationStatus,
        isShowingCollaborate,
        collaborationStep,
        setCollaborationStep,
        setIsShowingCollaborate,
        isMemoryConsentManageVisible,
        setIsMemoryConsentManageVisible,
        isVisitor,
        setIsVisitor,
        refetchThreads: async () => {
          setShouldFetchThreads(true)
          await refetchThreads()
        },
      }}
    >
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigationContext() {
  const context = useContext(NavigationContext)
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider")
  }
  return context
}
