import "chrry/globals.scss"
import "chrry/globals.css"
import "chrry/styles/view-transitions.css"

import { ReactNode } from "react"
import { v4 as uuidv4 } from "uuid"
import AppMetadata from "./AppMetadata"
import { locale, locales } from "./locales"
import { getMetadata, VERSION, getThreadId, pageSizes, API_URL } from "./utils"

import { getSession, getThread, getTranslations } from "./lib"
import { getSiteConfig, getSiteTranslation } from "./utils/siteConfig"
import Chrry from "./Chrry"

import {
  appWithStore,
  paginatedMessages,
  session,
  sessionUser,
  thread,
} from "./types"

export const generateMeta = async ({ locale }: { locale: locale }) => {
  const siteConfig = getSiteConfig()
  const t = getSiteTranslation(siteConfig.mode, locale)

  return getMetadata({
    title: t.title,
    description: t.description,
    locale,
  })
}

type WrapperProps = {
  children: ReactNode
  apiKey?: string
  viewPortWidth?: string
  viewPortHeight?: string
  session?: session
  translations?: Record<string, any>
  locale?: locale
  thread?: { thread: thread; messages: paginatedMessages }
}

export default async function ChrryAI({
  children,
  apiKey,
  locale,
  headersList,
  cookieStore,
  Wrapper = ({
    children,
    apiKey,
    viewPortWidth,
    viewPortHeight,
    session,
    translations,
    locale,
    thread,
  }) => (
    <Chrry
      thread={thread}
      locale={locale}
      apiKey={apiKey}
      viewPortWidth={viewPortWidth}
      viewPortHeight={viewPortHeight}
      session={session}
      translations={translations}
    >
      {children}
    </Chrry>
  ),
}: {
  children: React.ReactNode
  apiKey: string
  Wrapper?: (props: WrapperProps) => ReactNode
  locale: locale

  headersList: {
    get(key: string): string | null
  }

  cookieStore: {
    get(key: string): { readonly value?: string } | undefined
  }
}) {
  const pathname = headersList.get("x-pathname") || ""

  const threadId = getThreadId(pathname)

  const thread = threadId
    ? await getThread({
        id: threadId,
        pageSize: pageSizes.threads,
        token: apiKey,
      })
    : undefined

  const isDev = process.env.NODE_ENV === "development"

  const deviceId =
    cookieStore.get("deviceId")?.value ||
    headersList.get("x-device-id") ||
    uuidv4()

  const hostname = headersList.get("host") || ""

  const fingerprint =
    cookieStore.get("fingerprint")?.value || headersList.get("x-fp") || uuidv4()

  const agentName = cookieStore.get("agentName")?.value

  const appId =
    thread?.thread?.appId || headersList.get("x-app-id") || undefined
  const appSlug =
    thread?.thread?.app?.slug || headersList.get("x-app-slug") || "vex"

  const routeType = headersList.get("x-route-type") || undefined

  const viewPortWidth = cookieStore.get("viewPortWidth")?.value || ""
  const viewPortHeight = cookieStore.get("viewPortHeight")?.value || ""

  // Check for app route from middleware
  const siteConfig = getSiteConfig(hostname)

  // Call API session endpoint
  const [session, translations] = await Promise.all([
    getSession({
      appId,
      deviceId,
      fingerprint,
      token: apiKey,
      appSlug,
      agentName,
      pathname,
      routeType,
      translate: true,
      locale,
      chrryUrl: siteConfig.url,
      screenWidth: Number(viewPortWidth),
      screenHeight: Number(viewPortHeight),
      source: "layout",
      userAgent: headersList.get("user-agent") || `Chrry/${VERSION}`,
    }),

    getTranslations({
      token: apiKey,
      locale,
    }),
  ])

  if (session && "error" in session) {
    console.error(session.error)
    return <div>{session.error}</div>
  }

  let app: appWithStore | undefined

  let user: sessionUser | undefined

  if (session && "app" in session) {
    app = session.app
  }

  if (session && "user" in session) {
    user = session.user
  }

  const theme = app?.backgroundColor === "#ffffff" ? "light" : "dark" // Fallback to dark black

  const classnames = [theme, app?.themeColor].filter(Boolean).join(" ")

  return (
    <html
      role="application"
      lang={locale}
      className={classnames}
      aria-label={app?.name}
      suppressHydrationWarning
      translate="no"
    >
      {/* <ServiceWorkerRegistration /> */}
      <head suppressHydrationWarning>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, viewport-fit=cover, interactive-widget=resizes-content"
        />
        {/* Disable Google Translate to prevent hydration mismatches */}
        <meta name="google" content="notranslate" />
        <link
          rel="sitemap"
          type="application/xml"
          href={`${API_URL}/sitemap?chrryUrl=${encodeURIComponent(siteConfig.url)}`}
        />

        <AppMetadata app={app} />
        {!isDev && user?.role !== "admin" && (
          <>
            <script
              defer
              data-domain={siteConfig.domain}
              src="https://a.chrry.dev/js/app.js"
            />
          </>
        )}
      </head>
      <body className="loaded" suppressHydrationWarning>
        <Wrapper
          thread={thread}
          apiKey={apiKey}
          viewPortWidth={viewPortWidth}
          viewPortHeight={viewPortHeight}
          translations={translations}
          session={session && "app" in session ? session : undefined}
          locale={locale}
        >
          {children}
        </Wrapper>
      </body>
    </html>
  )
}
