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
  style,
}: {
  className?: string
  style?: React.CSSProperties
  app?: app
  slug?: string
}): React.ReactElement {
  const { language, threadId, threadIdRef } = useAuth()
  const { currentStore: store, app } = useApp()

  useAppMetadata()

  return (
    <Div
      className={className}
      style={style}
      data-url={language === defaultLocale ? "/" : `/${language}`}
    >
      <Thread isHome={!threadId && !threadIdRef.current} />
    </Div>
  )
}
