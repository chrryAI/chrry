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
  useCookieOrLocalStorage,
  usePlatform,
  useLocalStorage,
  getExtensionId,
  storage,
} from "../../platform"
import ago from "../../utils/timeAgo"
import { useTheme } from "../ThemeContext"

import {
  aiAgent,
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
import { getApp, getSession } from "../../lib"
import i18n from "../../i18n"
import { useHasHydrated } from "../../hooks"
import { locale, locales } from "../../locales"
import { t } from "i18next"
import { getSiteConfig } from "../../utils/siteConfig"
import { getAppAndStoreSlugs } from "../../utils/url"
import getAppSlugUtil from "../../utils/getAppSlug"
import {
  API_URL,
  apiFetch,
  CHRRY_URL,
  FRONTEND_URL,
  getExampleInstructions,
  getThreadId,
  instructionBase,
  isDevelopment,
  isE2E,
  PROD_FRONTEND_URL,
  WS_URL,
} from "../../utils"
import { Task } from "../TimerContext"
import useCache from "chrry/hooks/useCache"
import { useError } from "./ErrorProvider"

// Constants (shared with DataProvider)

export type { session }

const VERSION = "1.1.63"

const AuthContext = createContext<
  | {
      loadingAppId: string | undefined
      setLoadingAppId: (value: string | undefined) => void
      hasStoreApps: (item: appWithStore | undefined) => boolean
      threads?: {
        threads?: thread[]
        totalCount: number
      }
      setHasNotification: (value: boolean) => void
      lasProcessedSession: React.RefObject<string | undefined>
      setThreads: (value: { threads: thread[]; totalCount: number }) => void
      migratedFromGuestRef: React.RefObject<boolean>
      fetchApps: () => Promise<void>
      isLoadingApps: boolean
      isSplash: boolean
      setIsSplash: (value: boolean) => void
      findAppByPathname: (
        path: string,
        apps: appWithStore[],
      ) => appWithStore | undefined
      setShowFocus: (showFocus: boolean) => void
      showFocus: boolean
      isLoadingTasks: boolean
      fetchTasks: () => Promise<void>
      tasks?: {
        tasks: Task[]
        totalCount: number
        hasNextPage: boolean
        nextPage: number | null
      }
      setTasks: React.Dispatch<
        React.SetStateAction<
          | {
              tasks: Task[]
              totalCount: number
              hasNextPage: boolean
              nextPage: number | null
            }
          | undefined
        >
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
      lastAppId?: string
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
      loadingApp: appWithStore | undefined
      setLoadingApp: (loadingApp: appWithStore | undefined) => void
      app: appWithStore | undefined
      setApp: (app: appWithStore | undefined) => void
      apps: appWithStore[]
      storeApps: appWithStore[] // All apps from all stores
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
      hasNotification: boolean
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
      threadData?: { thread: thread; messages: paginatedMessages }
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
  threads?: {
    threads: thread[]
    totalCount: number
  }
  thread?: { thread: thread; messages: paginatedMessages }
  signOutContext?: (options: {
    callbackUrl: string
    errorUrl?: string
  }) => Promise<any>
}) {
  const [wasGifted, setWasGifted] = useState<boolean>(false)
  const [session, setSession] = useState<session | undefined>(props.session)

  const { searchParams, removeParams, pathname, addParams, ...router } =
    useNavigation()
  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const { isExtension, isStandalone, isFirefox, device, os, browser } =
    usePlatform()

  const env = isDevelopment ? "development" : "production"

  const setEnv = (env: "development" | "production" | "staging") => {
    fetchSession()
  }

  const [threads, setThreads] = useState<
    | {
        threads: thread[]
        totalCount: number
      }
    | undefined
  >(props.threads)

  const isCI = process.env.NEXT_PUBLIC_CI === "true"

  const siteConfig = getSiteConfig()

  const chrryUrl = CHRRY_URL

  const [deviceId, setDeviceId] = useCookieOrLocalStorage(
    "deviceId",
    session?.deviceId,
  )

  const { isStorageReady } = usePlatform()

  const fingerprintParam = searchParams.get("fp") || ""

  useEffect(() => {
    if (!deviceId && isStorageReady) {
      console.log("📝 Updating deviceId from session:", session?.deviceId)
      setDeviceId(uuidv4())
    }
  }, [deviceId, setDeviceId, isStorageReady])
  console.log("🚀~ deviceId", deviceId)

  const [enableNotifications, setEnableNotifications] = useLocalStorage<
    boolean | undefined
  >("enableNotifications", true)

  const [shouldFetchSession, setShouldFetchSession] = useState(!session)

  const [fingerprint, setFingerprint] = useCookieOrLocalStorage(
    "fingerprint",
    session?.guest?.fingerprint ||
      session?.user?.fingerprint ||
      fingerprintParam,
  )

  const tokenInternal =
    session?.user?.token || session?.guest?.fingerprint || apiKey
  // Local state for token and versions (no dependency on DataProvider)
  const [token, setTokenInternal] = useCookieOrLocalStorage(
    "token",
    tokenInternal,
    isExtension,
  )

  console.log("🚀~ ", tokenInternal)

  useEffect(() => {
    if (tokenInternal) {
      setTokenInternal(tokenInternal)
    }
  }, [tokenInternal])

  // Track if cookies/storage are ready (important for extensions)
  const [isCookieReady, setIsCookieReady] = useState(false)

  useEffect(() => {
    // For extensions, check if cookies have been loaded from chrome.cookies API
    // The getCookie function sets "_cookiesReady" flag after first token check
    // For web, cookies are immediately available
    if (isExtension) {
      const checkCookiesReady = async () => {
        const ready = await storage.getItem("_cookiesReady")
        if (ready === "true") {
          setIsCookieReady(true)
        } else {
          // Poll every 50ms until cookies are ready (max 2 seconds)
          let attempts = 0
          const interval = setInterval(async () => {
            attempts++
            const ready = await storage.getItem("_cookiesReady")
            if (ready === "true" || attempts > 40) {
              setIsCookieReady(true)
              clearInterval(interval)
            }
          }, 50)
          return () => clearInterval(interval)
        }
      }
      checkCookiesReady()
    } else {
      setIsCookieReady(true)
    }
  }, [isExtension])

  const setToken = (token?: string) => {
    setTokenInternal(token || "")
  }

  function processSession(sessionData?: session) {
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
        setFingerprint(sessionData.user.fingerprint || undefined)
        setGuest(undefined)
      } else if (sessionData.guest) {
        setGuest(sessionData.guest)
        setFingerprint(sessionData.guest.fingerprint)
        setToken(sessionData.guest.fingerprint)
        setUser(undefined)
      }

      setHasNotification(!!sessionData.hasNotification)

      // Update versions and apps
      setVersions(sessionData.versions)
      // setApps(sessionData.app?.store.apps || [])
      sessionData.aiAgents && setAiAgents(sessionData.aiAgents)
      if (sessionData.app) {
        setApp(sessionData.app)
        setStore(sessionData.app.store)
      }
    }
  }

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

  const [taskId, setTaskId] = useState<string | undefined>(
    searchParams.get("taskId") || undefined,
  )

  useEffect(() => {
    setTaskId(searchParams.get("taskId") || undefined)
  }, [searchParams])

  const [isGuestTest, setIsLiveGuestTest] = useLocalStorage<boolean>(
    "isGuestTest",
    fingerprintParam
      ? TEST_GUEST_FINGERPRINTS.includes(fingerprintParam)
      : false,
  )
  console.log(`🚀 ~ isGuestTest:`, isGuestTest)

  const [isMemberTest, setIsLiveMemberTest] = useLocalStorage<boolean>(
    "isMemberTest",
    fingerprintParam
      ? TEST_MEMBER_FINGERPRINTS.includes(fingerprintParam)
      : false,
  )

  const isLiveTest = isGuestTest || isMemberTest

  const [signInPart, setSignInPartInternal] = React.useState<
    "login" | "register" | "credentials" | undefined
  >(undefined)

  const setSignInPart = (
    part: "login" | "register" | "credentials" | undefined,
  ) => {
    const newPart = part && isE2E ? "credentials" : !!user ? undefined : part

    setSignInPartInternal(newPart)

    // Sync URL with state
    if (newPart) {
      addParams({ signIn: newPart })
    } else {
      removeParams("signIn")
    }
  }
  const {
    data: sessionSwr,
    mutate: refetchSession,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useSWR(
    (isExtension ? isStorageReady && isCookieReady : true) &&
      (fingerprint || token) &&
      deviceId &&
      shouldFetchSession
      ? "session"
      : null,
    async () => {
      try {
        // Don't pass appSlug - let the API determine base app by domain
        // Call the API action
        const result = await getSession({
          deviceId,
          appId: newApp?.id || lastAppId || app?.id,
          fingerprint,
          app: isBrowserExtension()
            ? "extension"
            : isStandalone
              ? "pwa"
              : "web",
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
          if ("status" in result && result.status === 429) {
            setShouldFetchSession(false)
            throw new Error("Rate limit exceeded")
          }

          // Handle other errors
          if ("error" in result && result.error) {
            toast.error(result.error as string)
            setShouldFetchSession(false)
          }
        }

        // 🔍 LOG: Check what apps are returned from session API
        const sessionResult = result as session
        console.log("📦 Session API Response - Apps:", {
          app: sessionResult.app.name,
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

        // Cache session data on successful fetch

        return sessionResult
      } catch (error) {
        captureException(error)
        console.error("Error fetching session:", error)
      }
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

  const [user, setUser] = React.useState<sessionUser | undefined>(session?.user)
  const [agentName, setAgentName] = useState(session?.aiAgent?.name)
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
  const [storeApps, setAllApps] = useState<appWithStore[]>(
    sessionData?.app?.store?.apps || [],
  )

  const getAppSlug = (
    targetApp: appWithStore,
    defaultSlug: string = "/",
  ): string => getAppSlugUtil({ targetApp, defaultSlug, pathname, baseApp })
  const baseApp = storeApps.find((item) => {
    if (!item) return false

    if (
      siteConfig.slug === item.slug &&
      item.store?.slug === siteConfig.storeSlug
    ) {
      return true
    }
  })

  const [threadId, setThreadId] = useState(getThreadId(pathname))

  const [app, setAppInternal] = useState<
    (appWithStore & { image?: string }) | undefined
  >(session?.app || baseApp)
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

  const [hasNotification, setHasNotification] = useState<boolean>(false)

  const lasProcessedSession = useRef<string | undefined>(undefined)

  // Find app by pathname - handles both base apps and sub-apps
  const findAppByPathname = (
    path: string,
    apps: appWithStore[],
  ): appWithStore | undefined => {
    if (path === "/") return undefined

    const { appSlug, storeSlug } = getAppAndStoreSlugs(path, {
      defaultAppSlug: baseApp?.slug || siteConfig.slug,
      defaultStoreSlug: baseApp?.store?.slug || siteConfig.storeSlug,
    })

    const matchedApp = storeApps?.find(
      (item) =>
        item.slug === appSlug &&
        (hasStoreApps(baseApp)
          ? baseApp?.store?.apps?.find((app) => app.slug === appSlug) ||
            item.store?.slug === storeSlug
          : true),
    )
    return matchedApp
  }

  const [lastAppId, setLastAppId] = useLocalStorage<string | undefined>(
    "lastAppId",
    undefined,
  )

  const [newApp, setNewApp] = useState<appWithStore | undefined>(undefined)

  // Get isStorageReady from platform context

  // Centralized function to merge apps without duplicates
  const mergeApps = useCallback((newApps: appWithStore[]) => {
    setAllApps((prevApps) => {
      // Create a map of existing apps by ID
      const existingAppsMap = new Map(prevApps.map((app) => [app.id, app]))

      // Add or update apps
      newApps.forEach((newApp) => {
        const existingApp = existingAppsMap.get(newApp.id)

        // If app doesn't exist, add it

        // If new app has more data (store.apps populated), update it
        if (hasStoreApps(newApp) && !hasStoreApps(existingApp)) {
          existingAppsMap.set(newApp.id, newApp)
        } else {
          existingAppsMap.set(newApp.id, newApp)
        }
      })

      return Array.from(existingAppsMap.values())
    })
  }, [])

  const fetchSession = async (newApp?: appWithStore) => {
    if (newApp) {
      await refetchApps()
      setNewApp(newApp)
    }

    setIsLoading(true)
    setShouldFetchSession(true)

    shouldFetchSession &&
      (await refetchSession(undefined, { revalidate: true }))
  }

  const [isSplash, setIsSplash] = useState(true)

  const [loadingAppId, setLoadingAppId] = useState<string | undefined>(
    undefined,
  )

  const [loadingApp, setLoadingAppInternal] = useState<
    appWithStore | undefined
  >(undefined)

  const setLoadingApp = (appWithStore?: appWithStore) => {
    setLoadingAppId(appWithStore?.id)
    setLoadingAppInternal(appWithStore)
  }

  const { captureException } = useError()

  const chrry = storeApps?.find((app) => !app.store?.parentStoreId)
  const vex = storeApps?.find((app) => app.slug === "vex")
  const sushi = storeApps?.find((app) => app.slug === "sushi")
  const focus = storeApps?.find((app) => app.slug === "focus")

  const appId = loadingAppId || app?.id

  const {
    data: storeAppsSwr,
    mutate: refetchApps,
    isLoading: isLoadingApps,
  } = useSWR(token && appId ? ["app", appId] : null, async () => {
    try {
      if (!token || !appId) return
      const app = await getApp({ token, appId, chrryUrl })

      return app.store?.apps
    } catch (error) {
      console.error(`🚀 ~ storeAppsSwr error:`, error)
      captureException(error)
    }
  })

  useEffect(() => {
    if (storeAppsSwr) {
      mergeApps(storeAppsSwr)
      setLoadingAppId(undefined)
    }
  }, [storeAppsSwr])

  const hasStoreApps = (item: appWithStore | undefined) => {
    if (!item || !storeApps.length) return false
    const app = storeApps?.find((app) => {
      return app.id === item?.id
    })

    return Boolean(
      app?.store?.app &&
        app?.store?.apps.length &&
        storeApps?.find(
          (app) => app.store?.appId && app.id === item?.store?.appId,
        ),
    )
  }

  useEffect(() => {
    if (hasStoreApps(loadingApp)) {
      setLoadingApp(undefined)
      return
    }

    if (loadingApp) {
      refetchApps()
    }
  }, [loadingApp, isLoadingApps, storeApps])

  const canShowFocus = !!(focus && app && app?.id === focus.id && !threadId)

  const [showFocus, setShowFocus] = useState(canShowFocus)

  useEffect(() => {
    setShowFocus(canShowFocus)
  }, [canShowFocus])

  const [store, setStore] = useState<storeWithApps | undefined>(app?.store)

  const storeAppIternal = app?.store?.apps.find(
    (item) =>
      app?.store?.appId &&
      item.id === app?.store?.appId &&
      item.store?.id &&
      item.store?.id === app?.store?.id,
  )

  const [storeApp, setStoreApp] = useState<appWithStore | undefined>(
    storeAppIternal,
  )

  useEffect(() => {
    storeAppIternal && setStoreApp(storeAppIternal)
  }, [storeAppIternal])

  const apps = storeApps.filter((item) => {
    return app?.store?.app?.store?.apps?.some((app) => app.id === item.id)
  })

  const userBaseApp = storeApps?.find(
    (app) => user?.userName && app.store?.slug === user?.userName,
  )

  const userBaseStore = userBaseApp?.store
  const guestBaseApp = storeApps?.find(
    (app) => guest?.id && app.store?.slug === guest?.id,
  )

  const guestBaseStore = guestBaseApp?.store

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

  useEffect(() => {
    if (userBaseApp) {
      setStoreApp(userBaseApp)
    } else if (guestBaseApp) {
      setStoreApp(guestBaseApp)
    }
  }, [guestBaseApp, userBaseApp])

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
      if (!item) return
      ;(item?.id !== baseApp?.id || !isExtension) && setLastAppId(item?.id)
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

          // Merge apps from the new app's store
          newApp?.store?.apps && mergeApps(newApp?.store?.apps)
          return newApp
        }

        return newApp
      })
    },
    [setColorScheme, setAppTheme, baseApp, mergeApps],
  )

  const [thread, setThread] = useState<thread | undefined>(props.thread?.thread)

  const [tasks, setTasks] = useState<
    | {
        tasks: Task[]
        totalCount: number
        hasNextPage: boolean
        nextPage: number | null
      }
    | undefined
  >(undefined)

  useEffect(() => {
    if (!threadId) {
      setThread(undefined)
    }
  }, [threadId])

  // app?.id removed from deps - use prevApp inside setState instead

  useEffect(() => {
    if (!storeApps.length || (!thread && threadId)) return

    // Priority 1: If there's a thread, use the thread's app
    let matchedApp: appWithStore | undefined

    if (thread?.appId) {
      const threadApp = storeApps.find((app) => app.id === thread.appId)
      matchedApp = threadApp
    }

    // Priority 2: Find app by pathname
    if (!matchedApp) {
      matchedApp = findAppByPathname(pathname, storeApps) || baseApp
      console.log("🛣️ Using pathname app:", matchedApp?.slug, pathname)
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
      storeId: matchedApp?.store,
      willSwitch: matchedApp?.id !== app?.id,
    })

    // Only update if the matched app is different from current app
    if (matchedApp && matchedApp.id !== app?.id) {
      console.log("🔄 Switching app:", app?.slug, "→", matchedApp.slug)
      setApp(matchedApp)
      setStore(matchedApp.store)

      setSlug(getAppSlug(matchedApp) || "")
    }
  }, [
    storeApps,
    pathname,
    baseApp,
    app?.id,
    thread,
    threadId,
    lastAppId,
    isExtension,
    loadingAppId,
  ])
  // Thread app takes priority over pathname, then falls back to pathname detection

  const [profile, setProfileInternal] = useState<user | undefined>(undefined)

  const setProfile = (profile: user | undefined) => {
    // if (profile && profile?.id === user?.id) return

    setProfileInternal(profile)
  }

  useEffect(() => {
    // PerformanceObserver is web-only, skip on React Native
    if (typeof PerformanceObserver === "undefined") {
      return
    }

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
  const [isLoadingTasks, setIsLoadingTasks] = useState(false)

  const { data: tasksData, mutate: refetchTasks } = useSWR(
    shouldFetchTasks && token ? ["tasks"] : null, // Disabled by default, fetch manually with refetchTasks()
    async () => {
      const response = await apiFetch(`${API_URL}/tasks`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      setIsLoadingTasks(false)
      return data
    },
  )

  // isLoading is true until first data arrives, then stays false

  useEffect(() => {
    if (tasksData) {
      Array.isArray(tasksData?.tasks) && setTasks(tasksData)
      setIsLoadingTasks(false)
    }
  }, [tasksData])

  const fetchTasks = async () => {
    setShouldFetchTasks(true)
    setIsLoadingTasks(true)
    shouldFetchTasks && (await refetchTasks())
  }

  // Handle session data updates
  useEffect(() => {
    processSession(sessionData)
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
    const created = storeApps?.some((app) => app.id === newApp?.id)
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
  }, [newApp, app, storeApps])

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

  const popcorn = storeApps.find((app) => app.slug === "popcorn")
  const atlas = storeApps.find((app) => app.slug === "atlas")
  const bloom = storeApps.find((app) => app.slug === "bloom")

  const zarathustra = storeApps.find((app) => app.slug === "zarathustra")

  const signOut = async () => {
    setShouldFetchSession(false)
    setUser(undefined)
    setGuest(undefined)
    setToken(fingerprint)
  }

  const isExtensionRedirect = searchParams.get("extension") === "true"
  const isLoggedOut = searchParams.get("loggedOut") === "true" || undefined
  const isWelcome = searchParams.get("welcome") === "true" || undefined
  const showAccountStatusRef = useRef(false)

  useEffect(() => {
    if (showAccountStatusRef.current) return

    if (isLoggedOut) {
      showAccountStatusRef.current = true

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
      showAccountStatusRef.current = true
    }
  }, [isLoggedOut, isWelcome])

  return (
    <AuthContext.Provider
      value={{
        threads,
        setThreads,
        showFocus,
        setShowFocus,
        isLoadingTasks,
        fetchTasks,
        tasks,
        setTasks,
        threadId,
        setThreadId,
        loadingApp,
        setLoadingApp,
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
        loadingAppId,
        setLoadingAppId,
        defaultInstructions,
        isSavingApp,
        setIsSavingApp,
        newApp,
        userBaseStore,
        guestBaseStore,
        userBaseApp,
        guestBaseApp,
        hasStoreApps,
        vex,
        fetchApps: async () => {
          await refetchApps()
        },
        TEST_MEMBER_FINGERPRINTS,
        TEST_GUEST_FINGERPRINTS,
        TEST_MEMBER_EMAILS,
        app,
        chrry,
        chrryUrl,
        storeApp,
        store,
        stores,
        migratedFromGuestRef,
        setStore,
        setStores,
        getAppSlug,
        language,
        setLanguage,
        memoriesEnabled,
        setMemoriesEnabled,
        gift,
        wasGifted,
        lasProcessedSession,
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
        hasNotification,
        guest,
        threadData: props.thread,
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
        isLoadingApps,
        setShouldFetchSession,
        isLoading,
        setIsLoading,
        signOut,
        thread,
        isSplash,
        setIsSplash,
        setThread,
        isExtensionRedirect,
        signInContext,
        signOutContext,
        characterProfilesEnabled,
        apps,
        setApps: setAllApps,
        setHasNotification,
        atlas,
        bloom,
        popcorn,
        zarathustra,
        updateMood,
        lastAppId,
        storeApps, // All apps from all stores
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
        findAppByPathname,
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
