"use client"

/**
 * ClientRouter - Reusable client-side router for web and extension
 *
 * Renders components based on pathname without Next.js page routing
 * Perfect for SPA-style navigation with instant route switching
 */

import { ReactNode, Suspense, CSSProperties } from "react"
import { useNavigation } from "./navigation"

// Default full-screen loading component
function DefaultLoading({ size = 30 }: { size?: number }) {
  const loadingStyle: CSSProperties = {
    height: "100vh",
    width: "100vw",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  }

  return (
    <div style={loadingStyle}>
      {/* You can import Loading component or use a simple spinner */}
      <div
        style={{
          width: size,
          height: size,
          border: "3px solid rgba(255, 255, 255, 0.3)",
          borderTop: "3px solid #fff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export interface Route {
  path: string
  component: ReactNode
  exact?: boolean
}

export interface ClientRouterProps {
  routes: Route[]
  fallback?: ReactNode
  loading?: ReactNode
  notFound?: ReactNode
}

/**
 * Match a pathname against a route path
 * Supports exact matching and wildcard matching
 */
function matchRoute(
  pathname: string,
  routePath: string,
  exact?: boolean,
): boolean {
  // Remove trailing slashes for comparison
  const cleanPathname = pathname.replace(/\/$/, "") || "/"
  const cleanRoutePath = routePath.replace(/\/$/, "") || "/"

  if (exact) {
    return cleanPathname === cleanRoutePath
  }

  // Check if pathname starts with route path
  return (
    cleanPathname === cleanRoutePath ||
    cleanPathname.startsWith(cleanRoutePath + "/")
  )
}

/**
 * Extract path segments for dynamic routing
 */
export function useRouteParams(pathname: string) {
  const segments = pathname.split("/").filter(Boolean)

  return {
    segments,
    lastSegment: segments[segments.length - 1] || null,
    firstSegment: segments[0] || null,
  }
}

/**
 * ClientRouter Component
 *
 * @example
 * ```tsx
 * <ClientRouter
 *   routes={[
 *     { path: "/", component: <Home />, exact: true },
 *     { path: "/calendar", component: <Calendar /> },
 *     { path: "/threads", component: <Threads /> },
 *     { path: "/lifeOS", component: <LifeOS /> },
 *   ]}
 *   loading={<Loading />}
 *   notFound={<NotFound />}
 * />
 * ```
 */
export function ClientRouter({
  routes,
  fallback,
  loading,
  notFound,
}: ClientRouterProps): React.ReactElement {
  const { pathname } = useNavigation()

  // Find matching route
  const matchedRoute = routes.find((route) =>
    matchRoute(pathname, route.path, route.exact),
  )

  // Render matched component or fallback
  const content = matchedRoute ? matchedRoute.component : notFound || fallback

  // Always wrap in Suspense with full-screen loading by default
  const loadingFallback = loading !== undefined ? loading : <DefaultLoading />

  return <Suspense fallback={loadingFallback}>{content}</Suspense>
}

/**
 * Route component for declarative routing
 *
 * @example
 * ```tsx
 * <ClientRouter>
 *   <Route path="/" component={<Home />} exact />
 *   <Route path="/calendar" component={<Calendar />} />
 *   <Route path="/threads" component={<Threads />} />
 * </ClientRouter>
 * ```
 */
export function Route({
  path,
  component,
}: {
  path: string
  component: ReactNode
  exact?: boolean
}): React.ReactElement {
  // This is just a declarative component, actual routing logic is in ClientRouter
  return <>{component}</>
}

/**
 * Hook to check if a route is active
 */
export function useIsRouteActive(path: string, exact?: boolean): boolean {
  const { pathname } = useNavigation()
  return matchRoute(pathname, path, exact)
}

/**
 * Hook to get current route info
 */
export function useCurrentRoute() {
  const { pathname, searchParams } = useNavigation()
  const { segments, lastSegment, firstSegment } = useRouteParams(pathname)

  return {
    pathname,
    searchParams,
    segments,
    lastSegment,
    firstSegment,
    // Helper to check if on specific route
    is: (path: string, exact?: boolean) => matchRoute(pathname, path, exact),
  }
}
