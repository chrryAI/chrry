// // utils/logger.ts
// const isDev = process.env.NODE_ENV === "development"

// // Global debug state (can be toggled at runtime)
// let debugEnabled = isDev
// let currentUserRole: string | null = null

// export const getLogger = ({
//     debugEnabled,
//     user
// }: {
//     debugEnabled: boolean,
//     user?: {
//         role?: string
//     }
// }) => {
//   // Enable/disable debug logging at runtime
//   setDebugMode: (enabled: boolean) => {
//     debugEnabled = enabled
//   },

//   // Set current user role for conditional logging
//   setUserRole: (role: string | null) => {
//     currentUserRole = role
//   },

//   // Debug logs (dev only OR admin users)
//   debug: (...args: any[]) => {
//     if (debugEnabled || currentUserRole === "admin") {
//       console.log(...args)
//     }
//   },

//   // Info logs (always shown)
//   info: (...args: any[]) => {
//     console.log(...args)
//   },

//   // Error logs with automatic exception capture
//   error: (
//     message: string,
//     error?: Error | unknown,
//     context?: Record<string, any>,
//   ) => {
//     console.error(message, error, context)

//     // Auto-capture to error tracking service (Sentry, etc.)
//     if (!isDev && typeof window !== "undefined") {
//       // Example: Send to Sentry
//       // Sentry.captureException(error, { extra: { message, ...context } })
//     }
//   },

//   // Warning logs (always shown)
//   warn: (...args: any[]) => {
//     console.warn(...args)
//   },

//   // Trace logs (only for admins, useful for deep debugging)
//   trace: (...args: any[]) => {
//     if (currentUserRole === "admin") {
//       console.trace(...args)
//     }
//   },
// }

// // Usage in your app context:
// // logger.setUserRole(user?.role || null)
// // logger.setDebugMode(user?.role === 'admin')
