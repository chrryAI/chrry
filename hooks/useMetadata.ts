import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { storeWithApps, thread } from "../types"
import {
  generateStoreMetadata,
  generateAppMetadata,
  generateThreadMetadata,
} from "../utils"
import { useAuth, useApp } from "../context/providers"
import getWhiteLabel from "../utils/getWhiteLabel"

/**
 * Hook to dynamically update page metadata for client-side navigation
 * Uses the same generateStoreMetadata function as server-side
 */
export function useStoreMetadata(store?: storeWithApps) {
  const { i18n } = useTranslation()

  const { baseApp, showFocus } = useAuth()
  const currentDomain =
    baseApp?.store?.domain ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "")
  useEffect(() => {
    if (showFocus) return
    if (typeof document === "undefined" || !store) return

    const locale = i18n.language || "en"

    // Get translations object from i18n
    const translations =
      (i18n.store.data[locale]?.translation as Record<string, any>) || {}

    // Generate metadata using the same function as server-side
    const metadata = generateStoreMetadata({
      store,
      locale,
      currentDomain,
      translations,
    })

    if (!metadata) return

    // Apply metadata to document
    if (metadata.title) {
      document.title = metadata.title as string
    }

    if (metadata.description) {
      updateOrCreateMeta("name", "description", metadata.description)
    }

    // Update OG tags
    if (metadata.openGraph) {
      const og = metadata.openGraph
      if (og.title) {
        updateOrCreateMeta("property", "og:title", String(og.title))
      }
      if (og.description) {
        updateOrCreateMeta("property", "og:description", og.description)
      }
      if (og.images && Array.isArray(og.images) && og.images[0]) {
        const image = og.images[0]
        const imageUrl = typeof image === "string" ? image : (image as any).url
        if (imageUrl) {
          updateOrCreateMeta("property", "og:image", String(imageUrl))
        }
      }
      if (og.url) {
        updateOrCreateMeta("property", "og:url", String(og.url))
      }
    }

    // Update Twitter card
    if (metadata.twitter) {
      const twitter = metadata.twitter
      if (twitter.title) {
        updateOrCreateMeta("name", "twitter:title", twitter.title as string)
      }
      if (twitter.description) {
        updateOrCreateMeta("name", "twitter:description", twitter.description)
      }
      if (
        twitter.images &&
        Array.isArray(twitter.images) &&
        twitter.images[0]
      ) {
        updateOrCreateMeta("name", "twitter:image", String(twitter.images[0]))
      }
    }

    // Update canonical URL
    if (metadata.alternates?.canonical) {
      updateOrCreateLink("canonical", String(metadata.alternates.canonical))
    }
  }, [store, i18n.language, baseApp, showFocus])
}

/**
 * Hook to dynamically update page metadata for app pages
 * Uses the same generateAppMetadata function as server-side
 */
export function useAppMetadata() {
  const { i18n } = useTranslation()

  const { currentStore } = useApp()

  const enabled = !currentStore

  const { baseApp, app, language: locale, showFocus } = useAuth()

  const storeApp = getWhiteLabel({ app }).storeApp || baseApp

  const currentDomain =
    storeApp?.store?.domain ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "")

  const translations =
    (i18n.store.data[locale]?.translation as Record<string, any>) || {}

  const metadata = app
    ? generateAppMetadata({
        app,
        store: storeApp?.store,
        locale,
        currentDomain,
        translations,
        whiteLabel: storeApp,
      })
    : undefined

  useEffect(() => {
    if (showFocus) return
    if (!metadata || !enabled) return

    if (metadata.title) {
      document.title = metadata.title as string
    }

    if (metadata.description) {
      updateOrCreateMeta("name", "description", metadata.description)
    }

    if (metadata.openGraph) {
      const og = metadata.openGraph
      if (og.title) {
        updateOrCreateMeta("property", "og:title", String(og.title))
      }
      if (og.description) {
        updateOrCreateMeta("property", "og:description", og.description)
      }
      if (og.images && Array.isArray(og.images) && og.images[0]) {
        const image = og.images[0]
        const imageUrl = typeof image === "string" ? image : (image as any).url
        if (imageUrl) {
          updateOrCreateMeta("property", "og:image", String(imageUrl))
        }
      }
      if (og.url) {
        updateOrCreateMeta("property", "og:url", String(og.url))
      }
    }

    if (metadata.twitter) {
      const twitter = metadata.twitter
      if (twitter.title) {
        updateOrCreateMeta("name", "twitter:title", twitter.title as string)
      }
      if (twitter.description) {
        updateOrCreateMeta("name", "twitter:description", twitter.description)
      }
      if (
        twitter.images &&
        Array.isArray(twitter.images) &&
        twitter.images[0]
      ) {
        updateOrCreateMeta("name", "twitter:image", String(twitter.images[0]))
      }
    }

    if (metadata.alternates?.canonical) {
      updateOrCreateLink("canonical", String(metadata.alternates.canonical))
    }
    if (metadata.alternates?.languages) {
      Object.entries(metadata.alternates.languages).forEach(([lang, url]) => {
        updateOrCreateLink("alternate", String(url), lang)
      })
    }
  }, [metadata, enabled, showFocus])
}

/**
 * Hook to dynamically update page metadata for thread pages
 */
export function useThreadMetadata(thread?: thread) {
  const { i18n } = useTranslation()

  const { baseApp } = useAuth()

  const locale = i18n.language || "en"

  const currentDomain =
    baseApp?.store?.domain ||
    (typeof window !== "undefined"
      ? `${window.location.protocol}//${window.location.host}`
      : "")

  const translations =
    (i18n.store.data[locale]?.translation as Record<string, any>) || {}

  const metadata = thread
    ? generateThreadMetadata({
        thread,
        locale,
        currentDomain,
        translations,
      })
    : undefined

  useEffect(() => {
    if (!metadata || typeof document === "undefined") return

    if (metadata.title) {
      document.title = metadata.title as string
    }

    if (metadata.description) {
      updateOrCreateMeta("name", "description", metadata.description)
    }

    if (metadata.openGraph) {
      const og = metadata.openGraph
      if (og.title) {
        updateOrCreateMeta("property", "og:title", String(og.title))
      }
      if (og.description) {
        updateOrCreateMeta("property", "og:description", og.description)
      }
      if (og.url) {
        updateOrCreateMeta("property", "og:url", String(og.url))
      }
    }

    if (metadata.twitter) {
      const twitter = metadata.twitter
      if (twitter.title) {
        updateOrCreateMeta("name", "twitter:title", twitter.title as string)
      }
      if (twitter.description) {
        updateOrCreateMeta("name", "twitter:description", twitter.description)
      }
    }

    if (metadata.alternates?.canonical) {
      updateOrCreateLink("canonical", String(metadata.alternates.canonical))
    }
    if (metadata.alternates?.languages) {
      Object.entries(metadata.alternates.languages).forEach(([lang, url]) => {
        updateOrCreateLink("alternate", String(url), lang)
      })
    }
  }, [metadata])
}

/**
 * Helper function to update or create meta tags
 */
function updateOrCreateMeta(
  attributeName: "name" | "property",
  attributeValue: string,
  content: string,
) {
  let metaTag = document.querySelector(
    `meta[${attributeName}="${attributeValue}"]`,
  )

  if (!metaTag) {
    metaTag = document.createElement("meta")
    metaTag.setAttribute(attributeName, attributeValue)
    document.head.appendChild(metaTag)
  }

  metaTag.setAttribute("content", content)
}

/**
 * Helper function to update or create link tags
 */
function updateOrCreateLink(rel: string, href: string, hreflang?: string) {
  let selector = `link[rel="${rel}"]`
  if (hreflang) {
    selector += `[hreflang="${hreflang}"]`
  }
  let linkTag = document.querySelector(selector)
  if (!linkTag) {
    linkTag = document.createElement("link")
    linkTag.setAttribute("rel", rel)
    if (hreflang) {
      linkTag.setAttribute("hreflang", hreflang)
    }
    document.head.appendChild(linkTag)
  }
  linkTag.setAttribute("href", href)
}
