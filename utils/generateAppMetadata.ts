import { Metadata } from "next"
import { appWithStore, storeWithApps, store } from "../types"
import { COLORS } from "chrry/context/ThemeContext"
import { t as tFunc } from "./t"
import { locale } from "../locales"

/**
 * Generate dynamic metadata for an app page
 *
 * @example
 * ```typescript
 * export async function generateMetadata({ params }) {
 *   const app = await getApp({ slug: params.slug })
 *   const store = await getStore({ slug: params.id })
 *   return generateAppMetadata({ app, store, locale: params.locale })
 * }
 * ```
 */
export function generateAppMetadata({
  app,
  store,
  locale = "en",
  currentDomain,
  translations,
}: {
  app: appWithStore
  store: storeWithApps
  locale?: locale | string
  currentDomain: string
  translations: Record<string, any>
}): Metadata {
  const title = app.name || app.title || "Chrry App"
  const description = app.description || `${title} - AI-powered agent on Chrry`

  const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.NEXT_PUBLIC_NODE_ENV === "production"

  const API_URL = !isProduction
    ? "http://localhost:3001/api"
    : "https://chrry.dev/api"
  // images array: [512px, 192px, 180px, 128px, 32px]
  const ogImage = app.images?.[0]?.url || "/logo/logo-512-512.png"
  const icon512 = app.images?.[0]?.url || "/logo/logo-512-512.png"
  const icon192 = app.images?.[1]?.url || "/logo/logo-192-192.png"
  const icon180 = app.images?.[2]?.url || "/logo/logo-180-180.png"
  const icon32 = app.images?.[4]?.url || "/logo/logo-32-32.png"

  const storeSlug = store.slug || "chrry"
  const storeName = store.name || "Chrry"
  const canonicalUrl = `${currentDomain}/${storeSlug}/${app.slug}`

  const t = (key: string) => {
    return tFunc(translations)(key)
  }
  return {
    title:
      `${app.name} - ${t(app.title)}` +
      (app.slug === "chrry" ? "" : " | Chrry"),
    description: description,
    manifest: `${API_URL}/manifest/${app.id}`,
    icons: [
      ...(icon32
        ? [{ rel: "icon", url: icon32, sizes: "32x32", type: "image/png" }]
        : []),
      ...(icon192
        ? [{ rel: "icon", url: icon192, sizes: "192x192", type: "image/png" }]
        : []),
      ...(icon512
        ? [{ rel: "icon", url: icon512, sizes: "512x512", type: "image/png" }]
        : []),
      ...(icon180
        ? [
            {
              rel: "apple-touch-icon",
              url: icon180,
              sizes: "180x180",
              type: "image/png",
            },
          ]
        : []),
    ],
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: app.name,
    },
    openGraph: {
      title: `${title} | ${storeName} | Chrry`,
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
      title: `${title} | ${storeName} | Chrry`,
      description: description,
      images: [ogImage],
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${currentDomain}/en/${storeSlug}/${app.slug}`,
        de: `${currentDomain}/de/${storeSlug}/${app.slug}`,
        fr: `${currentDomain}/fr/${storeSlug}/${app.slug}`,
        es: `${currentDomain}/es/${storeSlug}/${app.slug}`,
        ja: `${currentDomain}/ja/${storeSlug}/${app.slug}`,
        ko: `${currentDomain}/ko/${storeSlug}/${app.slug}`,
        pt: `${currentDomain}/pt/${storeSlug}/${app.slug}`,
        zh: `${currentDomain}/zh/${storeSlug}/${app.slug}`,
      },
    },
  }
}
