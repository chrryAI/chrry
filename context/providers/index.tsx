"use client"

/**
 * Centralized exports for all context providers and hooks
 */

// Providers
export { ErrorProvider, useError } from "./ErrorProvider"
export { NavigationProvider, useNavigationContext } from "./NavigationProvider"
export { AuthProvider, useAuth } from "./AuthProvider"
export { ChatProvider, useChat } from "./ChatProvider"
export { DataProvider, useData } from "./DataProvider"
export { AppProvider, useApp } from "./AppProvider"
export { PlatformProvider } from "../../platform"

// Composition root - combines all providers
import React, { ReactNode, useState } from "react"
import { PlatformProvider } from "../../platform"
import { ThemeProvider } from "../ThemeContext"
import { StylesProvider } from "../StylesContext"
import { ErrorProvider } from "./ErrorProvider"
import { NavigationProvider } from "./NavigationProvider"
import { AuthProvider, session } from "./AuthProvider"
import { DataProvider } from "./DataProvider"
import { ChatProvider } from "./ChatProvider"
import { AppProvider } from "./AppProvider"
import { AppContextProvider } from "../AppContext"
import { locale } from "../../locales"
import { SWRConfig } from "swr"
import { thread, paginatedMessages, appWithStore } from "../../types"
import { TimerContextProvider } from "../TimerContext"
import { Hey } from "../../Hey"
import getCacheProvider from "../../lib/swrCacheProvider"

interface AppProvidersProps {
  translations?: Record<string, any>
  locale?: locale
  apiKey?: string
  children: ReactNode
  session?: session
  app?: appWithStore
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
  threads,
}: AppProvidersProps) {
  const [error, setError] = useState("")

  // Global SWR configuration with 429 error handling and persistent cache
  const swrConfig = {
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
        if (!lastShown || now - Number.parseInt(lastShown) > 30000) {
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
  }

  return (
    <SWRConfig value={swrConfig}>
      <PlatformProvider
        viewPortWidth={viewPortWidth}
        viewPortHeight={viewPortHeight}
        session={session}
      >
        <ErrorProvider>
          <ThemeProvider session={session}>
            <AuthProvider
              translations={translations}
              thread={thread}
              locale={locale}
              error={error}
              apiKey={apiKey}
              app={app}
              pathname={pathname}
              threads={threads}
              onSetLanguage={onSetLanguage}
              session={session}
            >
              <DataProvider>
                <AppProvider>
                  <ChatProvider>
                    <TimerContextProvider>
                      <NavigationProvider pathname={pathname}>
                        <AppContextProvider>
                          <StylesProvider>
                            <Hey useExtensionIcon={useExtensionIcon}>
                              {children}
                            </Hey>
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
