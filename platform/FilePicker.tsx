/**
 * FilePicker Component - Platform Abstraction
 *
 * This file serves as the base entry point for TypeScript.
 * The actual implementation is in:
 * - FilePicker.web.tsx (for web platforms)
 * - FilePicker.native.tsx (for React Native)
 *
 * Your bundler will automatically resolve to the correct platform-specific file.
 */

export { default, type FilePickerProps } from "./FilePicker.web"
