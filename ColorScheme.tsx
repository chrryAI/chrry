import React from "react"
import { CheckIcon, Circle } from "./icons"
import { COLORS } from "./context/AppContext"
import { useHasHydrated } from "./hooks"
import { Button, Div, useTheme } from "./platform"
import { useColorSchemeStyles } from "./ColorScheme.styles"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"
import { useAuth } from "./context/providers/AuthProvider"

export default function ColorScheme({
  style,
  onChange,
  ...props
}: {
  style?: React.CSSProperties
  onChange?: (color: keyof typeof COLORS) => void
  colorScheme?: string
}) {
  const styles = useColorSchemeStyles()
  const { plausible } = useAuth()
  const {
    colorScheme: colorSchemeInternal,
    setColorScheme: setColorSchemeInternal,
    isDark,
  } = useTheme()
  const colorScheme = props.colorScheme || colorSchemeInternal

  const setColorScheme = (scheme?: string) => {
    if (!scheme) return

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
          key={key}
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
