"use client"

import { type CSSProperties, memo, useEffect, useState } from "react"
import A from "./a/A"
import { useAuth } from "./context/providers"
import { useStyles } from "./context/StylesContext"
import { useTimerContext } from "./context/TimerContext"
import { useHasHydrated } from "./hooks"
import Img from "./Image"
import { Span, usePlatform } from "./platform"

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
