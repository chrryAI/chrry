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
import { session, thread, paginatedMessages, appWithStore } from "./types"
import { locale } from "./locales"

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
  pathname?: string // SSR pathname for thread ID extraction
  threads?: {
    threads: thread[]
    totalCount: number
  }
  onSetLanguage?: (pathWithoutLocale: string, language: locale) => void
}) {
  return (
    <AppProviders
      useExtensionIcon={useExtensionIcon}
      locale={locale}
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
    >
      {children}
    </AppProviders>
  )
}
