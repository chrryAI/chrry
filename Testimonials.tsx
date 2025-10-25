"use client"

import React from "react"
import styles from "./Testimonials.module.scss"
import { useTheme } from "next-themes"
import { Quote, ChartColumnBig } from "./icons"
import clsx from "clsx"
import { useTranslation } from "react-i18next"

const Testimonials = ({ className }: { className?: string }) => {
  const { resolvedTheme } = useTheme()
  const { t } = useTranslation()
  return (
    <section
      data-testid="testimonials"
      className={clsx(styles.testimonials, className)}
    >
      <h3 style={{ marginBottom: 10, marginTop: 0 }}>🥰 {t("Testimonials")}</h3>
      <ul>
        {[
          {
            quote: t("vex_cost_transparency"),
            author: "— Sarah M.",
            emoji: "💰",
          },
          {
            quote: t("thread_collaboration"),
            author: "— David K.",
            emoji: "🤝",
          },
          {
            quote: t("smart_title_generation"),
            author: "— Emma R.",
            emoji: "⭐",
          },
        ].map((item, i) => (
          <li key={i} className={styles.testimonial}>
            <span className={styles.quote}>{t(item.quote)}</span>
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
