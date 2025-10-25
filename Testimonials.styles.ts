/**
 * Generated from Testimonials.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const TestimonialsStyleDefs = {
  testimonial: {
    marginBottom: 10,
    position: "relative",
  },
  author: {
    color: "var(--shade-5)",
    fontSize: 12,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const TestimonialsStyles = createUnifiedStyles(TestimonialsStyleDefs)

// Type for the hook return value
type TestimonialsStylesHook = {
  [K in keyof typeof TestimonialsStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useTestimonialsStyles =
  createStyleHook<TestimonialsStylesHook>(TestimonialsStyles)
