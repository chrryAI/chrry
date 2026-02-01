import { isDevelopment, isE2E } from "./env"
import { captureException } from "./errorTracking"

const originalConsole = {
  log: console.log.bind(console),
  error: console.error.bind(console),
  warn: console.warn.bind(console),
  info: console.info.bind(console),
}

// Helper to get user role from localStorage or provided user
const getUserRole = (user?: { role?: string }): string | undefined => {
  // Try localStorage first (browser only)
  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    try {
      const storedRole = localStorage.getItem("userRole")
      if (storedRole) {
        return storedRole
      }
    } catch (e) {
      // localStorage might be blocked or unavailable
    }
  }

  // Fallback to provided user role
  return user?.role
}

// Create custom console factory that has access to user and error tracking
export const createCustomConsole = (user?: { role?: string }) => {
  const role = getUserRole(user)
  const isCapacitor =
    typeof window !== "undefined" && !!(window as any).Capacitor
  const shouldLog = isE2E || isDevelopment || role === "admin" || isCapacitor

  return {
    log: (message?: any, ...args: any[]) => {
      if (shouldLog) {
        originalConsole.log(message, ...args)
      }
    },
    error: (message?: any, ...args: any[]) => {
      if (shouldLog) {
        // Capture error in Sentry
        captureException(
          message instanceof Error ? message : new Error(message),
        )
        originalConsole.error(message, ...args)
      }
    },
    warn: (message?: any, ...args: any[]) => {
      if (shouldLog) {
        originalConsole.warn(message, ...args)
      }
    },
    info: (message?: any, ...args: any[]) => {
      if (shouldLog) {
        originalConsole.info(message, ...args)
      }
    },
  }
}

export default originalConsole
