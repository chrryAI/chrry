"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useStyles } from "./context/StylesContext"
import { MousePointerClick } from "./icons"
import { useMoodSelectorStyles } from "./MoodSelector.styles"
import { Button, Div, Span } from "./platform"
import { emojiMap, type moodType } from "./types"

export default function MoodSelector({
  onMoodChange,
  children,
  className,
  style,
  showEdit = true,
  onSelectingMood,
  ...rest
}: {
  showEdit?: boolean
  children?: React.ReactNode
  mood: moodType | undefined
  className?: string
  style?: React.CSSProperties
  onMoodChange: (mood: moodType) => void
  onSelectingMood?: (value: boolean) => void
}) {
  const styles = useMoodSelectorStyles()
  const { utilities } = useStyles()
  const withDefaultMood = rest.mood || "thinking"
  const { t } = useTranslation()
  const [lastMood, setLastMoodInternal] = useState<moodType | undefined>(
    withDefaultMood,
  )

  const setLastMood = (mood: moodType | undefined) => {
    if (mood === "thinking") return
    setLastMoodInternal(mood)
  }

  const [mood, setMoodInternal] = useState<moodType | undefined>(
    withDefaultMood,
  )

  const setMood = (mood: moodType | undefined) => {
    onSelectingMood?.(!mood)
    mood && setLastMood(mood)
    setMoodInternal(mood)
    mood && mood !== lastMood && mood !== "thinking" && onMoodChange(mood)
  }

  useEffect(() => {
    setMoodInternal(withDefaultMood)
    setLastMood(withDefaultMood)
  }, [withDefaultMood])

  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        lastMood && setMood(lastMood)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const btnStyles = {
    ...utilities.link.style,
    ...styles.emoji.style,
    fontSize: style?.fontSize,
  }

  return (
    <Div ref={ref} style={style}>
      <Div style={styles.emojiContainer.style}>
        {mood ? (
          <Button
            data-testid="moodify-reset-button"
            aria-label={t("Change mood")}
            title={t("Change mood")}
            style={{
              ...btnStyles,
            }}
            className="link"
            onClick={() => {
              setMood(undefined)
            }}
            type="button"
          >
            {emojiMap[mood]}
            {children ? (
              <Div style={styles.children.style}>{children}</Div>
            ) : (
              showEdit && <Span style={styles.edit.style}>{t("Edit")}</Span>
            )}
          </Button>
        ) : (
          <>
            <Button
              style={{
                ...btnStyles,
              }}
              type="button"
              data-testid="moodify-happy-button"
              aria-label={t("Happy")}
              title={t("Happy")}
              className="link"
              onClick={() => setMood("happy")}
            >
              {emojiMap.happy}
            </Button>
            <Button
              style={{
                ...btnStyles,
              }}
              type="button"
              data-testid="moodify-sad-button"
              aria-label={t("Sad")}
              title={t("Sad")}
              className="link"
              onClick={() => setMood("sad")}
            >
              {emojiMap.sad}
            </Button>
            <Button
              style={{
                ...utilities.link.style,
                ...styles.emoji.style,
                fontSize: style?.fontSize,
              }}
              type="button"
              data-testid="moodify-angry-button"
              aria-label={t("Angry")}
              title={t("Angry")}
              className="link"
              onClick={() => setMood("angry")}
            >
              {emojiMap.angry}
            </Button>
            <Button
              style={{
                ...btnStyles,
              }}
              type="button"
              data-testid="moodify-astonished-button"
              aria-label={t("Astonished")}
              title={t("Astonished")}
              className="link"
              onClick={() => setMood("astonished")}
            >
              {emojiMap.astonished}
            </Button>
            <Button
              style={{
                ...btnStyles,
              }}
              type="button"
              data-testid="moodify-inlove-button"
              aria-label={t("In love")}
              title={t("In love")}
              className="link"
              onClick={() => setMood("inlove")}
            >
              {emojiMap.inlove}
            </Button>

            <Button
              style={{
                ...btnStyles,
              }}
              type="button"
              data-testid="moodify-thinking-button"
              aria-label={t("Thinking")}
              title={t("Thinking")}
              className="link"
              onClick={() => setMood("thinking")}
            >
              {showEdit && (
                <>
                  <MousePointerClick strokeWidth={1.5} />
                </>
              )}
            </Button>
          </>
        )}
      </Div>
    </Div>
  )
}
