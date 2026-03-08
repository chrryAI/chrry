"use client"

import { useAuth } from "./context/providers"
import { useAppMetadata } from "./hooks"
import { Div } from "./platform"
import Thread from "./Thread"
import type { app } from "./types"

export default function Home({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
  app?: app
  slug?: string
}): React.ReactElement {
  const { threadId, threadIdRef } = useAuth()

  useAppMetadata()

  return (
    <Div className={className} style={style}>
      <Thread isHome={!threadId && !threadIdRef.current} />
    </Div>
  )
}
