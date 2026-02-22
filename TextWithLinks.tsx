import React from "react"
import { A, Span } from "./platform"
import { FRONTEND_URL } from "./utils"

interface LinkProps {
  type: "link"
  url: string
  text?: string
  isExternal: boolean
}

type TextSegment = string | LinkProps

interface TextWithLinksProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  pageUrl?: string
  style?: React.CSSProperties
  text: string
}

const TextWithLinks: React.FC<TextWithLinksProps> = ({
  href,
  pageUrl = FRONTEND_URL,
  style,
  ...props
}) => {
  const text = props.text || href
  const segments = replaceLinks({ text, url: href, pageUrl })

  return (
    <>
      {segments.map((segment, index) => {
        if (typeof segment === "string") {
          return <React.Fragment key={index}>{segment}</React.Fragment>
        } else {
          return (
            <A
              key={index}
              href={segment.url}
              target={segment.isExternal ? "_blank" : "_self"}
              rel="noopener noreferrer"
              {...props}
              style={{
                textDecoration: "none",
                color: "var(--accent-6)",
              }}
            >
              <Span>{segment.text}</Span>
            </A>
          )
        }
      })}
    </>
  )
}

export default TextWithLinks

export function replaceLinks({
  text,
  url,
  pageUrl = "",
}: {
  text?: string
  url?: string
  pageUrl?: string
}): TextSegment[] {
  if (!url) return []
  const Rexp =
    /\b((?:https?:\/\/|www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&//=]*))/gi

  const segments: TextSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = Rexp.exec(url)) !== null) {
    if (match.index > lastIndex) {
      segments.push(url.substring(lastIndex, match.index))
    }

    const matchedUrl = match[0]
    try {
      const hasProtocol = /^https?:\/\//i.test(matchedUrl)
      const hasWww = /^www\./i.test(matchedUrl)
      const fullUrl = hasProtocol
        ? matchedUrl
        : hasWww
          ? `http://${matchedUrl}`
          : `http://${matchedUrl}`

      const url = new URL(fullUrl)

      let currentUrl: URL | undefined
      try {
        currentUrl = pageUrl ? new URL(pageUrl) : undefined
      } catch {
        currentUrl = undefined
      }

      const linkDomain = url.hostname || ""

      const isExternal =
        pageUrl &&
        currentUrl?.hostname &&
        !currentUrl.hostname.toLowerCase().startsWith(linkDomain.toLowerCase())

      segments.push({
        type: "link",
        url: hasProtocol ? matchedUrl : `https://${matchedUrl}`,
        text:
          text?.length && text?.length > 20
            ? `${linkDomain.toLowerCase()}...`
            : text,
        isExternal: !!isExternal,
      })
    } catch {
      segments.push(matchedUrl)
    }

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < url.length) {
    segments.push(url.substring(lastIndex))
  }

  return segments
}
