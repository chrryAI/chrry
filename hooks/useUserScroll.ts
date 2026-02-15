import { useEffect, useRef, useState, useCallback } from "react"
import { usePathname } from "./useWindowHistory"

export const useUserScroll = () => {
  const pathname = usePathname()
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [hasStoppedScrolling, setHasStoppedScrolling] = useState(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isUserInitiatedRef = useRef(false)
  const interactionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  // ✅ Expose reset function
  const resetScrollState = useCallback(() => {
    setHasStoppedScrolling(false)
    setIsUserScrolling(false)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
    if (interactionTimeoutRef.current) {
      clearTimeout(interactionTimeoutRef.current)
      interactionTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleUserInteraction = () => {
      isUserInitiatedRef.current = true

      // Clear previous timeout
      if (interactionTimeoutRef.current) {
        clearTimeout(interactionTimeoutRef.current)
      }

      // iOS Safari needs longer timeout for touch scrolling
      interactionTimeoutRef.current = setTimeout(() => {
        isUserInitiatedRef.current = false
      }, 500)
    }

    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = window.innerHeight
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50 // 50px threshold

      // If user scrolled to bottom (or programmatic scroll), reset stopped state
      if (isAtBottom) {
        setHasStoppedScrolling(false)
      }

      if (isUserInitiatedRef.current) {
        setIsUserScrolling(true)
        setHasStoppedScrolling(false)

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        // User stopped scrolling after 150ms
        scrollTimeoutRef.current = setTimeout(() => {
          setIsUserScrolling(false)
          // Only set hasStoppedScrolling if NOT at bottom
          if (!isAtBottom) {
            setHasStoppedScrolling(true)
          }
        }, 150)
      }
    }

    window.addEventListener("wheel", handleUserInteraction, { passive: true })
    window.addEventListener("touchstart", handleUserInteraction, {
      passive: true,
    })
    window.addEventListener("touchmove", handleUserInteraction, {
      passive: true,
    })
    window.addEventListener("keydown", handleUserInteraction)
    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      window.removeEventListener("wheel", handleUserInteraction)
      window.removeEventListener("touchstart", handleUserInteraction)
      window.removeEventListener("touchmove", handleUserInteraction)
      window.removeEventListener("keydown", handleUserInteraction)
      window.removeEventListener("scroll", handleScroll)

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  // Reset scroll state when pathname changes (e.g., navigating to a new thread)
  useEffect(() => {
    resetScrollState()
  }, [pathname, resetScrollState])

  return { isUserScrolling, hasStoppedScrolling, resetScrollState }
}
