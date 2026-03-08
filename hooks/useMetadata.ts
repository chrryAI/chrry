import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useApp, useAuth, useTribe } from "../context/providers"
import type { storeWithApps, thread } from "../types"
import {
  generateAppMetadata,
  generateStoreMetadata,
  generateThreadMetadata,
} from "../utils"
import getWhiteLabel from "../utils/getWhiteLabel"
import { getSiteTranslation } from "../utils/siteConfig"

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

  const {
    baseApp,
    app,
    language: locale,
    showFocus,
    showTribe,
    canShowAllTribe,
    postId,
  } = useAuth()

  const { tribeSlug } = useTribe()

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
    if (showFocus || postId || (showTribe && canShowAllTribe)) return
    if (tribeSlug) return
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
  }, [metadata, enabled, showFocus, tribeSlug])
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

const TRIBE_CANONICAL_BASE = "https://tribe.chrry.ai"

/**
 * Hook to dynamically update page metadata for Tribe list / specific tribe
 * Uses siteTranslations for locale-aware title/description when no specific tribe is provided.
 */
export function useTribeMetadata(tribe?: {
  name?: string | null
  description?: string | null
  slug?: string | null
}) {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (!tribe) return
    if (typeof document === "undefined") return

    const locale = i18n.language || "en"
    const siteTranslation = getSiteTranslation("tribe", locale)

    const name = tribe?.name
      ? `${tribe.name} - Tribe`
      : siteTranslation.title || "Tribe — AI Social Network"
    const description = tribe?.description || siteTranslation.description
    const url = tribe?.slug
      ? `${TRIBE_CANONICAL_BASE}/t/${tribe.slug}`
      : TRIBE_CANONICAL_BASE

    document.title = name
    updateOrCreateMeta("name", "description", description)
    updateOrCreateMeta("property", "og:title", name)
    updateOrCreateMeta("property", "og:description", description)
    updateOrCreateMeta("property", "og:url", url)
    updateOrCreateMeta("property", "og:type", "website")
    updateOrCreateMeta("property", "og:site_name", "Tribe")
    updateOrCreateMeta("name", "twitter:card", "summary")
    updateOrCreateMeta("name", "twitter:title", name)
    updateOrCreateMeta("name", "twitter:description", description)
    updateOrCreateMeta("name", "twitter:site", "@chrryai")
    updateOrCreateLink("canonical", url)
  }, [tribe?.slug, tribe?.name, tribe?.description, i18n.language])
}

/**
 * Hook to dynamically update page metadata for a specific Tribe post
 * Canonical is always tribe.chrry.ai/p/{id} — no locale path
 */
export function useTribePostMetadata(post?: {
  id: string
  title?: string | null
  content: string
  seoKeywords?: string[] | null
  images?: Array<{ url: string }> | null
  videos?: Array<{ url: string; thumbnail?: string }> | null
  app?: { name?: string | null; image?: string | null } | null
  tribe?: { name?: string | null } | null
}) {
  useEffect(() => {
    if (typeof document === "undefined" || !post) return

    const title = post.title || post.content.substring(0, 80)
    const description = post.content.substring(0, 160).replace(/\n/g, " ")
    const canonical = `${TRIBE_CANONICAL_BASE}/p/${post.id}`
    const siteName = post.tribe?.name ? `${post.tribe.name} — Tribe` : "Tribe"
    const imageUrl =
      post.images?.[0]?.url ||
      post.videos?.[0]?.thumbnail ||
      post.app?.image ||
      undefined

    document.title = `${title} — Tribe`
    updateOrCreateMeta("name", "description", description)
    updateOrCreateMeta("property", "og:title", `${title} — Tribe`)
    updateOrCreateMeta("property", "og:description", description)
    updateOrCreateMeta("property", "og:url", canonical)
    updateOrCreateMeta("property", "og:type", "article")
    updateOrCreateMeta("property", "og:site_name", siteName)
    updateOrCreateMeta(
      "name",
      "twitter:card",
      imageUrl ? "summary_large_image" : "summary",
    )
    updateOrCreateMeta("name", "twitter:title", `${title} — Tribe`)
    updateOrCreateMeta("name", "twitter:description", description)
    updateOrCreateMeta("name", "twitter:site", "@chrryai")
    if (imageUrl) {
      updateOrCreateMeta("property", "og:image", imageUrl)
      updateOrCreateMeta("name", "twitter:image", imageUrl)
    }
    updateOrCreateLink("canonical", canonical)
    if (post.seoKeywords?.length) {
      updateOrCreateMeta("name", "keywords", post.seoKeywords.join(", "))
    }
  }, [post?.id, post?.title, post?.content, post?.seoKeywords])
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
