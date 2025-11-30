"use client"

import { defaultLocale } from "./locales"
import Thread from "./Thread"
import { app } from "./types"
import { useAuth } from "./context/providers"
import { useApp } from "./context/providers"
import { useAppMetadata } from "./hooks"
import { Div } from "./platform"

export default function Home({
  className,
  slug,
}: {
  className?: string
  app?: app
  slug?: string
}): React.ReactElement {
  const { language, threadId } = useAuth()
  const { currentStore: store, app } = useApp()

  useAppMetadata(app, !store && !threadId)

  return (
    <Div data-url={language === defaultLocale ? "/" : `/${language}`}>
      <Thread isHome />
    </Div>
  )
}
