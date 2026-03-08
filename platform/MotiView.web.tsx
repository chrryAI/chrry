import React, { useEffect, useMemo, useState } from "react"

/**
 * Web MotiView wrapper
 * Uses CSS transitions to provide similar animation capabilities on web
 */

export interface MotiViewProps {
  from?: Record<string, any>
  animate?: Record<string, any>
  transition?: {
    type?: string
    duration?: number
    delay?: number
    [key: string]: any
  }
  style?: React.CSSProperties
  className?: string
  children?: React.ReactNode
  "data-testid"?: string
  [key: string]: any
}

// Helper to convert Moti-style transform values to CSS
const convertToCSSValue = (key: string, value: any): string => {
  if (key === "translateX" || key === "translateY") {
    return typeof value === "number" ? `${value}px` : value
  }
  if (key === "scale" || key === "scaleX" || key === "scaleY") {
    return String(value)
  }
  if (key === "rotate") {
    return typeof value === "number" ? `${value}deg` : value
  }
  return String(value)
}

// Helper to build transform string from Moti-style props
const buildTransform = (props: Record<string, any>): string => {
  const transforms: string[] = []

  if (props.translateX !== undefined) {
    transforms.push(
      `translateX(${convertToCSSValue("translateX", props.translateX)})`,
    )
  }
  if (props.translateY !== undefined) {
    transforms.push(
      `translateY(${convertToCSSValue("translateY", props.translateY)})`,
    )
  }
  if (props.scale !== undefined) {
    transforms.push(`scale(${props.scale})`)
  }
  if (props.scaleX !== undefined) {
    transforms.push(`scaleX(${props.scaleX})`)
  }
  if (props.scaleY !== undefined) {
    transforms.push(`scaleY(${props.scaleY})`)
  }
  if (props.rotate !== undefined) {
    transforms.push(`rotate(${convertToCSSValue("rotate", props.rotate)})`)
  }

  return transforms.join(" ")
}

// Convert Moti-style props to CSS styles
const convertToCSS = (props: Record<string, any>): React.CSSProperties => {
  const cssProps: React.CSSProperties = {}
  const transformKeys = [
    "translateX",
    "translateY",
    "scale",
    "scaleX",
    "scaleY",
    "rotate",
  ]

  Object.entries(props).forEach(([key, value]) => {
    if (transformKeys.includes(key)) {
      return // Handle in transform
    }
    // Direct assignment for CSS properties
    ;(cssProps as any)[key] = value
  })

  const transform = buildTransform(props)
  if (transform) {
    cssProps.transform = transform
  }

  return cssProps
}

export const MotiView = React.forwardRef<HTMLDivElement, MotiViewProps>(
  (
    {
      from,
      animate: animateTo,
      transition = {},
      style,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const [isAnimating, setIsAnimating] = useState(false)
    const { duration = 300, delay = 0 } = transition

    // Compute initial styles from "from" prop
    const initialStyles = useMemo(() => {
      if (!from) return style

      const fromStyles = convertToCSS(from)
      return { ...fromStyles, ...style }
    }, [from, style])

    // Compute target styles from "animate" prop
    const targetStyles = useMemo(() => {
      if (!animateTo) return style

      const toStyles = convertToCSS(animateTo)
      return { ...toStyles, ...style }
    }, [animateTo, style])

    // Trigger animation after mount
    useEffect(() => {
      const timer = setTimeout(() => {
        setIsAnimating(true)
      }, 10) // Small delay to ensure initial render completes

      return () => clearTimeout(timer)
    }, [])

    // Compute current styles based on animation state
    const currentStyles = useMemo(() => {
      const baseStyles = isAnimating ? targetStyles : initialStyles

      return {
        ...baseStyles,
        transition: isAnimating
          ? `all ${duration}ms ease-out ${delay}ms`
          : "none",
      }
    }, [isAnimating, initialStyles, targetStyles, duration, delay])

    return (
      <div ref={ref} style={currentStyles} className={className} {...props}>
        {children}
      </div>
    )
  },
)

MotiView.displayName = "MotiView"
