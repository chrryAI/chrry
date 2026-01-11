import React from "react"
import { useHasHydrated } from "./hooks"
import { useAppContext } from "./context/AppContext"
import clsx from "clsx"
import { Moon, Sun } from "./icons"
import { Button, Div, useTheme } from "./platform"
import { useStyles } from "./context/StylesContext"
import { useAuth } from "./context/providers/AuthProvider"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"

export default function ThemeSwitcher({
  onThemeChange,
  size = 18,
  style,
}: {
  onThemeChange?: (theme: "#000000" | "#ffffff") => void
  size?: number
  style?: React.CSSProperties
}) {
  const hasHydrated = useHasHydrated()
  const { isDark, setTheme: setThemeInternal, colorScheme } = useTheme()

  const { t } = useAppContext()

  const { plausible } = useAuth()

  const setTheme = (item: "light" | "dark") => {
    setThemeInternal(item)
    plausible({
      name: ANALYTICS_EVENTS.THEME_CHANGE,
      props: {
        // theme,
        colorScheme,
        isDark,
      },
    })
  }

  const { utilities } = useStyles()

  return (
    <Div>
      {hasHydrated && (
        <Button
          title={isDark ? t("Light") : t("Dark")}
          onClick={() => {
            setTheme(isDark ? "light" : "dark")
            onThemeChange?.(!isDark ? "#000000" : "#ffffff")
          }}
          style={{ ...utilities.link.style, ...style }}
          className={clsx("link")}
        >
          {isDark ? (
            <Sun color="var(--accent-1)" size={size} />
          ) : (
            <Moon color="var(--shade-7)" size={size} />
          )}
        </Button>
      )}
    </Div>
  )
}
