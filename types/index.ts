/**
 * Type definitions for Cherry UI library
 * These types mirror the database schema but are decoupled for open-source distribution
 */

// User types
export type user = {
  isLinkedToGoogle?: boolean
  isLinkedToApple?: boolean
  hasRefreshToken?: boolean
  id: string
  adConsent?: boolean
  stripeConnectAccountId?: string
  stripeConnectOnboarded?: boolean
  pendingCollaborationThreadsCount?: number
  activeCollaborationThreadsCount?: number
  name: string | null
  email: string
  emailVerified: Date | null
  image: string | null
  role: "admin" | "user"
  theme: "light" | "dark" | "system"
  createdOn: Date
  updatedOn: Date
  activeOn: Date | null
  language: "en" | "de" | "es" | "fr" | "ja" | "ko" | "pt" | "zh" | "nl" | "tr"
  fingerprint: string | null
  isOnline: boolean | null
  subscribedOn: Date | null
  userName: string
  fileUploadsToday: number
  fileUploadsThisHour: number
  totalFileSizeToday: number
  lastFileUploadReset: Date | null
  speechRequestsToday: number
  speechRequestsThisHour: number
  speechCharactersToday: number
  lastSpeechReset: Date | null
  imagesGeneratedToday: number
  lastImageGenerationReset: Date | null
  lastMessage?: message
  favouriteAgent:
    | "deepSeek"
    | "chatGPT"
    | "claude"
    | "gemini"
    | "flux"
    | "sushi"
    | "perplexity"
    | string
  timezone: string | null
  tasksCount: number
  appleId: string | null
  migratedFromGuest: boolean
  credits: number
  subscription?: subscription
  token?: string
  creditsLeft?: number
  messagesLastHour?: number
  characterProfiles?: characterProfile[]
  memoriesCount?: number
  placeHolder?: placeHolder
  instructions?: instruction[]
  characterProfilesEnabled?: boolean | null
  memoriesEnabled?: boolean | null
  hasCalendarScope?: boolean
  city: string | null
  country: string | null
  weather?: {
    location: string
    country: string
    temperature: string
    condition: string
    code: number
    createdOn: Date
    lastUpdated: Date
  } | null
}

export type newUser = Partial<user>

// Device types
export type device = {
  id: string
  type: string | null
  app: string | null
  os: string | null
  osVersion: string | null
  screenWidth: number | null
  screenHeight: number | null
  language: string | null
  timezone: string | null
  browser: string | null
  browserVersion: string | null
  appVersion: string | null
  userId: string | null
  guestId: string | null
  createdOn: Date
  updatedOn: Date
  fingerprint: string
}
export type moodType =
  | "happy"
  | "sad"
  | "angry"
  | "astonished"
  | "inlove"
  | "thinking"
export type mood = {
  userId: string | null
  guestId: string | null
  id: string
  createdOn: Date
  updatedOn: Date
  type: moodType
  taskLogId: string | null
}
export type timer = {
  id: string
  createdOn: Date
  updatedOn: Date
  fingerprint: string
  userId: string
  count: number
  isCountingDown: boolean
  preset1: number
  preset2: number
  preset3: number
}
export type task = {
  id: string
  userId: string | null
  createdOn: Date
  description: string | null
  title: string
  guestId: string | null
  order: number | null
  modifiedOn: Date
  total:
    | {
        date: string
        count: number
      }[]
    | null
  selected: boolean | null
}
export type taskLog = {
  userId: string | null
  guestId: string | null
  taskId: string
  id: string
  createdOn: Date
  updatedOn: Date
  moodId: string | null
  mood: moodType | null
  content: string
}

export type newTaskLog = {
  content: string
  taskId: string
  id?: string | undefined
  createdOn?: Date | undefined
  updatedOn?: Date | undefined
  userId?: string | null | undefined
  guestId?: string | null | undefined
  moodId?: string | null | undefined
  mood?: moodType | null
}

export type newDevice = Partial<device>

// Subscription types
export type subscription = {
  id: string
  provider: "stripe" | "apple" | "google"
  subscriptionId: string
  sessionId: string | null
  status: "active" | "canceled" | "pastDue" | "ended" | "trialing"
  userId: string | null
  guestId: string | null
  createdOn: Date
  updatedOn: Date
  plan: "plus" | "pro"
}

export type newSubscription = Partial<subscription>

// Guest types
export type guest = {
  id: string
  createdOn: Date
  updatedOn: Date
  ip: string
  fingerprint: string
  activeOn: Date
  email: string | null
  tasksCount: number
  adConsent?: boolean
  pendingCollaborationThreadsCount?: number
  activeCollaborationThreadsCount?: number
  favouriteAgent:
    | "deepSeek"
    | "chatGPT"
    | "claude"
    | "gemini"
    | "flux"
    | "perplexity"
    | "sushi"
  credits: number
  isBot: boolean
  isOnline: boolean | null
  imagesGeneratedToday: number
  lastImageGenerationReset: Date | null
  migratedToUser: boolean
  fileUploadsToday: number
  fileUploadsThisHour: number
  totalFileSizeToday: number
  lastFileUploadReset: Date | null
  subscribedOn: Date | null
  speechRequestsToday: number
  speechRequestsThisHour: number
  speechCharactersToday: number
  lastSpeechReset: Date | null
  timezone: string | null
  subscription?: subscription
  token?: string
  creditsLeft?: number
  lastMessage?: message
  messagesLastHour?: number
  characterProfiles?: characterProfile[]
  memoriesCount?: number
  placeHolder?: placeHolder
  instructions?: instruction[]
  characterProfilesEnabled?: boolean | null
  memoriesEnabled?: boolean | null
  city: string | null
  country: string | null
  weather?: {
    location: string
    country: string
    temperature: string
    condition: string
    code: number
    createdOn: Date
    lastUpdated: Date
  } | null
}

export type newGuest = Partial<guest>

export type sessionUser = user

export type sessionGuest = guest

// Account types
export type account = {
  userId: string
  type: string
  provider: string
  providerAccountId: string
  refresh_token: string | null
  access_token: string | null
  expires_at: number | null
  token_type: string | null
  scope: string | null
  id_token: string | null
  session_state: string | null
}

export type newAccount = Partial<account>

// Session types
export type session = {
  env?: "development" | "production" | "staging"
  TEST_GUEST_FINGERPRINTS?: string[]
  TEST_MEMBER_FINGERPRINTS?: string[]
  TEST_MEMBER_EMAILS?: string[]
  fingerprint?: string
  token?: string
  aiAgents?: aiAgent[]
  migratedFromGuest?: boolean
  hasNotification?: boolean
  createdOn?: string
  locale?: string
  aiAgent?: aiAgent
  VEX_LIVE_FINGERPRINTS?: string[]
  store: storeWithApps & {
    nextPage: string | null
    totalCount: number
  }
  stores?: Paginated<storeWithApps>
  versions: {
    webVersion: string
    firefoxVersion: string
    chromeVersion: string
    macosVersion: string
  }
  deviceId?: string
  app: appWithStore
  userBaseApp?: appWithStore
  guestBaseApp?: appWithStore
  // Device info from UAParser (server-side detection)
  device?: {
    vendor?: string
    model?: string
    type?: string
  }
  os?: {
    name?: string
    version?: string
  }
  browser?: {
    name?: string
    version?: string
    major?: string
  }
  guest?: sessionGuest

  user?: sessionUser
}

export type newSession = Partial<session>

// Verification token types
export type verificationToken = {
  identifier: string
  token: string
  expires: Date
}

export type newVerificationToken = Partial<verificationToken>

export type messages = {
  message: message & {
    isStreaming?: boolean
    isStreamingStop?: boolean
  }
  user?: user
  guest?: guest
  aiAgent?: aiAgent
  thread?: thread
}[]

export type paginatedMessages = {
  messages: messages
  nextPage?: number
  totalCount?: number
}
// Thread types
export type thread = {
  characterProfile?: characterProfile
  placeHolder?: placeHolder
  collaborations?:
    | {
        thread?: thread
        collaboration: collaboration
        user: user
      }[]
    | null
  isMainThread: boolean
  lastMessage?: message
  user?: user
  guest?: guest
  appId: string | null
  app?: appWithStore
  id: string
  userId: string | null
  guestId: string | null
  createdOn: Date
  updatedOn: Date
  title: string
  aiResponse: string
  isIncognito: boolean
  star: number | null
  bookmarks: Array<{
    userId?: string
    guestId?: string
    createdOn: string
  }> | null
  metadata: {} | null
  instructions: string | null

  visibility: "private" | "protected" | "public"
  artifacts: Array<{
    type: string
    url?: string
    name: string
    size: number
    data?: string
    id: string
  }> | null
}

export type newThread = Partial<thread>

// Push subscription types
export type pushSubscription = {
  id: string
  userId: string | null
  guestId: string | null
  endpoint: string
  p256dh: string
  auth: string
  createdOn: Date
  updatedOn: Date
}

export type newPushSubscription = Partial<pushSubscription>

// Collaboration types
export type collaborationStatus = "active" | "pending" | "revoked" | "rejected"

export type collaboration = {
  id: string
  threadId: string
  role: "owner" | "collaborator"
  userId: string
  createdOn: Date
  updatedOn: Date
  activeOn: Date | null
  status: collaborationStatus | null
  isOnline: boolean | null
  isTyping: boolean | null
  lastTypedOn: Date | null
  expiresOn: Date | null
}

export type newCollaboration = Partial<collaboration>

// AI Agent types
export type aiAgent = {
  id: string
  name:
    | "deepSeek"
    | "chatGPT"
    | "claude"
    | "gemini"
    | "flux"
    | "perplexity"
    | "sushi"
  displayName: string
  version: string
  apiURL: string
  description: string | null
  state: "active" | "testing" | "inactive"
  creditCost: number
  modelId: string
  order: number
  maxPromptSize: number | null
  capabilities: {
    text: boolean
    image: boolean
    audio: boolean
    video: boolean
    webSearch: boolean
    imageGeneration: boolean
    codeExecution?: boolean
    pdf: boolean
  }
  authorization: "user" | "subscriber" | "guest" | "all"
}

export type newAiAgent = Partial<aiAgent>

// Web search result types
export type webSearchResult = {
  title: string
  url: string
  snippet: string
}

// Task analysis types
export type taskAnalysis = {
  type: "chat" | "automation" | "booking" | "summary" | "scraping"
  creditMultiplier: number
  estimatedTokens: number
  confidence: number
}

// Model name types
export type modelName = "chatGPT" | "claude" | "deepSeek" | "gemini" | "flux"

// Message types
export type message = {
  id: string
  agentId: string | null
  debateAgentId: string | null
  pauseDebate: boolean
  clientId: string
  selectedAgentId: string | null
  isWebSearchEnabled: boolean
  isImageGenerationEnabled: boolean
  agentVersion: string | null
  userId: string | null
  guestId: string | null
  content: string
  reasoning: string | null
  originalContent: string | null
  createdOn: Date
  updatedOn: Date
  readOn: Date | null
  threadId: string
  metadata: {
    analysis?: taskAnalysis
  } | null
  task: "chat" | "automation" | "booking" | "summary" | "scraping"
  files: Array<{
    type: string
    url?: string
    name: string
    size: number
    data?: string
    id: string
  }> | null
  reactions: Array<{
    like: boolean
    dislike: boolean
    userId?: string
    guestId?: string
    createdOn: string
  }> | null
  creditCost: number
  webSearchResult: webSearchResult[] | null
  searchContext: string | null
  images: Array<{
    url: string
    prompt: string
    model?: string
    width?: number
    height?: number
    title?: string
    id: string
  }> | null
  audio: Array<{
    url: string
    size?: number
    title?: string
    id: string
  }> | null
  video: Array<{
    url: string
    size?: number
    title?: string
    id: string
  }> | null
}

export type newMessage = Partial<message>

// Credit usage types
export type creditUsage = {
  id: string
  userId: string | null
  guestId: string | null
  agentId: string
  creditCost: number
  messageType: "user" | "ai" | "image" | "search"
  threadId: string | null
  messageId: string | null
  createdOn: Date
}

export type newCreditUsage = Partial<creditUsage>

// System log types
export type systemLog = {
  id: string
  level: "info" | "warn" | "error"
  userId: string | null
  guestId: string | null
  message: string | null
  object: any | null
  createdOn: Date
  updatedOn: Date
}

export type newSystemLog = Partial<systemLog>

// Invitation types
export type invitation = {
  id: string
  threadId: string | null
  userId: string | null
  guestId: string | null
  email: string
  createdOn: Date
  updatedOn: Date
  gift: string | null
  status: "accepted" | "pending" | null
}

export type newInvitation = Partial<invitation>

// Calendar event types
export type calendarEvent = {
  id: string
  userId: string | null
  guestId: string | null
  title: string
  description: string | null
  location: string | null
  startTime: Date
  endTime: Date
  isAllDay: boolean
  timezone: string | null
  color: "red" | "orange" | "blue" | "green" | "violet" | "purple" | null
  category: string | null
  isRecurring: boolean
  recurrenceRule: {
    frequency: "daily" | "weekly" | "monthly" | "yearly"
    interval: number
    endDate?: string
    daysOfWeek?: number[] // 0-6, Sunday = 0
    dayOfMonth?: number
    weekOfMonth?: number
  } | null
  attendees: Array<{
    email: string
    name?: string
    status: "pending" | "accepted" | "declined"
    isOrganizer?: boolean
  }>
  threadId: string | null
  agentId: string | null
  aiContext: {
    originalPrompt?: string
    confidence?: number
    suggestedBy?: string
  } | null
  reminders: Array<{
    type: "email" | "notification" | "popup"
    minutesBefore: number
    sent?: boolean
  }>
  status: "confirmed" | "tentative" | "cancelled"
  visibility: "private" | "public" | "shared"
  externalId: string | null
  externalSource: "google" | "outlook" | "apple" | null
  lastSyncedAt: Date | null
  createdOn: Date
  updatedOn: Date
}

export type newCalendarEvent = Partial<calendarEvent>

// Document summary types
export type documentSummary = {
  id: string
  messageId: string | null
  threadId: string | null
  filename: string
  fileType: string
  fileSizeBytes: number | null
  summary: string | null
  keyTopics: any | null
  totalChunks: number | null
  createdOn: Date
  updatedOn: Date
}

export type newDocumentSummary = Partial<documentSummary>

// Thread summary types
export type threadSummary = {
  id: string
  threadId: string
  userId: string | null
  guestId: string | null
  summary: string
  keyTopics: string[] | null
  messageCount: number
  lastMessageAt: Date | null
  ragContext: {
    documentSummaries: string[]
    relevantChunks: { content: string; source: string; score: number }[]
    conversationContext: string
  } | null
  userMemories: Array<{
    id: string
    content: string
    tags: string[]
    relevanceScore: number
    createdAt: string
  }> | null
  characterTags: {
    agentPersonalities: {
      agentId: string
      traits: string[]
      behavior: string
    }[]
    conversationTone: string
    userPreferences: string[]
    contextualTags: string[]
  } | null
  embedding: any | null
  metadata: {
    version: string
    generatedBy: string
    confidence: number
    lastUpdated: string
  } | null
  createdOn: Date
  updatedOn: Date
}

export type newThreadSummary = Partial<threadSummary>

// Placeholder types
export type placeHolder = {
  id: string
  appId: string | null
  text: string
  userId: string | null
  guestId: string | null
  createdOn: Date
  updatedOn: Date
  threadId: string | null
  metadata: {
    history?: Array<{
      text: string
      generatedAt: string
      conversationContext?: string
      topicKeywords?: string[]
    }>
    clickCount?: number
    lastClickedAt?: string
    impressionCount?: number
    generatedBy?: "deepseek"
    confidence?: number
  } | null
}

export type newPlaceHolder = Partial<placeHolder>

// Character profile types
export type characterProfile = {
  id: string
  agentId: string
  userId: string | null
  guestId: string | null
  visibility: "private" | "protected" | "public"
  name: string
  personality: string
  pinned: boolean
  traits: {
    communication: string[]
    expertise: string[]
    behavior: string[]
    preferences: string[]
  }
  threadId: string
  tags: string[] | null
  usageCount: number
  lastUsedAt: Date | null
  userRelationship: string | null
  conversationStyle: string | null
  embedding: any | null
  metadata: {
    version: string
    createdBy: string
    effectiveness: number
  } | null
  createdOn: Date
  updatedOn: Date
}

export type newCharacterProfile = Partial<characterProfile>

export const emojiMap: Record<moodType, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  astonished: "😲",
  inlove: "😍",
  thinking: "🤔",
}

// App types
export type app = {
  id: string
  image?: string
  storeId: string | null
  userId: string | null
  guestId: string | null
  mainThreadId: string | null
  teamId: string | null
  tools: ("calendar" | "location" | "weather")[] | null
  name: string
  subtitle: string | null
  title: string
  description: string | null
  featureList: string[] | null
  icon: string | null
  tips: Array<{
    id: string
    content?: string
    emoji?: string
  }> | null
  tipsTitle: string | null
  images: Array<{
    url: string
    width?: number
    height?: number
    id: string
  }> | null
  slug: string
  highlights: Array<{
    id: string
    title: string
    content?: string
    emoji?: string
    requiresWebSearch?: boolean
    appName?: string
  }> | null
  version: string
  extends?: app[] | null
  status:
    | "testing"
    | "draft"
    | "pending_review"
    | "approved"
    | "rejected"
    | "active"
    | "inactive"
  submittedForReviewAt: Date | null
  reviewedAt: Date | null
  reviewedBy: string | null
  rejectionReason: string | null
  manifestUrl: string | null
  themeColor: string | null
  backgroundColor: string | null
  displayMode: "standalone" | "fullscreen" | "minimal-ui" | "browser" | null
  placeholder: string | null
  extend: Array<string> | null
  onlyAgent: boolean // If true, app only works with user's default agent
  capabilities: {
    text: boolean
    image: boolean
    audio: boolean
    video: boolean
    webSearch: boolean
    imageGeneration: boolean
    codeExecution: boolean
    pdf: boolean
  } | null
  tags: string[] | null
  systemPrompt: string | null
  tone: "professional" | "casual" | "friendly" | "technical" | "creative" | null
  language: string | null
  knowledgeBase: string | null
  ragDocumentIds: string[] | null
  ragEnabled: boolean
  examples: Array<{ user: string; assistant: string }> | null
  visibility: "private" | "public" | "unlisted"
  defaultModel: string | null
  temperature: number | null
  pricing: "free" | "one-time" | "subscription"
  tier: "free" | "plus" | "pro"
  price: number | null
  currency: string | null
  subscriptionInterval: "monthly" | "yearly" | null
  stripeProductId: string | null
  stripePriceId: string | null
  revenueShare: number | null
  apiKeys: {
    openai?: string
    anthropic?: string
    google?: string
    deepseek?: string
    perplexity?: string
    replicate?: string
    openrouter?: string
  } | null
  limits: {
    promptInput?: number
    promptTotal?: number
    speechPerHour?: number
    speechPerDay?: number
    speechCharsPerDay?: number
    fileUploadMB?: number
    filesPerMessage?: number
    messagesPerHour?: number
    messagesPerDay?: number
    imageGenerationsPerDay?: number
  } | null
  apiEnabled: boolean
  apiPricing: "free" | "per-request" | "subscription" | null
  apiPricePerRequest: number | null
  apiMonthlyPrice: number | null
  apiRateLimit: number | null
  apiKey: string | null
  chromeWebStoreUrl: string | null
  apiRequestCount: number
  apiRevenue: number
  usageCount: number
  likeCount: number
  shareCount: number
  installCount: number
  subscriberCount: number
  totalRevenue: number
  createdOn: Date
  updatedOn: Date
  features: { [key: string]: boolean } | null
}

export type newApp = Partial<app>

export type Paginated<T> = T & {
  items: T[]
  nextPage: string | null
  totalCount: number
}

// Store types
export type store = {
  id: string
  name: string
  slug: string
  title: string | null
  images: Array<{
    url: string
    width?: number
    height?: number
    id: string
  }> | null
  teamId: string | null
  domain: string | null
  appId: string | null
  userId: string | null
  guestId: string | null
  parentStoreId: string | null
  createdOn: Date
  updatedOn: Date
  apps: appWithStore[] | null
  description: string | null
  app: appWithStore | null
}

export type appWithStore = app & {
  store?: storeWithApps
  placeHolder?: placeHolder
  instructions?: instruction[]
}

export type storeWithApps = store & { apps: appWithStore[] }

// Instruction types
export type instruction = {
  id: string
  appId: string | null
  userId: string | null
  guestId: string | null
  title: string
  emoji: string
  content: string
  confidence: number
  generatedAt: Date
  requiresWebSearch: boolean
  createdOn: Date
  updatedOn: Date
}

export type newInstruction = Partial<instruction>

// City types
export type city = {
  id: string
  name: string
  country: string
  population: number | null
  createdOn: Date
  updatedOn: Date
}

export type newCity = Partial<city>

// Custom push subscription types (for queries)
export type newCustomPushSubscription = {
  endpoint: string
  createdOn: Date
  updatedOn: Date
  keys: {
    p256dh: string
    auth: string
  }
}

export type customPushSubscription = newCustomPushSubscription & {
  id: string
}

// Message action type (for automation/booking)
export type messageActionType = {
  type: string
  params?: Record<string, any>
  times?: number // Number of times to repeat this action (for calendar navigation, etc.)
  completed?: boolean
  result?: unknown
  remember?: boolean
}

// Budget category type
export type budgetCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "bills"
  | "health"
  | "education"
  | "travel"
  | "other"

// Constants
export const PLUS_CREDITS_PER_MONTH = 2000
export const ADDITIONAL_CREDITS = 500
export const GUEST_CREDITS_PER_MONTH = 30
export const MEMBER_CREDITS_PER_MONTH = 150
export const MAX_INSTRUCTIONS_CHAR_COUNT = 7500
export const MAX_THREAD_TITLE_CHAR_COUNT = 100

export const PROMPT_LIMITS = {
  INPUT: 7000,
  INSTRUCTIONS: 2000,
  TOTAL: 30000,
  WARNING_THRESHOLD: 5000,
  THREAD_TITLE: 100,
} as const
