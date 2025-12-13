"use client"

import { aiAgent, instruction, session } from "../../types"
import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useMemo,
} from "react"
import {
  isBrowserExtension,
  getExtensionId,
  usePlatform,
} from "../../platform/PlatformProvider"
import { getActions, ApiActions } from "../../lib"
import { useAuth } from "./AuthProvider"

import {
  toast,
  useCookieOrLocalStorage,
  useLocalStorage,
  useNavigation,
} from "../../platform"
import useSWR from "swr"
import { getWeatherCacheTime } from "../../utils/getWeatherCacheTime"
import { useError } from "./ErrorProvider"
import { getSiteConfig } from "../../utils/siteConfig"
import { ADDITIONAL_CREDITS, apiFetch } from "../../utils"

export type affiliateStats = {
  hasAffiliateLink: boolean
  code?: string
  affiliateLink?: string
  stats?: {
    clicks: number
    conversions: number
    totalRevenue: number
    commissionEarned: number
    commissionPaid: number
    commissionPending: number
    commissionRate: number
    status: string
  }
  referrals?: {
    total: number
    pending: number
    converted: number
    paid: number
  }
  createdOn?: string
  pendingPayout?: {
    id: string
    amount: number
    status: string
    requestedOn: string
  }
}

const DataContext = createContext<
  | {
      chrryUrl?: string
      ADDITIONAL_CREDITS: number
      CREDITS_PRICE: number
      PLUS_PRICE: number
      PRO_PRICE: number
      FREE_DAYS: number
      weather?:
        | {
            location: string
            country: string
            temperature: string
            condition: string
            code: number
            createdOn: Date
            lastUpdated: Date
          }
        | undefined
      setNeedsUpdateModalOpen: (value: boolean) => void
      needsUpdateModalOpen: boolean
      needsUpdate: boolean
      // Auth
      token?: string
      aiAgents: aiAgent[]
      setAiAgents: (aiAgents: aiAgent[]) => void
      fingerprint?: string
      pageSizes: {
        threads: number
        menuThreads: number
        messages: number
        users: number
        apps: number
      }
      VERSION: string
      versions?: {
        webVersion: string
        firefoxVersion: string
        chromeVersion: string
      }
      setVersions: (versions: {
        webVersion: string
        firefoxVersion: string
        chromeVersion: string
      }) => void
      // Data
      instructions: instruction[]
      affiliateStats: affiliateStats | null | undefined
      affiliateCode: string | null
      loadingAffiliateStats: boolean
      refetchAffiliateData: () => Promise<void>
      refetchWeather: () => void
      // Environment
      env: "development" | "production" | "staging"
      setEnv: (env: "development" | "production" | "staging") => void
      isDevelopment: boolean
      // URLs (from AuthProvider)
      API_URL: string
      isCI: boolean
      WS_URL: string
      FRONTEND_URL: string
      PROD_FRONTEND_URL: string
      MONTHLY_GUEST_CREDITS: number
      setToken: (token: string | undefined) => void
      // Prompt limits
      PROMPT_LIMITS: {
        INPUT: number
        INSTRUCTIONS: number
        TOTAL: number
        WARNING_THRESHOLD: number
        THREAD_TITLE: number
      }
      setPromptLimits: (limits: {
        INPUT: number
        INSTRUCTIONS: number
        TOTAL: number
        WARNING_THRESHOLD: number
        THREAD_TITLE: number
      }) => void
      // Actions
      actions: ApiActions
      TEST_GUEST_FINGERPRINTS: string[]
      TEST_MEMBER_FINGERPRINTS: string[]
      isE2E: boolean
    }
  | undefined
>(undefined)

// Check if running in development mode
// For extensions: check if extension ID matches dev ID
// For web: check NODE_ENV
const isProduction = process.env.NEXT_PUBLIC_NODE_ENV === "production"
const isExtension = isBrowserExtension()
const extensionId = getExtensionId()

export const isDevelopment = isExtension
  ? ["ihkpepnfnhmdkmpgfdnfbllldbgabbad"].includes(extensionId || "")
  : !isProduction

export const MONTHLY_GUEST_CREDITS = 30

export function DataProvider({ children, ...rest }: { children: ReactNode }) {
  const expenseCategory = [
    "food",
    "transport",
    "entertainment",
    "shopping",
    "bills",
    "health",
    "education",
    "travel",
    "other",
  ] as const

  const { user, deviceId, guest, chrryUrl, app, ...auth } = useAuth()
  const { captureException } = useError()

  const CREDITS_PRICE = 5.0
  // Affiliate code management
  const [affiliateCodeData, setAffiliateCodeData] = useLocalStorage<{
    code: string
    timestamp: number
  } | null>("vex_affiliate_code", null)

  const affiliateCode = useMemo(() => {
    if (!affiliateCodeData) return null

    const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
    const now = Date.now()
    const isExpired = now - affiliateCodeData.timestamp > thirtyDaysInMs

    if (isExpired) {
      setAffiliateCodeData(null)
      console.log("⏰ Affiliate code expired (30 days)")
      return null
    }

    return affiliateCodeData.code
  }, [affiliateCodeData, setAffiliateCodeData])

  const [instructions, setInstructions] = useState<instruction[]>([])
  const [affiliateStats, setAffiliateStats] = useState<
    affiliateStats | null | undefined
  >(null)
  const [loadingAffiliateStats, setLoadingAffiliateStats] =
    useState<boolean>(false)

  const VERSION = "1.6.84"

  const [weather, setWeather] = useLocalStorage<
    | {
        location: string
        country: string
        temperature: string
        condition: string
        code: number
        createdOn: Date
        lastUpdated: Date
      }
    | undefined
  >("weather", user?.weather || guest?.weather || undefined)

  const {
    API_URL,
    WS_URL,
    FRONTEND_URL,
    PROD_FRONTEND_URL,
    env,
    setEnv,
    isCI,
    token,
    setToken,
    TEST_GUEST_FINGERPRINTS,
    TEST_MEMBER_FINGERPRINTS,
    session,
  } = useAuth()

  const siteConfig = getSiteConfig()

  const {
    data: weatherData,
    error,
    mutate: refetchWeather,
  } = useSWR(
    siteConfig.mode !== "chrryDev" && token && deviceId ? ["weather"] : null,
    async () => {
      // return
      if (!token) return null

      try {
        const res = await apiFetch(`${API_URL}/weather`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) return
        return res.json()
      } catch (error) {
        captureException(error)
        console.error(`Error fetching weather`, error)
      }
    },
    {
      refreshInterval: (data) => {
        // Use the data parameter provided by SWR
        if (data) {
          return getWeatherCacheTime(data) * 1000 // Convert seconds to milliseconds
        }
        return 15 * 60 * 1000 // Default 15 minutes if no data yet
      },
      onErrorRetry: (error) => {
        if (error.message.includes("429")) return
      },
      shouldRetryOnError: false,
    },
  )

  // Get URL constants and env state from AuthProvider

  const [versions, setVersions] = useState<
    | {
        webVersion: string
        firefoxVersion: string
        chromeVersion: string
      }
    | undefined
  >(session?.versions)

  const pageSizes = {
    threads: 20,
    menuThreads: 10,
    messages: 20,
    users: 20,
    apps: 50,
  }

  const [PROMPT_LIMITS, setPromptLimits] = useState({
    INPUT: 7000, // Max for direct input
    INSTRUCTIONS: 2000, // Max for instructions
    TOTAL: 30000, // Combined max (input + context)
    WARNING_THRESHOLD: 5000, // Show warning at this length
    THREAD_TITLE: 100,
  })

  // Regional routing deprecated - now using env-based URLs from AuthProvider

  // Memoize actions to recreate when token or API_URL changes
  const actions = useMemo(
    () =>
      getActions({
        API_URL,
        token: token || "",
      }),
    [API_URL, token],
  )

  const { isStandalone, isExtension, isFirefox } = usePlatform()
  const { searchParams, pathname } = useNavigation()

  const { data: affiliateData, mutate: refetchAffiliateData } = useSWR(
    user && token && pathname.startsWith("/affiliate") ? ["affiliate"] : null,
    async () => {
      if (!token) {
        return null
      }
      setLoadingAffiliateStats(true)
      try {
        const res = await apiFetch(`${API_URL}/affiliates`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await res.json()
        return data
      } catch (error) {
        console.error("Failed to fetch affiliate stats:", error)
        return null
      } finally {
        setLoadingAffiliateStats(false)
      }
    },
  )

  useEffect(() => {
    if (affiliateData) {
      setAffiliateStats(affiliateData)
    } else if (!user && !loadingAffiliateStats) {
      setAffiliateStats(null)
    }
  }, [affiliateData, loadingAffiliateStats, user])

  useEffect(() => {
    if (!token) return
    // Check URL for ref parameter
    const ref = searchParams.get("ref")

    if (ref && !affiliateCode) {
      // Track click immediately for all users (guests and registered)
      apiFetch(`${API_URL}/affiliates/trackClick`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: ref }),
      }).catch((error) => {
        console.error("Failed to track affiliate click:", error)
      })

      // Check if user is trying to use their own affiliate code
      if (user) {
        apiFetch(`${API_URL}/affiliates`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.hasAffiliateLink && data.code === ref) {
              console.log("⚠️ Cannot use your own affiliate link")
              return
            }
            // Store affiliate code with timestamp
            setAffiliateCodeData({ code: ref, timestamp: Date.now() })
            console.log("🎯 Affiliate code stored (30 days):", ref)
          })
          .catch((error) => {
            console.error("Failed to check affiliate link:", error)
            // If check fails, still store the code (backend will validate)
            setAffiliateCodeData({ code: ref, timestamp: Date.now() })
          })
      } else {
        // Guest users can always store affiliate codes
        setAffiliateCodeData({ code: ref, timestamp: Date.now() })
        console.log("🎯 Affiliate code stored (guest, 30 days):", ref)
      }
    }
  }, [searchParams, affiliateCode, setAffiliateCodeData, user, token])

  const RELEASE_TIMESTAMP = "2025-09-14T09:48:29.393Z" // Move to constants
  const [createdOn, setCreatedOn] = useCookieOrLocalStorage("createdOn", "")

  useEffect(() => {
    if (createdOn === "") {
      setCreatedOn(new Date().toISOString())
    }
  }, [createdOn])

  const [needsUpdateModalOpen, setNeedsUpdateModalOpen] = useState(false)
  const [needsUpdate, setNeedsUpdate] = useState(false)

  const toVersionNumber = (version?: string): number => {
    if (!version) return 0

    // Split by dots and take first 3 parts for major.minor.patch
    const parts = version.split(".").slice(0, 3)

    // Pad with zeros if needed and convert each part
    const [major = 0, minor = 0, patch = 0] = parts.map((part) => {
      const num = parseInt(part.replace(/\D/g, ""), 10)
      return isNaN(num) ? 0 : num
    })

    // Create a comparable number: major * 10000 + minor * 100 + patch
    return major * 10000 + minor * 100 + patch
  }

  function getUnitFromCountry(country: string) {
    const fahrenheitCountries = [
      "United States",
      "Bahamas",
      "Belize",
      "Cayman Islands",
      "Liberia",
    ]
    return fahrenheitCountries.includes(country) ? "F" : "C"
  }

  useEffect(() => {
    if (error) captureException(error)
  }, [error])

  useEffect(() => {
    if (weatherData) {
      if (
        !weatherData.location ||
        !weatherData.current ||
        !weatherData.current.condition
      )
        return

      const unit = getUnitFromCountry(weatherData.location.country)
      setWeather({
        location: weatherData.location.name,
        country: weatherData.location.country,
        temperature: `${unit === "F" ? weatherData.current.temp_f : weatherData.current.temp_c}°${unit}`,
        condition: weatherData.current.condition.text,
        code: weatherData.current.condition.code,
        createdOn: new Date(),
        lastUpdated: weatherData.current.last_updated,
      })
    }
  }, [weatherData])

  const isE2E = process.env.NEXT_PUBLIC_TESTING_ENV === "e2e"

  const [aiAgents, setAiAgents] = useState<aiAgent[]>(session?.aiAgents || [])

  const { data: aiAgentsData } = useSWR<aiAgent[]>(
    siteConfig.mode !== "chrryDev" && aiAgents?.length > 0
      ? null
      : token && ["aiAgents", token, app?.id],
    async () => {
      const url = new URL(`${API_URL}/aiAgents`)
      if (app?.id) {
        url.searchParams.set("appId", app.id)
      }
      const res = await apiFetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "GET",
      })
      return await res.json()
    },
  )

  useEffect(() => {
    if (aiAgentsData) {
      setAiAgents(aiAgentsData)
    }
  }, [aiAgentsData])

  useEffect(() => {
    const update = !versions
      ? false
      : isExtension
        ? isFirefox
          ? toVersionNumber(versions.firefoxVersion) > toVersionNumber(VERSION)
          : toVersionNumber(versions.chromeVersion) > toVersionNumber(VERSION)
        : isStandalone && createdOn
          ? new Date(createdOn).getTime() <
            new Date(RELEASE_TIMESTAMP).getTime()
          : false
    setNeedsUpdate(update)
    setNeedsUpdateModalOpen(update)
  }, [versions, createdOn, isStandalone, isExtension, isFirefox])

  const FREE_DAYS = 5
  const PLUS_PRICE = 9.99
  const PRO_PRICE = 19.99

  return (
    <DataContext.Provider
      value={{
        chrryUrl,
        CREDITS_PRICE,
        FREE_DAYS,
        PLUS_PRICE,
        PRO_PRICE,
        ADDITIONAL_CREDITS,
        weather,
        aiAgents,
        setAiAgents,
        versions,
        setVersions,
        VERSION,
        token,
        instructions,
        affiliateStats,
        affiliateCode,
        loadingAffiliateStats,
        refetchAffiliateData,
        refetchWeather,
        env,
        setEnv,
        isDevelopment,
        API_URL,
        WS_URL,
        TEST_GUEST_FINGERPRINTS,
        TEST_MEMBER_FINGERPRINTS,
        FRONTEND_URL,
        PROMPT_LIMITS,
        setPromptLimits,
        setToken,
        PROD_FRONTEND_URL,
        MONTHLY_GUEST_CREDITS,
        actions,
        isE2E,
        pageSizes,
        setNeedsUpdateModalOpen,
        needsUpdateModalOpen,
        needsUpdate,
        isCI,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
