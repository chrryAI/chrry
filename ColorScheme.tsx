import React from "react"
import clsx from "clsx"
import { CheckIcon, Circle } from "./icons"
import { COLORS, useAppContext } from "./context/AppContext"
import { useHasHydrated } from "./hooks"
import { Button, Div, useTheme } from "./platform"
import { useColorSchemeStyles } from "./ColorScheme.styles"

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
  const { colorScheme: colorSchemeInternal, setColorScheme } = useTheme()
  const colorScheme = props.colorScheme || colorSchemeInternal

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
