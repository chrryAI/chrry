/**
 * Platform-Aware Icon Exports
 *
 * Automatically uses the correct icon library:
 * - Web/Extension: lucide-react (via index.web.tsx)
 * - ios/Android: lucide-react-native (via index.native.tsx)
 *
 * React Native's Metro bundler will automatically pick the right file.
 * Next.js will use this default (web) version.
 *
 * Usage:
 * import { Star, Heart, Settings } from 'chrry/icons'
 */

// Default to web icons (Next.js will use this)
// React Native's Metro bundler will use index.native.tsx instead
export * from "./index.web"
