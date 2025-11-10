import {
  type ComponentType,
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import { Providers } from "./Providers"
import Img from "./Image"
import {
  useAuth,
  useChat,
  useNavigationContext,
  useData,
} from "./context/providers"
import { useTheme, usePlatform } from "./platform"

import clsx from "clsx"
import styles from "./Sidebar.module.scss"
import { useHasHydrated } from "./hooks"
import { ErrorBoundary } from "./ErrorBoundary"
import Thread from "./Thread"
import Home from "./Home"
import { getSiteConfig } from "./utils/siteConfig"
import { excludedSlugRoutes, getAppAndStoreSlugs } from "./utils/url"
import { locales } from "./locales"

// Lazy load less frequently used components to reduce initial bundle
// const LifeOS = lazy(() => import("./LifeOS"))
const Store = lazy(() => import("./Store"))
const Calendar = lazy(() => import("./Calendar"))
const Why = lazy(() => import("./Why"))
const Privacy = lazy(() => import("./Privacy"))
const Terms = lazy(() => import("./Terms"))
const About = lazy(() => import("./About"))
const Threads = lazy(() => import("./Threads"))
const Users = lazy(() => import("./Users"))
const Chrry = lazy(() => import("./ChrryDotDev"))
const Affiliate = lazy(() => import("./Affiliate"))
const AffiliateDashboard = lazy(() => import("./AffiliateDashboard"))

// Route map with conditional lazy loading
const ROUTES: Record<string, ComponentType<any>> = {
  // lifeOS: LifeOS,
  calendar: Calendar,
  why: Why,
  privacy: Privacy,
  terms: Terms,
  about: About,
  threads: Threads,
  home: Home,
  affiliate: Affiliate,
  "affiliate/dashboard": AffiliateDashboard,
  u: Users,
  chrryDotDev: Chrry,
}

// Helper to detect app slugs vs regular routes

export const Hey = memo(
  function Hey({
    className,
    children,
    useExtensionIcon,
  }: {
    className?: string
    children?: React.ReactNode
    useExtensionIcon?: (slug?: string) => void
  }) {
    const { isHome, pathname, isSplash, setIsSplash } = useNavigationContext()

    const { threadId } = useChat()
    const { allApps, app, chrry } = useAuth()

    const { isExtension } = usePlatform()

    useEffect(() => {
      useExtensionIcon?.(app?.slug)
    }, [app, useExtensionIcon])

    const lastPathSegment = pathname.split("/").pop()?.split("?")[0]

    const store = allApps?.find(
      (app) => app?.store?.slug === lastPathSegment,
    )?.store

    // SSR routes that should be handled by Next.js
    // Check both exact matches and path prefixes (e.g., /blog/dear-claude)
    const ssrRoutes = ["blog"]
    const ssrPrefixes = ["/blog"]
    const isSSRRoute =
      (lastPathSegment && ssrRoutes.includes(lastPathSegment)) ||
      ssrPrefixes.some((prefix) => pathname.startsWith(prefix))

    // Detect if this is an app slug (atlas, peach, vault, etc.)
    const { appSlug } = getAppAndStoreSlugs(pathname, {
      defaultAppSlug: app?.slug ?? "",
      defaultStoreSlug: app?.store?.slug ?? "",
      excludedRoutes: excludedSlugRoutes,
      locales,
    })

    const isChrry = app && app.slug === "chrry"

    const isAppSlug =
      !!appSlug && allApps.some((candidate) => candidate.slug === appSlug)

    // Extract path without locale for route matching (e.g., /ja/affiliate/dashboard -> affiliate/dashboard)
    const pathWithoutLocale = pathname
      .replace(/^\/[a-z]{2}\//, "/")
      .slice(1)
      .split("?")[0]

    // Check if current route is a store slug by checking all apps
    const isStorePage = !!store

    // Check if this is a thread detail page (e.g., /threads/abc-123)
    const isThreadDetailPage = !!threadId

    // Auto-detect route component
    // Priority: Store pages > Full path match (nested routes) > Last segment > App slugs > Thread IDs
    const RouteComponent = isStorePage
      ? Store // Store slugs render Store component
      : pathWithoutLocale && ROUTES[pathWithoutLocale]
        ? ROUTES[pathWithoutLocale]
        : lastPathSegment && ROUTES[lastPathSegment]
          ? ROUTES[lastPathSegment]
          : isAppSlug
            ? Home // App slugs render Home with app context
            : null

    // Check if this is a client-side route
    // Skip SSR routes completely - let Next.js handle them
    const isClientRoute =
      isExtension ||
      (!isSSRRoute &&
        (!!RouteComponent ||
          threadId ||
          isThreadDetailPage ||
          pathname === "/" ||
          pathname === "/chrryDotDev" ||
          isAppSlug))

    const isHydrated = useHasHydrated()

    const [isImageLoaded, setIsImageLoaded] = useState(false)

    // Memoize onLoad callback to prevent flickering

    // Memoize app object to prevent unnecessary re-renders

    const getSplash = (isSplash: boolean) => {
      return (
        <div className={clsx(styles.splash, !isSplash && styles.hidden)}>
          <Img
            onLoad={() => setIsImageLoaded(true)}
            app={isChrry ? undefined : app}
            logo={isChrry ? "blossom" : undefined}
            showLoading={false}
            size={isChrry ? 72 : 64}
          />
        </div>
      )
    }
    // Memoize splash component to prevent re-renders
    const splash = getSplash(isSplash)

    useEffect(() => {
      isSplash && isImageLoaded && isHydrated && setIsSplash(!allApps.length)
    }, [isImageLoaded, isHydrated, isSplash, allApps])

    return (
      <div>
        <ErrorBoundary>
          {!app ? (
            <div className={clsx(styles.splash)}>
              <Img logo="blossom" showLoading={false} size={64} />
            </div>
          ) : (
            <>
              {splash}
              <Suspense>
                {isClientRoute ? (
                  // Client-side routes: SWAP content
                  // Check thread detail FIRST before RouteComponent
                  isThreadDetailPage && !isHome ? (
                    <Thread key={threadId} />
                  ) : RouteComponent ? (
                    <RouteComponent className={className} />
                  ) : (
                    isHome && <Home className={className} />
                  )
                ) : (
                  children
                )}
              </Suspense>
            </>
          )}
        </ErrorBoundary>
      </div>
    )
  },
  (prevProps, nextProps) => {
    // Only re-render if className or children actually changed
    return (
      prevProps.className === nextProps.className &&
      prevProps.children === nextProps.children
    )
  },
)

export default function Sidebar({
  useExtensionIcon,
}: {
  useExtensionIcon?: (slug?: string) => void
}): React.ReactElement {
  return (
    <Providers>
      <Hey useExtensionIcon={useExtensionIcon} />
    </Providers>
  )
}
