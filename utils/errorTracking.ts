// Framework-agnostic error tracking
// Works with @sentry/nextjs, @sentry/browser, or any other error tracking service

export function captureException(
  error: Error | unknown,
  context?: Record<string, any>,
) {
  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.error("[Error]", error, context)
  }

  // Try to use Sentry if available
  if (typeof window !== "undefined" && (window as any).Sentry) {
    ;(window as any).Sentry.captureException(error, { extra: context })
    return
  }

  // Fallback: just log the error
  console.error("Uncaught error:", error, context)
}

// Optional: Export other Sentry-like functions
export function captureMessage(
  message: string,
  level: "info" | "warning" | "error" = "info",
) {
  if (process.env.NODE_ENV === "development") {
    switch (level) {
      case "info":
        console.info("[Message]", message)
        break
      case "warning":
        console.warn("[Message]", message)
        break
      case "error":
        console.error("[Message]", message)
        break
    }
  }

  if (typeof window !== "undefined" && (window as any).Sentry) {
    ;(window as any).Sentry.captureMessage(message, level)
  }
}
