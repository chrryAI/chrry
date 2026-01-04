import { z } from "zod"
import sanitizeHtml from "sanitize-html"

// Helper: Sanitized string field
const sanitizedString = (options?: {
  min?: number
  max?: number
  regex?: RegExp
  regexMessage?: string
  allowedTags?: string[]
}) => {
  let baseSchema = z.string()

  // Apply validations first
  if (options?.min) {
    baseSchema = baseSchema.min(options.min, `Min ${options.min} characters`)
  }
  if (options?.max) {
    baseSchema = baseSchema.max(options.max, `Max ${options.max} characters`)
  }
  if (options?.regex) {
    baseSchema = baseSchema.regex(options.regex, options.regexMessage)
  }

  // Then apply sanitization transform
  return baseSchema.transform((val) =>
    sanitizeHtml(val, {
      allowedTags: options?.allowedTags || [],
      allowedAttributes: {},
    }),
  )
}

export const appSchema = z.object({
  // ID for updates (optional for new apps)
  id: z.string().optional(),

  // Basic Info (Tab 1)
  name: sanitizedString({
    min: 3,
    max: 8,
    regex: /^\S+$/,
    regexMessage: "Name cannot contain spaces",
  }),
  title: sanitizedString({
    min: 1,
    max: 30,
  }),
  description: sanitizedString({ max: 500 }).optional(),
  icon: z.string().optional(),
  image: z.string().optional(),
  tags: z.array(z.string()).optional(),
  placeholder: sanitizedString({ max: 50 }).optional(),
  // Highlights/Features
  highlights: z
    .array(
      z.object({
        id: z.string(),
        title: sanitizedString({ min: 1 }),
        content: sanitizedString().optional(),
        emoji: sanitizedString().optional(),
        requiresWebSearch: z.boolean().optional(),
        appName: z.string().optional(),
      }),
    )
    .optional(),

  tips: z
    .array(
      z.object({
        id: z.string(),
        content: sanitizedString().optional(),
        emoji: sanitizedString().optional(),
      }),
    )
    .optional(),
  // Personality (Tab 2)
  systemPrompt: sanitizedString({ max: 5000 }).optional(),
  tone: z
    .enum(["professional", "casual", "friendly", "technical", "creative"])
    .optional(),
  language: z.string().optional(),
  defaultModel: z.string().optional(),
  temperature: z
    .number()
    .min(0, "Temperature must be 0-2")
    .max(2, "Temperature must be 0-2")
    .optional(),

  tools: z
    .array(
      z.union([
        z.enum(["calendar", "location", "weather"]),
        z.uuid("Invalid tool ID"),
      ]),
    )
    .optional(),

  // Capabilities (Tab 3)
  capabilities: z
    .object({
      text: z.boolean(),
      image: z.boolean(),
      audio: z.boolean(),
      video: z.boolean(),
      webSearch: z.boolean(),
      imageGeneration: z.boolean(),
      codeExecution: z.boolean(),
      pdf: z.boolean(),
    })
    .optional(),

  // Monetization (Tab 6)
  pricing: z.enum(["free", "one-time", "subscription"]).optional(),
  tier: z.enum(["free", "plus", "pro"]).optional(),
  price: z.number().min(0, "Price must be positive").optional(),
  currency: z.string().optional(),
  subscriptionInterval: z.enum(["monthly", "yearly"]).optional(),

  // API Keys (BYOK - Bring Your Own Key)
  // If provided, creator pays API costs but still gets 70% revenue share
  // Vex keeps 30% for infrastructure
  apiKeys: z
    .object({
      openai: z.string().optional(),
      anthropic: z.string().optional(),
      google: z.string().optional(),
      deepseek: z.string().optional(),
      perplexity: z.string().optional(),
      replicate: z.string().optional(), // For Flux
    })
    .optional(),

  // Usage Limits (optional, uses system defaults if not provided)
  limits: z
    .object({
      promptInput: z.number().min(100).max(100000).optional(),
      promptTotal: z.number().min(1000).max(200000).optional(),
      speechPerHour: z.number().min(1).max(1000).optional(),
      speechPerDay: z.number().min(1).max(10000).optional(),
      speechCharsPerDay: z.number().min(100).max(100000).optional(),
      fileUploadMB: z.number().min(1).max(200).optional(),
      filesPerMessage: z.number().min(1).max(50).optional(),
      messagesPerHour: z.number().min(1).max(1000).optional(),
      messagesPerDay: z.number().min(10).max(10000).optional(),
      imageGenerationsPerDay: z.number().min(1).max(1000).optional(),
    })
    .optional(),

  apiEnabled: z.boolean().optional(),
  apiPricing: z.enum(["free", "per-request", "subscription"]).optional(),
  apiPricePerRequest: z
    .number()
    .min(0, "API price must be positive")
    .optional(),
  apiMonthlyPrice: z
    .number()
    .min(0, "Monthly price must be positive")
    .optional(),
  apiRateLimit: z.number().min(0, "Rate limit must be positive").optional(),

  // Settings (Tab 7)
  visibility: z.enum(["private", "public", "unlisted"]).optional(),
  extends: z.array(z.uuid("Invalid agent ID")).optional(),

  // Agent Exclusivity - boolean flag
  // If true, app only works with user's default agent (not other agents)
  // Used for partnership deals where apps are exclusive to default agent
  onlyAgent: z.boolean().optional(),

  themeColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  displayMode: z
    .enum(["standalone", "fullscreen", "minimal-ui", "browser"])
    .optional(),
})

// Export inferred type
export type appFormData = z.infer<typeof appSchema>
