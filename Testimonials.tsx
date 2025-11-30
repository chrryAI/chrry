"use client"

import React from "react"
import { ChartColumnBig, Quote } from "./icons"
import { useTranslation } from "react-i18next"
import { Div, Span, useTheme } from "./platform"
import { useTestimonialsStyles } from "./Testimonials.styles"

const Testimonials = ({ style }: { style?: React.CSSProperties }) => {
  const { isDark } = useTheme()
  const { t } = useTranslation()

  const styles = useTestimonialsStyles()
  return (
    <section data-testid="testimonials" style={styles.testimonials.style}>
      <Div>
        {[
          {
            quote:
              "Focus helped me finally build a daily focus habit. The mood tracker is a bonus!",
            author: "— Alex P.",
            emoji: "☺️",
          },
          {
            quote:
              "I love how simple and effective Focus is. My productivity has doubled.",
            author: "— Maria L.",
            emoji: "🚀",
          },
          {
            quote:
              "The reports make it easy to spot patterns in my work and mood. Highly recommended!",
            author: "— Jordan S.",
            emoji: <ChartColumnBig width={15} height={22} />,
          },
        ].map((item, i) => (
          <Div key={item.author} style={styles.testimonial.style}>
            <Span>
              <Quote
                size={22}
                strokeWidth={1.25}
                fill={isDark ? "var(--shade-1)" : "var(--shade-1)"}
                style={{
                  position: "absolute",
                  top: "-7px",
                  right: "-7px",
                  color: isDark ? "var(--shade-4)" : "var(--shade-3)",
                  backdropFilter: "blur(15px)",
                }}
              />
              {t(item.quote)}
            </Span>
            <Span> {item.emoji}</Span>
            <Div style={styles.author}>{item.author}</Div>
          </Div>
        ))}
      </Div>
    </section>
  )
}

export default Testimonials
