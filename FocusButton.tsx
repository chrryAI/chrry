"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { toast } from "react-hot-toast"
import { useTranslation } from "react-i18next"
import { FaDiscord } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"
import sanitizeHtml from "sanitize-html"
import A from "./a/A"
import AddTask from "./addTask/AddTask"
import Checkbox from "./Checkbox"
import ConfirmButton from "./ConfirmButton"
import { useAuth, useChat, useNavigationContext } from "./context/providers"
import { useStyles } from "./context/StylesContext"
import { COLORS, type themeType } from "./context/ThemeContext"
import { useTimerContext } from "./context/TimerContext"
import { useFocusButtonStyles } from "./FocusButton.styles"
import GitHubConnectButton from "./GitHubConnectButton"
import { useHasHydrated } from "./hooks"
import Img from "./Image"
import {
  AlarmClockCheck,
  Bird,
  ChevronDown,
  ChevronUp,
  Circle,
  CircleCheck,
  CirclePause,
  CirclePlay,
  CircleX,
  CloudDownload,
  GripVertical,
  Repeat,
  SettingsIcon,
  Trash2,
} from "./icons"
import Loading from "./Loading"
import {
  Button,
  Div,
  DraggableList,
  Input,
  Main,
  Span,
  useKeepAwake,
  usePlatform,
  useTheme,
  Video,
} from "./platform"
import SwipeableTimeControl from "./SwipeableTimeControl"
import Testimonials from "./Testimonials"
import ThemeSwitcher from "./ThemeSwitcher"
import {
  API_URL,
  apiFetch,
  FRONTEND_URL,
  GUEST_TASKS_COUNT,
  PLUS_TASKS_COUNT,
} from "./utils"
import { getSiteConfig } from "./utils/siteConfig"

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

export type Task = {
  id: string
  title: string
  createdOn: Date
  modifiedOn: Date
  description?: string
  total?: { date: string; count: number }[]
  order: number
  threadId?: string
}

const MAX_TIME = 3600 // 60 minutes in seconds

export default function FocusButton({
  style,
}: {
  style?: React.CSSProperties
}) {
  const { t } = useTranslation()

  const styles = useFocusButtonStyles()
  const { utilities } = useStyles()
  const {
    token,
    plausible: plausibleEvent,
    enableNotifications,
    setEnableNotifications,
    user,
    guest,
    baseApp,
    bloom,
    app,
    getAppSlug,
    storeApps,
    focus,
    setShowFocus,
    showFocus,
    loadingApp,
  } = useAuth()

  const { searchParams, addParams, push, removeParams } = useNavigationContext()

  const hasHydrated = useHasHydrated()

  const { os, isExtension } = usePlatform()

  const { enableSound, setEnableSound } = useTheme()

  useKeepAwake()

  const {
    playKitasaku,
    setPlayKitasaku,
    stopAdjustment,
    startAdjustment,
    isLoadingTasks,
    playBirds,
    setPlayBirds,
    activePomodoro,
    time,
    isCountingDown,
    isPaused,
    isFinished,
    setTime,
    startCountdown,
    fetchTasks,
    handlePresetTime,
    replay,
    setReplay,
    tasks,
    setTasks,
    handleCancel,
    handlePause,
    handleResume,
    presetMin1,
    presetMin2,
    presetMin3,
    setPresetMin1,
    setPresetMin2,
    setPresetMin3,
    selectedTasks,
    setSelectedTasks,
    remoteTimer,
  } = useTimerContext()

  const [isDeletingTask, setIsDeletingTask] = useState(false)

  const isMovingItemRef = useRef(false)
  const { isDark, setTheme: setThemeInContext } = useTheme()
  const {
    setPlaceHolderText,
    placeHolderText,
    setShouldFocus,
    setIsNewAppChat,
  } = useChat()

  const adjustIntervalRef = useRef<number | null>(null)
  const secondsUpButtonRef = useRef<HTMLButtonElement>(null)
  const secondsDownButtonRef = useRef<HTMLButtonElement>(null)
  const minutesUpButtonRef = useRef<HTMLButtonElement>(null)
  const minutesDownButtonRef = useRef<HTMLButtonElement>(null)

  const [originalPlaceHolderText, setOriginalPlaceHolderText] = useState<
    string | undefined
  >(placeHolderText)
  const [isEditingTask, setIsEditingTask] = useState(false)
  const setEditingTask = (task: Task | undefined) => {
    if (task?.threadId) {
      push(`/threads/${task.threadId}`)
    } else if (task?.id) {
      setOriginalPlaceHolderText(placeHolderText)
      setPlaceHolderText(
        `${t(`What did you work on for "{{title}}"? Share your progress...`, {
          title: task.title,
        })} 🌸`,
      )
      setShouldFocus(true)
      addParams({ taskId: task?.id })
      setIsEditingTask(true)
    } else {
      setIsEditingTask(false)
    }
  }

  // Cleanup: Reset placeholder when component unmounts
  useEffect(() => {
    return () => {
      isEditingTask && setPlaceHolderText(originalPlaceHolderText)
    }
  }, [isEditingTask, originalPlaceHolderText])

  const [showSettings, setShowSettings] = useState(false)
  const isMounted = useHasHydrated()

  const [addingTask, setAddingTask] = useState(
    searchParams.get("addTask") === "true",
  )

  useEffect(() => {
    setAddingTask(searchParams.get("addTask") === "true")
  }, [searchParams.get("addTask")])

  useEffect(() => {
    if (showSettings) {
      plausibleEvent({ name: "settings" })
    }
  }, [showSettings])

  const _setTheme = (theme: themeType) => {
    setThemeInContext(theme)
    theme === "dark"
      ? plausibleEvent({ name: "dark_mode" })
      : plausibleEvent({ name: "light_mode" })
  }

  useEffect(() => {
    document.title = `${Math.floor(time / 60)
      .toString()
      .padStart(
        2,
        "0",
      )}:${(time % 60).toString().padStart(2, "0")} - FocusButton`
  }, [time])

  const handleClick = () => {
    if (adjustIntervalRef.current) {
      return
    }

    if (!isCountingDown && time > 0) {
      startCountdown()
    } else if (isCountingDown && !isPaused) {
      handlePause()
    } else if (isPaused) {
      handleResume()
    }
  }

  // Set mounted state

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keys if input is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return
      }

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault()
          secondsUpButtonRef.current?.focus()
          {
            const newTime = Math.min(time + 1, MAX_TIME)
            setTime(newTime)
            startCountdown(newTime)
          }
          break

        case "ArrowDown":
          event.preventDefault()
          secondsDownButtonRef.current?.focus()
          {
            const newTime = Math.max(time - 1, 0)
            setTime(newTime)
            startCountdown(newTime)
          }
          break

        case " ":
        case "Enter":
          event.preventDefault()
          if (time > 0) {
            if (!isCountingDown || isPaused) {
              const currentTime = time
              startCountdown(currentTime)
            } else {
              handlePause()
            }
          }
          break

        case "Escape":
          if (isCountingDown) {
            handleCancel()
          }
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    time,
    isCountingDown,
    isPaused,
    isExtension,
    startCountdown,
    handlePause,
    handleCancel,
  ])

  useEffect(() => {
    if (!tasks && isMounted) {
      fetchTasks()
    }
  }, [tasks, isMounted])

  const updateTask = async ({
    task,
    reorder,
    total,
  }: {
    task: Task
    reorder?: boolean
    total?: { date: string; count: number }[]
  }) => {
    if (!token) return

    try {
      const url = `${API_URL}/tasks/${task.id}?reorder=${reorder}`
      const response = await apiFetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...task, total, reorder }),
      })
      const data = await response.json()
      return data
    } catch (error) {
      console.error(new Error("Error updating task:"), error)
      throw error
    }
  }

  const videoRef = useRef<HTMLVideoElement>(null)

  if (!hasHydrated) {
    return
  }

  if (showSettings) {
    return (
      <Div data-testid="focus-mode" style={styles.settingsContainer.style}>
        <Div>
          <Button
            data-testid="close-settings-button"
            style={styles.closeSettingsButton.style}
            aria-label={t("Close settings")}
            onClick={() => setShowSettings(false)}
          >
            <CircleX width={18} height={18} /> {t("Settings")}
          </Button>
        </Div>
        <Div style={styles.settings.style}>
          <Span style={styles.settingsSpan.style}>
            <Input
              data-testid="preset-min-1-input"
              type="number"
              min="0"
              max="60"
              placeholder="Minutes"
              value={String(presetMin1)}
              onChange={(e) => {
                setPresetMin1(Number(e.target.value))
              }}
            />
            {t("min")}
          </Span>
          <Span style={styles.settingsSpan.style}>
            <Input
              data-testid="preset-min-2-input"
              type="number"
              min="0"
              max="60"
              placeholder="Minutes"
              value={String(presetMin2)}
              onChange={(e) => {
                setPresetMin2(Number(e.target.value))
              }}
            />
            {t("min")}
          </Span>
          <Span style={styles.settingsSpan.style}>
            <Input
              data-testid="preset-min-3-input"
              type="number"
              min="0"
              max="60"
              placeholder="Minutes"
              value={String(presetMin3)}
              onChange={(e) => {
                setPresetMin3(Number(e.target.value))
              }}
            />
            {t("min")}
          </Span>
        </Div>
        <Div style={styles.additionalSettings.style}>
          <Checkbox
            checked={enableNotifications}
            onChange={(e) => setEnableNotifications(e)}
          >
            {t("Notifications")}
          </Checkbox>
          <Checkbox checked={enableSound} onChange={(e) => setEnableSound(e)}>
            {t("Sound")}
          </Checkbox>
          <GitHubConnectButton
            variant="small"
            size={14}
            buttonText="Connect GitHub"
          />
        </Div>
        <Div style={styles.settingsFooter.style}>
          <A
            style={styles.discord.style}
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/6NUvNSzs"
          >
            <FaDiscord size={16} /> Discord
          </A>
          ,{" "}
          <A
            style={styles.x.style}
            target="_blank"
            rel="noopener noreferrer"
            href="https://x.com/focusbuttonai"
          >
            <FaXTwitter size={12} />
          </A>{" "}
          , <Span>v{getSiteConfig("focus").version}</Span>
        </Div>
      </Div>
    )
  }

  const showControls = time > 0

  return (
    <Div style={style}>
      <Main style={styles.main.style}>
        <Div data-testid="pomodoro" style={styles.pomodoro.style}>
          <Button
            data-testid="preset-1"
            data-preset-min-1={presetMin1}
            className={"transparent"}
            style={{
              ...utilities.transparent.style,
              ...styles.timeAdjust.style,
              ...(activePomodoro === presetMin1
                ? isCountingDown && !isPaused
                  ? styles.active.style
                  : time !== 0 && styles.focusButtonPaused.style
                : {}),
            }}
            onClick={() => {
              handlePresetTime(presetMin1)
            }}
          >
            {presetMin1}
            {t("min")}
          </Button>
          <Button
            data-preset-min-2={presetMin2}
            data-testid="preset-2"
            className="transparent"
            style={{
              ...utilities.transparent.style,
              ...styles.timeAdjust.style,
              ...(activePomodoro === presetMin2
                ? isCountingDown && !isPaused
                  ? styles.active.style
                  : time !== 0 && styles.focusButtonPaused.style
                : {}),
            }}
            onClick={() => {
              handlePresetTime(presetMin2)
            }}
          >
            {presetMin2}
            {t("min")}
          </Button>
          <Button
            data-preset-min-3={presetMin3}
            data-testid="preset-3"
            className={"transparent"}
            style={{
              ...utilities.transparent.style,
              ...utilities.link.style,
              ...styles.timeAdjust.style,
              ...(activePomodoro === presetMin3
                ? isCountingDown && !isPaused
                  ? styles.active.style
                  : time !== 0 && styles.focusButtonPaused.style
                : {}),
            }}
            onClick={() => {
              handlePresetTime(presetMin3)
            }}
          >
            {presetMin3}
            {t("min")}
          </Button>
        </Div>
        <Span
          onClick={() => {
            if (videoRef.current && os === "ios") {
              !playKitasaku
                ? videoRef.current.play().catch((error: any) => {
                    console.error(error)
                  })
                : videoRef.current.pause()
            }
            setPlayKitasaku(!playKitasaku)
          }}
          style={styles.greeting.style}
        >
          <>
            <Span
              style={{
                cursor: "pointer",
                color: !user ? "var(--accent-6)" : undefined,
              }}
            >
              {t("Let’s focus")}
            </Span>
            <Div
              className="letsFocusContainer"
              style={styles.letsFocusContainer.style}
            >
              {user?.name ? (
                <Span style={styles.userName.style}>
                  {user.name.split(" ")[0]}
                </Span>
              ) : (
                ""
              )}
              <Div style={styles.videoContainer.style} title="Kitasaku">
                {!playKitasaku ? (
                  <CirclePlay
                    className="videoPlay"
                    style={styles.videoPlay.style}
                    color="var(--shade-5)"
                    size={16}
                  />
                ) : (
                  <CirclePause
                    className="videoPause"
                    style={styles.videoPause.style}
                    color="var(--shade-5)"
                    size={16}
                  />
                )}

                <Video
                  // ref={videoRef}
                  style={styles.video.style}
                  src={`${FRONTEND_URL}/video/blob.mp4`}
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              </Div>
            </Div>
          </>
        </Span>
        <Div
          className="slideUp"
          data-testid="focusbutton"
          style={{
            ...styles.focusButton.style,
            ...(isMounted ? styles.focusButtonMounted.style : {}),
            ...(isCountingDown ? styles.focusButtonCounting.style : {}),
            ...(isPaused ? styles.focusButtonPaused.style : {}),
            ...(isFinished ? styles.focusButtonFinished.style : {}),
          }}
        >
          <Div style={styles.headerContainer.style}>
            <Button
              data-testid="settings-button"
              title={t("Settings")}
              aria-label={t("Settings")}
              className="link"
              style={{ ...utilities.link.style, ...styles.showSettings.style }}
              onClick={() => setShowSettings(true)}
            >
              <SettingsIcon size={22} />
            </Button>
            <Button
              className="link"
              title={t("Replay")}
              aria-label={t("Replay")}
              aria-pressed={replay}
              style={{
                ...utilities.link.style,
                ...styles.showSettings.style,
                ...(replay ? styles.active.style : {}),
              }}
              onClick={() => setReplay(!replay)}
            >
              <Repeat size={22} />
            </Button>
          </Div>

          <Div
            data-time={time}
            data-testid="time"
            style={styles.timeDisplay.style}
          >
            <Div style={styles.time.style}>
              <SwipeableTimeControl
                style={{ userSelect: "none" }}
                value={Math.floor(time / 60)}
                onValueChange={(newMinutes) => {
                  const newTime = Math.min(
                    newMinutes * 60 + (time % 60),
                    MAX_TIME,
                  )
                  setTime(newTime)
                }}
                Up={
                  <Button
                    className="ghost"
                    ref={minutesUpButtonRef}
                    style={{ ...styles.timeAdjust.style }}
                    aria-label={t("Increase minutes")}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      if (e.pointerType === "mouse" && e.buttons !== 1) return
                      startAdjustment(1, true)
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation()
                      stopAdjustment()
                    }}
                    onPointerLeave={(e) => {
                      e.stopPropagation()
                      if (adjustIntervalRef.current) stopAdjustment()
                    }}
                    onClick={(e) => {
                      // Handle keyboard activation (Enter/Space)
                      if (e.detail === 0) {
                        e.stopPropagation()
                        startAdjustment(1, true)
                        stopAdjustment()
                      }
                    }}
                  >
                    <ChevronUp size={18} />
                  </Button>
                }
                Down={
                  <Button
                    className="ghost"
                    ref={minutesDownButtonRef}
                    style={{ ...styles.timeAdjust.style }}
                    aria-label={t("Decrease minutes")}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      if (e.pointerType === "mouse" && e.buttons !== 1) return
                      startAdjustment(-1, true)
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation()
                      stopAdjustment()
                    }}
                    onPointerLeave={(e) => {
                      e.stopPropagation()
                      if (adjustIntervalRef.current) stopAdjustment()
                    }}
                    onClick={(e) => {
                      // Handle keyboard activation (Enter/Space)
                      if (e.detail === 0) {
                        e.stopPropagation()
                        startAdjustment(-1, true)
                        stopAdjustment()
                      }
                    }}
                  >
                    <ChevronDown size={18} />
                  </Button>
                }
                time={time}
              />
              <Span style={styles.separator.style}>:</Span>
              <SwipeableTimeControl
                Up={
                  <Button
                    className="ghost"
                    ref={secondsUpButtonRef}
                    style={styles.timeAdjust.style}
                    aria-label={t("Increase seconds")}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      if (e.pointerType === "mouse" && e.buttons !== 1) return
                      startAdjustment(1, false)
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation()
                      stopAdjustment()
                    }}
                    onPointerLeave={(e) => {
                      e.stopPropagation()
                      if (adjustIntervalRef.current) stopAdjustment()
                    }}
                    onClick={(e) => {
                      // Handle keyboard activation (Enter/Space)
                      if (e.detail === 0) {
                        e.stopPropagation()
                        startAdjustment(1, false)
                        stopAdjustment()
                      }
                    }}
                  >
                    <ChevronUp size={18} />
                  </Button>
                }
                isMinute={false}
                Down={
                  <Button
                    className="ghost"
                    ref={secondsDownButtonRef}
                    style={styles.timeAdjust.style}
                    aria-label={t("Decrease seconds")}
                    onPointerDown={(e) => {
                      e.stopPropagation()
                      if (e.pointerType === "mouse" && e.buttons !== 1) return
                      startAdjustment(-1, false)
                    }}
                    onPointerUp={(e) => {
                      e.stopPropagation()
                      stopAdjustment()
                    }}
                    onPointerLeave={(e) => {
                      e.stopPropagation()
                      if (adjustIntervalRef.current) stopAdjustment()
                    }}
                    onClick={(e) => {
                      // Handle keyboard activation (Enter/Space)
                      if (e.detail === 0) {
                        e.stopPropagation()
                        startAdjustment(-1, false)
                        stopAdjustment()
                      }
                    }}
                  >
                    <ChevronDown size={18} />
                  </Button>
                }
                value={time % 60}
                onValueChange={(newSeconds) => {
                  const newTime = Math.min(
                    Math.floor(time / 60) * 60 + newSeconds,
                    MAX_TIME,
                  )
                  setTime(newTime)
                }}
                time={time}
              />
            </Div>
          </Div>
          <Div style={styles.footerContainer.style}>
            <ThemeSwitcher size={22} style={{ marginTop: 2.5 }} />
            <Button
              title={playBirds ? t("Pause sound") : t("Play sound")}
              aria-label={playBirds ? t("Pause sound") : t("Play sound")}
              onClick={() => setPlayBirds(!playBirds)}
              className={"link"}
              style={{ ...(playBirds ? styles.active : {}) }}
            >
              <Bird
                color={
                  isCountingDown && playBirds ? "var(--accent-4)" : undefined
                }
                size={22}
              />
            </Button>
          </Div>
        </Div>
        {remoteTimer?.count &&
        remoteTimer?.isCountingDown &&
        !isCountingDown &&
        !isPaused ? (
          <Button
            onClick={() => {
              setTime(remoteTimer.count)
            }}
            title={t("Continue on this device")}
            className="transparent"
            style={{
              fontSize: 12,
              display: "inline-flex",
              alignItems: "center",
              padding: "4px 7px",
              borderWidth: 1.25,
              fontFamily: "var(--font-mono)",
              gap: 5,
              alignContent: "center",
              alignSelf: "center",
              justifyContent: "center",
            }}
          >
            <CloudDownload color="var(--accent-6)" size={18} />
            {formatTime(remoteTimer?.count || 0)}
          </Button>
        ) : null}
        {showControls && (
          <Div style={styles.controls.style}>
            <Button
              className={"transparent"}
              style={{
                ...utilities.transparent.style,
                ...utilities.small.style,
                ...(isPaused || !isCountingDown
                  ? {}
                  : styles.pauseButton.style),
              }}
              data-testid={`focusbutton-${isPaused || !isCountingDown ? "start" : "pause"}-button`}
              onClick={handleClick}
            >
              {isPaused || !isCountingDown ? (
                <>
                  <CirclePlay
                    style={styles.controlIcon.style}
                    color="var(--accent-4)"
                    width={20}
                    height={20}
                  />
                  <Span>{t("Start")}</Span>
                </>
              ) : (
                <>
                  <CirclePause
                    style={styles.controlIcon.style}
                    width={20}
                    height={20}
                  />
                  <Span>{t("Pause")}</Span>
                </>
              )}
            </Button>
            <Button
              className={"transparent"}
              style={{
                ...utilities.transparent.style,
                ...utilities.small.style,
                ...styles.cancelButton.style,
              }}
              data-testid="focusbutton-cancel-button"
              onClick={handleCancel}
            >
              <CircleX
                style={styles.controlIcon.style}
                width={20}
                height={20}
              />
              <Span>{t("Cancel")}</Span>
            </Button>
          </Div>
        )}
      </Main>
      <Div style={styles.taskSection.style}>
        {(() => {
          if (addingTask) {
            return (
              <AddTask
                totalTasksCount={tasks?.tasks?.length || 0}
                onAdd={async () => {
                  await fetchTasks()
                  removeParams("addTask")
                  setAddingTask(false)
                }}
                onCancel={() => {
                  removeParams("addTask")
                  setAddingTask(false)
                }}
              />
            )
          }

          return (
            <>
              {isLoadingTasks ? (
                <Div style={styles.loadingTasks.style}>
                  <Loading />
                </Div>
              ) : (
                <>
                  <Div style={styles.app.style}>
                    <Div data-testid="task-reports" style={styles.top.style}>
                      <Button
                        data-testid="new-task-button"
                        className={"transparent"}
                        style={{
                          ...utilities.transparent.style,
                          ...styles.newTaskButton.style,
                        }}
                        onClick={() => {
                          addParams({ addTask: "true" })
                        }}
                      >
                        <AlarmClockCheck width={16} height={16} />
                        {t("New Task")}
                      </Button>
                      {focus && (
                        <Span
                          className={`${loadingApp?.id === focus?.id ? "glow" : ""}`}
                          style={{
                            "--glow-color":
                              COLORS[focus.themeColor as keyof typeof COLORS],
                          }}
                        >
                          <A
                            className={`button inverted`}
                            style={{
                              ...utilities.button.style,
                              ...utilities.inverted.style,
                              ...utilities.small.style,
                            }}
                            onClick={() => {
                              setShowFocus(false)
                              app?.id === focus?.id
                                ? setShowFocus(false)
                                : setIsNewAppChat({ item: app })
                            }}
                            // href={getAppSlug(refApp)}
                          >
                            {loadingApp?.id !== app?.id ? (
                              <Img size={20} app={app} />
                            ) : (
                              <Loading size={20} />
                            )}
                            {app?.name}
                          </A>
                        </Span>
                      )}
                    </Div>
                  </Div>

                  {tasks?.tasks?.length ? (
                    <>
                      <DraggableList
                        data-testid="tasks"
                        contentContainerStyle={styles.tasks.style}
                        data={tasks.tasks.filter(Boolean)}
                        keyExtractor={(item) => item.id}
                        onDragEnd={async ({ data, from, to }) => {
                          if (from === to) return
                          if (isMovingItemRef.current) return
                          isMovingItemRef.current = true

                          if (isCountingDown && !isPaused) {
                            handlePause()
                          }

                          // Optimistic update
                          setTasks((prevTasks) => {
                            if (!prevTasks) return prevTasks
                            return {
                              ...prevTasks,
                              tasks: data,
                            }
                          })

                          const draggedTask = data[to]
                          if (draggedTask) {
                            await updateTask({
                              task: {
                                ...draggedTask,
                                total: undefined,
                                order: to,
                              },
                              reorder: true,
                            })
                          }

                          isMovingItemRef.current = false
                        }}
                        renderItem={({ item: task, drag, isActive }) => (
                          <Div
                            data-task-title={task.title}
                            data-testid="task"
                            key={task.id}
                            style={{
                              ...styles.task.style,
                              ...(selectedTasks?.some((t) => t.id === task.id)
                                ? {
                                    ...styles.selectedTask.style,
                                    ...(isCountingDown && !isPaused
                                      ? styles.selectedTaskCounting.style
                                      : {}),
                                    ...(isPaused
                                      ? styles.selectedTaskPaused.style
                                      : {}),
                                    ...(isFinished
                                      ? styles.selectedTaskFinished.style
                                      : {}),
                                  }
                                : {}),

                              opacity: isActive ? 0.5 : 1,
                            }}
                          >
                            <Div style={styles.taskContent.style}>
                              <Button
                                className="link"
                                role="checkbox"
                                aria-checked={selectedTasks?.some(
                                  (t) => t.id === task.id,
                                )}
                                aria-pressed={
                                  selectedTasks?.some(
                                    (t) => t.id === task.id,
                                  ) ?? false
                                }
                                onClick={() => {
                                  if (
                                    selectedTasks?.some((t) => t.id === task.id)
                                  ) {
                                    setSelectedTasks(
                                      selectedTasks?.filter(
                                        (t) => t.id !== task.id,
                                      ),
                                    )
                                  } else {
                                    if (
                                      selectedTasks &&
                                      selectedTasks?.length === 3
                                    ) {
                                      toast.error(
                                        t("You can select up to 3 tasks"),
                                      )
                                      return
                                    }
                                    if (time === 0) {
                                      handlePresetTime(presetMin1)
                                    }
                                    setSelectedTasks(
                                      selectedTasks
                                        ? [...selectedTasks, task]
                                        : [task],
                                    )
                                  }
                                }}
                                style={{
                                  ...styles.taskTitle.style,
                                  cursor: "pointer",
                                  background: "transparent",
                                  border: "none",
                                  textAlign: "left",
                                  width: "100%",
                                  fontFamily: "inherit",
                                  fontSize: "inherit",
                                  color: "inherit",
                                }}
                              >
                                {selectedTasks?.some(
                                  (t) => t.id === task.id,
                                ) ? (
                                  <Span
                                    style={styles.taskSelected.style}
                                    data-testid="task-selected"
                                  >
                                    <CircleCheck
                                      width={16}
                                      height={16}
                                      color={
                                        isCountingDown
                                          ? "var(--accent-4)"
                                          : isPaused
                                            ? "var(--accent-1)"
                                            : undefined
                                      }
                                    />
                                  </Span>
                                ) : (
                                  <Span
                                    style={styles.taskNotSelected.style}
                                    data-testid="task-not-selected"
                                  >
                                    <Circle width={16} height={16} />
                                  </Span>
                                )}

                                {(() => {
                                  const totalTime = task.total?.reduce?.(
                                    (total, item) => total + item.count,
                                    0,
                                  )

                                  return (
                                    <>
                                      <Span
                                        task-time={totalTime}
                                        data-testid="task-title"
                                      >
                                        {sanitizeHtml(task.title)}
                                      </Span>
                                      {totalTime && totalTime > 0 ? (
                                        <Span style={styles.taskTime.style}>
                                          {Math.floor(totalTime / 3600) > 0 && (
                                            <>
                                              {Math.floor(totalTime / 3600)}h{" "}
                                            </>
                                          )}
                                          {Math.floor((totalTime % 3600) / 60) >
                                            0 && (
                                            <>
                                              {Math.floor(
                                                (totalTime % 3600) / 60,
                                              )}
                                              m{" "}
                                            </>
                                          )}
                                          {Math.floor(totalTime % 60)}s
                                        </Span>
                                      ) : null}
                                    </>
                                  )
                                })()}
                              </Button>

                              <Div
                                onPointerDown={(e) => {
                                  // Call drag FIRST - dnd-kit needs the unprevented event
                                  drag(e)

                                  // THEN prevent default to stop scroll interference on the handle
                                  // (dnd-kit will have already captured the event by now)
                                  e.preventDefault()
                                }}
                                title={t("Drag to reorder")}
                                aria-label={t("Drag to reorder")}
                                style={{
                                  ...styles.dragHandle.style,
                                  touchAction: "none",
                                  cursor: "grab",
                                  // Increase touch target size for better mobile UX
                                  padding: "8px",
                                  margin: "-8px",
                                }}
                              >
                                <GripVertical width={22} height={22} />
                              </Div>
                              <ConfirmButton
                                style={{
                                  position: "relative",
                                  bottom: 1.5,
                                }}
                                aria-label={`${t("Delete")} ${task.title}`}
                                title={t("Delete task")}
                                data-testid="edit-task-button"
                                className={"link"}
                                onClick={() => {
                                  if (
                                    selectedTasks?.some((t) => t.id === task.id)
                                  ) {
                                    handlePause()
                                  }
                                  setEditingTask(task)
                                }}
                                processing={isDeletingTask}
                                onConfirm={async () => {
                                  try {
                                    setIsDeletingTask(true)
                                    const response = await fetch(
                                      `${API_URL}/tasks/${task.id}`,
                                      {
                                        method: "DELETE",
                                        headers: {
                                          "Content-Type": "application/json",
                                          Authorization: `Bearer ${token}`,
                                        },
                                      },
                                    )

                                    const result = await response.json()

                                    if (result.error) {
                                      toast.error(result.error)
                                      return
                                    }
                                    await fetchTasks()
                                    toast.success(t("Deleted"))
                                  } catch (_error) {
                                    toast.error(t("Something went wrong"))
                                  } finally {
                                    setIsDeletingTask(false)
                                  }
                                }}
                              >
                                <Trash2 width={18} height={18} />
                              </ConfirmButton>
                            </Div>
                          </Div>
                        )}
                      />
                    </>
                  ) : null}
                  {tasks?.tasks?.length
                    ? guest &&
                      guest?.tasksCount <= GUEST_TASKS_COUNT && (
                        <Div
                          data-testid="great-start"
                          style={styles.greatStart.style}
                        >
                          {t(
                            "You can keep using the app just like this, you can add up to {{count}} tasks — but registering unlocks more ✨.",
                            { count: guest?.tasksCount },
                          )}
                        </Div>
                      )
                    : user && tasks?.tasks?.length
                      ? user?.tasksCount <= PLUS_TASKS_COUNT && (
                          <>
                            {t(
                              `You're doing awesome! Unlock more tasks, advanced mood insights, and priority support by subscribing to Plus ✨.`,
                            )}
                          </>
                        )
                      : undefined}

                  {!tasks?.tasks?.length && !isLoadingTasks && (
                    <Testimonials style={styles.testimonials.style} />
                  )}
                </>
              )}
            </>
          )
        })()}
      </Div>
    </Div>
  )
}
