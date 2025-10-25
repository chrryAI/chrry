import React from "react"
import { ExternalLink } from "./icons"

interface CitationTextProps {
  text: string
  webSearchResults?: Array<{
    title: string
    url: string
    snippet: string
  }>
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
}) => {
  if (!webSearchResults) return content
  const citationPattern = /\[(\d+)\]/g
  const parts: (string | React.ReactElement)[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = citationPattern.exec(content)) !== null) {
    // Add text before citation
    if (match.index > lastIndex) {
      parts.push(content.substring(lastIndex, match.index))
    }

    const citationNumber = parseInt(match[1] || "0")
    const sourceIndex = citationNumber - 1 // Convert to 0-based index
    const source = webSearchResults[sourceIndex]

    if (source && source.url && source.url !== "#") {
      // Create clickable citation
      parts.push(
        <a
          key={`citation-${citationNumber}-${match.index}`}
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="citation-link"
          title={`${source.title} - ${source.snippet}`}
          style={{
            color: "var(--accent-9)",
            textDecoration: "none",
            fontWeight: "500",
            display: "inline-flex",
            alignItems: "center",
            gap: "2px",
            padding: "1px 3px",
            borderRadius: "3px",
            backgroundColor: "var(--accent-2)",
            border: "1px solid var(--accent-4)",
            fontSize: "0.85em",
            lineHeight: "1.2",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-3)"
            e.currentTarget.style.borderColor = "var(--accent-6)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--accent-2)"
            e.currentTarget.style.borderColor = "var(--accent-4)"
          }}
        >
          [{citationNumber}]
          <ExternalLink size={10} />
        </a>,
      )
    } else {
      // Non-clickable citation (no URL available)
      parts.push(
        <span
          key={`citation-${citationNumber}-${match.index}`}
          className="citation-placeholder"
          style={{
            color: "var(--accent-7)",
            fontWeight: "500",
            fontSize: "0.85em",
          }}
        >
          [{citationNumber}]
        </span>,
      )
    }

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < content.length) {
    parts.push(content.substring(lastIndex))
  }

  return parts
}

const CitationText: React.FC<CitationTextProps> = ({
  text,
  webSearchResults = [],
  className,
}) => {
  // Replace citation numbers [1], [2], etc. with clickable links

  const processedContent = processTextWithCitations({
    content: text,
    webSearchResults,
  })

  if (typeof processedContent === "string") {
    return <span className={className}>{processedContent}</span>
  }

  return (
    <span className={className}>
      {processedContent.map((part, index) => (
        <React.Fragment key={index}>{part}</React.Fragment>
      ))}
    </span>
  )
}

export default CitationText
