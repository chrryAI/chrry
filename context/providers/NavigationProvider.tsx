"use client"

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
} from "react"
import {
  toast,
  useNavigation,
  usePlatform,
  NavigationParams,
} from "../../platform"
import { useOnlineStatus } from "../../hooks/useOnlineStatus"
import { useApp } from "./AppProvider"
import { useChat } from "./ChatProvider"
import { useAuth } from "./AuthProvider"
import { ANALYTICS_EVENTS } from "../../utils/analyticsEvents"

import { thread } from "../../types"
import { t } from "i18next"
import { defaultLocale } from "../../locales"
import { getSiteConfig, whiteLabels } from "../../utils/siteConfig"

const NavigationContext = createContext<
  | {
      isInstructionsModalOpen: boolean
      setIsInstructionsModalOpen: (value: boolean) => void
      hasNotification: boolean
      userNameByUrl: string | undefined
      searchParams: ReturnType<typeof useNavigation>["searchParams"]
      pathname: ReturnType<typeof useNavigation>["pathname"]
      isLoadingThreads: boolean
      setIsLoadingThreads: (value: boolean) => void
      burn: boolean
      addParams: ReturnType<typeof useNavigation>["addParams"]
      removeParams: ReturnType<typeof useNavigation>["removeParams"]
      threads?: {
        threads?: thread[]
        totalCount: number
      }
      setThreads: (value: { threads: thread[]; totalCount: number }) => void

      wasIncognito: boolean
      setWasIncognito: (value: boolean) => void
      router: NavigationParams
      isAccountVisible: boolean
      setIsAccountVisible: (value: boolean) => void
      isMemoryConsentManageVisible: boolean
      setIsMemoryConsentManageVisible: (value: boolean) => void
      isHome: boolean
      setIsHome: (value: boolean) => void

      isVisitor: boolean
      setIsVisitor: (value: boolean) => void
      collaborationStep: number
      setCollaborationStep: (step: number) => void
      isNewChat: boolean
      isShowingCollaborate: boolean
      refetchThreads: () => Promise<void>
      setIsShowingCollaborate: (value: boolean) => void
      goToThreads: (params?: Record<string, string>) => void
      getStoreSlug: (slug: string) => string
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

export function NavigationProvider({ children }: { children: ReactNode }) {
  // TODO: Move navigation logic here

  const addParam = (key: string, value: string) => {
    // TODO: Implement
  }

  const removeParam = (key: string) => {
    // TODO: Implement
  }

  const navigation = useNavigation()

  const { searchParams, pathname, ...router } = navigation

  const { app } = useApp()

  const {
    threadId,
    setIsNewChat,
    isNewChat,
    hasNotification,
    isLoadingThreads,
    setIsLoadingThreads,
    threads,
    setThreads,
    wasIncognito,
    setWasIncognito,
    burn,
    pendingCollaborationThreadsCount,
    activeCollaborationThreadsCount,
    setCollaborationStatus,
    collaborationStatus,
    collaborationStep,
    setCollaborationStep,
    isVisitor,
    setIsVisitor,
    refetchThreads,
    userNameByUrl,
    setShouldFetchThread,
  } = useChat()

  const goToCalendar = () => {
    const url = threadId ? `/calendar?threadId=${threadId}` : "/calendar"
    router.push(url)
  }

  const { slug, setSlug, getAppSlug, language, setShowFocus, plausible } =
    useAuth()

  const goToThreads = (params?: Record<string, string>) => {
    setShowFocus(false)
    const url = new URLSearchParams(params)
    router.push(`/threads${params ? "?" + url : ""}`)
  }

  const getStoreSlug = (slug: string) => {
    if (language === defaultLocale) {
      return `/${slug}`
    } else {
      return `/${language}/${slug}`
    }
  }

  const goToThread = (threadId: string) => {
    setShowFocus(false)
    router.push(`/threads/${threadId}`)
  }

  const goToApp = (slug: string) => {
    const appSlug = app ? getAppSlug(app, "") : undefined
    router.push(appSlug ? `/${appSlug}` : `/${slug}`)
  }

  const [isAccountVisible, setIsAccountVisible] = useState(
    searchParams.get("account") === "true",
  )

  const { isStandalone, os } = usePlatform()

  const [isShowingCollaborate, setIsShowingCollaborate] = useState(false)

  const [showAddToHomeScreen, setShowAddToHomeScreenInternal] = useState(
    searchParams.get("showInstall") === "true",
  )

  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false)

  const siteApp = getSiteConfig()

  const copiedRef = useRef(false)

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      toast.success(t("Copied"))
      setTimeout(() => (copiedRef.current = false), 2000)
    } catch (err) {
      toast.error("Failed to copy code")
    }
  }
  const setShowAddToHomeScreen = (value: boolean) => {
    if (typeof window === "undefined") return

    const whiteLabel = app?.slug
      ? whiteLabels.find((a) => a.slug === app.slug)
      : undefined
    !value && removeParam("showInstall")
    if (
      !isStandalone &&
      value &&
      app &&
      app.slug &&
      app.slug !== siteApp.slug &&
      ["ios", "android"].includes(os)
    ) {
      const newUrl = new URL(whiteLabel?.url || window.location.href)
      newUrl.searchParams.set("showInstall", "true")

      window.location.href = newUrl.toString()
    } else if (value) {
      if (!copiedRef.current) {
        copiedRef.current = true

        copyToClipboard(window.location.href)
      }
    }
    setShowAddToHomeScreenInternal(value)
  }

  useEffect(() => {
    if (showAddToHomeScreen) {
      setShowFocus(false)
    }
  }, [showAddToHomeScreen])

  const isOnline = useOnlineStatus()

  // toast.success(API_URL)
  // toast.success(FRONTEND_URL)

  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // 1. The "Panic" State (Lost Connection)
    if (!isOnline) {
      setWasOffline(true)
      // Change from "Error" to "Loading" or "Status" icon if possible
      toast.loading(t("Reconnecting..."), {
        id: "connection-status", // specific ID so we can update this exact toast
      })
    }

    // 2. The "Relief" State (Connection Restored)
    else if (isOnline && wasOffline) {
      // Update the EXISTING toast to Success
      toast.success(t("Back online"), {
        id: "connection-status",
        duration: 3000,
      })
      setWasOffline(false)

      // OPTIONAL: Trigger a silent revalidation of the current thread
      // mutate("/api/messages")
    }
  }, [isOnline, wasOffline])

  const [
    isMemoryConsentManageVisible,
    setIsMemoryConsentManageVisibleInternal,
  ] = useState(false)

  const setIsMemoryConsentManageVisible = (value: boolean) => {
    setIsMemoryConsentManageVisibleInternal(value)
    plausible({
      name: ANALYTICS_EVENTS.MEMORY_TOGGLE,
      props: {
        value,
      },
    })
  }

  const [isHome, setIsHome] = useState(pathname === "/")

  return (
    <NavigationContext.Provider
      value={{
        userNameByUrl,
        hasNotification,
        isLoadingThreads,
        setIsLoadingThreads,
        pathname: navigation.pathname,
        searchParams: navigation.searchParams,
        addParams: navigation.addParams,
        removeParams: navigation.removeParams,
        threads,
        setThreads,
        wasIncognito,
        setWasIncognito,
        burn,
        router: navigation,
        isAccountVisible,
        setIsAccountVisible,
        isHome,
        setIsHome,
        goToCalendar,
        slug,
        addParam,
        removeParam,
        showAddToHomeScreen,
        isNewChat,
        setIsNewChat,
        setShowAddToHomeScreen,
        setSlug,
        goToThreads,
        getStoreSlug,
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
        refetchThreads,
        isInstructionsModalOpen,
        setIsInstructionsModalOpen,
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
