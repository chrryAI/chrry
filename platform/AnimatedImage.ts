/**
 * Cross-platform AnimatedImage entry point
 * Re-exports from platform-specific implementations
 */

// This file re-exports from .web or .native based on the platform
// Next.js will use the .web version, React Native will use .native version
export * from "./AnimatedImage.web"
