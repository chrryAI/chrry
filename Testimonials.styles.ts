/**
 * Generated from Testimonials.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const TestimonialsStyleDefs = {
  testimonials: {
    marginTop: 15,
    padding: 0,
    margin: 0,
  },
  testimonial: {
    marginBottom: 10,
    backgroundColor: "var(--shade-1)",
    border: "1px solid var(--shade-2)",
    padding: 15,
    borderRadius: 20,
    position: "relative",
  },
  author: {
    color: "var(--shade-5)",
    fontSize: 14,
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
