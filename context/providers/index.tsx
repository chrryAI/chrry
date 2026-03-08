"use client"

/**
 * Centralized exports for all context providers and hooks
 */

export { PlatformProvider } from "../../platform"
export { AppProvider, type TabType, useApp } from "./AppProvider"
export { AuthProvider, useAuth } from "./AuthProvider"
export { ChatProvider, useChat } from "./ChatProvider"
export { DataProvider, useData } from "./DataProvider"
// Providers
export { ErrorProvider, useError } from "./ErrorProvider"
export { NavigationProvider, useNavigationContext } from "./NavigationProvider"
export { TribeProvider, useTribe } from "./TribeProvider"

// Composition root - combines all providers
import { type ReactNode, useMemo, useState } from "react"
import { SWRConfig } from "swr"
import { Hey } from "../../Hey"
import getCacheProvider from "../../lib/swrCacheProvider"
import type { locale } from "../../locales"
import { PlatformProvider } from "../../platform"
import type {
  appWithStore,
  paginatedMessages,
  paginatedTribePosts,
  paginatedTribes,
  thread,
  tribePostWithDetails,
} from "../../types"
import type { getSiteConfig } from "../../utils/siteConfig"
import { AppContextProvider } from "../AppContext"
import { StylesProvider } from "../StylesContext"
import { ThemeProvider } from "../ThemeContext"
import { TimerContextProvider } from "../TimerContext"
import { AppProvider } from "./AppProvider"
import { AuthProvider, type session } from "./AuthProvider"
import { ChatProvider } from "./ChatProvider"
import { DataProvider } from "./DataProvider"
import { ErrorProvider } from "./ErrorProvider"
import { NavigationProvider } from "./NavigationProvider"
import { TribeProvider } from "./TribeProvider"

export interface AppProvidersProps {
  translations?: Record<string, any>
  searchParams?: Record<string, string> & {
    get: (key: string) => string | null
    has: (key: string) => boolean
    toString: () => string
  } // URL search params with URLSearchParams-compatible API
  locale?: locale
  apiKey?: string
  children: ReactNode
  session?: session
  app?: appWithStore
  showTribe?: boolean
  pathname?: string // SSR pathname for thread ID extraction
  onSetLanguage?: (pathWithoutLocale: string, language: locale) => void
  signInContext?: (
    provider: "google" | "apple" | "credentials",
    options: {
      email?: string
      password?: string
      redirect?: boolean
      callbackUrl: string
      errorUrl?: string
      blankTarget?: boolean
    },
  ) => Promise<any>
  siteConfig?: ReturnType<typeof getSiteConfig>
  theme?: "light" | "dark"
  signOutContext?: (options: {
    callbackUrl: string
    errorUrl?: string
  }) => Promise<any>
  viewPortWidth?: string
  viewPortHeight?: string
  useExtensionIcon?: (slug?: string) => void
  thread?: { thread: thread; messages: paginatedMessages }
  threads?: {
    threads: thread[]
    totalCount: number
  }
  tribes?: paginatedTribes
  accountApp?: appWithStore
  tribePosts?: paginatedTribePosts
  tribePost?: tribePostWithDetails
}

/**
 * Centralized provider composition
 * Order matters: providers with no dependencies should be outer,
 * providers with dependencies should be inner
 */
export default function AppProviders({
  children,
  session,
  app,
  pathname,
  onSetLanguage,
  apiKey,
  viewPortWidth,
  viewPortHeight,
  thread,
  locale,
  translations,
  useExtensionIcon,
  siteConfig,
  searchParams,
  threads,
  tribes,
  tribePosts,
  theme,
  showTribe,
  tribePost,
  accountApp,
}: AppProvidersProps) {
  const [error, setError] = useState("")

  // Global SWR configuration with 429 error handling and persistent cache
  const swrConfig = useMemo(
    () => ({
      // Use persistent cache provider (IndexedDB on web, MMKV on native)
      provider: getCacheProvider,
      // Pre-populate cache with SSR data
      // fallback: {
      //   ...(session ? { session: { data: session } } : {}),
      //   ...(thread?.thread ? { [`threadId-${thread.thread.id}`]: thread } : {}),
      // },
      onError: (error: any) => {
        if (error?.status === 429) {
          // const errorKey = `rate_limit_${Date.now()}`
          const lastShown = localStorage.getItem("last_rate_limit_toast")
          const now = Date.now()

          // Only show toast if it's been more than 30 seconds since last one
          if (!lastShown || now - Number.parseInt(lastShown, 10) > 30000) {
            setError(
              "Rate limit exceeded. Please wait a moment before trying again.",
            )
            localStorage.setItem("last_rate_limit_toast", now.toString())
          }
        }
      },

      onErrorRetry: (
        error: any,
        key: string,
        config: any,
        revalidate: any,
        { retryCount }: any,
      ) => {
        // Don't retry on 429 errors
        if (error?.status === 429) return

        // Default retry logic for other errors
        if (retryCount >= 3) return
        setTimeout(() => revalidate({ retryCount }), 5000)
      },
    }),
    [],
  )

  return (
    <SWRConfig value={swrConfig}>
      <PlatformProvider
        viewPortWidth={viewPortWidth}
        viewPortHeight={viewPortHeight}
        session={session}
      >
        <ErrorProvider>
          <ThemeProvider theme={theme} session={session}>
            <AuthProvider
              translations={translations}
              thread={thread}
              locale={locale}
              error={error}
              apiKey={apiKey}
              app={app}
              pathname={pathname}
              threads={threads}
              showTribe={showTribe}
              onSetLanguage={onSetLanguage}
              session={session}
              siteConfig={siteConfig}
              searchParams={searchParams}
              tribes={tribes}
              tribePosts={tribePosts}
              tribePost={tribePost}
              accountApp={accountApp}
            >
              <DataProvider>
                <AppProvider>
                  <ChatProvider>
                    <TimerContextProvider>
                      <NavigationProvider
                        pathname={pathname}
                        searchParams={searchParams}
                      >
                        <AppContextProvider>
                          <StylesProvider>
                            <TribeProvider>
                              <Hey useExtensionIcon={useExtensionIcon}>
                                {children}
                              </Hey>
                            </TribeProvider>
                          </StylesProvider>
                        </AppContextProvider>
                      </NavigationProvider>
                    </TimerContextProvider>
                  </ChatProvider>
                </AppProvider>
              </DataProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorProvider>
      </PlatformProvider>
    </SWRConfig>
  )
}
