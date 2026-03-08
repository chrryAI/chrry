/**
 * Web implementation of useInView
 * Uses react-intersection-observer for lazy loading
 */

import { useInView as useInViewWeb } from "react-intersection-observer"

export const useInView = (options?: {
  triggerOnce?: boolean
  threshold?: number
  rootMargin?: string
  skip?: boolean
}) => {
  return useInViewWeb({
    triggerOnce: options?.triggerOnce ?? true,
    threshold: options?.threshold ?? 0,
    rootMargin: options?.rootMargin,
    skip: options?.skip,
  })
}
