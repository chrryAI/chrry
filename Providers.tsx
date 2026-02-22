"use client"
import "./i18n"
import AppProviders from "./context/providers"

export function Providers({
  children,
  onSetLanguage,
}: {
  children: React.ReactNode
  onSetLanguage?: (pathWithoutLocale: string, language: string) => void
}): React.ReactElement {
  return <AppProviders onSetLanguage={onSetLanguage}>{children}</AppProviders>
}
