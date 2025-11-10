"use client"

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react"
import useSWR from "swr"
import { v4 as uuidv4 } from "uuid"
import {
  isBrowserExtension,
  useNavigation,
  useCookie,
  usePlatform,
  useLocalStorage,
  getExtensionId,
} from "../../platform"
import ago from "../../utils/timeAgo"
import { useTheme } from "../ThemeContext"

import {
  aiAgent,
  message,
  characterProfile,
  appWithStore,
  user,
  Paginated,
  session,
  storeWithApps,
  sessionUser,
  sessionGuest,
  mood,
  thread,
  paginatedMessages,
  moodType,
} from "../../types"
import toast from "react-hot-toast"
import { getApps, getSession } from "../../lib"
import i18n from "../../i18n"
import { useHasHydrated } from "../../hooks"
import { locale, locales } from "../../locales"
import { t } from "i18next"
import { getSiteConfig } from "../../utils/siteConfig"
import { excludedSlugRoutes, getAppAndStoreSlugs } from "../../utils/url"
import {
  apiFetch,
  CHRRY_URL,
  getExampleInstructions,
  getThreadId,
  instructionBase,
  isDeepEqual,
} from "../../utils"
import { Task } from "../TimerContext"

// Constants (shared with DataProvider)

export type { session }

const VERSION = "1.1.63"

const AuthContext = createContext<
  | {
      setShowFocus: (showFocus: boolean) => void
      showFocus: boolean
      isLoadingTasks: boolean
      fetchTasks: () => Promise<void>
      tasks: {
        tasks: Task[]
        totalCount: number
        hasNextPage: boolean
        nextPage: number | null
      }
      setTasks: React.Dispatch<
        React.SetStateAction<{
          tasks: Task[]
          totalCount: number
          hasNextPage: boolean
          nextPage: number | null
        }>
      >
      threadId?: string
      setThreadId: (threadId?: string) => void
      taskId?: string
      updateMood: ({ type }: { type: moodType }) => Promise<void>
      focus: appWithStore | undefined
      sushi: appWithStore | undefined
      appAgent?: aiAgent
      favouriteAgent?: aiAgent
      sushiAgent: aiAgent | undefined
      claudeAgent: aiAgent | undefined
      deepSeekAgent: aiAgent | undefined
      perplexityAgent: aiAgent | undefined
      thread?: thread
      setThread: (thread?: thread) => void
      fetchMood: () => Promise<void>
      bloom: appWithStore | undefined
      isLoadingMoods: boolean
      mood: mood | null
      setMood: (mood: mood | null) => void
      moods: {
        moods: mood[]
        totalCount: number
        hasNextPage: boolean
        nextPage: number | null
      }
      isLoadingMood: boolean
      timeAgo: typeof ago
      fetchMoods: () => Promise<void>
      enableNotifications?: boolean
      setEnableNotifications: (enableNotifications?: boolean) => void
      defaultInstructions: instructionBase[]
      isSavingApp: boolean
      setIsSavingApp: (isSavingApp: boolean) => void
      setNewApp: (newApp: appWithStore | undefined) => void
      newApp?: appWithStore
      userBaseStore: storeWithApps | undefined
      guestBaseStore: storeWithApps | undefined
      userBaseApp: appWithStore | undefined
      guestBaseApp: appWithStore | undefined
      vex: appWithStore | undefined
      zarathustra: appWithStore | undefined
      atlas: appWithStore | undefined
      popcorn: appWithStore | undefined
      TEST_MEMBER_EMAILS?: string[]
      TEST_MEMBER_FINGERPRINTS: string[]
      TEST_GUEST_FINGERPRINTS: string[]
      storeApp: appWithStore | undefined
      chrry: appWithStore | undefined
      store: storeWithApps | undefined
      stores: Paginated<storeWithApps> | undefined
      setStore: (store: storeWithApps | undefined) => void
      setStores: (stores: Paginated<storeWithApps> | undefined) => void
      chrryUrl: string
      aiAgents: aiAgent[]
      app: (appWithStore & { image?: string }) | undefined
      setApp: (app: (appWithStore & { image?: string }) | undefined) => void
      apps: appWithStore[]
      allApps: appWithStore[] // All apps from all stores
      setSlug: (slug: string | undefined) => void
      setApps: (apps: appWithStore[]) => void
      getAppSlug: (app: appWithStore, defaultSlug?: string) => string
      characterProfilesEnabled?: boolean
      isExtensionRedirect: boolean
      signInContext?: (
        provider: "google" | "apple" | "credentials",
        options: {
          email?: string
          password?: string
          redirect?: boolean
          callbackUrl: string
          errorUrl: string
        },
      ) => Promise<any>
      signOutContext?: (options: {
        callbackUrl: string
        errorUrl?: string
      }) => Promise<any>
      language: locale
      isCI: boolean
      baseApp: appWithStore | undefined
      setLanguage: (language: locale) => void
      memoriesEnabled?: boolean
      setMemoriesEnabled?: (memoriesEnabled: boolean) => void
      characterProfiles?: characterProfile[]
      setCharacterProfiles?: (characterProfiles: characterProfile[]) => void
      showCharacterProfiles?: boolean
      setShowCharacterProfiles: (showCharacterProfiles: boolean) => void
      isLiveTest?: boolean
      signOut: () => Promise<void>
      onSetLanguage?: (pathWithoutLocale: string, language: locale) => void
      hasNotifications?: boolean
      isLoading?: boolean
      setIsLoading: (isLoading: boolean) => void
      fetchSession: () => Promise<void>
      setUser: (user?: sessionUser) => void
      setGuest: (guest?: sessionGuest) => void
      slug?: string
      track: (e: {
        name: string
        url?: string
        domain?: string
        props?: Record<string, any>
      }) => void
      profile?: sessionUser | undefined
      setProfile: (profile: sessionUser | undefined) => void
      shouldFetchSession: boolean
      setShouldFetchSession: (shouldFetchSession: boolean) => void
      refetchSession: (app?: appWithStore) => Promise<void>
      setFingerprint: (fingerprint?: string) => void
      deviceId?: string
      fingerprint?: string
      gift?: string
      wasGifted?: boolean
      setWasGifted?: (wasGifted: boolean) => void
      isGuestTest?: boolean
      isMemberTest?: boolean
      token?: string
      user?: sessionUser
      session?: session
      guest?: sessionGuest
      signInPart: "login" | "register" | "credentials" | undefined
      setToken: (token?: string) => void
      setSignInPart: (
        part: "login" | "register" | "credentials" | undefined,
      ) => void
      env: "development" | "production" | "staging"
      setEnv: (env: "development" | "production" | "staging") => void
      API_URL: string
      WS_URL: string
      FRONTEND_URL: string
      PROD_FRONTEND_URL: string
    }
  | undefined
>(undefined)

export function AuthProvider({
  apiKey,
  children,
  onSetLanguage,
  signInContext,
  signOutContext,
  error,
  locale,
  translations,
  ...props
}: {
  translations?: Record<string, any>
  locale?: locale
  apiKey?: string
  signInContext?: (
    provider: "google" | "apple" | "credentials",
    options: {
      email?: string
      password?: string
      redirect?: boolean
      callbackUrl: string
      errorUrl: string
    },
  ) => Promise<any>
  onSetLanguage?: (pathWithoutLocale: string, language: locale) => void
  children: ReactNode
  fingerprint?: string
  gift?: string
  error?: string
  session?: session
  thread?: { thread: thread; messages: paginatedMessages }
  signOutContext?: (options: {
    callbackUrl: string
    errorUrl?: string
  }) => Promise<any>
}) {
  const [wasGifted, setWasGifted] = useState<boolean>(false)
  const [session, setSession] = useState<session | undefined>(props.session)

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const { isExtension, isStandalone, isFirefox, device, os, browser } =
    usePlatform()

  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "production"
  const extensionId = getExtensionId()

  const isDevelopment = isExtension
    ? ["ihkpepnfnhmdkmpgfdnfbllldbgabbad"].includes(extensionId || "")
    : !isProduction

  const env = isDevelopment ? "development" : "production"

  const setEnv = (env: "development" | "production" | "staging") => {
    fetchSession()
  }

  const isCI = process.env.NEXT_PUBLIC_CI === "true"

  const siteConfig = getSiteConfig()

  // URL constants based on env
  const FE_PORT = process.env.NEXT_PUBLIC_FE_PORT || "3000"
  const API_PORT = process.env.API_PORT || "3001"
  const isTestingDevice = false && isDevelopment

  const chrryUrl = CHRRY_URL

  const FRONTEND_URL = isTestingDevice
    ? `http://192.168.2.27:${FE_PORT}`
    : env === "development"
      ? `http://localhost:${FE_PORT}`
      : chrryUrl

  const PROD_FRONTEND_URL = chrryUrl

  const WS_URL = isTestingDevice
    ? "ws://192.168.2.27:5001"
    : env === "development"
      ? "ws://localhost:5001"
      : process.env.NEXT_PUBLIC_WS_URL
        ? process.env.NEXT_PUBLIC_WS_URL
        : "wss://ws.chrry.dev"

  const API_URL = isTestingDevice
    ? `http://192.168.2.27:${API_PORT}/api`
    : isDevelopment
      ? `http://localhost:${API_PORT}/api`
      : process.env.NEXT_PUBLIC_API_URL
        ? process.env.NEXT_PUBLIC_API_URL
        : "https://chrry.dev/api"

  // Generate a stable deviceId immediately (don't wait for session or storage)
  const initialDeviceId = useRef<string>(uuidv4())

  // Sync with localStorage
  const [deviceIdFromStorage, setDeviceIdToStorage] = useLocalStorage<string>(
    "deviceId",
    initialDeviceId.current,
  )

  // Use session deviceId if available, otherwise use storage or generated
  const [deviceId, setDeviceIdState] = useState<string>(
    session?.deviceId || deviceIdFromStorage || initialDeviceId.current,
  )

  // Update deviceId when session.deviceId becomes available
  useEffect(() => {
    if (session?.deviceId && session.deviceId !== deviceId) {
      console.log("📝 Updating deviceId from session:", session.deviceId)
      setDeviceIdState(session.deviceId)
      setDeviceIdToStorage(session.deviceId)
    } else if (!session?.deviceId && deviceId !== deviceIdFromStorage) {
      // No session deviceId - ensure we have one in storage
      console.log("📝 Creating deviceId (no session):", deviceId)
      setDeviceIdToStorage(deviceId)
    }
  }, [session?.deviceId, deviceId, deviceIdFromStorage])
  // setDeviceIdToStorage is stable from useLocalStorage

  // Update deviceId from storage once loaded (only if different and no session deviceId)
  useEffect(() => {
    if (
      deviceIdFromStorage &&
      deviceIdFromStorage !== deviceId &&
      !session?.deviceId
    ) {
      console.log("📝 Updating deviceId from storage:", deviceIdFromStorage)
      setDeviceIdState(deviceIdFromStorage)
    }
  }, [deviceIdFromStorage, session?.deviceId])

  const [reactedMessages, setReactedMessages] = useState<message[]>([])

  const [enableNotifications, setEnableNotifications] = useLocalStorage<
    boolean | undefined
  >("enableNotifications", true)

  const [, setDeviceIdCookie] = useCookie("deviceId", "")

  // Sync deviceId to cookie once loaded
  useEffect(() => {
    if (deviceId) {
      setDeviceIdCookie(deviceId)
    }
  }, [deviceId])
  // setDeviceIdCookie is stable from useCookie

  const [shouldFetchSession, setShouldFetchSession] = useState(!session)

  const [fingerprint, setFingerprint] = useLocalStorage<string | undefined>(
    "fingerprint",
    session?.guest?.fingerprint || session?.user?.fingerprint || undefined,
  )

  // Local state for token and versions (no dependency on DataProvider)
  const [token, setToken] = useState<string | undefined>(
    apiKey || session?.user?.token || session?.guest?.fingerprint,
  )

  // Generate fingerprint if missing (for guests)
  useEffect(() => {
    if (!fingerprint) {
      const fp = uuidv4()
      setFingerprint(fp)
      // setToken(fp)
    }
  }, [fingerprint])
  // setFingerprint/setToken are stable from useLocalStorage/useState
  const [versions, setVersions] = useState(
    session?.versions || {
      webVersion: VERSION,
      firefoxVersion: VERSION,
      chromeVersion: VERSION,
    },
  )

  const TEST_MEMBER_FINGERPRINTS = session?.TEST_MEMBER_FINGERPRINTS || []
  const TEST_GUEST_FINGERPRINTS = session?.TEST_GUEST_FINGERPRINTS || []
  const TEST_MEMBER_EMAILS = session?.TEST_MEMBER_EMAILS || []

  // Create actions instance

  const { searchParams, removeParams, pathname, addParams, ...router } =
    useNavigation()

  const [taskId, setTaskId] = useState<string | undefined>(
    searchParams.get("taskId") || undefined,
  )

  useEffect(() => {
    setTaskId(searchParams.get("taskId") || undefined)
  }, [searchParams])

  const fingerprintParam = searchParams.get("fp") || ""

  const [isGuestTest, setIsLiveGuestTest] = useLocalStorage<boolean>(
    "isGuestTest",
    fingerprintParam
      ? TEST_GUEST_FINGERPRINTS.includes(fingerprintParam)
      : false,
  )

  const [isMemberTest, setIsLiveMemberTest] = useLocalStorage<boolean>(
    "isMemberTest",
    fingerprintParam
      ? TEST_MEMBER_FINGERPRINTS.includes(fingerprintParam)
      : false,
  )

  const [signInPart, setSignInPartInternal] = React.useState<
    "login" | "register" | "credentials" | undefined
  >(undefined)

  const setSignInPart = (
    part: "login" | "register" | "credentials" | undefined,
  ) => {
    const newPart = !!user ? undefined : part
    setSignInPartInternal(newPart)

    // Sync URL with state
    if (newPart) {
      addParams({ signIn: newPart })
    } else {
      removeParams("signIn")
    }
  }

  function trackPlausibleEvent({
    name,
    url,
    domain = chrryUrl.replace("https://", ""),
    browser,
    device,
    os,
    props = {},
    isPWA,
  }: {
    name: string
    url?: string
    domain?: string
    browser?: string
    device?: string
    os?: string
    isPWA?: boolean
    props?: Record<string, any>
  }) {
    const canAdd =
      isPWA !== undefined && os !== undefined && browser !== undefined

    const u =
      url || isExtension
        ? `/extension/${isFirefox ? "firefox" : "chrome"}${window.location.pathname}`
        : typeof window !== "undefined"
          ? canAdd
            ? `${isPWA ? `${os}/${browser}` : ""}${window?.location?.pathname || ""}`
            : window?.location?.pathname || ""
          : "/"

    fetch("https://a.chrry.dev/api/data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        url: `https://${domain}${u}`,
        domain,
        props,
      }),
    }).catch(() => {})
  }

  const [guest, setGuest] = React.useState<sessionGuest | undefined>(
    session?.guest,
  )
  const [user, setUser] = React.useState<sessionUser | undefined>(session?.user)
  const [agentName, setAgentName] = useCookie(
    "agentName",
    session?.aiAgent?.name,
  )
  const trackEvent = ({
    name,
    url,
    domain,
    props = {},
    device,
    os,
    browser,
    isPWA,
  }: {
    name: string
    url?: string
    domain?: string
    props?: Record<string, any>
    device?: string
    os?: string
    browser?: string
    isPWA?: boolean
  }) => {
    if (isDevelopment) return

    trackPlausibleEvent({
      url,
      name,
      props,
      domain,
      device,
      os,
      browser,
      isPWA,
    })
  }

  const isLiveTest = isGuestTest || isMemberTest

  const getAppSlug = (
    targetApp: appWithStore,
    defaultSlug: string = "/",
  ): string => {
    const localeMatch = locales.find(
      (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`),
    )
    const localePrefix = localeMatch ? `/${localeMatch}` : ""

    let computedSlug = defaultSlug

    if (targetApp) {
      if (targetApp.id === baseApp?.id) {
        computedSlug = defaultSlug
      } else if (baseApp?.id === chrry?.id && targetApp.id === chrry?.id) {
        computedSlug = defaultSlug
      } else if (
        targetApp.id === chrry?.id ||
        baseApp?.store?.apps.some((app) => app.id === targetApp.id)
      ) {
        computedSlug = `/${targetApp.slug}`
      } else {
        computedSlug = `/${targetApp.store?.slug}/${targetApp.slug}`
      }
    }

    if (localePrefix) {
      if (!computedSlug || computedSlug === "/") {
        return localePrefix || "/"
      }

      if (
        computedSlug === localePrefix ||
        computedSlug.startsWith(`${localePrefix}/`)
      ) {
        return computedSlug
      }

      if (computedSlug.startsWith("/")) {
        return `${localePrefix}${computedSlug}`
      }

      return `${localePrefix}/${computedSlug}`
    }

    return computedSlug || defaultSlug
  }

  useEffect(() => {
    const signInParam = searchParams.get("signIn")
    const currentPart = signInParam as
      | "login"
      | "register"
      | "credentials"
      | null

    // Only update state if it's different from URL to avoid loops
    if (currentPart !== signInPart) {
      setSignInPartInternal(!!user ? undefined : currentPart || undefined)
    }
  }, [searchParams, user])

  const track = ({
    name,
    url,
    domain = siteConfig.domain,
    props = {},
  }: {
    name: string
    url?: string
    domain?: string
    props?: Record<string, any>
  }) => {
    if (!user && !guest) return

    if (user?.role === "admin") return

    trackEvent({
      name,
      url,
      domain,
      device,
      os,
      browser,
      isPWA: isStandalone,
      props: {
        ...props,
        isStandalone,
        os,
        device,
        isMember: !!user,
        isGuest: !!guest,
        isSubscriber: !!(user || guest)?.subscription,
      },
    })
  }

  useEffect(() => {
    if (!fingerprint) return

    if (TEST_MEMBER_FINGERPRINTS.includes(fingerprint)) {
      setIsLiveMemberTest(true)
    }
    if (TEST_GUEST_FINGERPRINTS?.includes(fingerprint)) {
      setIsLiveGuestTest(true)
    }
  }, [fingerprint])

  const gift = searchParams.get("gift") || ""

  // Note: deviceId initialization is handled by useLocalStorage hook above
  // It automatically checks storage (localStorage/chrome.storage/MMKV) on all platforms
  // and generates UUID if not found. No manual useEffect needed!

  useEffect(() => {
    if (gift) {
      setWasGifted(true)
    }
  }, [gift])

  useEffect(() => {
    if (wasGifted && (guest?.subscription || user?.subscription)) {
      toast.success("Welcome to Vex Plus!")
      setWasGifted(false)
    }
  }, [user, guest])

  const [characterProfilesEnabled, setCharacterProfilesEnabled] = useState(
    !!(user || guest)?.characterProfilesEnabled,
  )
  const [memoriesEnabled, setMemoriesEnabled] = useState(
    !!(user || guest)?.memoriesEnabled,
  )

  useEffect(() => {
    if (user || guest) {
      setCharacterProfilesEnabled(!!(user || guest)?.characterProfilesEnabled)
      setMemoriesEnabled(!!(user || guest)?.memoriesEnabled)
    }
  }, [user, guest])

  const [language, setLanguageInternal] = useLocalStorage<locale>(
    "language",
    locale || (session?.locale as locale) || i18n.language || "en",
  )

  const setLanguage = async (language: locale) => {
    setLanguageInternal(language)
    i18n.changeLanguage(language)

    const currentPath = window.location.pathname
    let pathWithoutLocale = currentPath

    // Remove any existing locale prefix (e.g., /en/... or /ja/...)
    for (const loc of locales) {
      if (currentPath.startsWith(`/${loc}/`)) {
        pathWithoutLocale = currentPath.substring(loc.length + 1)
        break
      } else if (currentPath === `/${loc}`) {
        pathWithoutLocale = "/"
        break
      }
    }

    onSetLanguage?.(pathWithoutLocale, language)
  }

  const migratedFromGuestRef = useRef(false)

  const [hasNotifications, setHasNotifications] = useState<boolean | undefined>(
    false,
  )
  const getSlugFromPathname = (path: string): string | undefined => {
    if (path === "/") return undefined

    const siteConfig = getSiteConfig()

    const { appSlug } = getAppAndStoreSlugs(path, {
      defaultAppSlug: baseApp?.slug || siteConfig.slug,
      defaultStoreSlug: baseApp?.store?.slug || siteConfig.storeSlug,
      excludedRoutes: excludedSlugRoutes,
      locales,
    })

    if (!appSlug) {
      return undefined
    }

    const matchedApp = allApps?.find((app) => app.slug === appSlug)
    return matchedApp?.slug
  }

  // Find app by pathname - handles both base apps and sub-apps
  const findAppByPathname = (
    path: string,
    apps: appWithStore[],
  ): appWithStore | undefined => {
    const slugFromPath = getSlugFromPathname(path)
    if (!slugFromPath) return undefined

    // Try to find exact match by slug
    return apps.find((app) => app.slug === slugFromPath)
  }

  const [newApp, setNewApp] = useState<appWithStore | undefined>(undefined)

  const fetchSession = async (newApp?: appWithStore) => {
    if (newApp) {
      setNewApp(newApp)
    }

    setIsLoading(true)
    setShouldFetchSession(true)
    await refetchSession()
  }

  const { data: allAppsSwr } = useSWR(
    token ? ["allApps", token] : null,
    async () => {
      if (!token) return null
      const apps = await getApps({ token })
      return apps
    },
  )

  useEffect(() => {
    if (allAppsSwr) {
      setAllApps(allAppsSwr)
    }
  }, [allAppsSwr])

  const {
    data: sessionSwr,
    mutate: refetchSession,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useSWR(
    fingerprint && deviceId && shouldFetchSession ? ["session", env] : null,
    async () => {
      // Don't pass appSlug - let the API determine base app by domain
      // Call the API action
      const result = await getSession({
        deviceId,
        appId: newApp?.id || app?.id,
        fingerprint,
        app: isBrowserExtension() ? "extension" : isStandalone ? "pwa" : "web",
        gift,
        isStandalone,
        API_URL,
        VERSION,
        token: token || fingerprint!,
        appSlug: app?.slug || baseApp?.slug,
        agentName,
        chrryUrl,
      })

      // Check if result exists
      if (!result) {
        throw new Error("No response from server")
      }

      // Type guard for error response
      if ("error" in result || "status" in result) {
        // Handle rate limit
        if (result.status === 429) {
          setShouldFetchSession(false)
          throw new Error("Rate limit exceeded")
        }

        // Handle other errors
        if (result.error) {
          toast.error(result.error)
          setShouldFetchSession(false)
        }
      }

      // 🔍 LOG: Check what apps are returned from session API
      const sessionResult = result as session
      console.log("📦 Session API Response - Apps:", {
        totalApps: sessionResult.app?.store?.apps?.length || 0,
        apps: sessionResult.app?.store?.apps?.map((a: any) => ({
          slug: a.slug,
          name: a.name,
          storeId: a.store?.id,
          storeName: a.store?.name,
        })),
        currentStore: sessionResult.app?.store?.name,
        currentStoreId: sessionResult.app?.store?.id,
      })

      // Remove gift param from URL after successful session fetch
      if (gift) {
        removeParams("gift")
      }

      return result as session
    },
    {
      // revalidateOnMount: true,
      onError: (error) => {
        // Stop retrying on rate limit errors
        if (error.message.includes("429")) {
          setShouldFetchSession(false)
        }
      },
      errorRetryCount: 2,
      errorRetryInterval: 3000, // 5 seconds between retries
      shouldRetryOnError: (error) => {
        // Don't retry on rate limit errors
        return !error.message.includes("429")
      },
    },
  )

  const sessionData = sessionSwr || session

  const [allApps, setAllApps] = useState<appWithStore[]>([])

  const chrry = allApps?.find((app) => !app.store?.parentStoreId)
  const vex = allApps?.find((app) => app.slug === "vex")
  const sushi = allApps?.find((app) => app.slug === "sushi")
  const focus = allApps?.find((app) => app.slug === "focus")

  const getAlterNativeDomains = (store: storeWithApps) => {
    // Map askvex.com and vex.chrry.ai as equivalent domains
    if (
      store?.domain === "https://vex.chrry.ai" ||
      store?.domain === "https://askvex.com"
    ) {
      return ["https://vex.chrry.ai"]
    }

    return store.domain ? [store.domain] : []
  }

  const baseApp = allApps?.find((item) => {
    if (!item) return false
    if (
      siteConfig.slug === item.slug &&
      item.store?.slug === siteConfig.storeSlug
    ) {
      return true
    }
    // Must be the main app (not a sub-app)
    if (item.id !== item.store?.appId) return false

    // Must have a domain
    if (!item?.store?.domain) return false

    // Match the chrryUrl (e.g., chrry.ai or vex.chrry.ai)
    return (
      getAlterNativeDomains(item.store).includes(chrryUrl) ||
      item.store.domain === chrryUrl
    )
  })

  const [threadId, setThreadId] = useState(getThreadId(pathname))

  const [app, setAppInternal] = useState<
    (appWithStore & { image?: string }) | undefined
  >(session?.app || baseApp)

  const canShowFocus = !!focus && app?.id === focus.id && !threadId

  const [showFocus, setShowFocus] = useState(canShowFocus)

  useEffect(() => {
    setShowFocus(canShowFocus)
  }, [canShowFocus])

  const [store, setStore] = useState<storeWithApps | undefined>(app?.store)
  const [apps, setApps] = useState<appWithStore[]>(store?.apps || [])

  useEffect(() => {
    if (app?.store?.apps && app?.store?.apps.length) {
      setApps(app?.store?.apps)
    }
  }, [app])

  const userBaseApp = allApps?.find(
    (app) => user?.userName && app.store?.slug === user?.userName,
  )
  const userBaseStore = userBaseApp?.store
  const guestBaseApp = allApps?.find(
    (app) => guest?.id && app.store?.slug === guest?.id,
  )
  const guestBaseStore = guestBaseApp?.store

  const storeApp = app?.store?.apps.find(
    (item) => item.id === app?.store?.appId,
  )

  const [slugState, setSlugState] = useState<string | undefined>(
    (app && getAppSlug(app)) || undefined,
  )
  const [slugStorage, setSlugStorage] = useLocalStorage<string | undefined>(
    "slug",
    (app && getAppSlug(app)) || undefined,
  )

  const setSlug = isExtension ? setSlugStorage : setSlugState

  const slug = isExtension ? slugStorage : slugState

  const [stores, setStores] = useState<Paginated<storeWithApps> | undefined>(
    session?.stores,
  )

  // Handle pathname changes: extract slug and switch app

  const hasHydrated = useHasHydrated()

  const [shouldFetchMoods, setShouldFetchMoods] = useState(false)

  const [moods, setMoods] = useState<{
    moods: mood[]
    totalCount: number
    hasNextPage: boolean
    nextPage: number | null
  }>({
    moods: [],
    totalCount: 0,
    hasNextPage: false,
    nextPage: null,
  })

  const [isLoadingMood, setIsLoadingMood] = useState(true)
  const [mood, setMood] = useState<mood | null>(null)

  const [shouldFetchMood, setShouldFetchMood] = useState(true)

  const { data: moodData, mutate: refetchMood } = useSWR(
    shouldFetchMood && token ? ["mood", token] : null, // Disabled by default, fetch manually with refetchMood()
    async () => {
      const response = await apiFetch(`${API_URL}/mood`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      return response.json()
    },
  )

  const fetchMood = async () => {
    setShouldFetchMood(true)
    shouldFetchMood && refetchMood()
  }

  useEffect(() => {
    if (moodData?.id) {
      setMood(moodData)
    }
  }, [moodData])

  const {
    data: moodsData,
    isLoading: isLoadingMoods,
    mutate: refetchMoods,
  } = useSWR(shouldFetchMoods && token ? ["moods", token] : null, async () => {
    const response = await apiFetch(`${API_URL}/moods`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.json()
  })

  const updateMood = async ({ type }: { type: moodType }) => {
    const result = await apiFetch(`${API_URL}/mood`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ type }),
    })

    const data = await result.json()

    if (data?.error) {
      toast.error(data.error)
      return
    }

    refetchMood()
    refetchMoods()
  }

  useEffect(() => {
    if (moodsData && Array.isArray(moodsData?.moods)) {
      setMoods({
        ...moodsData,
        moods: moodsData?.moods?.map((item: mood) => ({
          ...item,
          createdOn: new Date(item?.createdOn || ""),
          updatedOn: new Date(item?.updatedOn || ""),
        })),
      })
    }
  }, [moodsData])

  if (translations && locale) {
    if (!i18n.hasResourceBundle(locale, "translation")) {
      i18n.addResourceBundle(locale, "translation", translations)
    }
    if (i18n.language !== locale && !hasHydrated) {
      i18n.changeLanguage(locale)
    }
  }

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if ((user || guest) && !isSessionLoading) {
      setIsLoading(false)
    }
  }, [user, guest, isSessionLoading])

  useEffect(() => {
    if (user && migratedFromGuestRef.current) {
      migratedFromGuestRef.current = false
      fetchSession()
      // refetchThreads()
    }
  }, [user])

  const { setColorScheme, setTheme } = useTheme()

  const [showCharacterProfiles, setShowCharacterProfiles] = useState(false)
  const [characterProfiles, setCharacterProfiles] = useState<
    characterProfile[]
  >([])

  useEffect(() => {
    if (user?.characterProfiles || guest?.characterProfiles) {
      setCharacterProfiles(
        user?.characterProfiles || guest?.characterProfiles || [],
      )
    }
  }, [user, guest])

  const [aiAgentsInternal, setAiAgents] = useState<aiAgent[]>(
    session?.aiAgents || [],
  )

  const sushiAgent = aiAgentsInternal?.find((agent) => agent.name === "sushi")

  const aiAgents = aiAgentsInternal.filter(
    (agent) => agent.name !== "deepSeek" && agent.name !== "flux",
  )

  const claudeAgent = aiAgents?.find((agent) => agent.name === "claude")

  const deepSeekAgent = sushiAgent // Alias: deepSeek is replaced by Sushi
  const perplexityAgent = aiAgents?.find((agent) => agent.name === "perplexity")

  const appAgent = aiAgents.find((agent) => agent.name === app?.defaultModel)

  const favouriteAgent = aiAgents?.find(
    (agent) => agent.name === (user || guest)?.favouriteAgent,
  )

  const setAppTheme = useCallback(
    (themeColor?: string) => {
      setTheme(themeColor === "#ffffff" ? "light" : "dark")
    },
    [setTheme],
  )

  const setApp = useCallback(
    (item: appWithStore | undefined) => {
      setAppInternal((prevApp) => {
        const newApp = item
          ? {
              ...item,
              image: item.image || item.images?.[0]?.url,
            }
          : undefined

        // Only update theme if app actually changed
        if (newApp?.id !== prevApp?.id) {
          // Defer theme updates to avoid "setState during render" error
          setTimeout(() => {
            newApp?.themeColor && setColorScheme(newApp.themeColor)
            newApp?.backgroundColor && setAppTheme(newApp.backgroundColor)
          }, 0)
        }

        return newApp
      })
    },
    [setColorScheme, setAppTheme],
  )

  const [thread, setThread] = useState<thread | undefined>(props.thread?.thread)

  const [tasks, setTasks] = useState<{
    tasks: Task[]
    totalCount: number
    hasNextPage: boolean
    nextPage: number | null
  }>({
    tasks: [],
    totalCount: 0,
    hasNextPage: false,
    nextPage: null,
  })

  useEffect(() => {
    if (!threadId) {
      setThread(undefined)
    }
  }, [threadId])

  const [isLoadingTasks, setIsLoadingTasks] = useState(true)

  // app?.id removed from deps - use prevApp inside setState instead

  useEffect(() => {
    if (!baseApp || !allApps.length || (!thread && threadId)) return

    // Priority 1: If there's a thread, use the thread's app
    let matchedApp: appWithStore | undefined

    if (thread?.appId) {
      const threadApp = allApps.find((app) => app.id === thread.appId)
      if (threadApp) {
        matchedApp = threadApp
        console.log("🧵 Using thread app:", threadApp.slug)
      }
    }

    // Priority 2: Find app by pathname
    if (!matchedApp) {
      matchedApp = findAppByPathname(pathname, allApps) || baseApp
      console.log("🛣️ Using pathname app:", matchedApp?.slug)
    }

    console.log("🔍 App detection:", {
      pathname,
      // threadId: thread?.id,
      // threadAppId: thread?.appId,
      matchedAppSlug: matchedApp?.slug,
      matchedAppId: matchedApp?.id,
      currentAppSlug: app?.slug,
      currentAppId: app?.id,
      baseAppSlug: baseApp?.slug,
      willSwitch: matchedApp?.id !== app?.id,
    })

    // Only update if the matched app is different from current app
    if (matchedApp && matchedApp.id !== app?.id) {
      console.log("🔄 Switching app:", app?.slug, "→", matchedApp.slug)
      setApp(matchedApp)
      setStore(matchedApp.store)
    }

    // Always update apps list even if app didn't change
    if (matchedApp) {
      // Use the matched app's store.apps if available (has nested apps from backend)
      // Otherwise filter allApps by store ID
      let currentStoreApps: appWithStore[] = []

      if (matchedApp?.store?.apps && matchedApp.store.apps.length > 0) {
        // Use nested store.apps (already has all apps for this store)
        currentStoreApps = matchedApp.store.apps
        console.log("✅ Using nested store.apps from matchedApp")
      } else {
        // Fallback: filter allApps by store ID
        currentStoreApps =
          allApps?.filter((a) => a?.store?.id === matchedApp?.store?.id) || []
        console.log("⚠️ Fallback: filtering allApps by store ID")
      }

      // Always add Chrry as second item if it's not in the current store
      const chrryApp = allApps?.find((a) => a.id === chrry?.id)
      const hasChrry = currentStoreApps.some((a) => a.id === chrry?.id)
      let finalApps = currentStoreApps
      if (!hasChrry && chrryApp && currentStoreApps.length > 0) {
        // Insert Chrry as second item (index 1)
        finalApps = [
          currentStoreApps[0]!,
          chrryApp,
          ...currentStoreApps.slice(1),
        ]
      } else if (!hasChrry && chrryApp) {
        // If no other apps, just add Chrry
        finalApps = [chrryApp]
      }

      console.log("✅ Final apps after Chrry logic:", {
        finalCount: finalApps.length,
        finalSlugs: finalApps.map((a) => a.slug),
      })

      setApps(finalApps)
      setSlug(getAppSlug(matchedApp) || "")
    }
  }, [allApps, pathname, baseApp, app?.id, thread, threadId])
  // Thread app takes priority over pathname, then falls back to pathname detection

  const [profile, setProfileInternal] = useState<user | undefined>(undefined)

  const setProfile = (profile: user | undefined) => {
    // if (profile && profile?.id === user?.id) return

    setProfileInternal(profile)
  }

  useEffect(() => {
    try {
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          track({
            name: "performance",
            props: {
              name: entry.name,
              entryType: entry.entryType,
              startTime: entry.startTime,
              duration: entry.duration,
            },
          })
        }
      }).observe({
        entryTypes: [
          "largest-contentful-paint",
          "first-input",
          "layout-shift",
          "navigation",
          "paint",
        ],
      })
    } catch (error) {
      console.warn("PerformanceObserver not supported:", error)
    }
  }, [track])

  const [isSavingApp, setIsSavingApp] = useState(false)

  const [shouldFetchTasks, setShouldFetchTasks] = useState(false)

  const { data: tasksData, mutate: refetchTasks } = useSWR(
    token && shouldFetchTasks ? ["tasks"] : null, // Disabled by default, fetch manually with refetchTasks()
    async () => {
      const response = await apiFetch(`${API_URL}/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      return data
    },
  )

  useEffect(() => {
    if (tasksData) {
      Array.isArray(tasksData?.tasks) && setTasks(tasksData)
      setIsLoadingTasks(false)
    }
  }, [tasksData])

  const fetchTasks = async () => {
    setShouldFetchTasks(true)
    shouldFetchTasks && refetchTasks()
  }

  // Handle session data updates
  useEffect(() => {
    if (sessionData) {
      setSession(sessionData)
      // Track guest migration
      if (sessionData.migratedFromGuest) {
        migratedFromGuestRef.current = sessionData.migratedFromGuest
      }

      // Update user/guest state
      if (sessionData.user) {
        setUser(sessionData.user)
        setToken(sessionData.user.token)
        setHasNotifications(sessionData.hasNotifications)
        setFingerprint(sessionData.user.fingerprint || undefined)
        setGuest(undefined)
      } else if (sessionData.guest) {
        setGuest(sessionData.guest)
        setHasNotifications(sessionData.hasNotifications)
        setFingerprint(sessionData.guest.fingerprint)
        setToken(sessionData.guest.fingerprint)
        setUser(undefined)
      }

      // Update versions and apps
      setVersions(sessionData.versions)
      // setApps(sessionData.app?.store.apps || [])

      sessionData.aiAgents && setAiAgents(sessionData.aiAgents)

      if (sessionData.app) {
        setApp(sessionData.app)
        setStore(sessionData.app.store)

        // 🔍 LOG: Check apps being set from session data
        console.log("🔄 Processing Session Data - Apps:", {
          totalApps: sessionData.app.store?.apps?.length || 0,
          apps: sessionData.app.store?.apps?.map((a: any) => ({
            slug: a.slug,
            name: a.name,
            storeId: a.store?.id,
            storeName: a.store?.name,
          })),
          currentStoreId: sessionData.app.store?.id,
          currentStoreName: sessionData.app.store?.name,
        })

        // Initialize ALL apps from session data (SSR-friendly)
        if (
          sessionData?.app?.store?.apps?.length &&
          sessionData?.app?.store?.apps?.length > 0
        ) {
          // setAllApps(sessionData.app.store.apps)

          // Also set current store's apps
          const currentStoreApps = sessionData.app.store.apps

          setApps(currentStoreApps)
        }
      }
    }
  }, [sessionData])

  const defaultInstructions = getExampleInstructions()
    .map((inst) => ({
      ...inst,
      title: inst.title,
      content: t(inst.content || ""),
    }))
    .map((inst) => ({
      ...inst,
      title: t(inst.title),
      content: t(inst.content || ""),
    }))

  useEffect(() => {
    if (!vex) return
    const created = allApps?.some((app) => app.id === newApp?.id)
    if (newApp && created && app?.id !== newApp.id) {
      const finalURL = getAppSlug(newApp)

      toast.success(t("🥳 WOW!, you created something amazing"))

      if (newApp) {
        // setApp(newApp)
        setNewApp(undefined)
        setIsSavingApp(false)
      }

      if (
        newApp.highlights?.some?.((h) =>
          defaultInstructions.some((i) => i.content === h.content),
        )
      ) {
        router.push(`${finalURL}?part=highlights`)
      } else {
        router.push(`${finalURL}`)
      }
    }
  }, [newApp, app, allApps, vex])

  const lastRateLimitErrorRef = useRef<string | null>(null)

  useEffect(() => {
    if (sessionError) {
      const errorMessage = sessionError?.message

      if (
        errorMessage.includes("HTTP 429") ||
        errorMessage.includes("Too Many Requests")
      ) {
        // Only show toast if it's a different error or enough time has passed
        if (lastRateLimitErrorRef.current !== errorMessage) {
          lastRateLimitErrorRef.current = errorMessage
          toast.error(
            "Rate limit exceeded. Please wait a moment before trying again.",
            {
              duration: 5000,
            },
          )
        }
      }
    }
  }, [sessionError])

  const popcorn = allApps.find((app) => app.slug === "popcorn")
  const atlas = allApps.find((app) => app.slug === "atlas")
  const bloom = allApps.find((app) => app.slug === "bloom")

  const zarathustra = allApps.find((app) => app.slug === "zarathustra")

  const signOut = async () => {
    setShouldFetchSession(false)
    setUser(undefined)
    setGuest(undefined)
    setToken(fingerprint)
  }

  const isExtensionRedirect = searchParams.get("extension") === "true"
  const isLoggedOut = searchParams.get("loggedOut") === "true" || undefined
  const isWelcome = searchParams.get("welcome") === "true" || undefined
  useEffect(() => {
    if (isLoggedOut) {
      isExtensionRedirect
        ? toast.success(`${t("Logged out")}. ${t("Reload your extension")}`)
        : toast.success(t("Logged out successfully"))
      removeParams("loggedOut")
    }
    if (isWelcome) {
      // setSelectedAgent(undefined)
      isExtensionRedirect
        ? toast.success(`${t("Welcome")}. ${t("Reload your extension")}`)
        : toast.success(`${t("Welcome")}`)

      removeParams("welcome")
    }
  }, [isLoggedOut, isWelcome])

  return (
    <AuthContext.Provider
      value={{
        showFocus,
        setShowFocus,
        isLoadingTasks,
        fetchTasks,
        tasks,
        setTasks,
        threadId,
        setThreadId,
        taskId,
        focus,
        sushi,
        claudeAgent,
        appAgent,
        sushiAgent,
        deepSeekAgent,
        favouriteAgent,
        perplexityAgent,
        setMood,
        isLoadingMoods,
        mood,
        moods,
        isLoadingMood,
        enableNotifications,
        setEnableNotifications,
        defaultInstructions,
        isSavingApp,
        setIsSavingApp,
        newApp,
        userBaseStore,
        guestBaseStore,
        userBaseApp,
        guestBaseApp,
        vex,
        TEST_MEMBER_FINGERPRINTS,
        TEST_GUEST_FINGERPRINTS,
        TEST_MEMBER_EMAILS,
        app,
        chrry,
        chrryUrl,
        storeApp,
        store,
        stores,
        setStore,
        setStores,
        getAppSlug,
        language,
        setLanguage,
        memoriesEnabled,
        setMemoriesEnabled,
        gift,
        wasGifted,
        setWasGifted,
        showCharacterProfiles,
        setShowCharacterProfiles,
        characterProfiles,
        setCharacterProfiles,
        isLiveTest,
        fingerprint,
        setFingerprint,
        deviceId,
        isGuestTest,
        isMemberTest,
        user,
        setUser,
        setGuest,
        isCI,
        baseApp,
        hasNotifications,
        guest,
        session,
        token,
        signInPart,
        setSignInPart,
        setSlug,
        slug,
        track,
        setToken,
        shouldFetchSession,
        profile,
        setProfile,
        setShouldFetchSession,
        isLoading,
        setIsLoading,
        signOut,
        thread,
        setThread,
        isExtensionRedirect,
        signInContext,
        signOutContext,
        characterProfilesEnabled,
        apps,
        setApps,
        atlas,
        bloom,
        popcorn,
        zarathustra,
        updateMood,
        allApps, // All apps from all stores
        refetchSession: async (newApp?: appWithStore) => {
          await fetchSession(newApp)
        },
        setNewApp,
        fetchSession,
        env,
        setEnv,
        API_URL,
        WS_URL,
        FRONTEND_URL,
        PROD_FRONTEND_URL,
        setApp,
        aiAgents,
        timeAgo: (date: string | Date, locale = language || "en-US") =>
          ago(date, locale),
        fetchMoods: async () => {
          setShouldFetchMoods(true)
          shouldFetchMood && refetchMoods()
        },
        fetchMood,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
