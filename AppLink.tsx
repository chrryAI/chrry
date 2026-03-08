import React, { type CSSProperties, useEffect } from "react"
import A from "./a/A"
import { useAuth, useChat, useNavigationContext } from "./context/providers"
import { Button, Span } from "./platform"
import type { appWithStore } from "./types"

export default function AppLink({
  style,
  app,
  children,
  onLoading,
  loading,
  className,
  title,
  as = "a",
  loadingStyle,
  isTribe = true,
  isPear = false,
  icon,
  ...props
}: {
  title?: string
  style?: CSSProperties
  app: appWithStore
  children?: React.ReactNode
  as?: "a" | "button"
  onLoading?: () => void
  loading?: React.ReactNode
  className?: string
  loadingStyle?: CSSProperties
  isTribe?: boolean
  isPear?: boolean
  icon?: React.ReactNode
  setIsNewAppChat?: (item: appWithStore) => void
}) {
  const { setIsNewChat } = useChat()
  const { loadingApp, getAppSlug, setLoadingAppId, storeApps, mergeApps } =
    useAuth()

  const [isLoading, setIsLoading] = React.useState(
    loadingApp && loadingApp?.id === app?.id,
  )

  const { pathname } = useNavigationContext()

  React.useEffect(() => {
    const l = loadingApp && loadingApp?.id === app?.id

    l && setIsLoading(l)
  }, [loadingApp])

  const currentApp = storeApps.find(
    (a) => a.id === app?.id && a.store?.apps?.length,
  )

  React.useEffect(() => {
    if (!isLoading || loadingApp) return
    if (currentApp?.id !== app.id) return

    setIsLoading(false)

    if (props.setIsNewAppChat) {
      props.setIsNewAppChat(app)
      return
    }
    setIsNewChat({
      value: true,
      to: getAppSlug(app),
      tribe: isTribe,
      pear: isPear,
    })
  }, [currentApp, loadingApp, isTribe, isPear])

  useEffect(() => {
    const sa = storeApps.find((a) => a.id === app.id)
    if (sa) return

    mergeApps([app])
  }, [app, mergeApps, storeApps])

  if (as === "a") {
    return (
      <A
        title={title}
        aria-label={title}
        href={getAppSlug(app)}
        style={{
          ...style,
          ...(isLoading ? loadingStyle : {}),
        }}
        onClick={(e: React.MouseEvent) => {
          if (e.metaKey || e.ctrlKey) {
            return
          }
          e.preventDefault()

          if (!currentApp) {
            setLoadingAppId(app.id)
            onLoading?.()
            setIsLoading(true)
            return
          }

          if (props.setIsNewAppChat) {
            props.setIsNewAppChat(app)
            return
          }

          setIsNewChat({
            value: true,
            to: getAppSlug(app),
            tribe: isTribe,
            pear: isPear,
          })
        }}
        className={`${className}`}
      >
        {isLoading ? <>{loading}</> : icon && <>{icon}</>}
        <>{children}</>
      </A>
    )
  }

  return (
    <Button
      aria-label={title}
      style={{
        ...style,
        ...(isLoading ? loadingStyle : {}),
      }}
      onClick={() => {
        if (!currentApp) {
          setLoadingAppId(app.id)
          onLoading?.()
          return
        }

        if (props.setIsNewAppChat) {
          props.setIsNewAppChat(app)
          return
        }

        setIsNewChat({
          value: true,
          to: getAppSlug(app),
          tribe: isTribe,
          pear: isPear,
        })
      }}
      className={`${className}`}
    >
      {isLoading && loading ? (
        <Span>{loading}</Span>
      ) : (
        icon && <Span>{icon}</Span>
      )}
      <>{children}</>
    </Button>
  )
}
