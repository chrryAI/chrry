import { ReactNode } from "react"
import { getSession } from "./lib"
import { session } from "./types"

interface SessionWrapperProps {
  children: ReactNode
  Wrapper: any
  thread: any
  apiKey: string
  viewPortWidth: string
  viewPortHeight: string
  locale: string
  appId?: string
  deviceId: string
  fingerprint: string
  appSlug: string
  agentName?: string
  pathname: string
  routeType?: string
  chrryUrl: string
  userAgent: string
}

// Async component that fetches session and renders Wrapper
export async function SessionWrapper({
  children,
  Wrapper,
  thread,
  apiKey,
  viewPortWidth,
  viewPortHeight,
  locale,
  appId,
  deviceId,
  fingerprint,
  appSlug,
  agentName,
  pathname,
  routeType,
  chrryUrl,
  userAgent,
}: SessionWrapperProps) {
  // Fetch session data - this will stream
  const session = await getSession({
    appId,
    deviceId,
    fingerprint,
    token: apiKey,
    appSlug,
    agentName,
    pathname,
    routeType,
    translate: true,
    locale,
    chrryUrl,
    screenWidth: Number(viewPortWidth),
    screenHeight: Number(viewPortHeight),
    userAgent,
  })

  if (session && "error" in session) {
    console.error(session.error)
    return <>{session.error}</>
  }

  return (
    <Wrapper
      thread={thread}
      apiKey={apiKey}
      viewPortWidth={viewPortWidth}
      viewPortHeight={viewPortHeight}
      session={session && "app" in session ? session : undefined}
      locale={locale}
    >
      {children}
    </Wrapper>
  )
}
