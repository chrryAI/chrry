/**
 * Cross-platform online status hook
 * Auto-resolves to .web.ts or .native.ts based on platform
 */

// Re-export from web implementation (will be replaced by bundler for native)
export { useOnlineStatus } from "./useOnlineStatus.web"
