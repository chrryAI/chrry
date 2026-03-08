// Platform-specific exports for MarkdownContent
// Bundler will automatically resolve to .web.tsx or .native.tsx

export type { default as MarkdownContentProps } from "./MarkdownContent.web"
export { default, processTextWithCitations } from "./MarkdownContent.web"
