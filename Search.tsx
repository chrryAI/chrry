"use client"

import React, { useEffect, useRef, useState } from "react"
import nprogress from "nprogress"
import { SearchIcon } from "./icons"
import { useDebouncedCallback } from "use-debounce"
import { useSearchParams, usePathname } from "./hooks/useWindowHistory"
import { useNavigationContext } from "./context/providers"
import { useSearchStyles } from "./Search.styles"
import { Div, Input } from "./platform"

export default function Search({
  className,
  placeholder,
  scroll = false,
  paramName = "search",
  onChange,
  dataTestId,
  style,
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
}) {
  const styles = useSearchStyles()
  const { addParams } = useNavigationContext()
  const searchParams = useSearchParams()
  const searchInputRef = useRef<HTMLInputElement>(null)

  const pathname = usePathname()

  const [term, setTerm] = useState(
    searchParams?.get(paramName)?.toString() || "",
  )

  const isFocus =
    props.isFocus ?? searchParams?.get("focus")?.toString() === "search"

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
      <SearchIcon style={{ ...styles.searchIcon.style }} />
      <Input
        style={{ ...styles.search.style }}
        data-testid={dataTestId}
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
    </Div>
  )
}
