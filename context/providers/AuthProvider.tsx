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
  storage,
} from "../../platform"
import ago from "../../utils/timeAgo"
import { useTheme } from "../ThemeContext"
import { cleanSlug } from "../../utils/clearLocale"
import console from "../../utils/log"
import useCache from "../../hooks/useCache"
import { SiteConfig, whiteLabels } from "../../utils/siteConfig"

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
import { defaultLocale, locale, locales } from "../../locales"
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
  isCI,
  WS_URL,
} from "../../utils"
import { Task } from "../TimerContext"
import { useError } from "./ErrorProvider"

// Constants (shared with DataProvider)

export type { session }

const VERSION = "1.1.63"

const AuthContext = createContext<
  | {
      burning: boolean
      burnApp?: appWithStore
      setDeviceId: (value: string) => void
      pear: appWithStore | undefined
      isPear: boolean
      setIsPear: (value: appWithStore | undefined) => void
      grapes: appWithStore[]
      setIsProgramme: (value: boolean) => void
      burn: boolean
      setBurn: (value: boolean) => void
      canBurn: boolean
      isProgramme: boolean
      siteConfig: SiteConfig
      isManagingApp: boolean
      setIsManagingApp: (value: boolean) => void
      isRemovingApp: boolean
      setIsRemovingApp: (value: boolean) => void
      accountApp: appWithStore | undefined
      loadingAppId: string | undefined
      setLoadingAppId: (value: string | undefined) => void
      hasStoreApps: (item: appWithStore | undefined) => boolean
      threads?: {
        threads?: thread[]
        totalCount: number
      }
      setBaseAccountApp: (value: appWithStore | undefined) => void
      setThreadId: (value: string | undefined) => void
      threadIdRef: React.RefObject<string | undefined>
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
      storeAppsSwr?: appWithStore
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
      updatedApp?: appWithStore
      setUpdatedApp: (updatedApp: appWithStore | undefined) => void
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
  error,
  locale,
  translations,
  pathname: ssrPathname, // SSR pathname from server
  ...props
}: {
  translations?: Record<string, any>
  locale?: locale
  apiKey?: string
  pathname?: string // SSR pathname for thread ID extraction

  onSetLanguage?: (pathWithoutLocale: string, language: locale) => void
  children: ReactNode
  fingerprint?: string
  gift?: string
  error?: string
  session?: session
  app?: appWithStore
  threads?: {
    threads: thread[]
    totalCount: number
  }
  thread?: { thread: thread; messages: paginatedMessages }
}) {
  const [wasGifted, setWasGifted] = useState<boolean>(false)
  const [session, setSession] = useState<session | undefined>(props.session)

  const { searchParams, removeParams, pathname, addParams, ...router } =
    useNavigation()

  const hasStoreApps = (app: appWithStore | undefined) => {
    return Boolean(app?.store?.app && app?.store?.apps.length)
  }

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      try {
        const response = await fetch(`${API_URL}/auth/signup/password`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password, name }),
        })

        if (response.ok) {
          const data = await response.json()
          setState({ user: data.user, loading: false })
          return { success: true, user: data.user }
        } else {
          const error = await response.json()
          return { success: false, error: error.error || "Sign up failed" }
        }
      } catch (error) {
        console.error("Sign up error:", error)
        return { success: false, error: "Sign up failed" }
      }
    },
    [],
  )

  interface AuthState {
    user: user | undefined
    loading: boolean
  }

  /**
   * Sign in with email/password
   */
  const signInWithPassword = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch(`${API_URL}/auth/signin/password`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        })

        if (response.ok) {
          const data = await response.json()
          setState({ user: data.user, loading: false })
          return { success: true, user: data.user, token: data.token }
        } else {
          const error = await response.json()
          return { success: false, error: error.error || "Sign in failed" }
        }
      } catch (error) {
        console.error("Sign in error:", error)
        return { success: false, error: "Sign in failed" }
      }
    },
    [],
  )

  /**
   * Sign in with Google OAuth
   * Redirects to Google OAuth page
   */
  const signInWithGoogle = useCallback(
    async (options?: { callbackUrl?: string; errorUrl?: string }) => {
      try {
        // Build OAuth URL with callback parameters
        const url = new URL(`${API_URL}/auth/signin/google`)
        if (options?.callbackUrl) {
          url.searchParams.set("callbackUrl", options.callbackUrl)
        }
        if (options?.errorUrl) {
          url.searchParams.set("errorUrl", options.errorUrl)
        }

        // Force account selection screen (prevents passkey prompt)
        url.searchParams.set("prompt", "select_account")

        // Redirect to Google OAuth
        window.location.href = url.toString()
        return { success: true }
      } catch (error) {
        console.error("Google sign in error:", error)
        return { success: false, error: "Google sign in failed" }
      }
    },
    [],
  )

  /**
   * Sign in with Apple OAuth
   * Redirects to Apple OAuth page
   */
  const signInWithApple = useCallback(
    async (options?: { callbackUrl?: string; errorUrl?: string }) => {
      try {
        // Build OAuth URL with callback parameters
        const url = new URL(`${API_URL}/auth/signin/apple`)
        if (options?.callbackUrl) {
          url.searchParams.set("callbackUrl", options.callbackUrl)
        }
        if (options?.errorUrl) {
          url.searchParams.set("errorUrl", options.errorUrl)
        }

        // Force account selection screen (prevents passkey prompt)
        url.searchParams.set("prompt", "select_account")

        // Redirect to Apple OAuth
        window.location.href = url.toString()
        return { success: true }
      } catch (error) {
        console.error("Apple sign in error:", error)
        return { success: false, error: "Apple sign in failed" }
      }
    },
    [],
  )

  const [user, setUser] = React.useState<sessionUser | undefined>(session?.user)

  const [state, setState] = useState<AuthState>({
    user,
    loading: true,
  })

  /**
   * Sign out
   */
  const signOutInternal = useCallback(
    async ({ callbackUrl }: { callbackUrl?: string }) => {
      try {
        await fetch(`${API_URL}/auth/signout`, {
          method: "POST",
          credentials: "include",
        })

        setState({ user: undefined, loading: false })

        callbackUrl ? (window.location.href = `${callbackUrl}`) : undefined
        return { success: true }
      } catch (error) {
        console.error("Sign out error:", error)
        return { success: false, error: "Sign out failed" }
      }
    },
    [],
  )

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const {
    isExtension,
    isStandalone,
    isFirefox,
    device,
    os,
    browser,
    isNative,
  } = usePlatform()

  const env = isDevelopment ? "development" : "production"

  const setEnv = (env: "development" | "production" | "staging") => {
    // fetchSession()
  }

  const [threads, setThreads] = useState<
    | {
        threads: thread[]
        totalCount: number
      }
    | undefined
  >(props.threads)

  const siteConfig = getSiteConfig(CHRRY_URL)

  const chrryUrl = CHRRY_URL

  const [deviceId, setDeviceId] = useCookieOrLocalStorage(
    "deviceId",
    props.session?.deviceId,
  )

  const { isStorageReady, isTauri } = usePlatform()

  const fingerprintParam = searchParams.get("fp") || ""

  useEffect(() => {
    if (!deviceId && isStorageReady) {
      console.log("📝 Updating deviceId from session:", session?.deviceId)
      if (isExtension) {
        setDeviceId(uuidv4())

        return
      } else if (isTauri) {
        setDeviceId(uuidv4())
      }
    }
  }, [deviceId, setDeviceId, isStorageReady, isTauri])

  const [enableNotifications, setEnableNotifications] = useLocalStorage<
    boolean | undefined
  >("enableNotifications", true)

  const [shouldFetchSession, setShouldFetchSession] = useState(!session)

  const [fingerprint, setFingerprint] = useCookieOrLocalStorage(
    "fingerprint",
    session?.guest?.fingerprint ||
      session?.user?.fingerprint ||
      fingerprintParam,
    isExtension,
  )

  const ssrToken =
    props?.session?.user?.token || props?.session?.guest?.fingerprint || apiKey
  // Local state for token and versions (no dependency on DataProvider)
  const [tokenExtension, setTokenExtension] = useCookieOrLocalStorage(
    "token",
    ssrToken,
    isExtension,
  )

  const [tokenWeb, setTokenWeb] = useLocalStorage("token", ssrToken)

  const token = isExtension || isTauri ? tokenExtension : tokenWeb

  const setToken =
    isExtension || isTauri
      ? setTokenExtension
      : (token: string | undefined) => {
          setTokenWeb(token)
          setTokenExtension(token)
        }

  useEffect(() => {
    if (ssrToken) {
      setToken(ssrToken)
    }
  }, [ssrToken])

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

  const merge = (prevApps: appWithStore[], newApps: appWithStore[]) => {
    // Create a map of existing apps by ID
    const existingAppsMap = new Map(prevApps.map((app) => [app.id, app]))

    // Add or update apps
    newApps.forEach((newApp) => {
      const existingApp = existingAppsMap.get(newApp.id)

      if (newApp.name === "MyAgent") {
        // debugger
      }

      if (existingApp && hasStoreApps(newApp)) {
        existingAppsMap.set(newApp.id, newApp)
      } else {
        existingAppsMap.set(newApp.id, newApp)
      }
    })

    return Array.from(existingAppsMap.values())
  }

  const [userBaseApp, setUserBaseApp] = useState<appWithStore | undefined>(
    props.session?.userBaseApp,
  )

  const userBaseStore = userBaseApp?.store
  const [guestBaseApp, setGuestBaseApp] = useState<appWithStore | undefined>(
    props.session?.guestBaseApp,
  )

  const accountApp = userBaseApp || guestBaseApp

  const setBaseAccountApp = (app: appWithStore | undefined) => {
    user && setUserBaseApp(app)
    guest && setGuestBaseApp(app)
  }

  const guestBaseStore = guestBaseApp?.store

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
        sessionData.userBaseApp && setUserBaseApp(sessionData.userBaseApp)
      } else if (sessionData.guest) {
        setGuest(sessionData.guest)
        setFingerprint(sessionData.guest.fingerprint)
        setToken(sessionData.guest.fingerprint)
        setUser(undefined)
        sessionData.guestBaseApp && setGuestBaseApp(sessionData.guestBaseApp)
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
    }
  }, [fingerprint])

  useEffect(() => {
    if (!token && fingerprint) {
      setToken(fingerprint)
    }
  }, [token, fingerprint])
  // setFingerprint/setToken are stable from useLocalStorage/useState
  const [versions, setVersions] = useState(
    session?.versions || {
      webVersion: VERSION,
      firefoxVersion: VERSION,
      chromeVersion: VERSION,
    },
  )

  const VEX_LIVE_FINGERPRINTS = session?.VEX_LIVE_FINGERPRINTS || []

  const TEST_MEMBER_FINGERPRINTS =
    session?.TEST_MEMBER_FINGERPRINTS?.concat(VEX_LIVE_FINGERPRINTS).filter(
      (fp) => !session?.TEST_GUEST_FINGERPRINTS?.includes(fp),
    ) || []

  const TEST_GUEST_FINGERPRINTS =
    session?.TEST_GUEST_FINGERPRINTS?.concat(VEX_LIVE_FINGERPRINTS).filter(
      (fp) => !session?.TEST_MEMBER_FINGERPRINTS?.includes(fp),
    ) || []

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
  const [isMemberTest, setIsLiveMemberTest] = useLocalStorage<boolean>(
    "isMemberTest",
    fingerprintParam
      ? TEST_MEMBER_FINGERPRINTS?.includes(fingerprintParam)
      : false,
  )

  const isLiveTest = isGuestTest || isMemberTest

  const [signInPart, setSignInPartInternal] = React.useState<
    "login" | "register" | "credentials" | undefined
  >(undefined)

  const [isRemovingApp, setIsRemovingApp] = useState(false)

  const setSignInPart = (
    part: "login" | "register" | "credentials" | undefined,
  ) => {
    const newPart = part && isE2E ? "credentials" : user ? undefined : part

    setSignInPartInternal(newPart)

    // Sync URL with state
    if (newPart) {
      addParams({ signIn: newPart })
    } else {
      removeParams("signIn")
    }
  }

  const [newApp, setNewApp] = useState<appWithStore | undefined>(undefined)
  const [updatedApp, setUpdatedApp] = useState<appWithStore | undefined>(
    undefined,
  )
  const [loadingAppId, setLoadingAppId] = useState<string | undefined>(
    undefined,
  )
  const allApps = merge(
    session?.app?.store?.apps || [],
    userBaseApp ? [userBaseApp] : guestBaseApp ? [guestBaseApp] : [],
  )
  const [storeApps, setAllApps] = useState<appWithStore[]>(allApps)

  const getAppSlug = (
    targetApp: appWithStore,
    defaultSlug: string = "/",
  ): string => getAppSlugUtil({ targetApp, defaultSlug, pathname, baseApp })
  const baseAppInternal = storeApps.find((item) => {
    if (!item) return false

    if (
      siteConfig.slug === item.slug &&
      item.store?.slug === siteConfig.storeSlug
    ) {
      return true
    }
  })

  const [baseApp, setBaseApp] = useState<appWithStore | undefined>(
    baseAppInternal,
  )

  const [app, setAppInternal] = useState<
    (appWithStore & { image?: string }) | undefined
  >(props.app || session?.app || baseApp)

  const appId = newApp?.id || updatedApp?.id || loadingAppId || app?.id

  const [isSavingApp, setIsSavingApp] = useState(false)
  const [isManagingApp, setIsManagingApp] = useState(false)

  const {
    data: sessionSwr,
    mutate: refetchSession,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useSWR(
    (isExtension ? isStorageReady && isCookieReady : true) &&
      fingerprint &&
      token &&
      deviceId &&
      shouldFetchSession &&
      !isRemovingApp &&
      !isSavingApp &&
      !isManagingApp
      ? "session"
      : null,
    async () => {
      // debugger

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
          app: sessionResult.app?.name,
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

  useEffect(() => {
    hasStoreApps(baseAppInternal) && setBaseApp(baseAppInternal)
  }, [baseAppInternal])

  const threadId = getThreadId(pathname)

  const threadIdRef = useRef(threadId)

  useEffect(() => {
    const signInParam = searchParams.get("signIn")
    const currentPart = signInParam as
      | "login"
      | "register"
      | "credentials"
      | null

    // Only update state if it's different from URL to avoid loops
    if (currentPart !== signInPart) {
      setSignInPartInternal(user ? undefined : currentPart || undefined)
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
    if (!isE2E && user?.role === "admin") return

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

    if (TEST_MEMBER_FINGERPRINTS?.includes(fingerprint)) {
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

  const [, setUserRole] = useLocalStorage("userRole", user?.role)

  useEffect(() => {
    if (user) {
      setUserRole(user.role)
    }
  }, [user])

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

  const [language, setLanguageInternal] = useCookieOrLocalStorage(
    "locale",
    locale || (session?.locale as locale) || i18n.language || "en",
    isExtension,
  )

  useEffect(() => {
    if (session?.locale) {
      setLanguageInternal(session?.locale)
    }
  }, [session?.locale])

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

    router.push(
      cleanSlug(
        `/${language === defaultLocale ? "" : language}${pathWithoutLocale}`,
      ),
    )
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

    if (
      userBaseApp &&
      storeSlug === userBaseApp.store?.slug &&
      appSlug === userBaseApp.slug
    ) {
      return userBaseApp
    }

    if (
      guestBaseApp &&
      storeSlug === guestBaseApp.store?.slug &&
      appSlug === guestBaseApp.slug
    ) {
      return guestBaseApp
    }

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

  // Get isStorageReady from platform context

  // Centralized function to merge apps without duplicates
  const mergeApps = useCallback(
    (newApps: appWithStore[]) => {
      setAllApps(merge(storeApps, newApps))
    },
    [storeApps],
  )

  const { clear } = useCache()

  const fetchSession = async () => {
    clear()
    setIsLoading(true)
    setShouldFetchSession(true)
    shouldFetchSession && (await refetchSession())
  }

  const [isSplash, setIsSplash] = useState(true)

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

  const burnApp = storeApps?.find((app) => app.slug === "burn")

  const accountAppId = userBaseApp?.id || guestBaseApp?.id

  const {
    data: storeAppsSwr,
    mutate: refetchApps,
    isLoading: isLoadingApps,
  } = useSWR(token && ["app", appId], async () => {
    try {
      if (!token) return
      const result = await getApp({
        token,
        appId,
        chrryUrl,
        pathname,
        skipCache: appId !== app?.id || appId === accountAppId,
      })
      return result
    } catch (error) {
      captureException(error)
    }
  })

  useEffect(() => {
    if (storeAppsSwr) {
      storeAppsSwr.store?.apps?.find((app) => app.id === loadingAppId) &&
        setLoadingApp(undefined)
      mergeApps(storeAppsSwr.store?.apps || [])

      const n = storeAppsSwr.store?.apps.find((app) => app.id === newApp?.id)
      if (n) {
        toast.success(t("🥳 WOW!, you created something amazing"))
        // if (!isExtension && !isNative) {
        //   // setSlug(getAppSlug(n) || "")
        //   window.location.href = getAppSlug(n)
        //   return
        // }
        setNewApp(undefined)

        setBaseAccountApp(n)

        setIsSavingApp(false)
        setIsManagingApp(false)

        setApp(n)
        setStore(n.store)
        router.push(getAppSlug(n))
      }

      const u = storeAppsSwr?.store?.apps.find(
        (app) => app.id === updatedApp?.id,
      )
      if (u) {
        toast.success(t("Updated") + " 🚀")
        // if (!isExtension && !isNative) {
        //   // setSlug(getAppSlug(n) || "")
        //   window.location.href = getAppSlug(u)
        //   return
        // }
        setUpdatedApp(undefined)
        setBaseAccountApp(u)

        setIsManagingApp(false)
        setIsSavingApp(false)

        setApp(u)
        setStore(u.store)

        setSlug(getAppSlug(u) || "")
        router.push(getAppSlug(u))

        return
      }
    }
  }, [storeAppsSwr, newApp, updatedApp])

  const canShowFocus = !!(focus && app && app?.id === focus.id && !threadId)

  const [showFocus, setShowFocus] = useState(canShowFocus)

  useEffect(() => {
    setShowFocus(canShowFocus)
  }, [canShowFocus])

  const [store, setStore] = useState<storeWithApps | undefined>(app?.store)

  const storeAppIternal = storeApps?.find(
    (item) =>
      app?.store?.appId &&
      item.id === app?.store?.appId &&
      item.store?.id &&
      item.store?.id === app?.store?.id,
  )
  const [storeApp, setStoreAppInternal] = useState<appWithStore | undefined>(
    storeAppIternal,
  )

  const isZarathustra = app?.slug === "zarathustra"

  const isBaseAppZarathustra = baseApp?.slug === "zarathustra"

  const [burnInternal, setBurnInternal] = useLocalStorage<boolean | null>(
    "burn",
    isZarathustra ? true : null,
  )

  const burn = burnInternal === null ? isZarathustra : burnInternal

  const burning = !!(burn || burnApp)
  const apps = storeApps.filter((item) => {
    return app?.store?.app?.store?.apps?.some((app) => {
      return app.id === item.id
    })
  })

  useEffect(() => {
    if (!app) return

    burn === null && setBurnInternal(isZarathustra)
  }, [isZarathustra, app])

  const zarathustra = storeApps.find((app) => app.slug === "zarathustra")

  const hasInformedRef = useRef(false)
  const setBurn = (value: boolean) => {
    setBurnInternal(value)

    // Privacy-respecting analytics: Track burn usage WITHOUT personal info or identifiers.
    // This helps us understand if the feature is valuable and worth investing in,
    // while respecting the user's choice for privacy. No user data, IDs, or content is tracked.
    // Only the fact that burn was activated (boolean event).
    if (value) {
      if (!hasInformedRef.current) {
        hasInformedRef.current = true
        toast.error(t("When you burn there is nothing to remember"))
      }
      track({
        name: "burn",
        props: {
          value,
        },
      })
    }

    if (burnApp && value) {
      router.push(getAppSlug(burnApp))
      return
    }

    if (zarathustra && baseApp?.id === zarathustra.id) {
      value && router.push(getAppSlug(zarathustra))
    }
  }

  const canBurn = true

  const [isProgrammeInternal, setIsProgrammeInternal] = useLocalStorage<
    boolean | null
  >("programme", isBaseAppZarathustra ? true : null)

  useEffect(() => {
    if (!baseApp) return

    isProgrammeInternal === null && setIsProgrammeInternal(isBaseAppZarathustra)
  }, [isBaseAppZarathustra, baseApp])

  const setIsProgramme = (value: boolean) => {
    setIsProgrammeInternal(value)
    removeParams("programme")
  }

  const grapes =
    app?.id === zarathustra?.id
      ? []
      : apps.filter(
          (app) =>
            whiteLabels.some((w) => w.slug === app.slug) &&
            app.store?.appId === app.id &&
            app.id !== zarathustra?.id,
        )

  const isPearInternal = searchParams.get("pear") === "true"

  const [isPear, setIsPearInternal] = useState(isPearInternal)

  const pear = storeApps.find((app) => app.slug === "pear")

  useEffect(() => {
    setIsPearInternal(isPearInternal)
  }, [isPearInternal])

  const setIsPear = (value: appWithStore | undefined) => {
    if (app?.slug === "zarathustra") return

    setIsPearInternal(!!value)
    value && router.push(`${getAppSlug(value)}?pear=true`)
    !value && removeParams("pear")
  }

  const isProgramme =
    isProgrammeInternal || searchParams.get("programme") === "true"

  const setStoreApp = (appWithStore?: appWithStore) => {
    appWithStore?.id !== storeApp?.id && setStoreAppInternal(appWithStore)
  }

  useEffect(() => {
    hasStoreApps(app) && setStoreApp(storeAppIternal)
  }, [storeAppIternal])

  const [slugState, setSlugState] = useState<string | undefined>(
    (app && getAppSlug(app)) || undefined,
  )
  const [slugStorage, setSlugStorage] = useLocalStorage<string | undefined>(
    "slug",
    (app && getAppSlug(app)) || undefined,
  )

  const setSlug = (slug: string | undefined) => {
    if (isExtension) {
      setSlugStorage(slug)
    } else {
      setSlugState(slug)
    }
  }

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
      if (!hasStoreApps(item)) {
        setLoadingApp(item)
        return
      }

      setLastAppId(item?.id)
      setAppInternal((prevApp) => {
        const newApp = item
          ? {
              ...item,
              image: item.image || item.images?.[0]?.url,
            }
          : undefined

        // Only update theme if app actually changed
        // Defer theme updates to avoid "setState during render" error
        setTimeout(() => {
          newApp?.themeColor && setColorScheme(newApp.themeColor)
          newApp?.backgroundColor && setAppTheme(newApp.backgroundColor)
        }, 0)

        // Merge apps from the new app's store
        newApp?.store?.apps && mergeApps(newApp?.store?.apps)
        return newApp
      })
    },
    [setColorScheme, setAppTheme, baseApp, mergeApps],
  )

  const [thread, setThreadInternal] = useState<thread | undefined>(
    props.thread?.thread,
  )

  const setThreadId = (id?: string) => {
    threadIdRef.current = id
  }

  const setThread = (thread: thread | undefined) => {
    setThreadId(thread?.id)
    setThreadInternal(thread)
  }

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

  // useEffect(() => {
  //   const slug = accountApp ? getAppSlug(accountApp) : ""
  //   if (slug !== pathname && accountApp?.id === app?.id) {
  //     router.push(slug)
  //   }
  // }, [accountApp, app, pathname])

  // app?.id removed from deps - use prevApp inside setState instead

  useEffect(() => {
    if (!baseApp) return
    if (!storeApps.length || (!thread && threadId)) return

    // debugger

    // Priority 1: If there's a thread, use the thread's app
    let matchedApp: appWithStore | undefined

    if (!matchedApp && thread?.appId) {
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
    thread,
    threadId,
    lastAppId,
    isExtension,
    loadingAppId,
    updatedApp,
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

  // Create sign in wrapper to match Chrry's expected interface
  const signInContext = async (
    provider: "google" | "apple" | "credentials",
    options: {
      email?: string
      password?: string
      redirect?: boolean
      callbackUrl: string
      errorUrl?: string
      blankTarget?: boolean
    },
  ) => {
    if (provider === "google") {
      return signInWithGoogle({
        callbackUrl: options.callbackUrl,
        errorUrl: options.errorUrl,
      })
    } else if (provider === "apple") {
      return signInWithApple({
        callbackUrl: options.callbackUrl,
        errorUrl: options.errorUrl,
      })
    } else if (
      provider === "credentials" &&
      options.email &&
      options.password
    ) {
      return signInWithPassword(options.email, options.password)
    }
    return { success: false, error: "Invalid provider or missing credentials" }
  }

  // Create sign out wrapper
  const signOutContext = async (options: { callbackUrl?: string }) => {
    return signOutContext(options)
  }

  const popcorn = storeApps.find((app) => app.slug === "popcorn")
  const atlas = storeApps.find((app) => app.slug === "atlas")
  const bloom = storeApps.find((app) => app.slug === "bloom")

  const signOut = async () => {
    setShouldFetchSession(false)
    setUser(undefined)
    setGuest(undefined)
    setToken(fingerprint)
    signOutInternal({ callbackUrl: "/" })

    // if (typeof window !== "undefined") {
    //   window.location.href = "/?loggedOut=true"
    // }
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

  const auth_token = searchParams.get("auth_token")

  const fp = searchParams.get("fp")

  useEffect(() => {
    if (auth_token) {
      // Remove auth_token from URL
      removeParams("auth_token")
    }
    if (fp) {
      // Remove fp from URL
      !isE2E && removeParams("fp")
    }
  }, [searchParams])

  return (
    <AuthContext.Provider
      value={{
        grapes,
        burn,
        setBurn,
        canBurn,
        isProgramme,
        setIsProgramme,
        threads,
        setThreads,
        showFocus,
        setShowFocus,
        updatedApp,
        setUpdatedApp,
        isLoadingTasks,
        fetchTasks,
        tasks,
        setTasks,
        threadId,
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
        storeAppsSwr,
        threadIdRef,
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
        accountApp,
        memoriesEnabled,
        setMemoriesEnabled,
        gift,
        wasGifted,
        lasProcessedSession,
        setWasGifted,
        isPear,
        setIsPear,
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
        setThreadId,
        burning,
        lastAppId,
        isRemovingApp,
        storeApps, // All apps from all stores
        refetchSession: async () => {
          await fetchSession()
        },
        pear,
        setIsManagingApp,
        isManagingApp,
        setNewApp,
        setIsRemovingApp,
        fetchSession,
        env,
        setEnv,
        API_URL,
        WS_URL,
        FRONTEND_URL,
        PROD_FRONTEND_URL,
        findAppByPathname,
        siteConfig,
        setBaseAccountApp,
        setDeviceId,
        setApp,
        aiAgents,
        timeAgo: (date: string | Date, locale = language || "en-US") =>
          ago(date, locale),
        fetchMoods: async () => {
          setShouldFetchMoods(true)
          shouldFetchMood && refetchMoods()
        },
        burnApp,
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
