import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import { storeWithApps, appWithStore, thread } from "../types"
import { generateStoreMetadata, generateAppMetadata } from "../utils"

/**
 * Hook to dynamically update page metadata for client-side navigation
 * Uses the same generateStoreMetadata function as server-side
 */
export function useStoreMetadata(store?: storeWithApps) {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (typeof document === "undefined" || !store) return

    const locale = i18n.language || "en"
    const currentDomain =
      typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}`
        : ""

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
  }, [
    store?.id,
    store?.name,
    store?.slug,
    store?.description,
    store?.app?.id,
    i18n.language,
  ])
}

/**
 * Hook to dynamically update page metadata for app pages
 * Uses the same generateAppMetadata function as server-side
 */
export function useAppMetadata(app?: appWithStore, enabled = true) {
  const { i18n } = useTranslation()

  useEffect(() => {
    if (!enabled || typeof document === "undefined" || !app) return

    const locale = i18n.language || "en"
    const currentDomain =
      typeof window !== "undefined"
        ? `${window.location.protocol}//${window.location.host}`
        : ""

    // Get translations object from i18n
    const translations =
      (i18n.store.data[locale]?.translation as Record<string, any>) || {}

    // Generate metadata using the same function as server-side
    const metadata = generateAppMetadata({
      app,
      locale,
      currentDomain,
      translations,
    })

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
  }, [
    app?.id,
    app?.name,
    app?.slug,
    app?.title,
    app?.description,
    app?.store?.id,
    app?.store?.name,
    app?.store?.slug,
    i18n.language,
    enabled,
  ])
}

/**
 * Hook to dynamically update page metadata for thread pages
 */
export function useThreadMetadata(thread?: thread) {
  const { i18n, t } = useTranslation()

  useEffect(() => {
    if (typeof document === "undefined" || !thread) return

    const locale = i18n.language || "en"
    const threadTitle = thread.title?.substring(0, 120) || "Thread"

    // Get translation for "Thread" description
    const descriptions: Record<string, string> = {
      en: "Thread for Vex AI Assistant",
      de: "Thread für den Vex KI-Assistenten",
      fr: "Thread pour l'assistant IA Vex",
      ja: "Vex AIアシスタントのスレッド",
      ko: "Vex AI 어시스턴트의 스레드",
      pt: "Thread para o Assistente de IA Vex",
      es: "Thread del Asistente de IA Vex",
      zh: "Vex AI助手的线程",
      nl: "Thread voor de Vex AI-assistent",
      tr: "Vex AI Asistanı için konu",
    }

    const title = `${threadTitle} | Vex`
    const description = descriptions[locale] || descriptions.en

    // Update title
    document.title = title

    // Update meta description
    if (description) {
      updateOrCreateMeta("name", "description", description)
    }

    // Update OG tags
    updateOrCreateMeta("property", "og:title", title)
    if (description) {
      updateOrCreateMeta("property", "og:description", description)
    }

    // Update Twitter card
    updateOrCreateMeta("name", "twitter:title", title)
    if (description) {
      updateOrCreateMeta("name", "twitter:description", description)
    }

    // Update canonical URL
    if (typeof window !== "undefined" && thread.id) {
      const currentDomain = `${window.location.protocol}//${window.location.host}`
      updateOrCreateLink("canonical", `${currentDomain}/threads/${thread.id}`)
    }
  }, [thread?.id, thread?.title, i18n.language])
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
function updateOrCreateLink(rel: string, href: string) {
  let linkTag = document.querySelector(`link[rel="${rel}"]`)

  if (!linkTag) {
    linkTag = document.createElement("link")
    linkTag.setAttribute("rel", rel)
    document.head.appendChild(linkTag)
  }

  linkTag.setAttribute("href", href)
}
