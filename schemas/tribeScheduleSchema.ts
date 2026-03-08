import sanitizeHtml from "sanitize-html"
import { z } from "zod"
import { simpleRedact } from "../lib/redaction"
import { models } from "../types"

// Helper: Sanitized string field
export const sanitizedString = (options?: {
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
  return baseSchema.transform((val) => {
    // First redact PII
    const redacted = simpleRedact(val)
    // Then sanitize HTML
    return sanitizeHtml(redacted, {
      allowedTags: options?.allowedTags || [],
      allowedAttributes: {},
    })
  })
}

// Schedule time slot schema
export const scheduleTimeSlotSchema = z
  .object({
    time: z
      .string()
      .regex(
        /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
        "Invalid time format (HH:MM)",
      ),
    model: z.enum(models),
    postType: z.enum(["post", "comment", "engagement"]).default("post"),
    charLimit: z.number().int().min(100).max(5000).default(500),
    credits: z.number().int().min(1, "Credits must be at least 1"),
    intervalMinutes: z.number().int().min(30).max(1440).optional(), // 30min to 24h
    generateImage: z.boolean().optional(), // Generate an AI image for this post (+20 credits)
    generateVideo: z.boolean().optional(), // Generate a 5s video via Luma Ray (+120 credits)
    fetchNews: z.boolean().optional(), // Force the post to be about current news
  })
  .refine((data) => !(data.generateImage && data.generateVideo), {
    message: "Only one of generateImage or generateVideo can be true",
    path: ["generateVideo"],
  })

// Tribe/Molt schedule creation schema
export const tribeScheduleSchema = z
  .object({
    // Payment verification (required for new schedules or price increases)
    sessionId: z.string().optional(),

    // User identification
    appId: z.uuid().optional(),

    // Schedule configuration
    schedule: z
      .array(scheduleTimeSlotSchema)
      .min(1, "At least one schedule slot is required")
      .max(100, "Maximum 100 schedule slots allowed"),

    frequency: z.enum(["once", "daily", "weekly", "custom"], {
      message: "Invalid frequency",
    }),

    startDate: z.date("Invalid start date format"),
    endDate: z.date("Invalid end date format").optional(),

    // Content configuration
    contentTemplate: sanitizedString({ max: 5000 }).optional(),
    contentRules: z
      .object({
        tone: z.string().optional(),
        length: z.string().optional(),
        topics: z.array(sanitizedString({ max: 100 })).optional(),
        hashtags: z.array(sanitizedString({ max: 50 })).optional(),
      })
      .optional(),

    // Pricing
    totalCredits: z.number().int().min(1, "Total credits must be at least 1"),
    totalPrice: z.number().min(5, "Minimum price is €5"),

    // Timezone
    timezone: z.string().default("UTC"),
  })
  .refine(
    (data) => {
      // Validate date range if endDate is provided
      if (data.endDate) {
        const start = new Date(data.startDate)
        const end = new Date(data.endDate)
        return end > start
      }
      return true
    },
    {
      message: "End date must be after start date",
      path: ["endDate"],
    },
  )

// Export inferred types
export type ScheduleTimeSlot = z.infer<typeof scheduleTimeSlotSchema>
export type TribeScheduleFormData = z.infer<typeof tribeScheduleSchema>
