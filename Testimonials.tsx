"use client"

import React from "react"
import styles from "./Testimonials.module.scss"
import { ChartColumnBig } from "lucide-react"
import { Quote } from "lucide-react"
import clsx from "clsx"
import { useTranslation } from "react-i18next"
import { useTheme } from "./platform"

const Testimonials = ({ className }: { className?: string }) => {
  const { isDark } = useTheme()
  const { t } = useTranslation()
  return (
    <section
      data-testid="testimonials"
      className={clsx(styles.testimonials, className)}
    >
      <ul>
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
          <li key={i} className={styles.testimonial}>
            <span className={styles.quote}>
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
            </span>
            <span> {item.emoji}</span>
            <br />
            <span className={styles.author}>{item.author}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default Testimonials
