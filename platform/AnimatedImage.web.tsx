/**
 * Web animated image using React Spring
 */

import React from "react"
import { useSpring, animated } from "@react-spring/web"
import { AnimationPreset, getAnimationConfig } from "./animations"

interface AnimatedImageProps {
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  isLoaded: boolean
  reduceMotion: boolean | null
  onLoad?: () => void
  dataTestId?: string
  animation?: AnimationPreset
}

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
  const animationStyle = useSpring(
    getAnimationConfig(animation, isLoaded, reduceMotion),
  )

  return (
    <animated.img
      data-testid={dataTestId}
      className={className}
      src={src}
      alt={alt}
      onLoad={onLoad}
      style={{
        ...style,
        ...animationStyle,
      }}
    />
  )
}
