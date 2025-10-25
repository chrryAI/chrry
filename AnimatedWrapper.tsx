import { type ReactNode, useState, useEffect } from "react"
import { useSpring, animated } from "@react-spring/web"
import { useReducedMotion, animationConfigs } from "./platform/animations"
import { useInView } from "./platform/useInView"
import { useNavigationContext } from "./context/providers"

interface AnimatedWrapperProps {
  children: ReactNode
  className?: string
  style?: React.CSSProperties
  animation?:
    | "slideUp"
    | "slideDown"
    | "slideLeft"
    | "slideRight"
    | "fadeIn"
    | "scaleIn"
  delay?: number // in milliseconds
  startVisible?: boolean // Start from opacity 1 instead of 0 to prevent flash
  useViewport?: boolean // Animate when element comes into view (default: true)
  ignoreSplash?: boolean // Skip splash check (for splash screen itself)
}

/**
 * Cross-platform animated wrapper component
 * Uses React Spring for smooth animations that work on web and native
 * Respects reduced motion preferences
 * Animates when element comes into viewport AND splash screen is hidden
 */
export function AnimatedWrapper({
  children,
  className,
  style,
  animation = "slideUp",
  delay = 0,
  startVisible = true, // Default to true to prevent flash
  useViewport = true, // Default to true - animate on viewport entry
  ignoreSplash = false, // Default to false - respect splash state
}: AnimatedWrapperProps) {
  const reduceMotion = useReducedMotion()
  const [shouldAnimate, setShouldAnimate] = useState(false)
  const { isSplash } = useNavigationContext()

  // Use intersection observer to trigger animation when in view
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1, // Trigger when 10% visible
  })

  // Animate when element comes into view AND (splash is hidden OR ignoreSplash is true)
  useEffect(() => {
    const canAnimate = ignoreSplash || !isSplash

    if (useViewport && inView && canAnimate) {
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, delay)
      return () => clearTimeout(timer)
    } else if (!useViewport && canAnimate) {
      // If not using viewport, animate immediately (if splash allows)
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, delay)
      return () => clearTimeout(timer)
    }
  }, [inView, delay, useViewport, isSplash, ignoreSplash])

  // Animation configurations with from/to states
  const getAnimationProps = () => {
    const immediate = reduceMotion || false
    const fromOpacity = startVisible ? 1 : 0

    switch (animation) {
      case "slideUp":
        return {
          opacity: shouldAnimate ? 1 : fromOpacity,
          transform: shouldAnimate ? "translateY(0px)" : "translateY(20px)",
          immediate,
          config: animationConfigs.normal,
        }

      case "slideDown":
        return {
          opacity: shouldAnimate ? 1 : fromOpacity,
          transform: shouldAnimate ? "translateY(0px)" : "translateY(-20px)",
          immediate,
          config: animationConfigs.normal,
        }

      case "slideLeft":
        return {
          opacity: shouldAnimate ? 1 : fromOpacity,
          transform: shouldAnimate ? "translateX(0px)" : "translateX(20px)",
          immediate,
          config: animationConfigs.normal,
        }

      case "slideRight":
        return {
          opacity: shouldAnimate ? 1 : fromOpacity,
          transform: shouldAnimate ? "translateX(0px)" : "translateX(-20px)",
          immediate,
          config: animationConfigs.normal,
        }

      case "fadeIn":
        return {
          opacity: shouldAnimate ? 1 : fromOpacity,
          immediate,
          config: animationConfigs.normal,
        }

      case "scaleIn":
        return {
          opacity: shouldAnimate ? 1 : fromOpacity,
          transform: shouldAnimate ? "scale(1)" : "scale(0.95)",
          immediate,
          config: animationConfigs.fast,
        }

      default:
        return {
          opacity: shouldAnimate ? 1 : fromOpacity,
          immediate,
          config: animationConfigs.normal,
        }
    }
  }

  const animationStyle = useSpring(getAnimationProps())

  return (
    <animated.div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...animationStyle,
      }}
    >
      {children}
    </animated.div>
  )
}
