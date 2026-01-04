// This file configures the initialization of Sentry for the client.
// https://docs.sentry.io/platforms/javascript/guides/react/

import * as Sentry from "@sentry/react"

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN
const ENABLE_SENTRY = import.meta.env.VITE_SENTRY === "true"

if (ENABLE_SENTRY && SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,

    // Use custom tunnel to bypass ad blockers
    tunnel: "https://g.chrry.dev/api/submit/",

    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring

    // Session Replay
    replaysSessionSampleRate: 0.1, // Sample 10% of sessions
    replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

    // Filter out noise
    beforeSend(event, hint) {
      // Ignore errors from browser extensions
      if (
        event.exception?.values?.[0]?.stacktrace?.frames?.some(
          (frame) =>
            frame.filename?.includes("chrome-extension://") ||
            frame.filename?.includes("moz-extension://"),
        )
      ) {
        return null
      }

      // Ignore ResizeObserver errors (common browser noise)
      if (event.message?.includes("ResizeObserver")) {
        return null
      }

      // Ignore network errors (often user connectivity issues)
      if (
        event.message?.includes("NetworkError") ||
        event.message?.includes("Failed to fetch")
      ) {
        return null
      }

      return event
    },

    // Environment
    environment: import.meta.env.MODE,

    // Release tracking
    release: import.meta.env.VITE_APP_VERSION,

    // Debug mode (only in development)
    debug: import.meta.env.MODE === "development",
  })
}

export default Sentry
