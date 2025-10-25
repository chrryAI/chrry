"use client"

import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useRef,
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
import { COLORS, useTheme } from "../ThemeContext"

import {
  aiAgent,
  guest,
  subscription,
  message,
  placeHolder,
  characterProfile,
  app,
  store,
  appWithStore,
  instruction,
  user,
  Paginated,
  session,
  storeWithApps,
  sessionUser,
  sessionGuest,
} from "../../types"
import toast from "react-hot-toast"
import { getSession } from "../../lib"
import i18n from "../../i18n"
import { useHasHydrated } from "../../hooks"
import { locale, locales } from "../../locales"
import { t } from "i18next"
import { getSiteConfig } from "../../utils/siteConfig"
import { useData } from "./DataProvider"

// Constants (shared with DataProvider)
const TEST_GUEST_FINGERPRINTS = ["052b1051-35e9-4264-97ac-2f0f67761869"]
const TEST_MEMBER_FINGERPRINTS = [
  "b6f0f5e0-9b1a-4b5a-8c3d-2e7f6a9b0c1d",
  "c7e1f6d1-0c2b-5c6b-9d4e-3f8g7b0d2e",
]

export type { session }

const VERSION = "1.1.63"

const AuthContext = createContext<
  | {
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
      getAppSlug: (app: appWithStore) => string
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
      refetchSession: () => Promise<void>
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
  children,
  onSetLanguage,
  signInContext,
  signOutContext,
  error,
  ...rest
}: {
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
  signOutContext?: (options: {
    callbackUrl: string
    errorUrl?: string
  }) => Promise<any>
}) {
  const [wasGifted, setWasGifted] = useState<boolean>(false)
  const [session, setSession] = useState<session | undefined>(rest.session)

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  const { isExtension, isStandalone, isFirefox, device, os, browser } =
    usePlatform()

  const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production"
  const extensionId = getExtensionId()

  const isDevelopment = isExtension
    ? ["ihkpepnfnhmdkmpgfdnfbllldbgabbad"].includes(extensionId || "")
    : !isProduction

  const [envInternal, setEnvInternal] = useCookie(
    "env",
    isDevelopment ? "development" : "production",
  )
  const env = envInternal as "development" | "production" | "staging"

  const setEnv = (env: "development" | "production" | "staging") => {
    setEnvInternal(env)
    fetchSession()
  }

  const isCI = process.env.NEXT_PUBLIC_CI === "true"

  const siteConfig = getSiteConfig()

  // URL constants based on env
  const FE_PORT = process.env.NEXT_PUBLIC_FE_PORT || "3000"
  const API_PORT = process.env.API_PORT || "3001"
  const isTestingDevice = false && isDevelopment

  const chrryUrl = process.env.NEXT_PUBLIC_CHRRY_URL || "https://chrry.ai"

  const baseAppUrl = process.env.NEXT_PUBLIC_BASE_APP_URL || chrryUrl

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
  }, [session?.deviceId, deviceId, deviceIdFromStorage, setDeviceIdToStorage])

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
  }, [deviceId, setDeviceIdCookie])

  const [shouldFetchSession, setShouldFetchSession] = useState(!!session)

  const [fingerprint, setFingerprint] = useLocalStorage<string | undefined>(
    "fingerprint",
    session?.guest?.fingerprint || session?.user?.fingerprint || undefined,
  )

  // Local state for token and versions (no dependency on DataProvider)
  const [token, setToken] = useState<string | undefined>(
    session?.user?.token || session?.guest?.fingerprint || fingerprint,
  )

  // Generate fingerprint if missing (for guests)
  useEffect(() => {
    if (!fingerprint) {
      const fp = uuidv4()
      setFingerprint(fp)
      setToken(fp)
    }
  }, [fingerprint, setFingerprint, setToken])
  const [versions, setVersions] = useState(
    session?.versions || {
      webVersion: VERSION,
      firefoxVersion: VERSION,
      chromeVersion: VERSION,
    },
  )

  // Create actions instance

  const { searchParams, removeParams, pathname, addParams } = useNavigation()

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
    debug: boolean = false,
  ): string => {
    debug &&
      console.log(`🚀 ~ file: AuthProvider.tsx:452 ~ targetApp:`, targetApp)
    if (!targetApp) return "/"

    if (targetApp.id === baseApp?.id) return "/"

    if (baseApp?.id === chrry?.id && targetApp.id === chrry?.id) {
      return `/`
    }

    if (
      targetApp.id === chrry?.id ||
      baseApp?.store?.apps.some((app) => app.id === targetApp.id)
    ) {
      return `/${targetApp.slug}`
    }

    return `/${targetApp.store?.slug}/${targetApp.slug}`
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
    domain = "askvex.com",
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
    if (TEST_GUEST_FINGERPRINTS.includes(fingerprint)) {
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
    (session?.locale as locale) || i18n.language || "en",
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
    if (path === "/") return undefined // Home route has no slug in path
    // Remove locale prefix if present (e.g., /ja/atlas -> /atlas)
    const pathWithoutLocale = path.replace(/^\/[a-z]{2}\//, "/")

    // Reserved routes that are not app slugs
    const excludedRoutes = [
      "threads",
      "settings",
      "profile",
      "about",
      "why",
      "terms",
      "privacy",
      "onboarding",
      "calendar",
      "u",
      "affiliate",
    ]

    // Split path into segments
    const segments = pathWithoutLocale.split("/").filter(Boolean)
    if (segments.length === 0) return undefined

    // Case 1: /threads or /settings (excluded route at root)
    if (segments.length === 1 && excludedRoutes.includes(segments?.[0] || "")) {
      return undefined
    }

    // Case 2: /bloom or /bloom/threads
    if (segments.length >= 1) {
      const appSlug = segments[segments.length - 1]
      if (allApps?.find((app) => app.slug === appSlug)) {
        return appSlug
      }
    }

    return undefined
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

  const [store, setStore] = useState<storeWithApps | undefined>(
    session?.app?.store,
  )

  const {
    data: sessionSwr,
    mutate: refetchSession,
    isLoading: isSessionLoading,
    error: sessionError,
  } = useSWR(
    deviceId && shouldFetchSession ? ["session", env] : null,
    async () => {
      if (!deviceId || !token) {
        return
      }

      // Don't pass appSlug - let the API determine base app by domain
      const appSlug = undefined

      // Call the API action
      const result = await getSession({
        deviceId,
        fingerprint,
        app: isBrowserExtension() ? "extension" : isStandalone ? "pwa" : "web",
        gift,
        isStandalone,
        API_URL,
        VERSION,
        token,
        appSlug,
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
  const sessionData = session || sessionSwr

  const [allApps, setAllApps] = useState<appWithStore[]>(
    sessionData?.apps || [],
  )

  const chrry = allApps?.find((app) => !app.store?.parentStoreId)

  const baseApp = allApps?.find(
    (item) =>
      item?.store?.domain &&
      (item?.store?.domain === baseAppUrl || item?.store?.domain === chrryUrl),
  )

  const [app, setAppInternal] = useState<
    (appWithStore & { image?: string }) | undefined
  >(baseApp || session?.app)

  const [apps, setApps] = useState<appWithStore[]>(store?.apps || [])

  useEffect(() => {
    if (app?.store?.apps && app?.store?.apps.length) {
      setApps(app?.store?.apps)
    }
  }, [app])

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
  useEffect(() => {
    if (!baseApp || !allApps) return

    // Find app by pathname using the utility function
    const matchedApp = findAppByPathname(pathname, allApps) || baseApp

    if (matchedApp) {
      // Pure client-side navigation - no API calls needed!
      setApp(matchedApp)
      setStore(matchedApp.store)

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
  }, [allApps, pathname, baseApp])

  const hasHydrated = useHasHydrated()

  if (session?.translations && session?.locale) {
    if (!i18n.hasResourceBundle(session.locale, "translation")) {
      i18n.addResourceBundle(
        session.locale,
        "translation",
        session.translations,
      )
    }
    if (i18n.language !== session.locale && !hasHydrated) {
      i18n.changeLanguage(session.locale)
    }
  }

  const [isLoading, setIsLoading] = useState(true)

  const fetchSession = async () => {
    setIsLoading(true)
    setShouldFetchSession(true)
    await refetchSession()
  }

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

  const [aiAgents, setAiAgents] = useState<aiAgent[]>(session?.aiAgents || [])

  const setAppTheme = (themeColor?: string) => {
    setTheme(themeColor === "#ffffff" ? "light" : "dark")
  }

  const setApp = (item: appWithStore | undefined) => {
    setAppInternal(
      item
        ? {
            ...item,
            image: item.image || item.images?.[0]?.url,
          }
        : undefined,
    )

    item?.themeColor && setColorScheme(item?.themeColor)
    item?.backgroundColor && setAppTheme(item.backgroundColor)
  }

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

  useEffect(() => {
    if (sessionData?.apps) {
      setAllApps(sessionData.apps)
    }
  }, [sessionData?.apps])

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
        isExtensionRedirect,
        signInContext,
        signOutContext,
        characterProfilesEnabled,
        apps,
        setApps,
        allApps, // All apps from all stores
        refetchSession: async () => {
          await fetchSession()
        },
        fetchSession,
        env,
        setEnv,
        API_URL,
        WS_URL,
        FRONTEND_URL,
        PROD_FRONTEND_URL,
        setApp,
        aiAgents,
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
