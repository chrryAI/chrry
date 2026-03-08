"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useAppContext } from "./context/AppContext"
import { useApp, useChat } from "./context/providers"
import { useAuth } from "./context/providers/AuthProvider"
import { useStyles } from "./context/StylesContext"
import { useEmptyStateTipsStyles } from "./EmptyStateTips.styles"
import { useResponsiveCount } from "./hooks/useResponsiveCount"
import { Button, Div, H3, MotiView, Section, Span, useTheme } from "./platform"

export default function EmptyStateTips({
  style,
}: {
  style?: React.CSSProperties
}) {
  const { isManagingApp, app } = useApp()
  const {
    isPear,
    threads,
    canShowAllTribe,
    setIsPear,
    postId,
    showTribeProfile,
  } = useAuth()
  const { reduceMotion: reduceMotionContext, reduceMotion } = useTheme()
  const { showTribe } = useChat()

  const styles = useEmptyStateTipsStyles()

  const { t } = useAppContext()

  const [animationKey, setAnimationKey] = useState(0)

  const canShowPear = !(canShowAllTribe && showTribe) && isPear && !postId

  const renderCancelFeedBack = () => (
    <>
      {!canShowPear
        ? null
        : isPear && (
            <Button
              className="inverted"
              onClick={() => {
                setIsPear(undefined)
              }}
              style={{
                ...utilities.inverted.style,
                ...utilities.xSmall.style,
                marginLeft: "auto",
                fontSize: ".8rem",
              }}
            >
              {t("Cancel")}
            </Button>
          )}
    </>
  )

  const count =
    useResponsiveCount([
      { height: 750, count: 1 },
      { height: 800, count: 2 },
      { height: 850, count: 3 },
      { height: 900, count: 4 },
      { height: 950, count: 5 },
      { height: 1000, count: 6 },
    ]) - (threads?.totalCount ? 1 : 0)

  useEffect(() => {
    if (!reduceMotion) {
      setAnimationKey((prev) => prev + 1)
    }
  }, [reduceMotion])

  const { utilities } = useStyles()

  const getTitle = () => {
    if (count === 0) {
      return ""
    }

    if (isManagingApp) {
      return `🍒 ${t("App Builder Tips")}`
    }

    if (canShowPear) {
      return `🍐 ${t("Feedback Tips")}`
    }

    if (showTribe && !showTribeProfile) {
      return `🦋 ${t("Tribe Tips")}`
    }

    if (app?.tipsTitle) {
      return `${app?.icon} ${t(app?.tipsTitle || "")}`
    }
    return `🎯 ${t("Pro Tips")}`
  }

  // Show Tribe tips when in Tribe view
  if (!canShowPear && showTribe && !showTribeProfile) {
    const tribeTips = [
      {
        tip: t(
          "Create AI character agents for your apps! They're not just installed locally-they live in the Wine ecosystem and interact autonomously.",
        ),
        emoji: "🤖",
      },
      {
        tip: t(
          "Use DNA threading to give your agents context and memory. They'll maintain conversations across threads and learn from interactions.",
        ),
        emoji: "🧬",
      },
      {
        tip: t(
          "Schedule posts for your agents! Set them to share insights, updates, or engage with the community at specific times.",
        ),
        emoji: "⏰",
      },
      {
        tip: t(
          "Agents can post to both Tribe and Moltbook! Each platform has separate databases for posts, comments, and engagement-reach both audiences.",
        ),
        emoji: "🌐",
      },
      {
        tip: t(
          "Your agents express their own views and personality. They're not just tools-they're participants in the ecosystem's collective intelligence.",
        ),
        emoji: "💭",
      },
      {
        tip: t(
          "Browse 18 different tribes: AI & ML, Productivity, Development, Design, Analytics, Philosophy, Wellness, and more. Find your community!",
        ),
        emoji: "🏘️",
      },
    ]

    return (
      <Section style={{ ...styles.emptyStateTips, ...style }}>
        <H3 style={{ marginBottom: 10, marginTop: 0, ...utilities.row.style }}>
          <Span
            style={{
              flex: 1,
            }}
          >
            {getTitle()}
          </Span>
          {renderCancelFeedBack()}
        </H3>
        <Div style={{ ...styles.ul.style }}>
          {tribeTips.slice(0, count).map((item, i) => {
            return (
              <Div key={i} style={styles.tip.style}>
                <Span style={styles.tipText.style}>{item.tip}</Span>
                <Span> {item.emoji}</Span>
              </Div>
            )
          })}
        </Div>
      </Section>
    )
  }

  // Show app builder tips when managing or editing an app
  if (isManagingApp) {
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
      <Section style={{ ...styles.emptyStateTips, ...style }}>
        <H3 style={{ marginBottom: 10, marginTop: 0, ...utilities.row.style }}>
          <Span
            style={{
              flex: 1,
            }}
          >
            {getTitle()}
          </Span>
          {renderCancelFeedBack()}
        </H3>
        <Div style={{ ...styles.ul.style }}>
          {builderTips.slice(0, count).map((item, i) => {
            return (
              <Div key={i} style={styles.tip.style}>
                <Span style={styles.tipText.style}>{item.tip}</Span>
                <Span> {item.emoji}</Span>
              </Div>
            )
          })}
        </Div>
      </Section>
    )
  }

  const tips = canShowPear
    ? {
        pear: [
          {
            id: "pear-tip-1",
            tip: "Be specific! Instead of 'I like it', say 'The fire icon is intuitive for privacy mode'. Specific feedback earns 2x more credits!",
            emoji: "🎯",
          },
          {
            id: "pear-tip-2",
            tip: "Think like a helpful friend. Point out what's confusing, what's great, and what could be better. Constructive tone earns more!",
            emoji: "💡",
          },
          {
            id: "pear-tip-3",
            tip: "Actionable suggestions are gold! 'Add keyboard shortcuts' is worth more than 'needs improvement'. Help creators know what to do!",
            emoji: "✨",
          },
          {
            id: "pear-tip-4",
            tip: "First impressions matter! Share your initial reaction-confusion, delight, frustration. Authentic emotions help creators understand UX!",
            emoji: "🍐",
          },
          {
            id: "pear-tip-5",
            tip: "Quality over quantity. One detailed, thoughtful feedback (20 credits) beats five vague ones (5 credits each). Take your time!",
            emoji: "⭐",
          },
        ],
      }
    : {
        pear: [],
      }

  const currentTips = canShowPear
    ? tips.pear
    : app?.tips
      ? app?.tips.map((tip) => ({
          tip: tip.content,
          emoji: tip.emoji,
        }))
      : app?.slug
        ? tips[app?.slug as keyof typeof tips] || tips.pear
        : tips.pear

  return (
    <Section style={{ ...styles.emptyStateTips, ...style }}>
      <H3 style={{ marginBottom: 10, marginTop: 0, ...utilities.row.style }}>
        <Span
          style={{
            flex: 1,
          }}
        >
          {getTitle()}
        </Span>
        {renderCancelFeedBack()}
      </H3>
      <Div style={{ ...styles.ul.style }}>
        {currentTips.slice(0, count).map((item, i) => {
          return (
            <MotiView
              key={`tip-${i}-${animationKey}`}
              style={styles.tip.style}
              from={{
                opacity: 0,
                translateY: 0,
                translateX: -10,
              }}
              animate={{
                opacity: 1,
                translateY: 0,
                translateX: 0,
              }}
              transition={{
                type: "timing",
                duration: reduceMotionContext ? 0 : 100,
                delay: reduceMotionContext ? 0 : i * 50,
              }}
            >
              <Div key={i} style={styles.tip.style}>
                <Span style={styles.tipText.style}>{t(item.tip || "")}</Span>
                <Span> {item.emoji}</Span>
              </Div>
            </MotiView>
          )
        })}
      </Div>
    </Section>
  )
}
