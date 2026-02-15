import React, { useEffect, type CSSProperties } from "react"
import { Span, Button } from "./platform"
import { appWithStore } from "./types"
import { useAuth, useChat } from "./context/providers"
import A from "./a/A"
import { useStyles } from "./context/StylesContext"
import Loading from "./Loading"

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
  isTribe,
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
  icon?: React.ReactNode
  setIsNewAppChat?: (item: appWithStore) => void
}) {
  const { setIsWebSearchEnabled, setIsNewAppChat } = useChat()
  const {
    loadingApp,
    getAppSlug,
    hasStoreApps,
    setLoadingApp,
    storeApps,
    mergeApps,
  } = useAuth()

  const [isLoading, setIsLoading] = React.useState(
    loadingApp && loadingApp?.id === app?.id,
  )

  React.useEffect(() => {
    setIsLoading(loadingApp && loadingApp?.id === app?.id)
  }, [loadingApp])

  useEffect(() => {
    const a = storeApps.find((app) => app.id === loadingApp?.id)
    if (hasStoreApps(a) && a) {
      setLoadingApp(undefined)
      props.setIsNewAppChat?.(a)
    }
  }, [loadingApp, storeApps])

  useEffect(() => {
    if (!app) return

    const isExist = storeApps.find((a) => a.id === app?.id)
    if (!isExist) {
      mergeApps([app])
    }
  }, [storeApps, app])

  const { utilities } = useStyles()
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

          if (!hasStoreApps(app)) {
            setLoadingApp(app)
            onLoading?.()
            return
          }

          if (props.setIsNewAppChat) {
            props.setIsNewAppChat(app)
            return
          }
          setIsNewAppChat({ item: app, tribe: isTribe })
        }}
        className={`${className}`}
      >
        {isLoading && loading ? (
          <Span>{loading}</Span>
        ) : (
          icon && <Span>{icon}</Span>
        )}
        <Span>{children}</Span>
      </A>
    )
  }

  return (
    <Button
      title={title}
      aria-label={title}
      style={{ ...style, ...(isLoading ? loadingStyle : {}) }}
      onClick={() => {
        if (isLoading) {
          onLoading?.()
          return
        }
        setIsNewAppChat({ item: app })
      }}
      className={className}
    >
      {isLoading ? <Span>{loading || <Loading />}</Span> : <Span>{icon}</Span>}

      <Span>{children}</Span>
    </Button>
  )
}
