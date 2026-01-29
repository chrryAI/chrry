interface LinkProps {
  type: "link"
  url: string
  text: string
  isExternal: boolean
}

type TextSegment = string | LinkProps

export default function replaceLinks({
  text,
  pageUrl = "",
}: {
  text: string
  pageUrl?: string
}): Array<TextSegment> {
  // Updated regex to match bare domains like gulpdash.com as well as URLs with protocols and www
  const Rexp =
    /\b((?:https?:\/\/|www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&//=]*))/gi

  const segments: TextSegment[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = Rexp.exec(text)) !== null) {
    // Add the text before the match
    if (match.index > lastIndex) {
      segments.push(text.substring(lastIndex, match.index))
    }

    const matchedUrl = match[0]
    try {
      // Ensure that the URL starts with http/https
      const hasProtocol = /^https?:\/\//i.test(matchedUrl)
      const hasWww = /^www\./i.test(matchedUrl)
      const fullUrl = hasProtocol
        ? matchedUrl
        : hasWww
          ? `http://${matchedUrl}`
          : `http://${matchedUrl}`

      // Use URL from react-native-url-polyfill
      const url = new URL(fullUrl)

      let currentUrl: URL | undefined
      try {
        currentUrl = pageUrl ? new URL(pageUrl) : undefined
      } catch (err) {
        currentUrl = undefined
      }

      const linkDomain = url.hostname || ""

      // Determine if the link is external only if currentDomain is provided
      const isExternal =
        pageUrl &&
        currentUrl?.hostname &&
        !currentUrl.hostname.toLowerCase().startsWith(linkDomain.toLowerCase())

      // Create link object
      segments.push({
        type: "link",
        url: hasProtocol ? matchedUrl : `https://${matchedUrl}`,
        text: `${linkDomain.toLowerCase()}...`,
        isExternal: !!isExternal,
      })
    } catch (error) {
      // If the URL is invalid, just add it as text
      segments.push(matchedUrl)
    }

    lastIndex = match.index + match[0].length
  }

  // Add any remaining text after the last match
  if (lastIndex < text.length) {
    segments.push(text.substring(lastIndex))
  }

  return segments
}
