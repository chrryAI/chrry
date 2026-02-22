"use client"

import {
  addDays,
  addMonths,
  addWeeks,
  differenceInMinutes,
  eachDayOfInterval,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subDays,
  subMonths,
  subWeeks,
} from "date-fns"
import { de, enUS, es, fr, ja, ko, nl, pt, tr, zhCN } from "date-fns/locale"
import { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import useSWR from "swr"
import { useCalendarStyles } from "./Calendar.styles"
import { COLORS, useAppContext } from "./context/AppContext"
import { useAuth, useData, useNavigationContext } from "./context/providers"
import { useStyles } from "./context/StylesContext"
import { useWebSocket } from "./hooks/useWebSocket"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Calendar as CalendarIcon,
  CalendarPlus,
  Clock,
  Columns,
  LayoutGrid,
  List,
  MapPin,
  RefreshCw,
} from "./icons"
import Loading from "./Loading"
import { Button, Div, H4, P, ScrollView, Span, usePlatform } from "./platform"
import type { calendarEvent } from "./types"

// Setup locales
const locales = {
  en: enUS,
  de: de,
  fr: fr,
  es: es,
  ja: ja,
  ko: ko,
  pt: pt,
  zh: zhCN,
  nl: nl,
  tr: tr,
}

type ViewType = "month" | "week" | "day" | "agenda"

const HOUR_HEIGHT = 60
const PIXELS_PER_MINUTE = HOUR_HEIGHT / 60

export default function Calendar({
  onSelectEvent,
  loading = false,
}: {
  onSelectEvent?: (event: calendarEvent) => void
  loading?: boolean
}) {
  const styles = useCalendarStyles()
  const { utilities } = useStyles()
  const { actions } = useData()
  const { t } = useAppContext()
  const [date, setDate] = useState<Date>(new Date())
  const [view, setView] = useState<ViewType>("month")
  const { token, user, language: locale, deviceId, signInContext } = useAuth()
  const { os } = usePlatform()
  const { searchParams } = useNavigationContext()

  // State
  const [calendarEvents, setCalendarEvents] = useState<calendarEvent[]>([])
  const [isGoogleConnected, _setIsGoogleConnected] = useState(
    !!user?.hasCalendarScope,
  )
  const [isSyncing, setIsSyncing] = useState(false)
  const [calendarEventsStartDate, setCalendarEventsStartDate] = useState<
    string | undefined
  >(undefined)
  const [calendarEventsEndDate, setCalendarEventsEndDate] = useState<
    string | undefined
  >(undefined)

  // Data Fetching
  const {
    data: calendarEventsData,
    isLoading: isLoadingCalendarEvents,
    mutate: refetchCalendarEvents,
  } = useSWR(
    token
      ? ["calendarEvents", calendarEventsStartDate, calendarEventsEndDate]
      : null,
    async () => {
      return await actions.getCalendarEvents({
        startDate: calendarEventsStartDate,
        endDate: calendarEventsEndDate,
      })
    },
  )

  // WebSocket
  useWebSocket<{ type: string; data: { event: calendarEvent } }>({
    onMessage: async ({ type, data }) => {
      if (type === "calendar_event") {
        await refetchCalendarEvents()
      }
    },
    token,
    deviceId,
  })

  // Update events state
  useEffect(() => {
    if (calendarEventsData && Array.isArray(calendarEventsData.events)) {
      setCalendarEvents(calendarEventsData.events)
    }
  }, [calendarEventsData])

  // Update date range for fetching based on view
  useEffect(() => {
    let start, end
    if (view === "month" || view === "agenda") {
      start = startOfWeek(startOfMonth(date))
      end = endOfWeek(endOfMonth(date))
    } else if (view === "week") {
      start = startOfWeek(date)
      end = endOfWeek(date)
    } else {
      start = startOfDay(date)
      end = endOfDay(date)
    }
    setCalendarEventsStartDate(start.toISOString())
    setCalendarEventsEndDate(end.toISOString())
  }, [date, view])

  // Group events by day
  const eventsByDay = useMemo(() => {
    if (!calendarEvents) return {}
    const grouped: Record<string, calendarEvent[]> = {}
    calendarEvents.forEach((event) => {
      const dayKey = format(new Date(event.startTime), "yyyy-MM-dd")
      if (!grouped[dayKey]) grouped[dayKey] = []
      grouped[dayKey].push(event)
    })
    Object.keys(grouped).forEach((key) => {
      grouped[key]?.sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
    })
    return grouped
  }, [calendarEvents])

  // Handlers
  const handlePrev = () => {
    if (view === "month" || view === "agenda") setDate(subMonths(date, 1))
    else if (view === "week") setDate(subWeeks(date, 1))
    else setDate(subDays(date, 1))
  }

  const handleNext = () => {
    if (view === "month" || view === "agenda") setDate(addMonths(date, 1))
    else if (view === "week") setDate(addWeeks(date, 1))
    else setDate(addDays(date, 1))
  }

  const handleToday = () => setDate(new Date())

  const handleGoogleSync = async () => {
    if (!token) return
    if (!isGoogleConnected) {
      if (!signInContext) {
        toast.error("Sign-in not available")
        return
      }
      try {
        await signInContext("google", {
          callbackUrl: "/calendar",
          errorUrl: "/calendar?error=google",
          redirect: true,
        })
      } catch (_error) {
        toast.error("Failed to connect Google Calendar")
      }
      return
    }
    setIsSyncing(true)
    try {
      const result = await actions.syncGoogleCalendar()
      if (result.error) {
        toast.error(result.error)
      } else {
        await refetchCalendarEvents()
        toast.success(`Synced ${result.imported} events`)
      }
    } catch (_error) {
      toast.error("Failed to sync")
    } finally {
      setIsSyncing(false)
    }
  }

  const getEventColor = (colorName?: string) => {
    switch (colorName) {
      case "red":
        return COLORS.red
      case "orange":
        return COLORS.orange
      case "blue":
        return COLORS.blue
      case "green":
        return COLORS.green
      case "violet":
        return COLORS.violet
      case "purple":
        return COLORS.purple
      default:
        return COLORS.blue
    }
  }

  // --- Renderers ---

  const renderTimeGrid = (days: Date[]) => {
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <ScrollView style={{ flex: 1 }}>
        <Div style={{ flexDirection: "row" }}>
          {/* Time Column */}
          <Div style={{ width: 50, borderRight: "1px solid var(--shade-2)" }}>
            <Div
              style={{ height: 40, borderBottom: "1px solid var(--shade-2)" }}
            />{" "}
            {/* Header spacer */}
            {hours.map((hour) => (
              <Div
                key={hour}
                style={{
                  height: HOUR_HEIGHT,
                  alignItems: "center",
                  justifyContent: "flex-start",
                  paddingTop: 8,
                }}
              >
                <Span style={{ fontSize: 10, color: "var(--text-secondary)" }}>
                  {format(new Date().setHours(hour, 0), "HH:mm")}
                </Span>
              </Div>
            ))}
          </Div>

          {/* Days Columns */}
          <Div style={{ flex: 1, flexDirection: "row" }}>
            {days.map((day) => {
              const dayKey = format(day, "yyyy-MM-dd")
              const events = eventsByDay[dayKey] || []
              const isToday = isSameDay(day, new Date())

              return (
                <Div
                  key={dayKey}
                  style={{
                    flex: 1,
                    borderRight: "1px solid var(--shade-1)",
                    minWidth: days.length === 1 ? undefined : 100,
                  }}
                >
                  {/* Header */}
                  <Div
                    style={{
                      height: 40,
                      borderBottom: "1px solid var(--shade-2)",
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: isToday
                        ? "var(--background-secondary)"
                        : "transparent",
                    }}
                  >
                    <Span
                      style={{
                        fontSize: 12,
                        fontWeight: isToday ? "bold" : "normal",
                        color: isToday
                          ? "var(--primary)"
                          : "var(--text-primary)",
                      }}
                    >
                      {format(day, "EEE d")}
                    </Span>
                  </Div>

                  {/* Grid */}
                  <Div
                    style={{ position: "relative", height: 24 * HOUR_HEIGHT }}
                  >
                    {/* Hour lines */}
                    {hours.map((hour) => (
                      <Div
                        key={hour}
                        style={{
                          position: "absolute",
                          top: hour * HOUR_HEIGHT,
                          left: 0,
                          right: 0,
                          height: 1,
                          backgroundColor: "var(--shade-1)",
                        }}
                      />
                    ))}

                    {/* Events */}
                    {events.map((event) => {
                      const start = new Date(event.startTime)
                      const end = new Date(event.endTime)
                      const startMinutes =
                        start.getHours() * 60 + start.getMinutes()
                      const duration = differenceInMinutes(end, start)

                      return (
                        <Button
                          key={event.id}
                          onClick={() => onSelectEvent?.(event)}
                          style={{
                            position: "absolute",
                            top: startMinutes * PIXELS_PER_MINUTE,
                            left: 2,
                            right: 2,
                            height: Math.max(duration * PIXELS_PER_MINUTE, 20),
                            backgroundColor: getEventColor(
                              event.color as string,
                            ),
                            borderRadius: 4,
                            padding: 4,
                            overflow: "hidden",
                            opacity: 0.9,
                            zIndex: 10,
                          }}
                        >
                          <Span
                            style={{
                              fontSize: 10,
                              color: "white",
                              fontWeight: "bold",
                            }}
                          >
                            {event.title}
                          </Span>
                          {duration > 45 && (
                            <Span style={{ fontSize: 9, color: "white" }}>
                              {format(start, "HH:mm")} - {format(end, "HH:mm")}
                            </Span>
                          )}
                        </Button>
                      )
                    })}
                  </Div>
                </Div>
              )
            })}
          </Div>
        </Div>
      </ScrollView>
    )
  }

  const renderMonthView = () => {
    const start = startOfWeek(startOfMonth(date))
    const end = endOfWeek(endOfMonth(date))
    const calendarDays = eachDayOfInterval({ start, end })

    return (
      <Div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Div
          style={{
            display: "flex",
            flexDirection: "row",
            borderBottom: "1px solid var(--shade-2)",
            paddingBottom: 8,
          }}
        >
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Div
              key={day}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                }}
              >
                {t(day)}
              </Span>
            </Div>
          ))}
        </Div>
        <Div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          {calendarDays.map((day) => {
            const dayKey = format(day, "yyyy-MM-dd")
            const events = eventsByDay[dayKey] || []
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, date)

            return (
              <Button
                key={dayKey}
                onClick={() => {
                  setDate(day)
                  setView("agenda")
                }}
                style={{
                  width: "14.28%",
                  height: "16.66%",
                  borderRight: "1px solid var(--shade-1)",
                  borderBottom: "1px solid var(--shade-1)",
                  padding: 4,
                  alignItems: "flex-start",
                  justifyContent: "flex-start",
                  backgroundColor: isCurrentMonth
                    ? "transparent"
                    : "var(--background-secondary)",
                  opacity: isCurrentMonth ? 1 : 0.5,
                }}
              >
                <Div
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: isToday ? "var(--primary)" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 2,
                  }}
                >
                  <Span
                    style={{
                      fontSize: 12,
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? "white" : "var(--text-primary)",
                    }}
                  >
                    {format(day, "d")}
                  </Span>
                </Div>
                <Div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  {events.slice(0, 4).map((event) => (
                    <Div
                      key={event.id}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: getEventColor(event.color as string),
                      }}
                    />
                  ))}
                  {events.length > 4 && (
                    <Span
                      style={{ fontSize: 8, color: "var(--text-secondary)" }}
                    >
                      +
                    </Span>
                  )}
                </Div>
              </Button>
            )
          })}
        </Div>
      </Div>
    )
  }

  const renderAgendaView = () => (
    <ScrollView style={{ flex: 1 }}>
      <Div
        style={{
          padding: 16,
          gap: 24,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {eachDayOfInterval({
          start: startOfMonth(date),
          end: endOfMonth(date),
        }).map((day) => {
          const dayKey = format(day, "yyyy-MM-dd")
          const events = eventsByDay[dayKey] || []
          const isToday = isSameDay(day, new Date())
          if (events.length === 0) return null

          return (
            <Div
              key={dayKey}
              style={{ display: "flex", flexDirection: "column", gap: 8 }}
            >
              <Div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Span
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: isToday ? "var(--primary)" : "var(--text-primary)",
                  }}
                >
                  {format(day, "d")}
                </Span>
                <Span
                  style={{
                    fontSize: 14,
                    color: isToday ? "var(--primary)" : "var(--text-secondary)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  {format(day, "EEE", {
                    locale: locales[locale as keyof typeof locales] || enUS,
                  })}
                </Span>
              </Div>
              <Div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  paddingLeft: 16,
                }}
              >
                {events.map((event) => (
                  <Button
                    key={event.id}
                    onClick={() => onSelectEvent?.(event)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      padding: 12,
                      backgroundColor: "var(--background-secondary)",
                      borderRadius: 8,
                      borderLeft: `4px solid ${getEventColor(event.color as string)}`,
                      gap: 4,
                      alignItems: "flex-start",
                      textAlign: "left",
                    }}
                  >
                    <Span style={{ fontWeight: 600, fontSize: 16 }}>
                      {event.title}
                    </Span>
                    <Div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        opacity: 0.8,
                      }}
                    >
                      <Div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Clock size={12} />
                        <Span style={{ fontSize: 12 }}>
                          {event.isAllDay
                            ? t("All day")
                            : `${format(new Date(event.startTime), "HH:mm")} - ${format(new Date(event.endTime), "HH:mm")}`}
                        </Span>
                      </Div>
                      {event.location && (
                        <Div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <MapPin size={12} />
                          <Span style={{ fontSize: 12 }}>{event.location}</Span>
                        </Div>
                      )}
                    </Div>
                  </Button>
                ))}
              </Div>
            </Div>
          )
        })}
        {Object.keys(eventsByDay).length === 0 && !isLoadingCalendarEvents && (
          <Div
            style={{
              padding: 32,
              alignItems: "center",
              justifyContent: "center",
              opacity: 0.5,
            }}
          >
            <P>{t("No events this month")}</P>
          </Div>
        )}
      </Div>
    </ScrollView>
  )

  return (
    <Div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Toolbar */}
      <Div
        style={{
          ...styles.toolbar.style,
          padding: 16,
          borderBottom: "1px solid var(--shade-2)",
        }}
      >
        <Div style={styles.toolbarSection.style}>
          <Button onClick={handleToday} style={utilities.transparent.style}>
            {t("Today")}
          </Button>
          <Div style={{ display: "flex", gap: 8 }}>
            <Button
              onClick={handlePrev}
              style={{ ...utilities.inverted.style, padding: 8 }}
            >
              <ArrowLeftIcon size={16} />
            </Button>
            <Button
              onClick={handleNext}
              style={{ ...utilities.inverted.style, padding: 8 }}
            >
              <ArrowRightIcon size={16} />
            </Button>
          </Div>
        </Div>

        <H4 style={styles.toolbarLabel.style}>
          {format(date, view === "day" ? "MMMM d, yyyy" : "MMMM yyyy", {
            locale: locales[locale as keyof typeof locales] || enUS,
          })}
        </H4>

        <Div style={{ display: "flex", gap: 8 }}>
          <Button
            onClick={() => setView("month")}
            style={{
              ...utilities.transparent.style,
              opacity: view === "month" ? 1 : 0.5,
            }}
          >
            <CalendarIcon size={16} />
          </Button>
          <Button
            onClick={() => setView("week")}
            style={{
              ...utilities.transparent.style,
              opacity: view === "week" ? 1 : 0.5,
            }}
          >
            <LayoutGrid size={16} />
          </Button>
          <Button
            onClick={() => setView("day")}
            style={{
              ...utilities.transparent.style,
              opacity: view === "day" ? 1 : 0.5,
            }}
          >
            <Columns size={16} />
          </Button>
          <Button
            onClick={() => setView("agenda")}
            style={{
              ...utilities.transparent.style,
              opacity: view === "agenda" ? 1 : 0.5,
            }}
          >
            <List size={16} />
          </Button>

          <Button
            onClick={handleGoogleSync}
            disabled={isSyncing}
            style={utilities.transparent.style}
          >
            {isSyncing ? (
              <Loading size={16} />
            ) : isGoogleConnected ? (
              <RefreshCw size={16} />
            ) : (
              <CalendarPlus size={16} />
            )}
          </Button>
        </Div>
      </Div>

      {/* Main Content */}
      {view === "month" && renderMonthView()}
      {view === "week" &&
        renderTimeGrid(
          eachDayOfInterval({ start: startOfWeek(date), end: endOfWeek(date) }),
        )}
      {view === "day" && renderTimeGrid([date])}
      {view === "agenda" && renderAgendaView()}
    </Div>
  )
}
