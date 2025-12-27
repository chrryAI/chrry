/**
 * Type declarations for platform-specific useInView
 * Bundler will resolve to .web.ts or .native.ts automatically
 */

export declare const useInView: (options?: {
  triggerOnce?: boolean
  threshold?: number
  rootMargin?: string
}) => {
  ref: any
  inView: boolean
  entry: any
}
