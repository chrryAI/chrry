import React, { useEffect } from "react"
import styles from "./ColorScheme.module.scss"
import clsx from "clsx"
import { CheckIcon, Circle } from "./icons"
import { COLORS, useAppContext } from "./context/AppContext"
import { useHasHydrated } from "./hooks"
import { useTheme } from "./platform"

export default function ColorScheme({
  className,
  onChange,
}: {
  className?: string
  onChange?: (color: keyof typeof COLORS) => void
}) {
  const { colorScheme, setColorScheme } = useTheme()
  const hasHydrated = useHasHydrated()

  if (!hasHydrated) return null

  return (
    <div className={clsx(styles.colorScheme, className)}>
      {Object.entries(COLORS).map(([key, value]) => (
        <button
          key={key}
          onClick={() => {
            setColorScheme(key as keyof typeof COLORS)
            onChange?.(key as keyof typeof COLORS)
          }}
          className={clsx("link", styles.color, styles[key])}
        >
          <Circle size={20} fill={value} color={value} />
          {colorScheme === key && (
            <CheckIcon
              className={styles.check}
              size={11}
              strokeWidth={3}
              color="white"
            />
          )}
        </button>
      ))}
    </div>
  )
}
