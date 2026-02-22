/**
 * Style Mapper - Platform-agnostic entry point
 *
 * This file re-exports from platform-specific implementations:
 * - styleMapper.web.ts (for web builds)
 * - styleMapper.native.ts (for React Native builds)
 *
 * The bundler will automatically resolve to the correct platform version
 */

export * from "./styleMapper.web"
