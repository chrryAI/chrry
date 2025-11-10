"use client"

import React, { useEffect, useState } from "react"
import { mood } from "./types"
import styles from "./MoodReports.module.scss"
import { BarChart, Bar, Cell, LabelList } from "recharts"

import { Trans, useTranslation } from "react-i18next"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import clsx from "clsx"
import { FRONTEND_URL } from "./utils"
import { useAuth } from "./context/providers"
import { useNavigation, useTheme } from "./platform"
import Loading from "./Loading"
import Img from "./Image"

import { ArrowLeft, ArrowRight } from "./icons"

type Mood = "happy" | "sad" | "angry" | "astonished" | "inlove" | "thinking"

const emojiMap: Record<Mood, string> = {
  happy: "😊",
  sad: "😢",
  angry: "😠",
  astonished: "😲",
  inlove: "😍",
  thinking: "🤔",
}

const moodValues: Record<Mood, number> = {
  happy: 80,
  sad: 20,
  angry: 10,
  astonished: 60,
  inlove: 100,
  thinking: 50,
}

const getMoodEmoji = (type: string) => {
  return emojiMap[type as Mood] || "🫥"
}
export default function MoodReports({
  className,
  onClose,
}: {
  onClose?: () => void
  className?: string
}) {
  const {
    isLoadingMoods,
    fetchMoods,
    user,
    guest,
    moods,
    token,
    language,
    track: trackEvent,
  } = useAuth()

  const { push, addParams, removeParams } = useNavigation()
  const [isClient, setIsClient] = useState(false)
  useEffect(() => {
    setIsClient(true)
  }, [])
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [isWindows, setIsWindows] = useState(false)

  useEffect(() => {
    setIsWindows(
      typeof window !== "undefined" && navigator.userAgent.includes("Windows"),
    )
  }, [])

  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() - 1)
    setCurrentMonth(newMonth)
  }

  const goToNextMonth = () => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(newMonth.getMonth() + 1)
    setCurrentMonth(newMonth)
  }

  const isLatestMonth = () => {
    const today = new Date()
    return (
      currentMonth.getMonth() === today.getMonth() &&
      currentMonth.getFullYear() === today.getFullYear()
    )
  }
  const goToPreviousWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() - 7)
    setCurrentWeek(newWeek)
    setCurrentDay(newWeek)
  }

  const goToNextWeek = () => {
    const newWeek = new Date(currentWeek)
    newWeek.setDate(newWeek.getDate() + 7)
    setCurrentWeek(newWeek)
    setCurrentDay(newWeek) // Sync daily view to first day of week
  }

  const getCurrentWeekMoods = () => {
    const startOfWeek = new Date(currentWeek)
    const day = currentWeek.getDay()
    const diff = (day === 0 ? -6 : 1) - day
    startOfWeek.setDate(currentWeek.getDate() + diff)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    endOfWeek.setHours(23, 59, 59, 999)

    const weekMoods = moods.moods?.filter(
      (mood) => mood.createdOn >= startOfWeek && mood.createdOn <= endOfWeek,
    )

    if (!weekMoods?.length) return []

    // Group moods by day and calculate average
    const moodsByDay = new Map<
      string,
      { moods: typeof weekMoods; sum: number; count: number }
    >()

    weekMoods.forEach((mood) => {
      const dateKey = new Date(mood.createdOn).toLocaleDateString()
      const moodValue = moodValues[mood.type as Mood] || 50

      if (!moodsByDay.has(dateKey)) {
        moodsByDay.set(dateKey, { moods: [], sum: 0, count: 0 })
      }

      const dayData = moodsByDay.get(dateKey)!
      dayData.moods.push(mood)
      dayData.sum += moodValue
      dayData.count++
    })

    // Convert to array with average mood per day
    return Array.from(moodsByDay.entries())
      .map(([date, data]) => {
        const avgValue = Math.round(data.sum / data.count)
        // Determine the most representative mood based on average
        const avgMood =
          avgValue >= moodValues.happy
            ? "happy"
            : avgValue >= moodValues.astonished
              ? "astonished"
              : avgValue >= moodValues.thinking
                ? "thinking"
                : avgValue >= moodValues.sad
                  ? "sad"
                  : avgValue >= moodValues.angry
                    ? "angry"
                    : "thinking"

        const firstMood = data.moods[0]
        if (!firstMood) return null

        return {
          date,
          mood: avgMood,
          emoji: getMoodEmoji(avgMood),
          id: firstMood.id,
          createdOn: firstMood.createdOn,
          value: avgValue,
          moodCount: data.count, // How many moods contributed to this average
        }
      })
      .filter((mood): mood is NonNullable<typeof mood> => mood !== null)
      .sort(
        (a, b) =>
          new Date(a.createdOn).getTime() - new Date(b.createdOn).getTime(),
      )
  }

  const getBarColor = (score: number) => {
    if (score < 30) return "var(--accent-0)" // red
    if (score < 50) return "var(--accent-1)" // orange
    if (score < 70) return "var(--accent-6)" // blue
    return "var(--accent-4)" // green
  }
  const { t } = useTranslation()

  useEffect(() => {
    if (!token) return
    fetchMoods()
  }, [token])

  const [currentDay, setCurrentDay] = useState(new Date())

  const getDailyMoodsForWeek = () => {
    const weekMoods = getCurrentWeekMoods()
    return ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
      (day, index) => {
        const jsDayIndex = index === 6 ? 0 : index + 1 // Map to JS day indices (Sun=0, Mon=1, etc.)
        const mood = weekMoods.find((m) => {
          return new Date(m.createdOn).getDay() === jsDayIndex
        })
        return {
          day,
          mood: mood || null,
        }
      },
    )
  }

  const isLatestDay = () => {
    const today = new Date()
    return currentDay.toDateString() === today.toDateString()
  }

  const isLatestWeek = () => {
    if (!moods.moods?.length) return true

    const today = new Date()
    const currentWeekStart = new Date(today)
    currentWeekStart.setDate(today.getDate() - today.getDay() + 1) // Monday
    currentWeekStart.setHours(0, 0, 0, 0)

    const viewedWeekStart = new Date(currentWeek)
    viewedWeekStart.setDate(currentWeek.getDate() - currentWeek.getDay() + 1) // Monday
    viewedWeekStart.setHours(0, 0, 0, 0)

    return viewedWeekStart.getTime() >= currentWeekStart.getTime()
  }

  const getMostRecentWeekWithData = () => {
    if (!moods.moods?.length) return []

    const latestDate = new Date(moods.moods[0]?.createdOn || new Date())

    // Calculate days since Monday (1)
    const daysSinceMonday = (latestDate.getDay() + 6) % 7
    const startOfWeek = new Date(latestDate)
    startOfWeek.setDate(latestDate.getDate() - daysSinceMonday)
    startOfWeek.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // Full 7-day week
    endOfWeek.setHours(23, 59, 59, 999)

    return moods.moods.filter(
      (mood) => mood.createdOn >= startOfWeek && mood.createdOn <= endOfWeek,
    )
  }
  const getMonthlyChartData = () => {
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    )
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
    )
    monthEnd.setHours(23, 59, 59, 999)

    const weeklyData: Record<number, { sum: number; count: number }> = {}

    moods.moods?.forEach((mood) => {
      const moodDate = new Date(mood.createdOn)
      if (moodDate >= monthStart && moodDate <= monthEnd) {
        const weekNum = Math.ceil(moodDate.getDate() / 7)
        const moodValue = moodValues[mood.type as Mood] || 50

        if (!weeklyData[weekNum]) {
          weeklyData[weekNum] = { sum: 0, count: 0 }
        }
        weeklyData[weekNum].sum += moodValue
        weeklyData[weekNum].count++
      }
    })

    return Object.entries(weeklyData).map(([week, data]) => ({
      week: parseInt(week),
      value: Math.round(data.sum / data.count),
      color: getBarColor(Math.round(data.sum / data.count)),
    }))
  }

  const monthlyChartData = getMonthlyChartData()
  if (!isClient) return null

  if (isLoadingMoods) {
    return (
      <div className={styles.loadingContainer}>
        <Loading />
      </div>
    )
  }

  return (
    <div className={clsx(styles.moodReports, className)}>
      <h2 className={styles.title} data-testid="moods-daily">
        🫥 {t("Daily")}{" "}
        <button
          className={clsx(styles.close, "link")}
          onClick={() => {
            removeParams("moodReport")
            onClose?.()
          }}
        >
          Focus
          <Img size={24} logo="focus" />
        </button>
      </h2>
      <div>
        <div
          className={styles.dailyMoods}
          style={{
            width: "100%",
            backgroundColor: "var(--shade-1)",
            borderRadius: "var(--radius)",
            outline: "1px solid var(--accent-1)",
            padding: "20px",
            boxShadow: "var(--shadow)",
          }}
        >
          {getDailyMoodsForWeek().map((moodForDay, index) => {
            const dayKey =
              ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][index] || "Sun"
            return (
              <div key={dayKey} className={styles.dayMood}>
                <span
                  className={`${styles.moodEmoji} ${isWindows ? styles.windows : ""}`}
                >
                  {getMoodEmoji(moodForDay?.mood?.mood || "🫥")}
                </span>
                <span className={styles.dayName}>{t(dayKey)}</span>
              </div>
            )
          })}
        </div>
        <div className={styles.navigation}>
          <span>
            <Trans
              i18nKey="Week of {{date}}"
              values={{
                date: currentWeek.toLocaleDateString(language, {
                  month: "short",
                  day: "numeric",
                }),
              }}
            />
          </span>
          <button
            data-testid="moods-previous-week-daily"
            className={clsx("link", styles.previous)}
            onClick={goToPreviousWeek}
          >
            <ArrowLeft size={16} className={styles.arrow} />
          </button>

          <button
            data-testid="moods-next-week-daily"
            disabled={isLatestDay()}
            className={clsx("link", styles.next)}
            onClick={goToNextWeek}
          >
            <ArrowRight size={16} className={styles.arrow} />
          </button>
        </div>
      </div>
      <h2 data-testid="moods-weekly" className={styles.title}>
        <span>📈 {t("Weekly")}</span>
      </h2>
      <div>
        <div
          style={{
            width: "100%",
            height: "300px",
            borderRadius: "var(--radius)",
            outline: "1px solid var(--accent-1)",
            boxShadow: "var(--shadow)",
          }}
        >
          <ResponsiveContainer>
            <LineChart
              data={getCurrentWeekMoods()}
              margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
            >
              {/* Remove CartesianGrid */}
              <XAxis
                dataKey="date"
                tickFormatter={(dateStr, index) => {
                  const date = new Date(
                    dateStr.includes("/")
                      ? dateStr.split("/").reverse().join("-")
                      : dateStr,
                  )

                  return t(
                    ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][
                      date.getDay() - 1
                    ] || "Sun",
                  )
                }}
                tick={{ fontSize: 12 }} // Smaller font size
              />
              <YAxis
                hide
                domain={[0, 100]}
                tick={{ fontSize: 12 }} // Consistent smaller font size
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--shade-1)",
                  border: "1px solid var(--shade-2)",
                  borderRadius: "var(--radius)",
                  color: "var(--foreground)",
                }}
                formatter={(value, name, props) => {
                  const moodCount = props.payload.moodCount || 1
                  return [
                    `${props.payload.emoji} ${props.payload.mood}`,
                    `Score: ${value}`,
                    moodCount > 1 ? `(avg of ${moodCount} moods)` : "",
                  ]
                }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="var(--accent-1)" // Using CSS variable for accent-6 color
                strokeWidth={2.5}
                dot={(props) => (
                  <text
                    key={props.payload.id}
                    x={props.cx}
                    y={props.cy}
                    dy={-8}
                    fontSize={20}
                    textAnchor="middle"
                  >
                    {getMoodEmoji(props.payload.mood)}
                  </text>
                )}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.navigation}>
          <span>
            <Trans
              i18nKey="Week of {{date}}"
              values={{
                date: currentWeek.toLocaleDateString(language, {
                  month: "short",
                  day: "numeric",
                }),
              }}
            />
          </span>
          <button
            data-testid="moods-previous-week-weekly"
            className={clsx("link", styles.previous)}
            onClick={goToPreviousWeek}
          >
            <ArrowLeft size={16} className={styles.arrow} />
          </button>

          <button
            data-testid="moods-next-week-weekly"
            disabled={isLatestWeek()}
            className={clsx("link", styles.next)}
            onClick={goToNextWeek}
          >
            <ArrowRight size={16} className={styles.arrow} />
          </button>
        </div>
      </div>

      <h2 data-testid="moods-monthly" className={styles.title}>
        📊 {t("Monthly")}{" "}
      </h2>

      <div>
        <div
          style={{
            width: "100%",
            height: "300px",
            backgroundColor: "var(--shade-1)",
            borderRadius: "var(--radius)",
            outline: "1px solid var(--accent-1)",
            boxShadow: "var(--shadow)",
          }}
        >
          <ResponsiveContainer>
            <BarChart
              data={monthlyChartData}
              margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis
                dataKey="week"
                tickFormatter={(week) => t("week_number", { number: week })}
                tick={{ fontSize: 12 }}
              />
              <YAxis hide domain={[0, 100]} />
              <Bar dataKey="value" radius={[18, 18, 0, 0]}>
                {monthlyChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
                <LabelList
                  dataKey="value"
                  position="top"
                  fill="var(--foreground)"
                  fontSize={12}
                  fontWeight={500}
                  formatter={(value: any) => {
                    const numValue = Number(value)
                    if (isNaN(numValue)) return value

                    const emoji = getMoodEmoji(
                      numValue >= moodValues.happy
                        ? "happy"
                        : numValue <= moodValues.sad
                          ? "sad"
                          : numValue <= moodValues.angry
                            ? "angry"
                            : numValue >= moodValues.astonished
                              ? "astonished"
                              : numValue >= moodValues.inlove
                                ? "inlove"
                                : "neutral",
                    )
                    return `${emoji} ${numValue}`
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className={styles.navigation}>
          <span>
            <Trans
              i18nKey="Month of {{date}}"
              values={{
                date: currentMonth.toLocaleDateString(language, {
                  month: "short",
                  year: "numeric",
                }),
              }}
            />
          </span>
          <button
            data-testid="moods-previous-month"
            className={clsx("link", styles.previous)}
            onClick={goToPreviousMonth}
          >
            <ArrowLeft size={16} className={styles.arrow} />
          </button>
          <button
            data-testid="moods-next-month"
            disabled={isLatestMonth()}
            className={clsx("link", styles.next)}
            onClick={goToNextMonth}
          >
            <ArrowRight size={16} className={styles.arrow} />
          </button>
        </div>
      </div>
    </div>
  )
}
