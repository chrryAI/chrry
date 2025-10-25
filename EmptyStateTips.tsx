"use client"

import React from "react"
import { useAppContext } from "./context/AppContext"
import styles from "./EmptyStateTips.module.scss"
import clsx from "clsx"
import { useApp } from "./context/providers"

export default function EmptyStateTips({ className }: { className?: string }) {
  const { slug, isManagingApp, canEditApp } = useApp()

  const { t } = useAppContext()

  const getTitle = () => {
    if (isManagingApp || canEditApp) {
      return `✨ ${t("App Builder Tips")}`
    }
    return `🎯 ${t("Pro Tips")}`
  }

  // Show app builder tips when managing or editing an app
  if (isManagingApp || canEditApp) {
    const builderTips = [
      {
        tip: t(
          "Give your app a clear, memorable name. Think about what makes it unique and valuable to users.",
        ),
        emoji: "✨",
      },
      {
        tip: t(
          "Write a compelling description. Explain what your app does and who it's for in simple terms.",
        ),
        emoji: "📝",
      },
      {
        tip: t(
          "Add custom highlights to showcase your app's best features. These appear on the home screen!",
        ),
        emoji: "💡",
      },
      {
        tip: t(
          "Choose the right AI model for your use case. Claude for reasoning, DeepSeek for speed, GPT for creativity.",
        ),
        emoji: "🤖",
      },
      {
        tip: t(
          "Enable only the capabilities you need. This keeps your app focused and easy to use.",
        ),
        emoji: "⚙️",
      },
      {
        tip: t(
          "A good system prompt is the secret to a great app. Be specific about tone, style, and behavior.",
        ),
        emoji: "🎯",
      },
    ]

    return (
      <section className={clsx(styles.emptyStateTips, className)}>
        <h3 style={{ marginBottom: 10, marginTop: 0 }}>{getTitle()}</h3>
        <ul>
          {builderTips.map((item, i) => (
            <li key={i} className={styles.tip}>
              <span className={styles.tipText}>{item.tip}</span>
              <span> {item.emoji}</span>
            </li>
          ))}
        </ul>
      </section>
    )
  }

  const tips = {
    Atlas: [
      {
        tip: t(
          "Ask about visa requirements for any country. I'll check the latest rules and entry requirements instantly!",
        ),
        emoji: "🗺️",
      },
      {
        tip: t(
          "Flight prices change constantly. I can compare airlines and find the best deals for your dates.",
        ),
        emoji: "💰",
      },
      {
        tip: t(
          "The best neighborhoods aren't in guidebooks. I know where locals actually eat and hang out.",
        ),
        emoji: "🏨",
      },
      {
        tip: t(
          "A smart itinerary saves hours. I'll plan your days to maximize time and minimize travel.",
        ),
        emoji: "📅",
      },
      {
        tip: t(
          "Skip the tourist traps. I can recommend authentic spots that don't make it to Instagram.",
        ),
        emoji: "🌍",
      },
    ],
    Bloom: [
      {
        tip: t(
          "Custom workout routines that match your fitness level. No gym? No problem - I'll design home workouts!",
        ),
        emoji: "💪",
      },
      {
        tip: t(
          "Healthy meal plans with recipes you'll actually enjoy. Tell me your diet preferences and I'll plan your week.",
        ),
        emoji: "🥗",
      },
      {
        tip: t(
          "Track calories and exercise in one place. I'll help you monitor progress and stay motivated!",
        ),
        emoji: "📊",
      },
      {
        tip: t(
          "Calculate your carbon footprint and get practical tips. Small changes make a big environmental impact!",
        ),
        emoji: "🌍",
      },
      {
        tip: t(
          "Meditation and wellness routines that actually stick. Just 10 minutes daily can reduce stress by 40%!",
        ),
        emoji: "🧘",
      },
    ],
    Peach: [
      {
        tip: t(
          "Find like-minded people nearby who share your interests. Shared hobbies create the strongest friendships!",
        ),
        emoji: "👥",
      },
      {
        tip: t(
          "Plan team building events or casual hangouts. I'll suggest creative group activities everyone will love!",
        ),
        emoji: "🎉",
      },
      {
        tip: t(
          "Get social skills advice for any situation. First impressions matter - I'll help you nail them!",
        ),
        emoji: "💬",
      },
      {
        tip: t(
          "Build genuine connections through shared activities. I can match you with people who get you!",
        ),
        emoji: "🤝",
      },
      {
        tip: t(
          "Organize meetups, brunches, or game nights. Regular gatherings reduce stress and boost happiness!",
        ),
        emoji: "📅",
      },
    ],
    Vault: [
      {
        tip: t(
          "Track your spending and see where money goes. People who track save 20% more on average!",
        ),
        emoji: "📊",
      },
      {
        tip: t(
          "Create a budget that actually works for your lifestyle. The 50/30/20 rule helps 80% reach their goals!",
        ),
        emoji: "💵",
      },
      {
        tip: t(
          "Learn investment strategies from beginner to advanced. Starting early can grow wealth by 10x!",
        ),
        emoji: "📈",
      },
      {
        tip: t(
          "Find practical ways to save without sacrificing quality. Small changes add up to $1,200+ per year!",
        ),
        emoji: "💳",
      },
      {
        tip: t(
          "Set realistic financial goals with a step-by-step plan. Written goals are 42% more likely to happen!",
        ),
        emoji: "🎯",
      },
    ],
    default: [
      {
        tip: t(
          "AI remembers your preferences across all conversations. Tell me once, and I'll remember forever!",
        ),
        emoji: "🧠",
      },
      {
        tip: t(
          "Create custom instructions for any situation. Make AI behave exactly how you want it to!",
        ),
        emoji: "⚙️",
      },
      {
        tip: t(
          "Enable web search for real-time information. Get current news, prices, and data that changes daily!",
        ),
        emoji: "🔍",
      },
      {
        tip: t(
          "Bookmark important threads for instant access. Never lose track of your best conversations!",
        ),
        emoji: "⭐️",
      },
      {
        tip: t(
          "Share threads and collaborate in real-time. Work together with friends or colleagues seamlessly!",
        ),
        emoji: "🤝",
      },
    ],
  }

  const currentTips = slug
    ? tips[slug as keyof typeof tips] || tips.default
    : tips.default

  const getAppTitle = () => {
    if (slug === "Atlas") return "✈️ " + t("Travel Tips")
    if (slug === "Bloom") return "🌸 " + t("Wellness Tips")
    if (slug === "Peach") return "🍑 " + t("Social Tips")
    if (slug === "Vault") return "💰 " + t("Finance Tips")
    return "🎯 " + t("Pro Tips")
  }

  return (
    <section className={clsx(styles.emptyStateTips, className)}>
      <h3 style={{ marginBottom: 10, marginTop: 0 }}>{getAppTitle()}</h3>
      <ul>
        {currentTips.map((item, i) => (
          <li key={i} className={styles.tip}>
            <span className={styles.tipText}>{item.tip}</span>
            <span> {item.emoji}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
