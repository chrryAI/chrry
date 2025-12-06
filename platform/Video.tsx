/**
 * Video Component - Platform Abstraction
 *
 * This file serves as the base entry point for TypeScript.
 * The actual implementation is in:
 * - Video.web.tsx (for web platforms)
 * - Video.native.tsx (for React Native)
 *
 * Your bundler will automatically resolve to the correct platform-specific file.
 */

// Re-export from web implementation as default for TypeScript
// The bundler will override this with the correct platform file
export { default, type VideoProps } from "./Video.web"
