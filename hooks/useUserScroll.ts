import { useEffect, useRef, useState, useCallback } from "react"

export const useUserScroll = () => {
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [hasStoppedScrolling, setHasStoppedScrolling] = useState(false)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isUserInitiatedRef = useRef(false)

  // ✅ Expose reset function
  const resetScrollState = useCallback(() => {
    setHasStoppedScrolling(false)
    setIsUserScrolling(false)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
      scrollTimeoutRef.current = null
    }
  }, [])

  useEffect(() => {
    const handleUserInteraction = () => {
      isUserInitiatedRef.current = true
      setTimeout(() => {
        isUserInitiatedRef.current = false
      }, 100)
    }

    const handleScroll = () => {
      if (isUserInitiatedRef.current) {
        setIsUserScrolling(true)
        setHasStoppedScrolling(false)

        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current)
        }

        scrollTimeoutRef.current = setTimeout(() => {
          setIsUserScrolling(false)
          setHasStoppedScrolling(true) // User stopped scrolling = reading
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

  return { isUserScrolling, hasStoppedScrolling, resetScrollState }
}
