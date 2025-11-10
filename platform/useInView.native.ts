/**
 * Native implementation of useInView
 * Always returns inView=true (images load immediately on native)
 *
 * You can enhance this with react-native-intersection-observer if needed
 */

export const useInView = (options?: {
  triggerOnce?: boolean
  threshold?: number
  rootMargin?: string
}) => {
  // On native, always return inView=true
  // Images load immediately without lazy loading
  return {
    ref: () => {},
    inView: true,
    entry: undefined,
  }
}
