"use client"

// Only import styles on web platforms (not React Native)
// React Native will skip these imports during bundling
if (typeof window !== "undefined") {
  try {
    require("./globals.scss")
    require("./globals.css")
    require("./styles/view-transitions.css")
  } catch (e) {
    // React Native will throw here, which is fine
  }
}

import React from "react"
import AppProviders from "./context/providers"
import {
  session,
  thread,
  paginatedMessages,
  appWithStore,
  paginatedTribes,
  paginatedTribePosts,
  tribePostWithDetails,
} from "./types"
import { locale } from "./locales"
import { getSiteConfig } from "./utils/siteConfig"

export default function Chrry({
  children,
  session,
  thread,
  viewPortWidth,
  viewPortHeight,
  onSetLanguage,
  apiKey,
  locale,
  translations,
  useExtensionIcon,
  threads,
  app,
  pathname,
  siteConfig,
  searchParams,
  tribes,
  tribePosts,
  tribePost,
  theme,
}: {
  translations?: Record<string, any>
  useExtensionIcon?: (slug?: string) => void
  locale?: locale
  thread?: { thread: thread; messages: paginatedMessages }
  apiKey?: string
  children?: React.ReactNode
  session?: session
  app?: appWithStore
  viewPortWidth?: string
  viewPortHeight?: string
  siteConfig?: ReturnType<typeof getSiteConfig>
  searchParams?: Record<string, string> & {
    get: (key: string) => string | null
    has: (key: string) => boolean
    toString: () => string
  } // URL search params with URLSearchParams-compatible API
  pathname?: string // SSR pathname for thread ID extraction
  threads?: {
    threads: thread[]
    totalCount: number
  }
  theme?: "light" | "dark"
  tribes?: paginatedTribes
  tribePosts?: paginatedTribePosts
  tribePost?: tribePostWithDetails
  onSetLanguage?: (pathWithoutLocale: string, language: locale) => void
}) {
  return (
    <AppProviders
      useExtensionIcon={useExtensionIcon}
      locale={locale}
      siteConfig={siteConfig}
      session={session}
      app={app}
      viewPortWidth={viewPortWidth}
      viewPortHeight={viewPortHeight}
      pathname={pathname}
      onSetLanguage={onSetLanguage}
      apiKey={apiKey}
      thread={thread}
      translations={translations}
      threads={threads}
      searchParams={searchParams}
      tribes={tribes}
      tribePosts={tribePosts}
      tribePost={tribePost}
      theme={theme}
    >
      {children}
    </AppProviders>
  )
}
