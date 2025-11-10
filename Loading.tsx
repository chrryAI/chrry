import { LoaderCircle } from "./icons"
import styles from "./Loading.module.scss"
import clsx from "clsx"
import { useHasHydrated } from "./hooks"

export default function Loading({
  className,
  width,
  height,
  size,
  color = "var(--accent-6)",
  fullScreen = false,
}: {
  className?: string
  width?: number
  height?: number
  color?: string
  size?: number
  fullScreen?: boolean
}): React.ReactElement | null {
  const isHydrated = useHasHydrated()
  const LoadingWrapper = ({ children }: { children: React.ReactNode }) =>
    fullScreen ? (
      <div className={styles.loadingWrapper}>{children}</div>
    ) : (
      <>{children}</>
    )

  if (!isHydrated) {
    return null
  }
  return (
    <LoadingWrapper>
      <LoaderCircle
        width={width || size || 24}
        height={height || size || 24}
        className={clsx(styles.loadingCircle, className)}
        color={color as any}
        data-testid="imgLoading"
      />
    </LoadingWrapper>
  )
}
