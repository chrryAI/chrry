import type React from "react"

export interface MarkdownContentProps {
  content: string
  className?: string
  "data-testid"?: string
  style?: React.CSSProperties
  webSearchResults?: Array<{
    title: string
    url: string
    snippet: string
  }>
}

export interface codeBlock {
  language: string
  children: string
  className?: string
}

export const processTextWithCitations = ({
  content,
  webSearchResults,
}: {
  content: string
  webSearchResults?: Array<{
    title: string
    url: string
    snippet: string
  }>
}): string => {
  if (!webSearchResults || webSearchResults.length === 0) return content

  const citationPattern = /\[(\d+)\]/g
  let processedContent = content

  // Replace citation numbers with markdown links
  processedContent = processedContent.replace(
    citationPattern,
    (match, citationNumber) => {
      const sourceIndex = Number.parseInt(citationNumber, 10) - 1 // Convert to 0-based index
      const source = webSearchResults[sourceIndex]

      if (source?.url && source.url !== "#") {
        // Create markdown link with title attribute
        return `[${match}](${source.url} "${source.title} - ${source.snippet}")`
      } else {
        // Keep as plain text if no URL available
        return match
      }
    },
  )

  return processedContent
}
