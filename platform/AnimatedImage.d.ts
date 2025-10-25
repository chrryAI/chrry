/**
 * Type declarations for platform-specific AnimatedImage
 * Bundler will resolve to .web.tsx or .native.tsx automatically
 */

import * as React from "react"
import type { AnimationPreset } from "./animations"

export interface AnimatedImageProps {
  src: string
  alt?: string
  className?: string
  style?: React.CSSProperties | any
  isLoaded: boolean
  reduceMotion: boolean | null
  onLoad?: () => void
  dataTestId?: string
  animation?: AnimationPreset
}

export declare function AnimatedImage(
  props: AnimatedImageProps,
): React.ReactElement
