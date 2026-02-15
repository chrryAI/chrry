"use client"

import React, { useEffect, useState, CSSProperties, memo } from "react"

import { usePlatform } from "./platform"
import Img from "./Image"

import { useHasHydrated } from "./hooks"
import { Span } from "./platform"
import A from "./a/A"
import { useStyles } from "./context/StylesContext"

import { useAuth } from "./context/providers"
import { useTimerContext } from "./context/TimerContext"

function FocusButton({
  style,
  width,
}: {
  width?: number
  style?: CSSProperties
}) {
  const { time, presetMin1 } = useTimerContext()

  const { appStyles } = useStyles()
  const { isExtension, isFirefox, isWeb: _isWeb } = usePlatform()
  const { focus, getAppSlug, setShowFocus, app } = useAuth()

  const hasHydrated = useHasHydrated()

  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    if (time === 0) {
      const interval = setInterval(() => {
        setCurrentTime(new Date())
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [time])

  const formatTime = () => {
    if (time > 0) {
      return `${Math.floor(time / 60)}:${String(time % 60).padStart(2, "0")}`
    } else if (app?.id === focus?.id) {
      return `${presetMin1}"`
    } else {
      const hours = currentTime.getHours()
      const minutes = currentTime.getMinutes()
      return `${hours}:${String(minutes).padStart(2, "0")}`
    }
  }

  if (!focus || !hasHydrated) {
    return null
  }

  return (
    <A
      onClick={() => setShowFocus(true)}
      href={`${getAppSlug(focus)}`}
      openInNewTab={isExtension && isFirefox}
      style={{
        ...appStyles.focus.style,
        ...style,
      }}
    >
      {hasHydrated && (
        <Span style={appStyles.focusTime.style}>{formatTime()}</Span>
      )}
      <Img
        style={appStyles.focus.style}
        logo="focus"
        width={width || 22}
        height={width || 22}
      />
    </A>
  )
}

export default memo(FocusButton)
