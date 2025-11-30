import React from "react"
import { A, useNavigation, usePlatform, useTheme } from "./platform"
import { useData } from "./context/providers"

export default function Anchor({
  clientOnly,
  openInNewTab,
  target,
  children,
  preventDefault,
  ...props
}: React.HTMLAttributes<HTMLAnchorElement> & {
  openInNewTab?: boolean
  href?: string
  preventDefault?: boolean
  clientOnly?: boolean
  target?: "_blank" | "_self" | "_parent" | "_top"
}) {
  const { FRONTEND_URL } = useData()

  const { addHapticFeedback } = useTheme()
  const { isExtension, BrowserInstance } = usePlatform()
  const router = useNavigation()

  const isExternalUrl = (url?: string) => {
    if (openInNewTab) return true
    if (!url) return false
    return (
      (url.startsWith("http://") ||
        url.startsWith("https://") ||
        url.startsWith("mailto:") ||
        url.startsWith("//")) &&
      !url.startsWith(FRONTEND_URL)
    )
  }

  // Normalize internal URLs by stripping FRONTEND_URL
  const href =
    !openInNewTab && props.href?.startsWith(FRONTEND_URL)
      ? props.href.replace(FRONTEND_URL, "") || "/"
      : props.href

  return (
    <A
      {...props}
      target={target}
      onClick={(e) => {
        props.onClick?.(e)

        if (clientOnly) {
          return
        }
        // Allow meta/ctrl+click to open in new tab
        if (e.metaKey || e.ctrlKey) {
          return
        }

        // Don't prevent default for external URLs (let browser handle)
        if (isExternalUrl(href)) {
          addHapticFeedback()
          // For extensions, open external URLs in new tab via background script
          if (isExtension && BrowserInstance && href) {
            e.preventDefault()
            BrowserInstance.runtime?.sendMessage({
              action: "openInSameTab",
              url: href,
            })
          }
          return
        }

        e.preventDefault()
        addHapticFeedback()

        // Handle internal routing
        if (href && !preventDefault) {
          router.push(href, {
            clientOnly,
          })
          return
        }
      }}
    >
      {children}
    </A>
  )
}
