/// <reference types="chrome" />

import type { guest, subscription, user, thread, threadSummary } from "../types"
import countries from "i18n-iso-countries"
import { getEnv } from "./env"

// Browser API type for extension compatibility
type BrowserAPIType = typeof chrome | typeof browser
import isOwner from "./isOwner"
import {
  exampleInstructions,
  getExampleInstructions,
} from "./getExampleInstructions"

import { getWeatherCacheTime } from "./getWeatherCacheTime"
import { locales } from "../locales"
import { getSiteConfig } from "./siteConfig"
import { getAppAndStoreSlugs, excludedSlugRoutes } from "./url"
import replaceLinks from "./replaceLinks"
export * from "./env"
import { isE2E } from "./env"
import {
  isDevelopment,
  isTestingDevice,
  isProduction,
  checkIsExtension,
  getExtensionUrl,
  isCI,
} from "./env"

export {
  isCI,
  isDevelopment,
  isTestingDevice,
  isProduction,
  checkIsExtension,
  getExtensionUrl,
}

export const VEX_LIVE_FINGERPRINTS =
  getEnv().VEX_LIVE_FINGERPRINTS?.split(",") || []

export const VEX_LIVE_FINGERPRINT = VEX_LIVE_FINGERPRINTS[0] || ""

export { exampleInstructions, getExampleInstructions }

export const isSameDay = (date1: Date, date2: Date) => {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

export { replaceLinks }

export const GUEST_TASKS_COUNT = 4
export const MEMBER_TASKS_COUNT = 8
export const PLUS_TASKS_COUNT = 30

export { getWeatherCacheTime }

// Get hostname from window if available (client-side)
const getClientHostname = () => {
  if (typeof window !== "undefined" && window.location) {
    return window.location.hostname
  }
  return undefined
}

// Priority: env var > dynamic detection > hardcoded fallback
const hostname = getClientHostname()
export const CHRRY_URL =
  getEnv().VITE_CHRRY_URL ||
  (hostname ? getSiteConfig(hostname).url : "https://vex.chrry.ai")

export const FREE_DAYS = 5
export const PLUS_PRICE = 9.99
export const PRO_PRICE = 19.99
export const CREDITS_PRICE = 5.0
export const ADDITIONAL_CREDITS = 500

export function isValidUuidV4(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    uuid,
  )
}

export function getThreadId(pathname?: string): string | undefined {
  if (!pathname) return undefined
  // Server-safe: check if window exists
  const segments = pathname.split("/").filter(Boolean)
  const threadsIndex = segments.findIndex((segment) => segment === "threads")

  if (threadsIndex === -1) return undefined

  const threadSegment = segments[threadsIndex + 1] || ""
  const [threadId] = threadSegment.split("?")[0]?.split("&") ?? []

  return threadId && isValidUuidV4(threadId) ? threadId : undefined
}

// export const isDevelopment = process.env.VITE_NODE_ENV !== "production"

export const MAX_TOOL_CALLS_PER_MESSAGE = 7

export const WS_URL =
  getEnv().VITE_WS_URL ||
  (isTestingDevice
    ? "ws://192.168.2.27:3001"
    : isDevelopment
      ? "ws://localhost:3001"
      : "wss://chrry.dev") // Unified WebSocket on production

export const WS_SERVER_URL =
  getEnv().VITE_WS_SERVER_URL ||
  getEnv().WS_SERVER_URL ||
  "http://127.0.0.1:3001"

export const addParam = (key: string, value: string) => {
  if (typeof window === "undefined") return
  const searchParams = new URLSearchParams(window.location.search)
  searchParams.set(key, value)
  const newUrl = searchParams.toString()
    ? `?${searchParams.toString()}`
    : window.location.pathname
  window.history.replaceState({}, "", newUrl)
}

const FE_PORT = getEnv().VITE_FE_PORT || "5173"
const API_PORT = getEnv().API_PORT || "3001"

export const FRONTEND_URL =
  getEnv().VITE_FRONTEND_URL ||
  (isTestingDevice
    ? `http://192.168.2.27:${FE_PORT}`
    : isDevelopment
      ? `http://localhost:${FE_PORT}`
      : CHRRY_URL)

export const PROD_FRONTEND_URL = FRONTEND_URL

export const API_INTERNAL_URL = getEnv().VITE_API_INTERNAL_URL

export const API_URL =
  getEnv().VITE_API_URL ||
  (isTestingDevice
    ? `http://192.168.2.27:${API_PORT}/api`
    : isDevelopment
      ? `http://localhost:${API_PORT}/api`
      : isE2E
        ? "https://e2e.chrry.dev/api"
        : "https://chrry.dev/api")

// API fetch wrapper with credentials for cross-domain requests
export const apiFetch = (url: string, options?: RequestInit) => {
  return fetch(url, {
    ...options,
    credentials: "include", // Send cookies cross-domain
    headers: {
      ...options?.headers,
    },
  })
}

export const PROMPT_LIMITS = {
  INPUT: 7000, // Max for direct input
  INSTRUCTIONS: 2000, // Max for instructions
  TOTAL: 30000, // Combined max (input + context)
  WARNING_THRESHOLD: 5000, // Show warning at this length
  THREAD_TITLE: 100,
}

export const expenseCategory = [
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

export type expenseCategoryType = (typeof expenseCategory)[number]

export const budgetCategory = expenseCategory

export const extensionSuggestions = [
  {
    text: "Instantly magic up a quick page summary",
    emoji: "✨",
  },
  {
    text: "Snag and organize the juiciest info you spot",
    emoji: "🔍",
  },

  {
    text: "Add this event to my calendar",
    emoji: "📅",
  },
  {
    text: "Reserve tables, book trips—no sweat",
    emoji: "🎟️",
  },
  {
    text: "Compare prices for this product",
    emoji: "💰",
  },
  {
    text: "Screenshot selected area",
    emoji: "📸",
  },
  {
    text: "Zap the whole site into your language",
    emoji: "🌈",
  },
  {
    text: "Organize open tabs by topic",
    emoji: "🗂️",
  },
]

export const storage =
  typeof browser !== "undefined" ? browser?.storage?.local : undefined

export const pageSizes = {
  threads: 20,
  menuThreads: 10,
  messages: 20,
  users: 20,
  stores: 20,
  apps: 50,
  taskLogs: 20,
}

const now = new Date()

export const utcToday = new Date(
  Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
)

export const getExtensionUrls = (domain?: string): string[] => {
  const vex = getSiteConfig("vex").url
  const chrry = getSiteConfig("chrryAI").url
  const atlas = getSiteConfig("atlas").url
  const istanbul = getSiteConfig("istanbul").url
  const amsterdam = getSiteConfig("amsterdam").url
  const tokyo = getSiteConfig("tokyo").url
  const newYork = getSiteConfig("newYork").url
  const focus = getSiteConfig("focus").url

  // Development: only use localhost
  if (isDevelopment) {
    return [FRONTEND_URL]
  }

  // Production: current mode first, then other extensions as fallbacks
  const urls = [vex, chrry, atlas, istanbul, amsterdam, tokyo, newYork, focus]
  return urls
}

export const getBrowserAPI = (): BrowserAPIType | null => {
  if (typeof window === "undefined") return null

  // Check for Chrome API first
  if (typeof chrome !== "undefined" && (chrome as any)?.runtime?.id) {
    return chrome as unknown as BrowserAPIType
  }

  // Fallback to Firefox API
  if (typeof browser !== "undefined" && (browser as any).runtime?.id) {
    return browser as unknown as BrowserAPIType
  }

  return null
}

export const BrowserInstance = getBrowserAPI()

// Check if message needs web search - comprehensive multilingual support

export function capitalizeFirstLetter(val: string) {
  return String(val).charAt(0).toUpperCase() + String(val).slice(1)
}

export const getMetadata = ({
  // manifest = "/manifest.webmanifest",
  title = "Chrry - Your personal AI assistant",
  description = "Chat with AI, analyze files, and boost productivity in any language",
  keywords = [
    "ai chat",
    "multilingual",
    "file analysis",
    "productivity",
    "GPT-5",
    "claude",
    "gemini",
    "voice input",
    "focus",
    "chrry",
  ],
  robots,
  locale = "en",
  alternates,
}: {
  manifest?: string
  title?: string
  description?: string
  keywords?: string[]
  locale?: string
  robots?: {
    index: boolean
    follow: boolean
  }
  alternates?: {
    canonical?: string
    languages?: Record<string, string>
  }
} = {}) => {
  const metadata = {
    metadataBase: new URL("https://chrry.ai"),
    alternates: alternates
      ? alternates
      : {
          canonical: "./",
        },
    title,
    icons: ["/icon.ico"],
    description,
    ...(keywords.length > 0 && { keywords: keywords.join(", ") }),
    openGraph: {
      title,
      description,
      url: "https://chrry.ai",
      siteName: "Chrry",
      images: [
        {
          url: "https://chrry.ai/logo/logo-512-512.png",
          width: 512,
          height: 512,
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      title,
      description,
      card: "summary",
      site: "https://chrry.ai",
      creator: "@chrryAI",
      images: [
        {
          url: "https://chrry.ai/logo/logo-1200-630.png",
          width: 1200,
          height: 630,
        },
      ],
    },
    robots,
    // manifest,
  }

  return metadata
}

export const removeParam = (key: string) => {
  if (typeof window === "undefined") return
  const searchParams = new URLSearchParams(window.location.search)
  searchParams.delete(key)
  const newUrl = searchParams.toString()
    ? `?${searchParams.toString()}`
    : window.location.pathname
  window.history.replaceState({}, "", newUrl)
}

export const isFirefox =
  typeof navigator !== "undefined" && navigator?.userAgent?.includes("Firefox")

export function getFlag({ code }: { code?: string }) {
  if (!code || code.length !== 2) return "🏳️"

  // Convert ISO country code to flag emoji
  // Each letter gets converted to regional indicator symbol
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + 127397))
    .join("")
}

const config = getSiteConfig(getClientHostname())

export const VERSION = config.version || "1.10.89"
export type instructionBase = {
  id: string
  title: string
  emoji?: string
  requiresWebSearch?: boolean
  content?: string
  appName?: string
  appId?: string | null // Match instruction type from schema
}

/**
 * Get dynamic, context-aware example instructions
 * Supports app-specific instructions with weather, location, and time context
 * Fully internationalized with proper parameterization
 */

export const getSlugFromPathname = (
  path: string,
): { appSlug: string; storeSlug: string } => {
  return getAppAndStoreSlugs(path, {
    defaultAppSlug: config.slug,
    defaultStoreSlug: config.storeSlug,
    excludedRoutes: excludedSlugRoutes,
    locales,
  })
}

export const getInstructionConfig = ({
  city,
  country,
  weather,
  t,
}: {
  city?: string | null
  country?: string | null
  weather?: { temperature?: string; condition?: string } | null
  t?: (key: string, params?: Record<string, string | number>) => string
}) => {
  const hour = new Date().getHours()
  const timeOfDay =
    hour >= 5 && hour < 12
      ? "morning"
      : hour >= 12 && hour < 17
        ? "afternoon"
        : hour >= 17 && hour < 22
          ? "evening"
          : "night"
  function getCountryCode(countryName: string): string {
    const code = countries.getAlpha2Code(countryName, "en")
    return code || countryName
  }
  // Get country flag emoji
  const flag = country ? getFlag({ code: getCountryCode(country) }) : ""

  // Get temperature and location (used across all instructions)
  const temp = weather?.temperature ? weather.temperature : ""
  const location =
    city && country ? `${city}, ${country}` : city || country || ""

  // Get weather emoji
  const weatherEmoji = weather?.condition?.toLowerCase().includes("rain")
    ? "🌧️"
    : weather?.condition?.toLowerCase().includes("cloud")
      ? "☁️"
      : weather?.condition?.toLowerCase().includes("sun")
        ? "☀️"
        : weather?.condition?.toLowerCase().includes("snow")
          ? "❄️"
          : "🌤️"

  // Combined weather description for {{weather}} placeholder
  const weatherDescription =
    temp && weatherEmoji ? `${weatherEmoji}${temp}` : ""

  return {
    flag,
    temp,
    location,
    weatherEmoji,
    timeOfDay,
    hour,
    city: city || undefined,
    country: country || undefined,
    weather: weatherDescription, // Add combined weather for {{weather}} placeholder
  }
}

export const getBrowserIdentity = () => {
  if (typeof chrome !== "undefined" && chrome.identity) {
    return chrome.identity
  }
  if (typeof browser !== "undefined" && (browser as any).identity) {
    return (browser as any).identity
  }
  return undefined
}

const THREAD_SUMMARY_LIMITS = {
  guest: 10, // Trial experience
  member: 50, // Registered users
  plus: 200, // 200/day (very generous)
  pro: 500, // 500/day (unlimited feel)
}

export function checkThreadSummaryLimit({
  user,
  guest,
  thread,
}: {
  user?: (user & { subscription?: subscription }) | null
  guest?: (guest & { subscription?: subscription }) | null
  threadId?: string
  thread: thread & { summary?: threadSummary }
}): boolean {
  if (!user?.characterProfilesEnabled && !guest?.characterProfilesEnabled)
    return false

  const summary = thread.summary

  // Determine user type and limit
  let limit: number
  if (user?.subscription || guest?.subscription) {
    limit =
      user?.subscription?.plan === "pro"
        ? THREAD_SUMMARY_LIMITS.pro
        : THREAD_SUMMARY_LIMITS.plus
  } else if (user) {
    limit = THREAD_SUMMARY_LIMITS.member
  } else {
    limit = THREAD_SUMMARY_LIMITS.guest
  }

  try {
    // Check if summary was created today
    if (summary?.createdOn) {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const summaryDate = new Date(summary.createdOn)
      summaryDate.setHours(0, 0, 0, 0)

      // If summary was created today, check if thread message count is under limit
      // This prevents one huge thread from consuming entire daily quota
      if (summaryDate.getTime() === today.getTime()) {
        return summary.messageCount < limit
      }
    }

    // Allow generation if no summary exists or summary is from previous day
    return true
  } catch (error) {
    console.error("Error checking thread summary limit:", error)
    return false
  }
}

export const getRedirectURL = () => {
  if (checkIsExtension()) {
    return "focusbutton://auth-callback" // Keep this for desktop auth flow
  }
  const identity = getBrowserIdentity()
  if (!identity) {
    throw new Error("Browser identity API not available")
  }
  return identity.getRedirectURL().replace(/\/$/, "")
}

export const getDailyImageLimit = ({
  member,
  guest,
}: {
  member?: Partial<user> & { subscription?: subscription }
  guest?: Partial<guest> & { subscription?: subscription }
}) => {
  const multiplier = member?.role === "admin" ? 10 : 1
  if (member?.subscription || guest?.subscription) {
    return 50 * multiplier // Plus users: 50 images per day
  } else if (member) {
    return 10 * multiplier // Free users: 10 images per day
  } else {
    return 3 * multiplier // Guests: 3 images per day
  }
}

export function isValidUsername(username: string) {
  return /^[a-zA-Z0-9]{3,20}$/.test(username)
}

export { isOwner }

export const isCollaborator = (
  thread: thread,
  userId?: string,
  status?: "active" | "pending",
): boolean => {
  if (!userId || !thread.collaborations) return false
  return (
    thread.collaborations.some(
      (collab) =>
        collab.user.id === userId &&
        (status ? collab.collaboration.status === status : true),
    ) ?? false
  )
}

export const PDF_LIMITS = {
  initial: 0.5 * 1024 * 1024, // 0.5MB initial limit
  increment: 0.25 * 1024 * 1024, // +0.25MB per minute
  max: 2 * 1024 * 1024, // Absolute max 2MB
}

export const MAX_FILE_LIMITS = {
  artifacts: 10,
  chat: 5,
}

export const MAX_FILE_SIZES = {
  deepSeek: {
    pdf: 22 * 1024 * 1024, // 22MB - reports show it can handle large documents
    image: 0, // Not supported
    audio: 0, // Not supported
    video: 0, // Not supported
    text: 22 * 1024 * 1024, // 22MB - matches PDF capability
  },
  sushi: {
    pdf: 50 * 1024 * 1024, // 50MB - GPT-5 enhanced document processing
    image: 20 * 1024 * 1024, // 20MB - GPT-5 Vision API limit
    audio: 25 * 1024 * 1024, // 25MB - Whisper API limit (unchanged)
    video: 100 * 1024 * 1024, // 100MB - GPT-5 improved video processing
    text: 50 * 1024 * 1024, // 5MB - matches PDF capability
  },
  perplexity: {
    pdf: 0, // Not supported
    image: 0, // Not supported
    audio: 0, // Not supported
    video: 0, // Not supported
    text: 0, // Not supported
  },
  chatGPT: {
    pdf: 50 * 1024 * 1024, // 50MB - GPT-5 enhanced document processing
    image: 20 * 1024 * 1024, // 20MB - GPT-5 Vision API limit
    audio: 25 * 1024 * 1024, // 25MB - Whisper API limit (unchanged)
    video: 100 * 1024 * 1024, // 100MB - GPT-5 improved video processing
    text: 50 * 1024 * 1024, // 50MB - GPT-5 enhanced text processing
  },
  claude: {
    pdf: 500 * 1024 * 1024, // 500MB - Claude 4 Files API maximum
    image: 500 * 1024 * 1024, // 500MB - Claude 4 Files API maximum
    audio: 500 * 1024 * 1024, // 500MB - Claude 4 Files API maximum
    video: 500 * 1024 * 1024, // 500MB - Claude 4 Files API maximum
    text: 500 * 1024 * 1024, // 500MB - Claude 4 Files API maximum
  },
  gemini: {
    pdf: 500 * 1024 * 1024, // 500MB - Gemini Pro 2.5 enhanced processing
    image: 500 * 1024 * 1024, // 500MB - Gemini Pro 2.5 multimodal capabilities
    audio: 500 * 1024 * 1024, // 500MB - Gemini Pro 2.5 audio processing
    video: 1000 * 1024 * 1024, // 1GB - Gemini Pro 2.5 video analysis (within 2GB limit)
    text: 500 * 1024 * 1024, // 300MB - Gemini Pro 2.5 text processing
  },
}

export const OWNER_CREDITS = 999999

export const isDeepEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true
  if (
    typeof obj1 !== "object" ||
    obj1 === null ||
    typeof obj2 !== "object" ||
    obj2 === null
  ) {
    return false
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) return false

  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!isDeepEqual(obj1[key], obj2[key])) return false
  }

  return true
}

// Export getHourlyLimit
export { decodeHtmlEntities } from "./decodeHtmlEntities"
export { getHourlyLimit } from "./getHourlyLimit"

// Export generateAppMetadata
export { generateAppMetadata } from "./generateAppMetadata"

// Export generateStoreMetadata
export { generateStoreMetadata } from "./generateStoreMetadata"

// Export generateThreadMetadata
export { generateThreadMetadata } from "./generateThreadMetadata"

// Export file validation utilities
export {
  validateFile,
  getMaxFileSize,
  isTextFile,
  formatFileSize,
} from "./fileValidation"
export type {
  FileValidationResult,
  AgentCapabilities,
  AgentModel,
} from "./fileValidation"

// Export API URL utilities
