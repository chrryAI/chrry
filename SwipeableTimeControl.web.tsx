import React, { useRef, useCallback, useEffect } from "react"
import NumberFlow from "@number-flow/react"
import { usePlatform } from "./platform"

interface SwipeableTimeControlProps {
  value: number
  onValueChange: (newValue: number) => void
  isMinute?: boolean
  disabled?: boolean
  style?: React.CSSProperties
  Up: React.ReactNode
  Down: React.ReactNode
  time: number
}

const SwipeableTimeControl = ({
  value,
  onValueChange,
  isMinute = false,
  disabled = false,
  style,
  Up,
  Down,
  time,
}: SwipeableTimeControlProps) => {
  const { os } = usePlatform()
  const containerRef = useRef<HTMLDivElement>(null)
  const startYRef = useRef<number>(0)
  const isDraggingRef = useRef<boolean>(false)
  const lastValueRef = useRef<number>(value)

  const maxValue = isMinute ? 59 : Infinity // Max minutes: 59, Max seconds: 59
  const minValue = 0

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled) return

      e.preventDefault()
      e.stopPropagation()

      startYRef.current = e.clientY
      isDraggingRef.current = true
      lastValueRef.current = value

      if (containerRef.current) {
        containerRef.current.setPointerCapture(e.pointerId)
        containerRef.current.style.transform = "scale(1.02)"
        containerRef.current.style.opacity = "0.8"
      }
    },
    [disabled, value],
  )

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDraggingRef.current || disabled) return

      e.preventDefault()

      const deltaY = startYRef.current - e.clientY
      const sensitivity = os === "ios" ? 3 : 20 // Adjust sensitivity (lower = more sensitive)
      const change = Math.round(deltaY / sensitivity)

      if (Math.abs(change) > 0) {
        const newValue = Math.max(
          minValue,
          Math.min(maxValue, lastValueRef.current + change),
        )
        if (newValue !== value) {
          onValueChange(newValue)
        }
      }
    },
    [disabled, value, onValueChange, minValue, maxValue],
  )

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDraggingRef.current) return

    e.preventDefault()
    e.stopPropagation()

    isDraggingRef.current = false

    if (containerRef.current) {
      containerRef.current.releasePointerCapture(e.pointerId)
      containerRef.current.style.transform = "scale(1)"
      containerRef.current.style.opacity = "1"
    }
  }, [])

  const handlePointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (isDraggingRef.current) {
        handlePointerUp(e)
      }
    },
    [handlePointerUp],
  )

  // Prevent default touch behaviors
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const preventTouch = (e: TouchEvent) => {
      if (isDraggingRef.current) {
        e.preventDefault()
      }
    }

    container.addEventListener("touchstart", preventTouch, { passive: false })
    container.addEventListener("touchmove", preventTouch, { passive: false })

    return () => {
      container.removeEventListener("touchstart", preventTouch)
      container.removeEventListener("touchmove", preventTouch)
    }
  }, [])

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    userSelect: "none",
    cursor: disabled ? "default" : "grab",
    transition: "transform 0.15s ease, opacity 0.15s ease",
    touchAction: "none", // Prevent default touch behaviors
    ...style,
  }

  const numberStyle: React.CSSProperties = {
    fontSize: "40px",
    fontWeight: 200,
    textAlign: "center",
    fontFamily: 'Monaco, "Lucida Console", monospace',
    userSelect: "none",
  }

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <div>{Up}</div>

      <div style={numberStyle}>
        <NumberFlow value={value} format={{ minimumIntegerDigits: 2 }} />
      </div>

      <div>{Down}</div>
    </div>
  )
}

export default SwipeableTimeControl
