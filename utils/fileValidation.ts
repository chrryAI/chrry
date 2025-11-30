import { MAX_FILE_SIZES } from "./index"

export interface FileValidationResult {
  isSupported: boolean
  maxSize: number
  fileCategory: "image" | "audio" | "video" | "pdf" | "text" | "unknown"
}

export interface AgentCapabilities {
  image?: boolean
  audio?: boolean
  video?: boolean
  pdf?: boolean
  text?: boolean
}

export type AgentModel =
  | "deepSeek"
  | "sushi"
  | "chatGPT"
  | "claude"
  | "gemini"
  | "perplexity"
  | "string"

/**
 * Get maximum file size based on file type and agent model
 * @param fileType - MIME type of the file
 * @param agentModel - The AI agent model being used (defaults to sushi)
 */
export function getMaxFileSize(
  fileType: string,
  agentModel: AgentModel = "sushi",
): number {
  const limits =
    MAX_FILE_SIZES[agentModel as keyof typeof MAX_FILE_SIZES] ||
    MAX_FILE_SIZES.sushi

  if (fileType.startsWith("image/")) {
    return limits.image
  }
  if (fileType.startsWith("video/")) {
    return limits.video
  }
  if (fileType.startsWith("audio/")) {
    return limits.audio
  }
  if (fileType === "application/pdf") {
    return limits.pdf
  }
  // Text files
  return limits.text
}

/**
 * Check if a file extension is a text-based file
 */
export function isTextFile(fileName: string): boolean {
  const lowerName = fileName.toLowerCase()
  const textExtensions = [
    ".txt",
    ".md",
    ".json",
    ".csv",
    ".xml",
    ".html",
    ".css",
    ".js",
    ".ts",
    ".tsx",
    ".jsx",
    ".py",
    ".java",
    ".c",
    ".cpp",
    ".h",
    ".hpp",
    ".cs",
    ".php",
    ".rb",
    ".go",
    ".rs",
    ".swift",
    ".kt",
    ".scala",
    ".sh",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".conf",
    ".log",
  ]

  return textExtensions.some((ext) => lowerName.endsWith(ext))
}

/**
 * Validate a file against agent capabilities
 * @param file - The file to validate
 * @param capabilities - The agent's capabilities
 * @param agentModel - The AI agent model being used (defaults to sushi)
 * @returns Validation result with support status, max size, and file category
 */
export function validateFile(
  file: File,
  capabilities?: AgentCapabilities,
  agentModel: AgentModel = "sushi",
): FileValidationResult {
  const fileType = file.type.toLowerCase()
  const fileName = file.name.toLowerCase()

  // Check image files
  if (fileType.startsWith("image/")) {
    return {
      isSupported: capabilities?.image ?? false,
      maxSize: getMaxFileSize(fileType, agentModel),
      fileCategory: "image",
    }
  }

  // Check audio files
  if (fileType.startsWith("audio/")) {
    return {
      isSupported: capabilities?.audio ?? false,
      maxSize: getMaxFileSize(fileType, agentModel),
      fileCategory: "audio",
    }
  }

  // Check video files
  if (fileType.startsWith("video/")) {
    return {
      isSupported: capabilities?.video ?? false,
      maxSize: getMaxFileSize(fileType, agentModel),
      fileCategory: "video",
    }
  }

  // Check PDF files
  if (fileType === "application/pdf" || fileName.endsWith(".pdf")) {
    return {
      isSupported: capabilities?.pdf ?? false,
      maxSize: getMaxFileSize(fileType, agentModel),
      fileCategory: "pdf",
    }
  }

  // Check text-based files (always supported for code/text analysis)
  if (fileType.startsWith("text/") || isTextFile(fileName)) {
    return {
      isSupported: true, // Text files are always supported
      maxSize: getMaxFileSize("text/plain", agentModel),
      fileCategory: "text",
    }
  }

  // Unknown file type
  return {
    isSupported: false,
    maxSize: 0,
    fileCategory: "unknown",
  }
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i]
}
