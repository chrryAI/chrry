"use client"

import React, { useEffect, useRef, useState } from "react"
import styles from "./Search.module.scss"
import clsx from "clsx"
import nprogress from "nprogress"
import { SearchIcon } from "./icons"
import { useDebouncedCallback } from "use-debounce"
import {
  useSearchParams,
  usePathname,
  useRouter,
} from "./hooks/useWindowHistory"
import { useAppContext } from "./context/AppContext"
import { useNavigationContext } from "./context/providers"

export default function Search({
  className,
  placeholder,
  scroll = false,
  paramName = "search",
  onChange,
  dataTestId,
  ...props
}: {
  className?: string
  placeholder?: string
  scroll?: boolean
  paramName?: string
  isFocus?: boolean
  dataTestId?: string
  onChange?: (search: string) => void
}) {
  const { addParam } = useNavigationContext()
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
    addParam(paramName, search || "")
    nprogress.done()
  }, 600)

  return (
    <div className={clsx(styles.searchBoxWrapper)}>
      <SearchIcon className={styles.searchIcon} />
      <input
        className={clsx(styles.search, className)}
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
    </div>
  )
}
