import React from "react"
import { useData } from "../context/providers"
import { A, useNavigation, usePlatform, useTheme } from "../platform"

const Anchor = React.forwardRef<
  HTMLAnchorElement,
  React.HTMLAttributes<HTMLAnchorElement> & {
    openInNewTab?: boolean
    href?: string
    preventDefault?: boolean
    clientOnly?: boolean
    target?: "_blank" | "_self" | "_parent" | "_top"
  }
>(
  (
    { clientOnly, target, children, preventDefault, openInNewTab, ...props },
    ref,
  ) => {
    const { FRONTEND_URL } = useData()

    const { addHapticFeedback } = useTheme()
    const { isExtension, BrowserInstance, isTauri } = usePlatform()
    const router = useNavigation()

    const newTab = !isTauri && openInNewTab

    const isExternalUrl = (url?: string) => {
      if (isTauri) return false
      if (newTab) return true
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
      !newTab && props.href?.startsWith(FRONTEND_URL)
        ? props.href.replace(FRONTEND_URL, "") || "/"
        : props.href

    return (
      <A
        {...props}
        ref={ref}
        target={newTab ? "_blank" : target}
        onClick={(e) => {
          props.onClick?.(e)

          if (e.defaultPrevented) {
            return
          }

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
              BrowserInstance?.runtime?.sendMessage({
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
  },
)

Anchor.displayName = "Anchor"

export default Anchor
