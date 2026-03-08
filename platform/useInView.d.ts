/**
 * Type declarations for platform-specific useInView
 * Bundler will automatically resolve to .web.ts or .native.ts
 */

export declare const useInView: (options?: {
  triggerOnce?: boolean
  threshold?: number
  rootMargin?: string
  skip?: boolean
}) => {
  ref: any
  inView: boolean
  entry: any
}
