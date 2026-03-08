"use client"

import nprogress from "nprogress"
import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
import { useNavigationContext } from "./context/providers"
import { usePathname, useSearchParams } from "./hooks/useWindowHistory"
import { SearchIcon } from "./icons"
import Loading from "./Loading"
import { Div, Input, usePlatform } from "./platform"
import { useSearchStyles } from "./Search.styles"

export default function Search({
  className,
  placeholder,
  scroll = false,
  paramName = "search",
  onChange,
  dataTestId,
  style,
  loading,
  ...props
}: {
  className?: string
  placeholder?: string
  scroll?: boolean
  paramName?: string
  isFocus?: boolean
  dataTestId?: string
  onChange?: (search: string) => void
  style?: React.CSSProperties
  loading?: boolean
}) {
  const styles = useSearchStyles()
  const { addParams } = useNavigationContext()
  const searchParams = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { isWeb, isDesktop, os } = usePlatform()

  const pathname = usePathname()

  const [term, setTerm] = useState(
    searchParams?.get(paramName)?.toString() || "",
  )

  const isFocus =
    props.isFocus ?? searchParams?.get("focus")?.toString() === "search"

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K or /
      const target = document.activeElement as HTMLElement
      const isInput =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable

      if (
        ((e.metaKey || e.ctrlKey) && e.key === "k") ||
        (e.key === "/" && !isInput)
      ) {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    if (isWeb && typeof window !== "undefined") {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isWeb])

  useEffect(() => {
    if (isFocus) {
      searchInputRef.current?.focus()
    }
    nprogress.done()

    !searchParams?.get(paramName)?.toString() && setTerm("")
  }, [pathname, searchParams, isFocus])

  const handleSearch = useDebouncedCallback((search?: string) => {
    nprogress.start()
    onChange?.(search || "")
    addParams({ [paramName]: search || "" })
    nprogress.done()
  }, 600)

  return (
    <Div style={{ ...styles.searchBoxWrapper.style, ...style }}>
      {loading ? (
        <Loading style={{ ...styles.searchIcon.style }} />
      ) : (
        <SearchIcon style={{ ...styles.searchIcon.style }} />
      )}
      <Input
        style={{
          ...styles.search.style,
          borderColor: style?.borderColor,
          paddingRight: isDesktop ? 60 : undefined,
        }}
        data-testid={dataTestId}
        aria-label={placeholder || "Search"}
        type="search"
        placeholder={placeholder || "Search"}
        name="search"
        ref={searchInputRef}
        onChange={(e) => {
          handleSearch(e.target.value)
          setTerm(e.target.value)
        }}
        value={term}
      />
      {isDesktop && (
        <span
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
            border: "1px solid var(--shade-3)",
            borderRadius: 4,
            padding: "2px 6px",
            fontSize: 12,
            color: "var(--shade-5)",
            background: "var(--shade-1)",
            pointerEvents: "none",
            userSelect: "none",
            lineHeight: 1,
            fontFamily: "var(--font-mono)",
          }}
        >
          {os === "macos" || os === "ios" ? "⌘K" : "Ctrl+K"}
        </span>
      )}
    </Div>
  )
}
