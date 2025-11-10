"use client"

import { Trans, useTranslation } from "react-i18next"
import React, { useState, useRef, useEffect } from "react"
import styles from "./FocusButton.module.scss"
import { useHasHydrated } from "./hooks"
import {
  AlarmClockCheck,
  ChevronDown,
  ChevronUp,
  CirclePause,
  CirclePlay,
  CircleX,
  GripVertical,
  Moon,
  Pencil,
  SettingsIcon,
  Sun,
  CircleCheck,
  Circle,
  Bird,
  SmilePlus,
  Repeat,
  CloudDownload,
} from "lucide-react"

import { FaDiscord } from "react-icons/fa"
import { FaXTwitter } from "react-icons/fa6"

import { toast } from "react-hot-toast"
import clsx from "clsx"
import { DndProvider } from "react-dnd"
import { HTML5Backend } from "react-dnd-html5-backend"
import DraggableItem from "./DraggableItem"
import {
  GUEST_TASKS_COUNT,
  PLUS_TASKS_COUNT,
  FRONTEND_URL,
  VERSION,
  API_URL,
  apiFetch,
} from "./utils"

import sanitizeHtml from "sanitize-html"
import Loading from "./Loading"
import Checkbox from "./Checkbox"
import { Suspense, lazy } from "react"
import AddTask from "./AddTask"
import { useTimerContext } from "./context/TimerContext"
import SwipeableTimeControl from "./SwipeableTimeControl"
import { useAuth, useChat } from "./context/providers"
import { useNavigation, usePlatform, useTheme } from "./platform"
import { themeType } from "./context/ThemeContext"
import Img from "./Image"
import A from "./A"
import { useStyles } from "./context/StylesContext"
import Testimonials from "./Testimonials"
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

export default function FocusButton({ className }: { className?: string }) {
  const { t } = useTranslation()

  const {
    token,
    track: trackEvent,
    enableNotifications,
    setEnableNotifications,
    user,
    guest,
    baseApp,
    bloom,
    app,
    getAppSlug,
    allApps,
    focus,
    setShowFocus,
    showFocus,
  } = useAuth()

  const { searchParams, addParams, push, setParams } = useNavigation()

  const hasHydrated = useHasHydrated()

  const { os, isExtension } = usePlatform()

  const { enableSound, setEnableSound } = useTheme()

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

  useEffect(() => {
    if (!tasks?.tasks?.length) {
      fetchTasks()
    }
  }, [tasks])

  const isMovingItemRef = useRef(false)
  const { isDark, setTheme: setThemeInContext } = useTheme()
  const { setPlaceHolderText, placeHolderText, setShouldFocus } = useChat()

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
      trackEvent({ name: "settings" })
    }
  }, [showSettings])

  const setTheme = (theme: themeType) => {
    setThemeInContext(theme)
    theme === "dark"
      ? trackEvent({ name: "dark_mode" })
      : trackEvent({ name: "light_mode" })
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

  const { utilities } = useStyles()

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
        body: JSON.stringify({ ...task, total }),
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
      <div className={styles.settingsContainer}>
        <div className={styles.closeSettingsButtonWrapper}>
          <button
            data-testid="close-settings-button"
            className={styles.closeSettingsButton}
            onClick={() => setShowSettings(false)}
          >
            <CircleX width={18} height={18} /> {t("Settings")}
          </button>
        </div>
        <div className={styles.settings}>
          <span>
            <input
              data-testid="preset-min-1-input"
              type="number"
              min="0"
              max="60"
              placeholder="Minutes"
              defaultValue={presetMin1}
              onChange={(e) => {
                setPresetMin1(Number(e.target.value))
              }}
            />
            {t("min")}
          </span>
          <span>
            <input
              data-testid="preset-min-2-input"
              type="number"
              min="0"
              max="60"
              placeholder="Minutes"
              defaultValue={presetMin2}
              onChange={(e) => {
                setPresetMin2(Number(e.target.value))
              }}
            />
            {t("min")}
          </span>
          <span>
            <input
              data-testid="preset-min-3-input"
              type="number"
              min="0"
              max="60"
              placeholder="Minutes"
              defaultValue={presetMin3}
              onChange={(e) => {
                setPresetMin3(Number(e.target.value))
              }}
            />
            {t("min")}
          </span>
        </div>
        <div className={styles.additionalSettings}>
          <Checkbox
            checked={enableNotifications}
            onChange={(e) => setEnableNotifications(e.target.checked)}
          >
            {t("Notifications")}
          </Checkbox>
          <Checkbox
            checked={enableSound}
            onChange={(e) => setEnableSound(e.target.checked)}
          >
            {t("Sound")}
          </Checkbox>
        </div>
        <div className={styles.settingsFooter}>
          <a
            className={styles.discord}
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/6NUvNSzs"
          >
            <FaDiscord size={16} /> Discord
          </a>
          ,{" "}
          <a
            className={styles.x}
            target="_blank"
            rel="noopener noreferrer"
            href="https://x.com/focusbuttonai"
          >
            <FaXTwitter size={12} />
          </a>{" "}
          ,{" "}
          <span className={styles.version}>
            v{getSiteConfig("focus").version}
          </span>
        </div>
      </div>
    )
  }

  const showControls = time > 0

  return (
    <div className={clsx(styles.page, className)}>
      <div className={clsx(styles.container)}>
        <main className={styles.main}>
          <div data-testid="pomodoro" className={styles.pomodoro}>
            <button
              data-testid="preset-1"
              data-preset-min-1={presetMin1}
              className={clsx(
                styles.timeAdjust,
                activePomodoro === presetMin1
                  ? isCountingDown && !isPaused
                    ? styles.active
                    : time !== 0 && styles.paused
                  : undefined,
                "link",
              )}
              onClick={(e) => {
                e.stopPropagation()
                handlePresetTime(presetMin1)
              }}
            >
              {presetMin1}
              {t("min")}
            </button>
            <button
              data-preset-min-2={presetMin2}
              data-testid="preset-2"
              className={clsx(
                styles.timeAdjust,
                activePomodoro === presetMin2
                  ? isCountingDown && !isPaused
                    ? styles.active
                    : time !== 0 && styles.paused
                  : undefined,
                "link",
              )}
              onClick={(e) => {
                e.stopPropagation()
                handlePresetTime(presetMin2)
              }}
            >
              {presetMin2}
              {t("min")}
            </button>
            <button
              data-preset-min-3={presetMin3}
              data-testid="preset-3"
              className={clsx(
                styles.timeAdjust,
                activePomodoro === presetMin3
                  ? isCountingDown && !isPaused
                    ? styles.active
                    : time !== 0 && styles.paused
                  : undefined,
                "link",
              )}
              onClick={(e) => {
                e.stopPropagation()
                handlePresetTime(presetMin3)
              }}
            >
              {presetMin3}
              {t("min")}
            </button>
          </div>
          <span className={styles.greeting}>
            <>
              <span>{t("Let’s focus")}</span>
              <div
                className={clsx(
                  styles.letsFocusContainer,
                  isDark && styles.dark,
                )}
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
              >
                {user?.name ? (
                  <span className={styles.userName}>
                    {user.name.split(" ")[0]}
                  </span>
                ) : (
                  ""
                )}
                <div className={styles.videoContainer} title="Kitasaku">
                  {!playKitasaku ? (
                    <CirclePlay
                      className={styles.videoPlay}
                      color="var(--shade-5)"
                      size={16}
                    />
                  ) : (
                    <CirclePause
                      className={styles.videoPause}
                      color="var(--shade-5)"
                      size={16}
                    />
                  )}

                  <video
                    ref={videoRef}
                    className={styles.video}
                    src={`${FRONTEND_URL}/video/blob.mp4`}
                    autoPlay
                    loop
                    muted
                    playsInline
                  ></video>
                </div>
              </div>
            </>
          </span>
          <div
            data-testid="focusbutton"
            className={clsx(
              styles.focusButton,
              isMounted && styles.mounted,
              isCountingDown && !isPaused && styles.counting,
              isPaused && styles.paused,
              isFinished && styles.finished,
            )}
          >
            <div className={styles.headerContainer}>
              <button
                data-testid="settings-button"
                title={t("Settings")}
                className={clsx(styles.showSettings, "link")}
                onClick={() => setShowSettings(true)}
              >
                <SettingsIcon size={22} />
              </button>
              <button
                title={t("Replay")}
                className={clsx(styles.replay, replay && styles.active, "link")}
                onClick={() => setReplay(!replay)}
              >
                <Repeat size={22} />
              </button>
            </div>

            <div
              data-time={time}
              data-testid="time"
              className={styles.timeDisplay}
            >
              <div
                className={styles.time}
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
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
                    <button
                      ref={minutesUpButtonRef}
                      className={styles.timeAdjust}
                      onClick={(e) => e.stopPropagation()}
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
                    >
                      <ChevronUp size={18} />
                    </button>
                  }
                  Down={
                    <button
                      ref={minutesDownButtonRef}
                      className={styles.timeAdjust}
                      onClick={(e) => e.stopPropagation()}
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
                    >
                      <ChevronDown size={18} />
                    </button>
                  }
                  time={time}
                />
                <span className={styles.separator}>:</span>
                <SwipeableTimeControl
                  Up={
                    <button
                      ref={secondsUpButtonRef}
                      className={styles.timeAdjust}
                      onClick={(e) => e.stopPropagation()}
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
                    >
                      <ChevronUp size={18} />
                    </button>
                  }
                  isMinute={false}
                  Down={
                    <button
                      ref={secondsDownButtonRef}
                      className={styles.timeAdjust}
                      onClick={(e) => e.stopPropagation()}
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
                    >
                      <ChevronDown size={18} />
                    </button>
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
              </div>
            </div>
            <div className={styles.footerContainer}>
              <button
                title={isDark ? t("Light") : t("Dark")}
                className={clsx(
                  styles.themeToggle,
                  isDark ? styles.dark : styles.light,
                  "link",
                )}
              >
                {isDark ? (
                  <Sun
                    className={styles.sun}
                    size={22}
                    onClick={() => {
                      setTheme("light")
                    }}
                  />
                ) : (
                  <Moon
                    className={styles.moon}
                    size={22}
                    onClick={() => {
                      setTheme("dark")
                    }}
                  />
                )}
              </button>
              <button
                title={playBirds ? t("Pause sound") : t("Play sound")}
                onClick={() => setPlayBirds(!playBirds)}
                className={clsx(
                  styles.birdButton,
                  playBirds && styles.active,
                  "link",
                )}
              >
                <Bird
                  color={
                    isCountingDown && playBirds ? "var(--accent-4)" : undefined
                  }
                  size={22}
                />
              </button>
            </div>
          </div>
          {remoteTimer?.count &&
          remoteTimer?.isCountingDown &&
          !isCountingDown &&
          !isPaused ? (
            <button
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
            </button>
          ) : null}
          {showControls && (
            <div className={clsx(styles.controls)}>
              <button
                className={clsx(
                  styles.controlButton,
                  isPaused || !isCountingDown
                    ? styles.startButton
                    : styles.pauseButton,
                  "link",
                )}
                data-testid={`focusbutton-${isPaused || !isCountingDown ? "start" : "pause"}-button`}
                onClick={handleClick}
              >
                {isPaused || !isCountingDown ? (
                  <>
                    <CirclePlay
                      className={styles.controlIcon}
                      color="var(--accent-4)"
                      width={20}
                      height={20}
                    />
                    <span>{t("Start")}</span>
                  </>
                ) : (
                  <>
                    <CirclePause
                      className={styles.controlIcon}
                      width={20}
                      height={20}
                    />
                    <span>{t("Pause")}</span>
                  </>
                )}
              </button>
              <button
                className={clsx(
                  styles.cancelButton,
                  isCountingDown && styles.isCountingDown,
                  "link",
                )}
                data-testid="focusbutton-cancel-button"
                onClick={handleCancel}
              >
                <CircleX
                  className={styles.controlIcon}
                  width={20}
                  height={20}
                />
                <span>{t("Cancel")}</span>
              </button>
            </div>
          )}
        </main>
        <div className={styles.taskSection}>
          {(() => {
            if (addingTask) {
              return (
                <AddTask
                  totalTasksCount={tasks?.tasks?.length || 0}
                  onAdd={async () => {
                    await fetchTasks()
                    setAddingTask(false)
                  }}
                  onCancel={() => {
                    setAddingTask(false)
                  }}
                />
              )
            }

            return (
              <>
                {isLoadingTasks ? (
                  <div className={styles.loadingTasks}>
                    <Loading />
                  </div>
                ) : (
                  <>
                    <div className={styles.app}>
                      <div data-testid="task-reports" className={styles.top}>
                        <button
                          data-testid="new-task-button"
                          className={clsx(
                            styles.newTaskButton,
                            "transparent link",
                          )}
                          onClick={() => {
                            addParams({ addTask: "true" })
                          }}
                        >
                          <AlarmClockCheck width={16} height={16} />
                          {t("New task")}
                        </button>
                        {focus && (
                          <A
                            style={{
                              ...utilities.button.style,
                              ...utilities.inverted.style,
                              ...utilities.small.style,
                            }}
                            onClick={() => {
                              setShowFocus(false)
                              app?.id === focus?.id
                                ? setShowFocus(false)
                                : push(getAppSlug(focus))
                            }}
                            // href={getAppSlug(refApp)}
                          >
                            <Img size={20} app={focus} />
                            {focus.name}
                          </A>
                        )}
                      </div>
                    </div>

                    {tasks?.tasks?.length ? (
                      <>
                        <div data-testid="tasks" className={clsx(styles.tasks)}>
                          <DndProvider backend={HTML5Backend}>
                            {tasks.tasks.filter(Boolean).map((task, index) => (
                              <DraggableItem
                                key={task.id}
                                index={index}
                                moveItem={async (from, to) => {
                                  if (isMovingItemRef.current) return
                                  isMovingItemRef.current = true

                                  if (isCountingDown && !isPaused) {
                                    handlePause()
                                  }

                                  setTasks((prevTasks) => {
                                    const newTasks = [...prevTasks.tasks]
                                    const draggedTask = newTasks[from]
                                    if (!draggedTask) {
                                      toast.error("Dragged task not found")
                                      return prevTasks
                                    }

                                    newTasks.splice(from, 1)
                                    newTasks.splice(to, 0, draggedTask)

                                    updateTask({
                                      task: {
                                        ...draggedTask,
                                        total: undefined,
                                        order: to,
                                      },
                                      reorder: true,
                                    })
                                    return {
                                      ...prevTasks,
                                      tasks: newTasks,
                                    }
                                  })

                                  isMovingItemRef.current = false
                                }}
                              >
                                <div
                                  data-task-title={task.title}
                                  data-testid="task"
                                  key={task.id}
                                  className={clsx(
                                    styles.task,
                                    index === 0 && styles.currentTask,
                                    selectedTasks?.some(
                                      (t) => t.id === task.id,
                                    ) && styles.selectedTask,
                                    isCountingDown &&
                                      !isPaused &&
                                      styles.counting,
                                    isPaused && styles.paused,
                                    isFinished && styles.finished,
                                  )}
                                >
                                  <div className={styles.taskContent}>
                                    <div
                                      onClick={() => {
                                        if (
                                          selectedTasks?.some(
                                            (t) => t.id === task.id,
                                          )
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
                                      className={styles.taskTitle}
                                    >
                                      {selectedTasks?.some(
                                        (t) => t.id === task.id,
                                      ) ? (
                                        <span
                                          className={styles.taskSelected}
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
                                        </span>
                                      ) : (
                                        <span
                                          className={styles.taskNotSelected}
                                          data-testid="task-not-selected"
                                        >
                                          <Circle width={16} height={16} />
                                        </span>
                                      )}

                                      {(() => {
                                        const totalTime = task.total?.reduce?.(
                                          (total, item) => total + item.count,
                                          0,
                                        )

                                        return (
                                          <>
                                            <span
                                              task-time={totalTime}
                                              data-testid="task-title"
                                            >
                                              {sanitizeHtml(task.title)}
                                            </span>
                                            {totalTime && totalTime > 0 ? (
                                              <span className={styles.taskTime}>
                                                {Math.floor(totalTime / 3600) >
                                                  0 && (
                                                  <>
                                                    {Math.floor(
                                                      totalTime / 3600,
                                                    )}
                                                    h{" "}
                                                  </>
                                                )}
                                                {Math.floor(
                                                  (totalTime % 3600) / 60,
                                                ) > 0 && (
                                                  <>
                                                    {Math.floor(
                                                      (totalTime % 3600) / 60,
                                                    )}
                                                    m{" "}
                                                  </>
                                                )}
                                                {Math.floor(totalTime % 60)}s
                                              </span>
                                            ) : null}
                                          </>
                                        )
                                      })()}
                                    </div>

                                    <GripVertical
                                      width={22}
                                      height={22}
                                      className={styles.dragHandle}
                                    />
                                    <button
                                      data-testid="edit-task-button"
                                      className={"link"}
                                      onClick={() => {
                                        if (
                                          selectedTasks?.some(
                                            (t) => t.id === task.id,
                                          )
                                        ) {
                                          handlePause()
                                        }
                                        setEditingTask(task)
                                      }}
                                    >
                                      <Pencil width={18} height={18} />
                                    </button>
                                  </div>
                                </div>
                              </DraggableItem>
                            ))}
                          </DndProvider>
                        </div>
                      </>
                    ) : null}
                    {tasks?.tasks?.length
                      ? guest &&
                        guest?.tasksCount <= GUEST_TASKS_COUNT && (
                          <div
                            data-testid="great-start"
                            className={styles.greatStart}
                          >
                            <Trans
                              i18nKey="greatStart"
                              values={{ count: guest?.tasksCount }}
                              components={{
                                register: (
                                  <button
                                    onClick={() =>
                                      addParams({
                                        subscribe: "true",
                                        plan: "plus",
                                      })
                                    }
                                    className="link"
                                  />
                                ),
                              }}
                            />
                          </div>
                        )
                      : user && tasks?.tasks?.length
                        ? user?.tasksCount <= PLUS_TASKS_COUNT && (
                            <Trans
                              i18nKey="greatStartMember"
                              components={{
                                subscribe: (
                                  <button
                                    style={{
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: 2,
                                      position: "relative",
                                      top: 1.1,
                                    }}
                                    onClick={() =>
                                      addParams({
                                        subscribe: "true",
                                        plus: "true",
                                      })
                                    }
                                    className="link"
                                  >
                                    <SmilePlus
                                      className={styles.svg}
                                      size={12}
                                    />
                                    <span>{t("subscribing")}</span>
                                  </button>
                                ),
                              }}
                            />
                          )
                        : undefined}

                    {!tasks?.tasks?.length && !isLoadingTasks && (
                      <Testimonials className={styles.testimonials} />
                    )}
                  </>
                )}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
