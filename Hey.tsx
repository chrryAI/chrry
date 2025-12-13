"use client"

import {
  type ComponentType,
  lazy,
  memo,
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import Img from "./Image"
// Import hooks directly from their source files to avoid circular dependency with context/providers/index.tsx
import { useAuth } from "./context/providers/AuthProvider"
import { useChat } from "./context/providers/ChatProvider"
import { useNavigationContext } from "./context/providers/NavigationProvider"
import { usePlatform, useLocalStorage, Div } from "./platform"
import { useSidebarStyles } from "./Sidebar.styles"
import { useHasHydrated } from "./hooks"
import { ErrorBoundary } from "./ErrorBoundary"
import Thread from "./Thread"
import Home from "./Home"
import { excludedSlugRoutes, getAppAndStoreSlugs } from "./utils/url"
import { locales } from "./locales"
import { FRONTEND_URL, getThreadId } from "./utils"
import { useApp } from "./context/providers"

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
}

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
    const { pathname, router } = useNavigationContext()

    const { isExtension } = usePlatform()

    const styles = useSidebarStyles()

    const [pathnameLocal, setPathnameLocal] = useLocalStorage<
      string | undefined
    >("pathname", isExtension ? pathname : undefined)

    useEffect(() => {
      if (isExtension) {
        setPathnameLocal(pathname)
      }
    }, [pathname, isExtension])

    const { app, isSplash, setIsSplash, storeApps, threadId } = useAuth()

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

    // useEffect(() => {
    //   if (
    //     pathnameLocal &&
    //     isExtension &&
    //     pathnameLocal !== "/" &&
    //     pathnameLocal !== pathname
    //   ) {
    //     router.push(pathnameLocal)
    //   }
    // }, [pathnameLocal, isExtension, pathname])

    const isChrry = app && app.slug === "chrry"

    // Check if current route is a store slug by checking all apps
    const isStorePage = storeApps?.find(
      (app) => app.store?.slug === pathWithoutLocale,
    )

    // Auto-detect route component
    // Priority: Store pages > Full path match (nested routes) > Last segment > App slugs > Thread IDs
    const RouteComponent = isStorePage
      ? Store // Store slugs render Store component
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
      if (!app?.store?.apps?.length) return

      const timer = setTimeout(() => {
        setMinSplashTimeElapsed(true)
      }, 1000)
      return () => clearTimeout(timer)
    }, [isImageLoaded, app])

    const getSplash = useCallback(
      (isSplash: boolean) => {
        const splashStyle = styles.splash
        const hiddenStyle = styles.splashHidden
        if (!app) return null
        return (
          <Div
            style={{
              ...splashStyle.style,
              ...(!isSplash ? hiddenStyle.style : {}),
            }}
          >
            <Img
              onLoad={(src) => {
                setIsImageLoaded(true)
              }}
              app={isChrry ? undefined : app}
              logo={isChrry ? "blossom" : undefined}
              showLoading={false}
              size={isChrry ? 72 : 64}
            />
          </Div>
        )
      },
      [app, isSplash],
    )
    // Memoize splash component to prevent re-renders
    const splash = getSplash(isSplash)

    useEffect(() => {
      isSplash &&
        isImageLoaded &&
        isHydrated &&
        minSplashTimeElapsed &&
        setIsSplash(!app?.store?.apps?.length)
    }, [isImageLoaded, isHydrated, isSplash, minSplashTimeElapsed])

    // useEffect(() => {
    //   app?.slug && useExtensionIcon?.(app?.slug)
    // }, [app, useExtensionIcon])
    //

    return (
      <Div>
        <ErrorBoundary>
          {!app ? (
            <Div style={styles.splash.style}>
              <Img logo="blossom" showLoading={false} size={64} />
            </Div>
          ) : (
            <>
              {splash}
              <Suspense>
                {isClientRoute ? (
                  // Client-side routes: SWAP content
                  // Check thread detail FIRST before RouteComponent
                  threadId ? (
                    <Thread key={threadId} />
                  ) : RouteComponent ? (
                    <RouteComponent />
                  ) : (
                    <Home />
                  )
                ) : (
                  children
                )}
              </Suspense>
            </>
          )}
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
