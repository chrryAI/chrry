import { storeWithApps } from "../types"
import { t as tFunc } from "./t"
import { locale } from "../locales"
import getWhiteLabel from "./getWhiteLabel"
import { getImageSrc } from "../lib"
import { MetadataResult } from "./generateThreadMetadata"

/**
 * Generate dynamic metadata for a store page
 *
 * @example
 * ```typescript
 * export async function generateMetadata({ params }) {
 *   const store = await getStore({ slug: params.id })
 *   return generateStoreMetadata({ store, locale: params.locale })
 * }
 * ```
 */
export function generateStoreMetadata({
  store,
  locale = "en",
  currentDomain,
  translations,
}: {
  store: storeWithApps
  locale?: locale | string
  currentDomain: string
  translations: Record<string, any>
}): MetadataResult | undefined {
  const title = store.name || "Blossom"
  const description = store.description || `${title} - Blossom`

  // Use store images or fallback to main app images

  const storeSlug = store.slug || "blossom"
  const storeName = store.name || "Blossom"
  // Prefer a dedicated white-label base URL for this storeSlug if configured
  // (e.g. books.chrry.ai for the "books" store) to avoid cross-domain duplicates.
  const { storeApp } = store.app
    ? getWhiteLabel({ app: store.app })
    : { storeApp: store.app }

  if (!storeApp) {
    return undefined
  }

  const ogImage = storeApp.images?.[0]?.url || "/logo/logo-512-512.png"

  const baseUrl = storeApp?.store?.domain || currentDomain
  const canonicalUrl = `${baseUrl}/${storeSlug}`

  const t = (key: string) => {
    return tFunc(translations)(key)
  }

  const toRelative = (val: string) => {
    return val.replace(baseUrl, "")
  }

  return {
    title: `${t(storeName)} - Chrry`,
    description: description,
    manifest: `/manifest.webmanifest?appId=${store?.app?.id}`,
    icons: [16, 48, 128, 180, 192, 512].map((size) => ({
      url: toRelative(
        getImageSrc({ app: storeApp, size, BASE_URL: baseUrl }).src ||
          "/images/pacman/space-invader.png",
      ),
      sizes: `${size}x${size}`,
      type: "image/png",
      purpose: "any maskable",
    })),
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: storeName,
    },
    openGraph: {
      title: `${title}`,
      description: description,
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
      locale: locale,
      type: "website",
      url: canonicalUrl,
    },
    twitter: {
      card: "summary",
      title: `${title}`,
      description: description,
      images: [
        {
          url: ogImage,
          width: 512,
          height: 512,
          alt: title,
        },
      ],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        // Default locale points exactly to the canonical URL (no /en prefix)
        en: canonicalUrl,
        // Other locales live on the same canonical base host
        de: `${baseUrl}/de/${storeSlug}`,
        fr: `${baseUrl}/fr/${storeSlug}`,
        es: `${baseUrl}/es/${storeSlug}`,
        ja: `${baseUrl}/ja/${storeSlug}`,
        ko: `${baseUrl}/ko/${storeSlug}`,
        pt: `${baseUrl}/pt/${storeSlug}`,
        zh: `${baseUrl}/zh/${storeSlug}`,
      },
    },
  }
}
