"use client"
import type React from "react"
import { useHasHydrated } from "./hooks"
import { LoaderCircle } from "./icons"
import { useLoadingStyles } from "./Loading.styles"
import { Div } from "./platform"

export default function Loading({
  className,
  width,
  height,
  size,
  color = "var(--accent-6)",
  fullScreen = false,
  style,
  icon,
  "aria-label": ariaLabel,
}: {
  className?: string
  width?: number
  height?: number
  color?: string
  size?: number
  fullScreen?: boolean
  style?: React.CSSProperties
  icon?: React.ReactNode
  "aria-label"?: string
}): React.ReactElement | null {
  const isHydrated = useHasHydrated()

  const styles = useLoadingStyles()
  const LoadingWrapper = ({ children }: { children: React.ReactNode }) =>
    fullScreen ? (
      <Div
        className={"fullScreen"}
        style={{ ...styles.loadingWrapper.style, ...style }}
        role="status"
        aria-label={ariaLabel || "Loading"}
      >
        {children}
      </Div>
    ) : (
      <>{children}</>
    )

  if (!isHydrated) {
    return null
  }
  return (
    <LoadingWrapper>
      {icon || (
        <LoaderCircle
          width={width || size || 24}
          height={height || size || 24}
          style={{ ...styles.loadingCircle.style, ...style }}
          color={color as any}
          data-testid="imgLoading"
          className="spinner"
          role={fullScreen ? undefined : "status"}
          aria-label={fullScreen ? undefined : ariaLabel || "Loading"}
        />
      )}
    </LoadingWrapper>
  )
}
