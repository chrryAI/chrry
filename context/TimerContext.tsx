"use client"

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  SetStateAction,
  createContext,
  useContext,
  useMemo,
} from "react"
import type { ReactElement, ReactNode } from "react"

import { isSameDay, FRONTEND_URL, apiFetch, API_URL } from "../utils"
import { device, timer } from "../types"
import console from "../utils/log"

import useSWR from "swr"
import { useWebSocket } from "../hooks/useWebSocket"
import { useAuth } from "./providers"
import { useLocalStorage, usePlatform, useTheme, Audio } from "../platform"

export const STORAGE_SELECTED_TASKS_KEY = "selectedTasks"

export const TimerContext = createContext<{
  fetchTimer: () => Promise<void>
  selectedTasks: Task[] | undefined
  setSelectedTasks: (value: Task[] | undefined) => void
  presetMin1: number
  presetMin2: number
  presetMin3: number
  setPresetMin1: (value: number) => void
  setPresetMin2: (value: number) => void
  setPresetMin3: (value: number) => void
  playKitasaku?: boolean
  setPlayKitasaku: (playKitasaku: boolean) => void
  stopAdjustment: () => void
  startAdjustment: (direction: number, isMinutes: boolean) => void
  playTimerEnd: () => void
  updateTimer: (data: timer) => void
  isCancelled: boolean

  remoteTimer: timer | null
  timer: timer | null
  setTimer: (timer: timer | null) => void

  tasks?: {
    tasks: Task[]
    totalCount: number
    hasNextPage: boolean
    nextPage: number | null
  }
  setTasks: (
    tasks: SetStateAction<
      | {
          tasks: Task[]
          totalCount: number
          hasNextPage: boolean
          nextPage: number | null
        }
      | undefined
    >,
  ) => void
  handlePresetTime: (minutes: number) => void
  isLoadingTasks: boolean
  playBirds?: boolean
  setPlayBirds: (playBirds: boolean) => void
  activePomodoro: number | null
  setActivePomodoro: (activePomodoro: number | null) => void
  time: number
  isCountingDown: boolean
  isPaused: boolean
  isFinished: boolean
  startTime: number
  setIsCountingDown: (isCountingDown: boolean) => void
  setIsPaused: (isPaused: boolean) => void
  setTime: (time: number) => void
  setIsFinished: (isFinished: boolean) => void
  startCountdown: (duration?: number) => void
  setStartTime: (startTime: number) => void
  fetchTasks: () => Promise<void>
  handleCancel: () => void
  replay: boolean
  setReplay: (replay: boolean) => void
  handlePause: () => void
  handleResume: () => void
}>({
  isCancelled: false,
  remoteTimer: null,
  timer: null,
  setTimer: (timer: timer | null) => {},
  updateTimer: (data: timer) => {},
  selectedTasks: undefined,
  setSelectedTasks: (tasks: Task[] | undefined) => {},
  presetMin1: 25,
  presetMin2: 15,
  presetMin3: 5,
  setPresetMin1: (value: number) => {},
  setPresetMin2: (value: number) => {},
  setPresetMin3: (value: number) => {},
  handlePause: () => {},
  handleResume: () => {},
  playKitasaku: false,
  setPlayKitasaku: (playKitasaku: boolean) => {},
  stopAdjustment: () => {},
  startAdjustment: (direction: number, isMinutes: boolean) => {},
  playTimerEnd: () => {},
  fetchTasks: async () => {},
  fetchTimer: async () => {},
  isLoadingTasks: false,
  playBirds: false,
  setPlayBirds: (playBirds: boolean) => {},
  activePomodoro: null,
  setActivePomodoro: (activePomodoro: number | null) => {},
  time: 0,
  isCountingDown: false,
  isPaused: false,
  isFinished: false,
  startTime: 0,
  setIsCountingDown: (isCountingDown: boolean) => {},
  setIsPaused: (isPaused: boolean) => {},
  setTime: (time: number) => {},
  setIsFinished: (isFinished: boolean) => {},
  startCountdown: (duration?: number) => {},
  setStartTime: (startTime: number) => {},
  handlePresetTime: (minutes: number) => {},
  handleCancel: () => {},
  replay: false,
  setReplay: (replay: boolean) => {},
  tasks: {
    tasks: [] as Task[],
    totalCount: 0,
    hasNextPage: false,
    nextPage: null,
  },
  setTasks: () => {},
})

// Add global type declaration for browser

type TimerState = {
  time: number
  isCountingDown: boolean
  isPaused: boolean
  isFinished: boolean
  source?: string
  timestamp?: number
  startTime: number
  isFinalState?: boolean
  isCanceled?: boolean
}

export type Task = {
  id: string
  title: string
  createdOn: Date
  modifiedOn: Date
  description?: string
  total?: { date: string; count: number }[]
  order: number
  selected?: boolean
}

export function TimerContextProvider({
  children,
}: {
  children: ReactNode
}): ReactElement {
  const {
    token,
    enableNotifications,
    user,
    deviceId,
    fingerprint,
    fetchMood,
    plausible,
    tasks,
    setTasks,
    isLoadingTasks,
    fetchTasks,
    session,
  } = useAuth()

  const { enableSound } = useTheme()

  const { send } = useWebSocket<{
    // timer: timer & { deviceId?: string }
    type: string
    // mood: mood
    // selectedTasks: Task[]
    deviceId: string
    data: timer
  }>({
    onMessage: async ({ type, data }) => {
      if (type === "timer") {
        await fetchTimer()
        setRemoteTimer(data)
      }

      if (type === "tasks") {
        await fetchTimer()
      }

      if (type === "mood") {
        await fetchMood()
      }

      // if (data && type === "selected_tasks") {
      //   // Only update if fingerprint is different to prevent loops
      //   setTimerTasks(data)
      // }
    },
    token,
    deviceId,
    deps: [fingerprint],
  })

  const isExtension = usePlatform()
  const [time, setTime] = useState(0)
  const [isCountingDown, setIsCountingDown] = useState(false)
  const [replay, setReplay] = useState<boolean>(false)
  const [timer, setTimerInternal] = useState<timer | null>(null)

  // API-first: Use state instead of localStorage
  // Timer state comes from DB via SWR, localStorage only for offline cache
  const [timerState, setTimerState] = useState<TimerState | null>(null)
  const [activePomodoro, setActivePomodoro] = useState<number | null>(null)

  const setTimer = (timer: timer | null) => {
    setTimerInternal((prevTimer) => {
      if (
        prevTimer?.id === timer?.id &&
        prevTimer?.isCountingDown === timer?.isCountingDown &&
        prevTimer?.count === timer?.count &&
        prevTimer?.preset1 === timer?.preset1 &&
        prevTimer?.preset2 === timer?.preset2 &&
        prevTimer?.preset3 === timer?.preset3
      ) {
        return prevTimer // No change, prevent re-render
      }

      return timer
    })
  }

  const [remoteTimer, setRemoteTimer] = useState<
    (timer & { device?: device }) | null
  >(null)

  useEffect(() => {
    if (!remoteTimer || remoteTimer.count !== timer?.count) return
    if (!remoteTimer?.isCountingDown) {
      handlePause(false)
    } else {
      handleResume()
    }

    setRemoteTimer(null)
  }, [remoteTimer, timer])

  const [isPaused, setIsPaused] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [isCancelled, setIsCancelled] = useState(false)

  const [timerTasks, setTimerTasks] = useState<Task[]>([])
  const lastProcessedFingerprintRef = useRef<string | undefined>(undefined)
  const lastFilteredTasksRef = useRef<string>("")

  useEffect(() => {
    if (!timerTasks?.length) return
    // Use functional update to avoid tasks dependency
    setTasks((prevTasks) => {
      // Safety check: ensure prevTasks and prevTasks.tasks exist
      if (!prevTasks || !prevTasks.tasks || !Array.isArray(prevTasks.tasks)) {
        return prevTasks
      }

      // Check if there are actual updates before updating
      const hasUpdates = timerTasks.some((t) => {
        const task = prevTasks.tasks.find((task) => task.id === t.id)
        if (!task?.total || !t.total) return false

        const updatedTotal = t.total.reduce((a, b) => a + b.count, 0)
        const currentTotal = task.total.reduce((a, b) => a + b.count, 0)

        return updatedTotal > currentTotal
      })

      // Don't update if nothing changed - prevents infinite loop
      if (!hasUpdates) return prevTasks

      return {
        ...prevTasks,
        tasks: prevTasks.tasks.map((task) => {
          const updatedTask = timerTasks.find((t) => t.id === task.id)
          if (!updatedTask?.total?.length || !task.total?.length) return task

          const updatedTotal = updatedTask.total.reduce(
            (a, b) => a + b.count,
            0,
          )
          const currentTotal = task.total.reduce((a, b) => a + b.count, 0)

          return updatedTotal > currentTotal
            ? { ...task, total: updatedTask.total }
            : task
        }),
      }
    })

    // Clear the fingerprint after processing to prevent re-running
  }, [timerTasks, fingerprint])

  const [presetMin1, setPresetMin1Internal] = useLocalStorage(
    "presetMin1",
    timer?.preset1 || 25,
  )

  const lastSent = useRef(0)

  const [selectedTasks, setSelectedTasksInternal] = useLocalStorage<
    Task[] | undefined
  >(STORAGE_SELECTED_TASKS_KEY, undefined)

  useEffect(() => {
    // Safety check: ensure tasks.tasks exists
    if (!tasks?.tasks || !Array.isArray(tasks.tasks)) return

    // Create a stable key from task IDs to detect actual changes
    const taskIdsKey = tasks.tasks
      .map((t) => t.id)
      .sort()
      .join(",")

    // Skip if tasks haven't actually changed
    if (lastFilteredTasksRef.current === taskIdsKey) return

    lastFilteredTasksRef.current = taskIdsKey

    setSelectedTasksInternal((currentSelected) => {
      if (!currentSelected?.length || !tasks?.tasks?.length)
        return currentSelected

      const filtered = currentSelected.filter((task) =>
        tasks.tasks.some((t) => t.id === task.id),
      )

      // Only update if there are actual changes
      if (
        filtered?.length !== currentSelected?.length ||
        filtered?.some(
          (t, i) => currentSelected[i] && t.id !== currentSelected[i].id,
        )
      ) {
        return filtered
      }

      return currentSelected
    })
  }, [tasks?.tasks])

  const updateTimer = useCallback(
    (data: timer) => {
      if (!token) return

      const deviceId = fingerprint

      if (!data.isCountingDown) {
        send({
          timer: data,
          selectedTasks,
          type: "timer",
          isCountingDown: false,
        })
        return
      }

      const now = Date.now()
      if (now - lastSent.current >= 5000) {
        send({
          timer: data,
          selectedTasks,
          type: "timer",
        })
        lastSent.current = now
      }
    },
    [send, selectedTasks, token, isCountingDown, isFinished, remoteTimer],
  )

  useEffect(() => {
    if (!timer) return

    if (timer.isCountingDown === isCountingDown) return

    if (isCountingDown) {
      handleResume()
    } else {
      handlePause()
    }

    // updateTimer(timer)
  }, [timer, isCountingDown])

  const setPresetMin1 = useCallback(
    (value: number) => {
      setPresetMin1Internal(value)
      if (timer) {
        const newTimer = { ...timer, preset1: value }
        setTimer(newTimer)
        updateTimer(newTimer)
      }
    },
    [timer, updateTimer],
  )

  const [presetMin2, setPresetMin2Internal] = useLocalStorage(
    "presetMin2",
    timer?.preset2 || 15,
  )

  const setPresetMin2 = useCallback(
    (value: number) => {
      setPresetMin2Internal(value)
      if (fingerprint && timer) {
        const newTimer = { ...timer, preset2: value }
        setTimer(newTimer)
        updateTimer(newTimer)
      }
    },
    [fingerprint, timer, updateTimer],
  )

  const [presetMin3, setPresetMin3Internal] = useLocalStorage(
    "presetMin3",
    timer?.preset3 || 5,
  )

  const setPresetMin3 = useCallback(
    (value: number) => {
      setPresetMin3Internal(value)
      if (fingerprint && timer) {
        const newTimer = { ...timer, preset3: value }
        setTimer(newTimer)
        updateTimer(newTimer)
      }
    },
    [fingerprint, timer, updateTimer],
  )

  useEffect(() => {
    if (!tasks?.totalCount || selectedTasks) return
    if (!tasks?.tasks || !Array.isArray(tasks.tasks)) return

    const filter = tasks.tasks.filter((task) => task.selected)
    setSelectedTasksInternal(filter)
  }, [tasks?.totalCount])

  const setSelectedTasks = useCallback((value: Task[] | undefined) => {
    setSelectedTasksInternal(value)
  }, [])

  const [startTime, setStartTime] = useLocalStorage<number>(
    "startTime",
    timer?.count || 0,
  )
  const timerRef = useRef<any | null>(null)
  const isTimerEndingRef = useRef<boolean>(false)
  const adjustIntervalRef = useRef<number | null>(null)
  const lastVisibilityUpdateRef = useRef<number>(0)
  const hasRestoredTimerRef = useRef<boolean>(false)

  const [playBirds, setPlayBirds] = useState<boolean | undefined>(undefined)

  useEffect(() => {
    if (!timer?.id) return
    setPresetMin1Internal(timer.preset1)
    setPresetMin2Internal(timer.preset2)
    setPresetMin3Internal(timer.preset3)
  }, [timer?.id])

  const [shouldFetchTimer, setShouldFetchTimer] = useState(true)

  const {
    data: timerData,
    mutate: refetchTimer,
    isLoading: isLoadingTimer,
  } = useSWR(
    deviceId && token && session && shouldFetchTimer ? ["timer"] : null, // Disabled by default, fetch manually with refetchTimer()
    async () => {
      const response = await apiFetch(`${API_URL}/timers/${deviceId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return response.json()
    },
  )

  const hasAutoResumedRef = useRef(false)

  useEffect(() => {
    if (isCountingDown) return // Already counting
    if (!timerData?.isCountingDown) return // DB says not counting
    if (timerData.count === 0) return // Timer finished
    if (hasAutoResumedRef.current) return // Already auto-resumed

    hasAutoResumedRef.current = true
    handleResume()
  }, [timerData?.isCountingDown, timerData?.count])

  const fetchTimer = async () => {
    setShouldFetchTimer(true)
    shouldFetchTimer && refetchTimer()
  }

  useEffect(() => {
    if (timerData) {
      // Mark as restored to prevent multiple initializations
      hasRestoredTimerRef.current = true

      // Update timer object
      setTimer(timerData)

      // Restore timer state from API
      if (timerData.isCountingDown && timerData.count > 0) {
        setTime(timerData.count)
        setIsCountingDown(true)

        setIsPaused(false)
        setIsFinished(false)
        setStartTime(Date.now())

        // Timer will start via the isCountingDown state change
      } else if (timerData.count > 0) {
        // Timer is paused
        setTime(timerData.count)
        setIsCountingDown(false)
        setIsPaused(true)
        setIsFinished(false)
      } else {
        // Timer is at 0
        setTime(0)
        setIsCountingDown(false)
        setIsPaused(false)
        setIsFinished(true)
      }
    }
  }, [timerData])

  useEffect(() => {
    if (!timer && token && fingerprint && user && !isLoadingTimer) {
      fetchTimer()
    }
  }, [fingerprint, token, user, timer, isLoadingTimer])

  useEffect(() => {
    if (!token) return
    if (isCountingDown && selectedTasks?.length && !isPaused) {
      const currentDay = new Date()

      const currentElapsed = startTime
        ? Math.floor((Date.now() - startTime) / 1000)
        : 0

      if (currentElapsed === 0) {
        return
      }

      // Collect updates to apply after setTasks completes
      const updatedSelectedTasks: Task[] = []

      for (const selectedTask of selectedTasks) {
        let updatedTotal: any = null

        setTasks((prevTasks) => {
          if (!prevTasks) return prevTasks
          return {
            ...prevTasks,
            tasks: prevTasks.tasks.map((task) => {
              if (task.id === selectedTask.id) {
                const hasDay = task.total?.find?.((t) =>
                  isSameDay(new Date(t.date), currentDay),
                )

                const total = hasDay
                  ? task.total?.map((t) => {
                      return {
                        ...t,
                        count: isSameDay(new Date(t.date), currentDay)
                          ? t.count + 1
                          : t.count,
                      }
                    })
                  : task.total?.length
                    ? [
                        ...task.total,
                        { date: currentDay.toISOString(), count: 1 },
                      ]
                    : [{ date: currentDay.toISOString(), count: 1 }]

                // Store the updated total to apply later
                updatedTotal = total

                return {
                  ...task,
                  total,
                }
              }
              return task
            }),
          }
        })

        // Collect the updated task for batch update
        if (updatedTotal) {
          updatedSelectedTasks.push({
            ...selectedTask,
            total: updatedTotal,
          })
        } else {
          updatedSelectedTasks.push(selectedTask)
        }
      }

      // Update selectedTasks after all setTasks calls complete
      if (updatedSelectedTasks.length > 0) {
        setSelectedTasks(updatedSelectedTasks)
      }
    }
  }, [time, isCountingDown, isPaused, token])

  // Use ref to plausible timer sync - only sync on state changes, not every second
  const timerSyncRef = useRef<number>(0)

  useEffect(() => {
    if (!timer || !fingerprint) return

    // Sync timer state every 5 seconds while counting, or immediately on state change
    const now = Date.now()
    const shouldSync =
      !isCountingDown || // State changed (stopped/paused)
      now - timerSyncRef.current >= 5000 // 5s throttle while running

    if (!shouldSync) return

    timerSyncRef.current = now

    const updatedTimer = {
      ...timer,
      preset1: presetMin1,
      preset2: presetMin2,
      preset3: presetMin3,
      isCountingDown,
      count: time,
    }

    // Update local state
    setTimer(updatedTimer)

    // Sync to WebSocket and DB
    updateTimer(updatedTimer)

    // Persist to localStorage via hook
    setTimerState({
      time,
      isCountingDown,
      isPaused,
      startTime,
      timestamp: now,
      isFinished: false,
    })
  }, [
    time,
    isCountingDown,
    isPaused,
    timer,
    fingerprint,
    presetMin1,
    presetMin2,
    presetMin3,
    startTime,
  ])

  const currentStateRef = useRef({
    time: 0,
    isCountingDown: false,
    isPaused: false,
    isFinished: false,
  })

  useEffect(() => {
    currentStateRef.current = {
      time,
      isCountingDown,
      isPaused,
      isFinished,
    }
  }, [time, isCountingDown, isPaused, isFinished])

  const handleTimerEnd = useCallback(() => {
    if (!isCountingDown) return

    setIsFinished(true)
    setPlayBirds(false)

    if (timer) {
      updateTimer({
        ...timer,
        count: 0,
        isCountingDown: false,
      })
    }

    setIsCountingDown(false)
    setIsPaused(false)
    setTime(0)

    // Clear timer state immediately
    setTimerState(null)

    // Clear interval
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Play sound and show notification
    playTimerEnd()
    sendNotification()

    setTimeout(() => {
      if (replay) {
        handlePresetTime(presetMin1)
        startCountdown()
      }
    }, 1000)
  }, [isCountingDown, timer, updateTimer, isExtension, replay, presetMin1])

  useEffect(() => {
    if (time === 0 && isCountingDown) {
      handleTimerEnd()
    }
  }, [time, isCountingDown])

  const startCountdown = useCallback(
    (duration?: number) => {
      if (duration !== undefined) {
        setTime(duration)
      }

      // Clear any existing timer
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      setIsCountingDown(true)
      setIsPaused(false)
      setIsFinished(false)
      setIsCancelled(false)

      const now = Date.now()
      setStartTime(now)

      if (timer) {
        updateTimer({
          ...timer,
          isCountingDown: true,
        })
      }

      console.log("Starting web timer")
      // Start local timer for web mode
      const initialTime = duration ?? time
      let lastUpdate = now

      timerRef.current = setInterval(() => {
        const currentTime = Date.now()
        const elapsedTime = Math.floor((currentTime - lastUpdate) / 1000)

        if (elapsedTime > 0) {
          lastUpdate = currentTime - ((currentTime - lastUpdate) % 1000)

          setTime((prevTime) => {
            const newTime = Math.max(0, prevTime - elapsedTime)

            if (newTime === 0 && prevTime > 0) {
              clearInterval(timerRef.current)
              timerRef.current = null
              // Trigger timer end after state update
              setTimeout(() => handleTimerEnd(), 0)
            }
            return newTime
          })
        }
      }, 100)

      // Save state to localStorage
      setTimerState({
        time: initialTime,
        isCountingDown: true,
        isPaused: false,
        startTime: now,
        isFinished: false,
      })

      plausible({ name: "timer_start", props: { duration: duration || time } })
    },
    [time, isExtension, updateTimer, timer, fingerprint],
  )

  const handleCancel = useCallback(() => {
    setIsCancelled(true)
    setPlayBirds(false)
    // Prevent multiple cancellations
    // if (isTimerEndingRef.current) {
    //   return
    // }
    isTimerEndingRef.current = true

    // Clear any existing timer interval
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (timer) {
      updateTimer({
        ...timer,
        count: 0,
        isCountingDown: false,
      })

      setTimer({
        ...timer,
        count: 0,
        isCountingDown: false,
      })
    }

    setTime(0)
    setIsCountingDown(false)
    setIsPaused(false)
    setIsFinished(true)

    // Clear timer state
    setTimerState(null)

    plausible({ name: "timer_cancel" })

    // Reset the flag after a short delay
    setTimeout(() => {
      isTimerEndingRef.current = false
    }, 500)
  }, [isExtension, timer, fingerprint])

  const handlePause = useCallback(
    (update: boolean = true) => {
      setIsPaused(true)
      setIsCountingDown(false)
      setIsCancelled(false)

      // Clear interval if running locally
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      // Update local storage for web version
      setTimerState({
        time,
        isCountingDown: false,
        isPaused: true,
        timestamp: Date.now(),
        startTime,
        isFinished: false,
      })

      if (timer && update) {
        updateTimer({ ...timer, isCountingDown: false })
      }

      plausible({ name: "timer_pause", props: { timeLeft: time } })
    },
    [timer, updateTimer, time, startTime, plausible],
  )

  const handleResume = useCallback(() => {
    setIsPaused(false)
    setIsCancelled(false)
    setIsCountingDown(true)

    const now = Date.now()
    setStartTime(now)

    // Start the timer with current remaining time
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    // Start countdown with current display time
    startCountdown(time)

    plausible({ name: "timer_resume", props: { timeLeft: time } })
  }, [time, startCountdown, plausible])

  const handlePresetTime = useCallback(
    (minutes: number) => {
      const newTime = minutes * 60
      setIsPaused(true)
      setIsFinished(false)
      setTime(newTime)
      setActivePomodoro(minutes)

      // Stop any running timer
      if (isCountingDown) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setIsCountingDown(false)
      }

      // Save timer state
      setTimerState({
        time: newTime,
        isCountingDown: false,
        isPaused: true,
        timestamp: Date.now(),
        startTime: Date.now(),
        isFinished: false,
      })

      // Save active Pomodoro separately
      setActivePomodoro(minutes)

      // Track event
      plausible({ name: "timer_preset", props: { minutes, timeSet: newTime } })
    },
    [isCountingDown, plausible],
  )

  // Active pomodoro is now loaded automatically via useLocalStorage hook

  // Set mounted state

  // Restore timer state on mount
  const restoreTimerState = useCallback(async () => {
    try {
      // State is now loaded automatically via useLocalStorage hook
      if (!timerState) {
        return
      }
      const state = timerState

      // If timer was running, calculate elapsed time
      if (state.isCountingDown && !state.isPaused && state.startTime) {
        const elapsedTime = Math.floor((Date.now() - state.startTime) / 1000)
        state.time = Math.max(0, state.time - elapsedTime)
      }

      console.log("Restoring timer state:", state)

      if (state) {
        setTime(state.time)
        setIsCountingDown(state.isCountingDown)
        setIsPaused(state.isPaused)
        setIsFinished(state.isFinished)

        if (state.startTime) {
          setStartTime(state.startTime)
        }

        // If timer was running, restart it
        if (state.isCountingDown && !state.isPaused && state.time > 0) {
          startCountdown(state.time)
        }
      }
    } catch (error) {
      console.error("Error restoring timer state:", error)
    }
  }, [isExtension])

  useEffect(() => {
    restoreTimerState()
  }, [restoreTimerState])

  const audioRef = useRef<HTMLAudioElement | undefined>(undefined)

  const kitasakuRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    playBirds && plausible({ name: "play_bird_sound" })

    // Only use Audio API on web (check for global Audio constructor)
    if (typeof window !== "undefined" && "Audio" in window) {
      audioRef.current = audioRef.current || new (window as any).Audio()
    }

    if (playBirds) {
      ;(async () => {
        if (!audioRef.current) return

        try {
          audioRef.current.src = `${FRONTEND_URL}/sounds/birds.mp3`
          audioRef.current.loop = true
          audioRef.current.volume = 0.5

          // Preload and play
          audioRef.current.load()
          await audioRef.current.play().catch((error) => {
            console.log("Audio playback failed:", error)
          })
        } catch (error) {
          console.error("Error playing notification sound:", error)
        }
      })()
    } else {
      audioRef.current?.pause()
    }
  }, [playBirds, isExtension])

  const playTimerEnd = useCallback(async () => {
    // Only play sound in web mode (check for global Audio API)
    if (!enableSound || typeof window === "undefined" || !("Audio" in window)) {
      return
    }

    try {
      const audio = new (window as any).Audio()
      audio.src = `${FRONTEND_URL}/sounds/timer-end.mp3`
      audio.volume = 0.9

      // Preload and play
      audio.load()
      await audio.play().catch((error: Error) => {
        console.log("Audio playback failed:", error)
      })
    } catch (error) {
      console.error("Error playing notification sound:", error)
    }
  }, [isExtension, enableSound])

  const isNotificationSupported = typeof Notification !== "undefined"

  const sendNotification = useCallback(() => {
    if (!enableNotifications || isExtension) return
    if (!isNotificationSupported) return

    try {
      if (Notification.permission === "granted") {
        new Notification("Time's up!", {
          body: "Your focus session has ended.",
          icon: "/icons/icon-128.png",
        })
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission()
          .then((permission) => {
            if (permission === "granted") {
              new Notification("Time's up!", {
                body: "Your focus session has ended.",
                icon: "/icons/icon-128.png",
              })
            }
          })
          .catch((error) => {
            console.log("Notification permission request failed:", error)
          })
      }
    } catch (error) {
      console.log("Notification failed:", error)
    }
  }, [enableNotifications, isExtension, isNotificationSupported])

  const startAdjustment = useCallback(
    (direction: number, isMinutes: boolean = false) => {
      // Stop any running timer
      if (isCountingDown) {
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
        setIsCountingDown(false)
        setIsPaused(false)
        setIsFinished(false)
      }

      // Set to paused state when adjusting time
      setIsPaused(true)

      const increment = isMinutes ? 60 : 1 // 60 seconds for minutes, 1 for seconds
      const adjustTime = () => {
        setTime((prevTime: number) => {
          const newTime = prevTime + direction * increment
          // Ensure time stays within bounds (0 to 60 minutes)
          const boundedTime = Math.max(0, Math.min(3600, newTime))
          return boundedTime
        })
      }

      adjustTime() // Initial adjustment

      if (!adjustIntervalRef.current) {
        // 300ms for minutes, 250ms for seconds
        const intervalTime = isMinutes ? 300 : 250

        adjustIntervalRef.current = window.setInterval(adjustTime, intervalTime)
      }
    },
    [isCountingDown],
  )

  const stopAdjustment = useCallback(() => {
    if (adjustIntervalRef.current) {
      clearInterval(adjustIntervalRef.current)
      adjustIntervalRef.current = null
    }
  }, [])

  const handleVisibilityChange = useCallback(
    (now: number) => {
      if (document.hidden) {
        return
      }

      // App coming to foreground - handled by timerState from useLocalStorage
    },
    [time, isCountingDown, startCountdown],
  )

  useEffect(() => {
    const handleVisibilityChangeWrapper = () => {
      const now = Date.now()
      // Prevent multiple updates within 1 second
      if (now - lastVisibilityUpdateRef.current < 1000) {
        return
      }
      lastVisibilityUpdateRef.current = now

      handleVisibilityChange(now)
    }

    document.addEventListener("visibilitychange", handleVisibilityChangeWrapper)
    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChangeWrapper,
      )
    }
  }, [handleVisibilityChange])

  // Handle keyboard events

  useEffect(() => {
    if (isFinished) {
      setPlayBirds(false)
      const timer = setTimeout(() => {
        setIsFinished(false)
      }, 1000) // Match animation duration
      return () => clearTimeout(timer)
    }
  }, [isFinished])

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (adjustIntervalRef.current) clearInterval(adjustIntervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (isExtension) {
      const handleMessage = (message: any) => {
        console.log("Received message:", message)

        if (message.type === "TIMER_UPDATE") {
          console.log("Timer update message:", {
            remainingTime: message.remainingTime,
            running: message.running,
            isPaused: message.isPaused,
          })

          if (message.remainingTime !== undefined) {
            console.log("Updating time to:", message.remainingTime)
            setTime(message.remainingTime)

            // Start or update local timer for smooth UI updates
            if (message.running && !message.isPaused) {
              console.log("Starting local countdown timer")
              if (timerRef.current) {
                console.log("Clearing existing timer")
                clearInterval(timerRef.current)
              }
              timerRef.current = setInterval(() => {
                setTime((prevTime: number) => {
                  const newTime = Math.max(0, prevTime - 1)
                  console.log("Local timer update:", newTime)
                  if (newTime === 0) {
                    console.log("Timer reached zero, clearing interval")
                    clearInterval(timerRef.current)
                    timerRef.current = null
                  }
                  return newTime
                })
              }, 1000)
            } else if (timerRef.current) {
              console.log("Stopping local countdown timer")
              clearInterval(timerRef.current)
              timerRef.current = null
            }
          }

          if (message.running !== undefined) {
            console.log("Updating timer state:", {
              running: message.running,
              paused: !message.running,
            })
            setIsCountingDown(message.running)
            setIsPaused(!message.running)
          }
        }
      }

      console.log("Setting up message listener")

      return () => {
        // Clean up any timers if needed
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      }
    }
  }, [isExtension])

  const [playKitasaku, setPlayKitasaku] = useState(false)

  useEffect(() => {
    if (playKitasaku) {
      plausible({ name: "video_clicked" })
      kitasakuRef.current?.play()
    } else {
      kitasakuRef.current?.pause()
    }
  }, [playKitasaku])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      remoteTimer,
      selectedTasks,
      setSelectedTasks,
      presetMin1,
      presetMin2,
      presetMin3,
      setPresetMin1,
      setPresetMin2,
      setPresetMin3,
      playKitasaku,
      setPlayKitasaku,
      stopAdjustment,
      startAdjustment,
      playTimerEnd,
      playBirds,
      setPlayBirds,
      activePomodoro,
      setActivePomodoro,
      time,
      isCountingDown,
      isPaused,
      isFinished,
      startTime,
      setIsCountingDown,
      setIsPaused,
      setTime,
      setIsFinished,
      startCountdown,
      setStartTime,
      handlePresetTime,
      handleCancel,
      replay,
      setReplay,
      tasks,
      setTasks,
      timer,
      setTimer,
      updateTimer,
      handlePause,
      handleResume,
      isCancelled,
      fetchTasks,
      isLoadingTasks,
      fetchTimer,
    }),
    [
      remoteTimer,
      selectedTasks,
      setSelectedTasks,
      presetMin1,
      presetMin2,
      presetMin3,
      setPresetMin1,
      setPresetMin2,
      setPresetMin3,
      playKitasaku,
      stopAdjustment,
      startAdjustment,
      playTimerEnd,
      isLoadingTasks,
      fetchTasks,
      playBirds,
      activePomodoro,
      time,
      isCountingDown,
      isPaused,
      isFinished,
      startTime,
      startCountdown,
      handlePresetTime,
      handleCancel,
      replay,
      tasks,
      timer,
      updateTimer,
      handlePause,
      handleResume,
      isCancelled,
      fetchTimer,
    ],
  )

  return (
    <TimerContext.Provider value={contextValue}>
      <Audio
        onEnded={() => {
          setPlayKitasaku(false)
        }}
        ref={kitasakuRef}
        src={`https://7079yofdv0.ufs.sh/f/5ALK9G4mxClOzaZ7Raq4EKF7sQYcoB0gvqwN1HhxA3pMTtmI`}
      />
      {children}
    </TimerContext.Provider>
  )
}

export const useTimerContext = () => {
  const context = useContext(TimerContext)
  if (context === undefined) {
    throw new Error(
      "useTimerContext must be used within a TimerContextProvider",
    )
  }

  return context
}
