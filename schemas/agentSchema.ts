import { z } from "zod"
import { sanitizedString } from "./appSchema"

export const aiAgentCapabilitiesSchema = z.object({
  text: z.boolean().default(true),
  image: z.boolean().default(false),
  audio: z.boolean().default(false),
  video: z.boolean().default(false),
  webSearch: z.boolean().default(false),
  imageGeneration: z.boolean().default(false),
  codeExecution: z.boolean().optional().default(false),
  pdf: z.boolean().default(false),
})

export const aiAgentSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, "Name is required"),
  displayName: z.string().min(1, "Display name is required"),
  version: z.string().default("1.0.0"),
  apiURL: z.string().url("API URL must be a valid URL").or(z.string().min(1)),
  description: z.string().optional(),
  state: z.enum(["active", "testing", "inactive"]).default("active"),
  creditCost: z.number().int().min(0).default(1),
  modelId: z.string().min(1, "Model ID is required"),
  userId: z.string().uuid().optional(),
  guestId: z.string().uuid().optional(),
  order: z.number().int().default(0),
  maxPromptSize: z.number().int().optional(),
  capabilities: aiAgentCapabilitiesSchema.default({
    text: true,
    image: false,
    audio: false,
    video: false,
    webSearch: false,
    imageGeneration: false,
    codeExecution: false,
    pdf: false,
  }),
  authorization: z.enum(["user", "subscriber", "guest", "all"]).default("all"),
})

// Schema for creating a custom AI agent (user-provided fields only)
export const createCustomAiAgentSchema = z.object({
  name: sanitizedString({ min: 1, max: 100 }),
  apiKey: z.string().min(1, "API key is required"),
  displayName: sanitizedString({ min: 1, max: 100 }).optional(),
  modelId: z.string().min(1).optional(),
  apiURL: z.string().url().optional(),
  capabilities: aiAgentCapabilitiesSchema.partial().optional(),
})

export type AiAgent = z.infer<typeof aiAgentSchema>
export type AiAgentCapabilities = z.infer<typeof aiAgentCapabilitiesSchema>
export type CreateCustomAiAgent = z.infer<typeof createCustomAiAgentSchema>
