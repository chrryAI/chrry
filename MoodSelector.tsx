"use client"

import React, { useEffect, useRef, useState } from "react"
import styles from "./MoodSelector.module.scss"
import clsx from "clsx"
import { PiHandTap } from "react-icons/pi"
import { MousePointerClick } from "lucide-react"
import { useTranslation } from "react-i18next"
import { emojiMap, moodType } from "./types"

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

  return (
    <div
      ref={ref}
      style={style}
      className={clsx(styles.moodSelector, className)}
    >
      <div className={styles.emojiContainer}>
        {mood ? (
          <button
            data-testid="moodify-reset-button"
            style={{
              fontSize: style?.fontSize,
            }}
            className={clsx("link", styles.emoji)}
            onClick={() => {
              setMood(undefined)
            }}
            type="button"
          >
            {emojiMap[mood]}
            {children ? (
              <div className={styles.children}>{children}</div>
            ) : (
              showEdit && <span className={styles.edit}>{t("Edit")}</span>
            )}
          </button>
        ) : (
          <>
            <button
              style={{
                fontSize: style?.fontSize,
              }}
              type="button"
              data-testid="moodify-happy-button"
              className={clsx("link", styles.emoji)}
              onClick={() => setMood("happy")}
            >
              {emojiMap["happy"]}
            </button>
            <button
              style={{
                fontSize: style?.fontSize,
              }}
              type="button"
              data-testid="moodify-sad-button"
              className={clsx("link", styles.emoji)}
              onClick={() => setMood("sad")}
            >
              {emojiMap["sad"]}
            </button>
            <button
              style={{
                fontSize: style?.fontSize,
              }}
              type="button"
              data-testid="moodify-angry-button"
              className={clsx("link", styles.emoji)}
              onClick={() => setMood("angry")}
            >
              {emojiMap["angry"]}
            </button>
            <button
              style={{
                fontSize: style?.fontSize,
              }}
              type="button"
              data-testid="moodify-astonished-button"
              className={clsx("link", styles.emoji)}
              onClick={() => setMood("astonished")}
            >
              {emojiMap["astonished"]}
            </button>
            <button
              style={{
                fontSize: style?.fontSize,
              }}
              type="button"
              data-testid="moodify-inlove-button"
              className={clsx("link", styles.emoji)}
              onClick={() => setMood("inlove")}
            >
              {emojiMap["inlove"]}
            </button>

            <button
              style={{
                fontSize: style?.fontSize,
              }}
              type="button"
              data-testid="moodify-thinking-button"
              className={clsx("link", styles.emoji)}
              onClick={() => setMood("thinking")}
            >
              {showEdit && (
                <>
                  <PiHandTap strokeWidth={1.5} className={styles.mobile} />
                  <MousePointerClick
                    strokeWidth={1.5}
                    className={styles.desktop}
                  />
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
