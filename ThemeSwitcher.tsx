import React from "react"
import { useHasHydrated } from "./hooks"
import { useAppContext } from "./context/AppContext"
import clsx from "clsx"
import { Moon, Sun } from "./icons"
import { useTheme } from "./platform"

export default function ThemeSwitcher({
  onThemeChange,
  size = 18,
}: {
  onThemeChange?: (theme: "#000000" | "#ffffff") => void
  size?: number
}) {
  const hasHydrated = useHasHydrated()
  const { isDark, setTheme } = useTheme()
  const { t } = useAppContext()
  return (
    <div>
      {hasHydrated && (
        <button
          title={isDark ? t("Light") : t("Dark")}
          onClick={() => {
            setTheme(isDark ? "light" : "dark")
            onThemeChange?.(isDark ? "#000000" : "#ffffff")
          }}
          className={clsx("link")}
        >
          {isDark ? (
            <Sun color="var(--accent-1)" size={size} />
          ) : (
            <Moon color="var(--shade-7)" size={size} />
          )}
        </button>
      )}
    </div>
  )
}
