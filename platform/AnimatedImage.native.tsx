/**
 * Native animated image using React Native Reanimated
 */

import React from "react"
import { Image } from "react-native"
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated"
import type { AnimationPreset } from "./animations"

interface AnimatedImageProps {
  src: string
  alt?: string
  className?: string
  style?: any
  isLoaded: boolean
  reduceMotion: boolean | null
  onLoad?: () => void
  dataTestId?: string
  animation?: AnimationPreset
}

const ReanimatedImage = Animated.createAnimatedComponent(Image)

export function AnimatedImage({
  src,
  alt,
  className,
  style,
  isLoaded,
  reduceMotion,
  onLoad,
  dataTestId,
  animation = "slideUp",
}: AnimatedImageProps) {
  const animatedStyle = useAnimatedStyle(() => {
    const config = reduceMotion
      ? { duration: 0 }
      : { damping: 15, stiffness: 150 }

    switch (animation) {
      case "slideUp":
        return {
          opacity: withTiming(isLoaded ? 1 : 0, { duration: 300 }),
          transform: [
            {
              translateY: withSpring(isLoaded ? 0 : 30, config),
            },
          ],
        }

      case "slideDown":
        return {
          opacity: withTiming(isLoaded ? 1 : 0, { duration: 300 }),
          transform: [
            {
              translateY: withSpring(isLoaded ? 0 : -30, config),
            },
          ],
        }

      case "slideLeft":
        return {
          opacity: withTiming(isLoaded ? 1 : 0, { duration: 300 }),
          transform: [
            {
              translateX: withSpring(isLoaded ? 0 : 30, config),
            },
          ],
        }

      case "slideRight":
        return {
          opacity: withTiming(isLoaded ? 1 : 0, { duration: 300 }),
          transform: [
            {
              translateX: withSpring(isLoaded ? 0 : -30, config),
            },
          ],
        }

      case "scale":
      case "scaleIn":
        return {
          opacity: withTiming(isLoaded ? 1 : 0, { duration: 300 }),
          transform: [
            {
              scale: withSpring(isLoaded ? 1 : 0.5, config),
            },
          ],
        }

      case "pulse":
        return {
          opacity: withTiming(isLoaded ? 1 : 0.5, { duration: 300 }),
          transform: [
            {
              scale: withSpring(isLoaded ? 1 : 0.7, config),
            },
          ],
        }

      case "float":
        return {
          opacity: withTiming(isLoaded ? 1 : 0.8, { duration: 300 }),
          transform: [
            {
              translateY: withSpring(isLoaded ? 0 : -15, config),
            },
          ],
        }

      case "wiggle":
        return {
          opacity: withTiming(isLoaded ? 1 : 0, { duration: 300 }),
          transform: [
            {
              rotate: withSpring(isLoaded ? "0deg" : "-15deg", config),
            },
          ],
        }

      case "fade":
      case "fadeIn":
      default:
        return {
          opacity: withTiming(isLoaded ? 1 : 0, { duration: 300 }),
        }
    }
  }, [isLoaded, animation, reduceMotion])

  return (
    <ReanimatedImage
      testID={dataTestId}
      source={{ uri: src }}
      onLoad={onLoad}
      style={[style, animatedStyle]}
      accessibilityLabel={alt}
    />
  )
}
