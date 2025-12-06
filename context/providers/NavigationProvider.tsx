"use client"

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react"
import {
  toast,
  useNavigation,
  usePlatform,
  useOnlineStatus,
  NavigationParams,
} from "../../platform"
import { useApp } from "./AppProvider"
import { useChat } from "./ChatProvider"
import { useAuth } from "./AuthProvider"

import { thread, session } from "../../types"
import { t } from "i18next"
import { defaultLocale } from "../../locales"
import { getSiteConfig, whiteLabels } from "../../utils/siteConfig"

const NavigationContext = createContext<
  | {
      hasNotification: boolean
      userNameByUrl: string | undefined
      searchParams: ReturnType<typeof useNavigation>["searchParams"]
      pathname: ReturnType<typeof useNavigation>["pathname"]
      isLoadingThreads: boolean
      setIsLoadingThreads: (value: boolean) => void
      isIncognito: boolean
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
    isIncognito,
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
  } = useChat()

  const goToCalendar = () => {
    const url = threadId ? `/calendar?threadId=${threadId}` : "/calendar"
    router.push(url)
  }

  const { slug, setSlug, getAppSlug, language, setThreadId, setShowFocus } =
    useAuth()

  const goToThreads = (params?: Record<string, string>) => {
    const appSlug = app ? getAppSlug(app, "") : undefined
    setThreadId(undefined)

    const url = new URLSearchParams(params)
    router.push(
      appSlug
        ? `/${appSlug}/threads${params ? "?" + url : ""}`
        : `/threads${params ? "?" + url : ""}`,
    )
  }

  const getStoreSlug = (slug: string) => {
    if (language === defaultLocale) {
      return `/${slug}`
    } else {
      return `/${language}/${slug}`
    }
  }

  const goToThread = (threadId: string) => {
    router.push(`/threads/${threadId}`)
  }

  const goToApp = (slug: string) => {
    const appSlug = app ? getAppSlug(app, "") : undefined
    router.push(appSlug ? `/${appSlug}` : `/${slug}`)
  }

  const [isAccountVisible, setIsAccountVisible] = useState(
    searchParams.get("account") === "true",
  )

  const { os, isStandalone } = usePlatform()

  const [isShowingCollaborate, setIsShowingCollaborate] = useState(false)

  const [showAddToHomeScreen, setShowAddToHomeScreenInternal] = useState(
    searchParams.get("showInstall") === "true",
  )

  const siteApp = getSiteConfig()

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
      app.slug !== siteApp.slug
    ) {
      const newUrl = new URL(whiteLabel?.url || window.location.href)
      newUrl.searchParams.set("showInstall", "true")

      window.location.href = newUrl.toString()
    } else {
      setShowAddToHomeScreenInternal(value)
    }
  }

  useEffect(() => {
    if (showAddToHomeScreen) {
      setShowFocus(false)
    }
  }, [showAddToHomeScreen])

  const isOnline = useOnlineStatus()

  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    if (!isOnline) {
      setWasOffline(true)
      // toast.error(t("You are offline"), {
      //   duration: 6000,
      // })
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

  const [isMemoryConsentManageVisible, setIsMemoryConsentManageVisible] =
    useState(false)

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
        isIncognito,
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
