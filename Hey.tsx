"use client"

import {
  type ComponentType,
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react"
import AgentProfile from "./AgentProfile"
import { useApp } from "./context/providers"
// Import hooks directly from their source files to avoid circular dependency with context/providers/index.tsx
import { useAuth } from "./context/providers/AuthProvider"
import { useNavigationContext } from "./context/providers/NavigationProvider"
import { ErrorBoundary } from "./ErrorBoundary"
import Home from "./Home"
import { useHasHydrated } from "./hooks"
import Img from "./Image"
import Loading from "./Loading"
import { Div, useLocalStorage, usePlatform } from "./platform"
import { useSidebarStyles } from "./Sidebar.styles"
import Thread from "./Thread"
import { getAppAndStoreSlugs } from "./utils/url"
import Programme from "./z/Programme"

// Lazy load less frequently used components to reduce initial bundle
const Store = lazy(() => import("./Store"))
const Calendar = lazy(() => import("./Calendar"))
const Why = lazy(() => import("./Why"))
const Privacy = lazy(() => import("./Privacy"))
const Terms = lazy(() => import("./Terms"))
const About = lazy(() => import("./about"))
const Threads = lazy(() => import("./Threads"))
const Users = lazy(() => import("./Users"))
const Affiliate = lazy(() => import("./affiliate"))
const AffiliateDashboard = lazy(() => import("./affiliateDashboard"))

// Route map with conditional lazy loading
const ROUTES: Record<string, ComponentType<any>> = {
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
  agent: AgentProfile,
}

export const Hey = memo(
  function Hey({
    children,
  }: {
    className?: string
    children?: React.ReactNode
    useExtensionIcon?: (slug?: string) => void
  }) {
    const { pathname } = useNavigationContext()

    const { isExtension } = usePlatform()

    const styles = useSidebarStyles()

    const [_pathnameLocal, setPathnameLocal] = useLocalStorage<
      string | undefined
    >("pathname", isExtension ? pathname : undefined)

    useEffect(() => {
      if (isExtension) {
        setPathnameLocal(pathname)
      }
    }, [pathname, isExtension])

    const {
      app,
      isSplash,
      setIsSplash,
      storeApps,
      threadId,
      isProgramme,
      baseApp,
      isLoadingPosts,
      siteConfig,
      postId,
    } = useAuth()

    const { appSlug } = getAppAndStoreSlugs(pathname, {
      defaultAppSlug: baseApp?.slug || siteConfig.slug,
      defaultStoreSlug: baseApp?.store?.slug || siteConfig.storeSlug,
    })

    const { currentStore } = useApp()

    const lastPathSegment = pathname.split("/").pop()?.split("?")[0]

    // SSR routes that should be handled by Next.js
    // Check both exact matches and path prefixes (e.g., /blog/dear-claude)
    const ssrRoutes = ["blog"]
    const ssrPrefixes = ["/blog"]
    const isSSRRoute =
      (lastPathSegment && ssrRoutes.includes(lastPathSegment)) ||
      ssrPrefixes.some((prefix) => pathname.startsWith(prefix))

    // Detect if this is an app slug (atlas, peach, vault, etc.)

    const pathWithoutLocale = pathname
      .replace(/^\/[a-z]{2}\//, "/")
      .slice(1)
      .split("?")[0]

    const showTribeLogo = siteConfig.isTribe && pathname === "/"

    // Check if current route is a store slug by checking all apps
    const isStorePage = storeApps?.find(
      (app) => app.store?.slug === pathWithoutLocale,
    )

    // Check if this is an agent profile route
    const isAgentRoute = pathname.startsWith("/agent/")

    // Auto-detect route component
    // Priority: Store pages > Agent routes > Full path match (nested routes) > Last segment > App slugs > Thread IDs
    const RouteComponent = isStorePage
      ? Store // Store slugs render Store component
      : isAgentRoute
        ? AgentProfile // Agent profile pages
        : pathWithoutLocale && ROUTES[pathWithoutLocale]
          ? ROUTES[pathWithoutLocale]
          : lastPathSegment && ROUTES[lastPathSegment]
            ? ROUTES[lastPathSegment]
            : null

    // Check if this is a client-side route
    // Skip SSR routes completely - let Next.js handle them
    const isClientRoute =
      isExtension ||
      (!isSSRRoute &&
        (!!RouteComponent ||
          threadId ||
          postId ||
          pathname === "/" ||
          pathname === "/api" ||
          app ||
          currentStore))

    const isHydrated = useHasHydrated()

    const [isImageLoaded, setIsImageLoaded] = useState(false)
    const [minSplashTimeElapsed, setMinSplashTimeElapsed] = useState(false)

    // Minimum splash screen duration (300ms) - starts when image loads
    useEffect(() => {
      if (!isImageLoaded) return

      const timer = setTimeout(() => {
        setMinSplashTimeElapsed(true)
      }, 1000)
      return () => clearTimeout(timer)
    }, [isImageLoaded])

    const getSplash = useCallback(
      (isSplash: boolean) => {
        const splashStyle = styles.splash
        const hiddenStyle = styles.splashHidden

        return (
          <Div
            style={{
              ...splashStyle.style,
              ...(!isSplash ? hiddenStyle.style : {}),
            }}
          >
            <Img
              key={app?.slug || appSlug}
              onLoad={(_src) => {
                setIsImageLoaded(true)
              }}
              slug={showTribeLogo ? "tribe" : app ? undefined : appSlug}
              app={showTribeLogo ? undefined : app}
              showLoading={false}
              size={showTribeLogo ? 80 : 64}
            />
          </Div>
        )
      },
      [app, isSplash, appSlug, showTribeLogo],
    )
    const splash = getSplash(isSplash)

    useEffect(() => {
      isSplash &&
        isImageLoaded &&
        isHydrated &&
        minSplashTimeElapsed &&
        app?.store?.apps?.length &&
        !isLoadingPosts &&
        setIsSplash(false)
    }, [
      isImageLoaded,
      isHydrated,
      isLoadingPosts,
      isSplash,
      minSplashTimeElapsed,
      app,
    ])

    // useEffect(() => {
    //   app?.slug && useExtensionIcon?.(app?.slug)
    // }, [app, useExtensionIcon])
    //

    return (
      <Div>
        <ErrorBoundary>
          {splash}
          <Suspense fallback={<Loading fullScreen />}>
            <Programme />
            <Div style={{ display: isProgramme ? "none" : "block" }}>
              {isClientRoute ? (
                // Client-side routes: SWAP content
                // Check thread detail FIRST before RouteComponent
                postId ? (
                  <Home />
                ) : threadId ? (
                  <Thread key={threadId} />
                ) : RouteComponent ? (
                  <RouteComponent />
                ) : (
                  <Home />
                )
              ) : (
                children
              )}
            </Div>
          </Suspense>
        </ErrorBoundary>
      </Div>
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
