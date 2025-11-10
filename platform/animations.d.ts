/**
 * Type declarations for platform-specific animations
 * Bundler will resolve to .web.ts or .native.ts automatically
 */

export declare const toRem: (value: number) => string

export declare const useReducedMotion: () => boolean | null

export declare const animationConfigs: {
  fast: { duration: number }
  normal: { duration: number }
  slow: { duration: number }
  spring: { tension: number; friction: number }
}

export declare const fadeInConfig: (reduceMotion: boolean) => {
  from: { opacity: number }
  to: { opacity: number }
  immediate: boolean
  config: { duration: number }
}

export declare const slideInConfig: (
  reduceMotion: boolean,
  distance?: number,
) => {
  from: { opacity: number; transform: string }
  to: { opacity: number; transform: string }
  immediate: boolean
  config: { duration: number }
}

export declare const scaleConfig: (reduceMotion: boolean) => {
  from: { scale: number }
  to: { scale: number }
  immediate: boolean
  config: { duration: number }
}
