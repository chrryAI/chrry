import type React from "react"
import { useColorSchemeStyles } from "./ColorScheme.styles"
import { COLORS, useAppContext } from "./context/AppContext"
import { useAuth } from "./context/providers/AuthProvider"
import { useHasHydrated } from "./hooks"
import { CheckIcon, Circle } from "./icons"
import { Button, Div, useTheme } from "./platform"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"

export default function ColorScheme({
  style,
  onChange,
  dataTestId,
  ...props
}: {
  style?: React.CSSProperties
  onChange?: (color: keyof typeof COLORS) => void
  colorScheme?: string
  dataTestId?: string
}) {
  const styles = useColorSchemeStyles()
  const { plausible } = useAuth()
  const { t } = useAppContext()
  const {
    colorScheme: colorSchemeInternal,
    setColorScheme: setColorSchemeInternal,
    isDark,
    setIsThemeLocked,
  } = useTheme()
  const colorScheme = props.colorScheme || colorSchemeInternal

  const setColorScheme = (scheme?: string) => {
    if (!scheme) return
    setIsThemeLocked(true)
    setColorSchemeInternal(scheme)

    plausible({
      name: ANALYTICS_EVENTS.COLOR_SCHEME_CHANGE,
      props: {
        colorScheme,
        isDark,
      },
    })
  }

  const hasHydrated = useHasHydrated()

  if (!hasHydrated) return null

  return (
    <Div style={{ ...styles.colorScheme.style, ...style }}>
      {Object.entries(COLORS).map(([key, value]) => (
        <Button
          data-testid={`${dataTestId}-${key}`}
          key={key}
          aria-label={t("Set color scheme to {{color}}", { color: key })}
          onClick={() => {
            !props.colorScheme && setColorScheme(key as keyof typeof COLORS)
            onChange?.(key as keyof typeof COLORS)
          }}
          style={{ ...styles.color.style }}
          className={"link"}
        >
          <Circle size={20} fill={value} color={value} />
          {colorScheme === key && (
            <CheckIcon
              style={{ ...styles.check.style }}
              size={11}
              strokeWidth={3}
              color="white"
            />
          )}
        </Button>
      ))}
    </Div>
  )
}
