"use client"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"

import React, { useState, useCallback, useMemo, useEffect } from "react"
import {
  Calendar as BigCalendar,
  Views,
  View,
  ToolbarProps,
} from "react-big-calendar"
// Import drag and drop - using dynamic import for better compatibility
import * as DnDModule from "react-big-calendar/lib/addons/dragAndDrop"
const withDragAndDrop = (DnDModule as any).default || DnDModule
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  parse,
  getDay,
} from "date-fns"
import useSWR from "swr"
import { dateFnsLocalizer } from "react-big-calendar"
import { enUS, de, fr, es, ja, ko, pt, zhCN, nl, tr } from "date-fns/locale"
import "react-big-calendar/lib/addons/dragAndDrop/styles.css"
import styles from "./Calendar.module.scss"
import clsx from "clsx"
import Skeleton from "./Skeleton"
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowLeft,
  CalendarPlus,
  RefreshCw,
} from "./icons"
import EventModal from "./EventModal"
import { COLORS, useAppContext } from "./context/AppContext"
import { modalData } from "./EventModal"
import { CalendarEventFormData } from "./lib"
import Loading from "./Loading"
import toast from "react-hot-toast"
import { useAuth, useData, useNavigationContext } from "./context/providers"
import { usePlatform } from "./platform"
import { useHasHydrated } from "./hooks"
import { useWebSocket } from "./hooks/useWebSocket"
import { calendarEvent } from "./types"

// Setup localizer with all supported locales
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

// Create localizer factory that accepts locale
const createLocalizer = (locale: string) => {
  const dateFnsLocale = locales[locale as keyof typeof locales] || enUS
  return dateFnsLocalizer({
    format: (date: Date | string | number, formatStr: string) => {
      const dateObj = date instanceof Date ? date : new Date(date)
      return format(dateObj, formatStr, { locale: dateFnsLocale })
    },
    parse: (str: string, formatStr: string) =>
      parse(str, formatStr, new Date(), { locale: dateFnsLocale }),
    startOfWeek: (date: Date | string | number) => {
      const dateObj = date instanceof Date ? date : new Date(date)
      return startOfWeek(dateObj, { locale: dateFnsLocale })
    },
    getDay,
    locales: { [locale]: dateFnsLocale },
  })
}

// Create drag-and-drop enabled calendar (will be created inside component to avoid SSR issues)

// Custom toolbar component
const CustomToolbar = (
  props: ToolbarProps<calendarEvent, object> & {
    onGoogleSync?: () => void
    isGoogleConnected?: boolean
    isSyncing?: boolean
  },
) => {
  const {
    label,
    onNavigate,
    onView,
    view: initialView,
    onGoogleSync,
    isGoogleConnected,
    isSyncing,
  } = props
  const { t } = useAppContext()
  const [view, setView] = useState<View>(initialView)

  const { searchParams, goToThread, goToApp } = useNavigationContext()

  const threadId = searchParams.get("threadId")
  const app = searchParams.get("app")

  // Sync view state from URL

  const availableViews = [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]

  return (
    <div className={styles.toolbar}>
      <div className={styles.toolbarSection}>
        {(threadId || app) && (
          <button
            onClick={() => (app ? goToApp(app) : goToThread(threadId!))}
            className="transparent"
            title={t("Back to chat")}
          >
            <ArrowLeft size={16} />
            {t("Back")}
          </button>
        )}
        <button onClick={() => onNavigate("TODAY")}>{t("Today")}</button>
        <button
          className={clsx("inverted", styles.arrowButton)}
          onClick={() => onNavigate("PREV")}
        >
          <ArrowLeftIcon size={16} />
        </button>
        <button
          className={clsx("inverted", styles.arrowButton)}
          onClick={() => onNavigate("NEXT")}
        >
          <ArrowRightIcon size={16} />
        </button>
        {onGoogleSync && (
          <button
            onClick={onGoogleSync}
            disabled={isSyncing}
            className="transparent"
            title={
              isGoogleConnected
                ? t("Sync with Google Calendar")
                : t("Connect Google Calendar")
            }
          >
            {isSyncing ? (
              <Loading size={16} />
            ) : isGoogleConnected ? (
              <>
                <RefreshCw size={16} />
                {t("Sync")}
              </>
            ) : (
              <>
                <CalendarPlus size={16} />
                {t("Connect Google")}
              </>
            )}
          </button>
        )}
      </div>

      <div className={styles.toolbarLabel}>{label}</div>

      <div className={clsx(styles.toolbarSection, styles.viewButtons)}>
        {availableViews.map((viewName) => (
          <button
            key={viewName}
            className={clsx(view !== viewName ? "transparent" : "inverted")}
            onClick={() => onView(viewName)}
          >
            {viewName === Views.MONTH && t("Month")}
            {viewName === Views.WEEK && t("Week")}
            {viewName === Views.DAY && t("Day")}
            {viewName === Views.AGENDA && t("Agenda")}
          </button>
        ))}
      </div>
    </div>
  )
}

// Event component with color support
const EventComponent = ({ event }: { event: calendarEvent }) => {
  return (
    <div className={clsx("rbc-event", event.color && styles[event.color])}>
      <strong>{event.title}</strong>
    </div>
  )
}

export default function Calendar({
  onSelectEvent,
  onSelectSlot,
  onEventDrop,
  onEventResize,
  loading = false,
  defaultView = Views.MONTH,
  defaultDate = new Date(),
  className,
}: {
  events?: calendarEvent[]
  onSelectEvent?: (event: calendarEvent) => void
  onSelectSlot?: (slotInfo: { start: Date; end: Date; slots: Date[] }) => void
  onEventDrop?: (event: {
    event: calendarEvent
    start: Date
    end: Date
  }) => void
  onEventResize?: (event: {
    event: calendarEvent
    start: Date
    end: Date
  }) => void
  loading?: boolean
  defaultView?: View
  defaultDate?: Date
  className?: string
}) {
  const { actions } = useData()

  useHasHydrated()

  const [calendarEvents, setCalendarEvents] = useState<calendarEvent[]>([])

  // Handle event selection - open modal for editing
  const handleSelectEvent = useCallback(
    (event: calendarEvent, e?: any) => {
      // Don't open modal if clicking "show more" button

      // Find the full event data from calendarEvents
      const fullEvent = calendarEvents.find((e) => e.id === event.id)

      // Open modal with event data for editing
      setModalData({
        start: (event as any).start || new Date(event.startTime),
        end: (event as any).end || new Date(event.endTime),
        title: event.title,
        eventId: event.id, // Pass event ID for update
        description: fullEvent?.description,
        location: fullEvent?.location,
        color: fullEvent?.color,
        category: fullEvent?.category,
        isAllDay: fullEvent?.isAllDay,
        timezone: fullEvent?.timezone,
        attendees: fullEvent?.attendees,
        reminders: fullEvent?.reminders,
        // recurrence: fullEvent?.recurrence,
      })
      setIsModalOpen(true)

      if (onSelectEvent) {
        onSelectEvent(event)
      }
    },
    [onSelectEvent, calendarEvents],
  )

  const { t, console } = useAppContext()
  const [date, setDate] = useState<Date>(new Date()) // Force current date
  const {
    token,
    API_URL,
    signInContext,
    user,
    language: locale,
    deviceId,
  } = useAuth()
  const { os, device } = usePlatform()

  const { searchParams, router } = useNavigationContext()

  // Create localizer based on user's locale
  const localizer = useMemo(() => createLocalizer(locale || "en"), [locale])

  // Custom messages for react-big-calendar
  const messages = useMemo(
    () => ({
      date: t("Date"),
      time: t("Time"),
      event: t("Event"),
      allDay: t("All day"),
      week: t("Week"),
      work_week: t("Week"),
      day: t("Day"),
      month: t("Month"),
      previous: t("Previous"),
      next: t("Next"),
      yesterday: t("Yesterday"),
      tomorrow: t("Tomorrow"),
      today: t("Today"),
      agenda: t("Agenda"),
      noEventsInRange: t("No events in this range"),
      showMore: (total: number) => `+${total} ${t("more")}`,
    }),
    [t],
  )
  const initialView = (searchParams.get("view") as View) || defaultView
  const [view, setView] = useState<View>(initialView)

  // Sync view state when URL changes (browser back/forward)
  useEffect(() => {
    const urlView = (searchParams.get("view") as View) || defaultView
    if (urlView !== view) {
      setView(urlView)
    }
  }, [searchParams, defaultView])

  // Listen for browser back/forward button
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      const urlView = (params.get("view") as View) || defaultView
      setView(urlView)
    }

    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [defaultView])
  const hasCalendarScope = user?.hasCalendarScope

  const [isGoogleConnected, setIsGoogleConnected] = useState(!!hasCalendarScope)
  const [isSyncing, setIsSyncing] = useState(false)

  const [calendarEventsStartDate, setCalendarEventsStartDate] = useState<
    string | undefined
  >(undefined)
  const [calendarEventsEndDate, setCalendarEventsEndDate] = useState<
    string | undefined
  >(undefined)

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

  // Real-time calendar event updates via WebSocket
  useWebSocket<{
    type: string
    data: {
      event: calendarEvent
    }
  }>({
    onMessage: async ({ type, data }) => {
      if (type === "calendar_event") {
        console.log("📅 New calendar event created:", data.event)
        // Refetch calendar events to show the new event
        refetchCalendarEvents()
      }
    },
    token,
    deviceId,
  })

  useEffect(() => {
    if (calendarEventsData && Array.isArray(calendarEventsData.events)) {
      setCalendarEvents(calendarEventsData.events)
    }
  }, [calendarEventsData, isGoogleConnected])

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Transform API events to calendar format with proper Date objects
  const { transformedEvents, eventsByDay } = useMemo(() => {
    if (!calendarEvents) return { transformedEvents: [], eventsByDay: {} }

    // Group events by day
    const eventsByDay: Record<string, calendarEvent[]> = {}
    const allEvents: calendarEvent[] = []

    calendarEvents
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
      )
      .forEach((calendarEvent) => {
        const dayKey = format(new Date(calendarEvent.startTime), "yyyy-MM-dd")
        if (!eventsByDay[dayKey]) {
          eventsByDay[dayKey] = []
        }

        // Transform event with Date objects for react-big-calendar
        const transformedEvent = {
          ...calendarEvent,
          start: new Date(calendarEvent.startTime),
          end: new Date(calendarEvent.endTime),
        }

        eventsByDay[dayKey].push(transformedEvent)
        allEvents.push(transformedEvent)
      })

    // Don't limit events - let react-big-calendar handle "show more"
    const limitedEvents: calendarEvent[] = []
    Object.values(eventsByDay).forEach((dayEvents) => {
      limitedEvents.push(...dayEvents)
    })

    return { transformedEvents: limitedEvents, eventsByDay }
  }, [calendarEvents, view])

  // Ensure we start with current date on mount
  useEffect(() => {
    const now = new Date()
    setDate(now)
  }, [])

  // Update date range when view or date changes to fetch appropriate events
  useEffect(() => {
    let startOfRange: Date
    let endOfRange: Date

    if (view === Views.MONTH) {
      startOfRange = startOfMonth(date)
      endOfRange = endOfMonth(date)
    } else if (view === Views.WEEK) {
      startOfRange = startOfWeek(date)
      endOfRange = endOfWeek(date)
    } else {
      startOfRange = startOfDay(date)
      endOfRange = endOfDay(date)
    }

    setCalendarEventsStartDate(startOfRange.toISOString())
    setCalendarEventsEndDate(endOfRange.toISOString())
  }, [date, view, setCalendarEventsStartDate, setCalendarEventsEndDate])

  const [modalData, setModalData] = useState<modalData>(undefined)

  // Handle slot selection - open modal for event creation
  const handleSelectSlot = useCallback(
    (slotInfo: { start: Date; end: Date; slots: Date[]; action?: string }) => {
      // Only open modal for drag selection, not clicks
      // This prevents modal from opening when clicking "show more" or day cells
      if (slotInfo.action === "click") {
        return
      }

      setModalData({
        start: slotInfo.start,
        end: slotInfo.end,
      })
      setIsModalOpen(true)

      // Also call the original handler if provided
      if (onSelectSlot) {
        onSelectSlot(slotInfo)
      }
    },
    [onSelectSlot],
  )

  // Handle modal close
  const handleModalClose = useCallback(() => {
    setIsModalOpen(false)
    setModalData(undefined)
  }, [])

  // Custom EventWrapper to limit visible events and show "show more"
  const EventContainerWrapper = useCallback(
    (props: any) => {
      const { children, event, ...restProps } = props

      // Only apply limit in month view
      if (view !== Views.MONTH) {
        return <div>{children}</div>
      }

      // Get the date from the event
      const eventDate = event?.start
      if (!eventDate) {
        return <div>{children}</div>
      }

      const dayKey = format(eventDate, "yyyy-MM-dd")
      const dayEvents = eventsByDay[dayKey] || []
      const hasMoreEvents = dayEvents.length > 4
      const eventIndex = dayEvents.findIndex((e) => e.id === event.id)
      const isLastVisibleEvent = eventIndex === 3 // Fourth event (index 3)

      // Hide events after the 4th
      if (eventIndex >= 4) {
        return null
      }

      return (
        <div
          style={{
            position: "static",
            display: "flex",
            flexDirection: "column",
            ...restProps.style,
          }}
        >
          <div>{children}</div>
          {hasMoreEvents && isLastVisibleEvent && (
            <button
              className="show-more-link"
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                setDate(new Date(eventDate))
                setView(Views.DAY)
              }}
            >
              +{dayEvents.length - 4} more
            </button>
          )}
        </div>
      )
    },
    [eventsByDay, view, setDate, setView],
  )

  // Utility function to build full event data for updates
  const buildEventUpdate = (
    eventId: string,
    start: Date,
    end: Date,
  ): CalendarEventFormData | null => {
    const event = calendarEvents.find((e) => e.id === eventId)
    if (!event) return null

    return {
      title: event.title,
      startTime: start,
      endTime: end,
      color: event.color || "blue",
      attendees: event.attendees ?? [],
      reminders: event.reminders ?? [],
      description: event.description ?? undefined,
      location: event.location ?? undefined,
      timezone: event.timezone ?? undefined,
      category: event.category ?? undefined,
      isAllDay: event.isAllDay ?? false,
      isRecurring: event.isRecurring ?? false,
      recurrenceRule: event.recurrenceRule ?? undefined,
      status: event.status ?? "confirmed",
      visibility: event.visibility ?? "private",
      threadId: event.threadId ?? undefined,
      agentId: event.agentId ?? undefined,
      aiContext: event.aiContext ?? undefined,
      externalId: event.externalId ?? undefined,
      externalSource: event.externalSource ?? undefined,
    }
  }

  // Handle event drag and drop with optimistic update
  const handleEventDrop = useCallback(
    async (args: any) => {
      if (!token) return

      const eventId = args.event.id
      const newStart = new Date(args.start)
      const newEnd = new Date(args.end)

      // Find the original event for rollback
      const originalEvent = calendarEvents.find((e) => e.id === eventId)
      if (!originalEvent) return

      // Build full event data with new times
      const eventData = buildEventUpdate(eventId, newStart, newEnd)
      if (!eventData) return

      // Optimistic update - update UI immediately
      setCalendarEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, startTime: newStart, endTime: newEnd } : e,
        ),
      )

      const rollback = () => {
        setCalendarEvents((prev) =>
          prev.map((e) => (e.id === eventId ? originalEvent : e)),
        )
      }

      try {
        // Send update to server
        const result = await actions.updateCalendarEvent({
          id: eventId,
          event: eventData,
        })

        if (result?.error) {
          // Show field-specific errors if available
          if (result.errors && result.errors.length > 0) {
            result.errors.forEach((err: { field: string; message: string }) => {
              toast.error(`${err.field}: ${err.message}`)
            })
          } else {
            toast.error(result.error)
          }
          rollback()
          return
        }

        // Success - refetch to ensure sync
        await refetchCalendarEvents()
      } catch (error) {
        console.error("Failed to update event:", error)
        toast.error("Failed to update event")
        // Rollback on failure
        rollback()
      }

      if (onEventDrop) {
        onEventDrop({
          event: args.event,
          start: newStart,
          end: newEnd,
        })
      }
    },
    [
      onEventDrop,
      token,
      calendarEvents,
      refetchCalendarEvents,
      buildEventUpdate,
    ],
  )

  // Handle event resize with optimistic update
  const handleEventResize = useCallback(
    async (args: any) => {
      if (!token) return

      const eventId = args.event.id
      const newStart = new Date(args.start)
      const newEnd = new Date(args.end)

      // Find the original event for rollback
      const originalEvent = calendarEvents.find((e) => e.id === eventId)
      if (!originalEvent) return

      // Build full event data with new times
      const eventData = buildEventUpdate(eventId, newStart, newEnd)
      if (!eventData) return

      // Optimistic update - update UI immediately
      setCalendarEvents((prev) =>
        prev.map((e) =>
          e.id === eventId ? { ...e, startTime: newStart, endTime: newEnd } : e,
        ),
      )

      const rollback = () => {
        setCalendarEvents((prev) =>
          prev.map((e) => (e.id === eventId ? originalEvent : e)),
        )
      }

      try {
        // Send update to server
        const result = await actions.updateCalendarEvent({
          id: eventId,
          event: eventData,
        })

        if (result?.error) {
          // Show field-specific errors if available
          if (result.errors && result.errors.length > 0) {
            result.errors.forEach((err: { field: string; message: string }) => {
              toast.error(`${err.field}: ${err.message}`)
            })
          } else {
            toast.error(result.error)
          }
          rollback()
          return
        }

        // Success - refetch to ensure sync
        await refetchCalendarEvents()
      } catch (error) {
        console.error("Failed to resize event:", error)
        toast.error("Failed to resize event")
        // Rollback on failure
        rollback()
      }

      if (onEventResize) {
        onEventResize({
          event: args.event,
          start: newStart,
          end: newEnd,
        })
      }
    },
    [
      onEventResize,
      token,
      calendarEvents,
      refetchCalendarEvents,
      buildEventUpdate,
    ],
  )

  // Handle navigation
  const handleNavigate = useCallback((newDate: Date) => {
    setDate(newDate)
  }, [])

  const handleViewChange = useCallback((newView: View) => {
    setView(newView)

    // Update URL without page reload using History API
    const newUrl =
      newView === "month" ? "/calendar" : `/calendar?view=${newView}`

    window.history.pushState({}, "", newUrl)
  }, [])

  // Handle Google Calendar sync or connect
  const handleGoogleSync = useCallback(async () => {
    if (!token) return

    // If not connected, trigger Google re-authentication
    if (!isGoogleConnected) {
      if (!signInContext) {
        toast.error("Sign-in not available")
        return
      }

      try {
        // In development, calendar scope is automatically included
        await signInContext("google", {
          callbackUrl: "/calendar",
          errorUrl: "/calendar?error=google",
          redirect: true,
        })
      } catch (error) {
        console.error("Failed to initiate Google sign-in:", error)
        toast.error("Failed to connect Google Calendar")
      }
      return
    }

    // If connected, sync events
    setIsSyncing(true)

    try {
      const result = await actions.syncGoogleCalendar()

      if (result.error) {
        toast.error(result.error)
        return
      }

      await refetchCalendarEvents()
      toast.success(
        `Synced ${result.imported} of ${result.total} events from Google Calendar`,
      )
    } catch (error) {
      console.error("Failed to sync Google Calendar:", error)
      toast.error("Failed to sync with Google Calendar")
    } finally {
      setIsSyncing(false)
    }
  }, [token, isGoogleConnected, refetchCalendarEvents])

  // Custom event style getter
  const eventStyleGetter = useCallback((event: calendarEvent) => {
    let backgroundColor: string = COLORS.blue // Default blue

    switch (event.color) {
      case "red":
        backgroundColor = COLORS.red
        break
      case "orange":
        backgroundColor = COLORS.orange
        break
      case "blue":
        backgroundColor = COLORS.blue
        break
      case "green":
        backgroundColor = COLORS.green
        break
      case "violet":
        backgroundColor = COLORS.violet
        break
      case "purple":
        backgroundColor = COLORS.purple
        break
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.9,
        color: "white",
        border: "none",
        display: "block",
      },
    }
  }, [])

  // Custom day prop getter for highlighting today
  const dayPropGetter = useCallback((date: Date) => {
    const today = new Date()
    const isToday = format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")

    if (isToday) {
      return {
        className: "rbc-today",
        style: {
          backgroundColor: "var(--primary-light)",
        },
      }
    }

    return {}
  }, [])

  // Custom slot prop getter for past time styling
  const slotPropGetter = useCallback((date: Date) => {
    const now = new Date()
    const isPast = date < now

    if (isPast) {
      return {
        style: {
          backgroundColor: "var(--background-disabled)",
          opacity: 0.6,
        },
      }
    }

    return {}
  }, [])

  const hasHydrated = useHasHydrated()

  // Create DnDCalendar inside component to avoid SSR issues
  // Use conditional check in case withDragAndDrop fails to load
  const DnDCalendar = useMemo(() => {
    try {
      if (typeof withDragAndDrop === "function") {
        return (withDragAndDrop as any)(BigCalendar)
      }
      console.warn(
        "withDragAndDrop is not a function, falling back to regular calendar",
      )
      return BigCalendar
    } catch (error) {
      console.error("Failed to create DnD calendar:", error)
      return BigCalendar
    }
  }, [])

  // ⚡ Bolt: Memoize components to prevent unnecessary re-renders of react-big-calendar internals
  const components = useMemo(
    () => ({
      toolbar: (props: any) => (
        <CustomToolbar
          {...props}
          onGoogleSync={user?.role === "admin" ? handleGoogleSync : undefined}
          isGoogleConnected={isGoogleConnected}
          isSyncing={isSyncing}
        />
      ),
      event: EventComponent,
      eventWrapper: view === Views.MONTH ? EventContainerWrapper : undefined,
      month: {
        dateHeader: ({ date }: any) => (
          <div className={clsx(styles.dateHeader, device && styles[device])}>
            <button
              className={clsx("link", styles.addEventButton)}
              onClick={(e) => {
                e.stopPropagation()
                // Get current time for the selected date
                const now = new Date()
                const selectedDate = new Date(date)

                // Set the start time to current time on the selected date
                const startTime = new Date(selectedDate)
                startTime.setHours(now.getHours(), now.getMinutes(), 0, 0)

                // Set end time to 1 hour later
                const endTime = new Date(startTime)
                endTime.setHours(startTime.getHours() + 1)

                setModalData({
                  start: startTime,
                  end: endTime,
                })
                setIsModalOpen(true)
              }}
            >
              <CalendarPlus className={styles.calendarPlus} size={16} />
            </button>
            <button
              className={clsx("small transparent", styles.dateButton)}
              onClick={(e) => {
                e.stopPropagation()
                // Navigate to day view for this specific date
                setDate(new Date(date))
                setView(Views.DAY)
              }}
            >
              {date.getDate()}
            </button>
          </div>
        ),
      },
    }),
    [
      user?.role,
      handleGoogleSync,
      isGoogleConnected,
      isSyncing,
      view,
      EventContainerWrapper,
      device,
    ],
  )

  // ⚡ Bolt: Memoize formats to prevent unnecessary re-renders
  const formats = useMemo(
    () => ({
      timeGutterFormat: "HH:mm",
      eventTimeRangeFormat: (
        { start, end }: any,
        culture: any,
        localizer: any,
      ) =>
        `${localizer?.format(start, "HH:mm", culture)} - ${localizer?.format(end, "HH:mm", culture)}`,
      agendaTimeFormat: "HH:mm",
      agendaTimeRangeFormat: (
        { start, end }: any,
        culture: any,
        localizer: any,
      ) =>
        `${localizer?.format(start, "HH:mm", culture)} - ${localizer?.format(end, "HH:mm", culture)}`,
    }),
    [],
  )

  if (!hasHydrated) return null

  return (
    <Skeleton>
      <div
        className={clsx(
          styles.calendar,
          className,
          loading && styles.loading,
          device && styles[device],
        )}
      >
        {false ? (
          <div className={styles.loadingContainer}>
            <Loading className={styles.loading} />
          </div>
        ) : (
          <DnDCalendar
            localizer={localizer}
            messages={messages}
            events={transformedEvents}
            startAccessor={(event: any) => event.start}
            endAccessor={(event: any) => event.end}
            titleAccessor="title"
            allDayAccessor={(event: any) => event.isAllDay}
            // Views
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
            view={view}
            onView={handleViewChange}
            // Date navigation
            date={date}
            onNavigate={handleNavigate}
            // Disable built-in popup (we use custom wrapper)
            popup={false}
            // Event handlers
            onSelectEvent={handleSelectEvent}
            onSelectSlot={view !== Views.MONTH ? handleSelectSlot : undefined}
            onEventDrop={handleEventDrop}
            onEventResize={handleEventResize}
            // Selection
            selectable={true}
            resizable={true}
            // Time configuration
            step={15} // 15-minute increments
            timeslots={4} // 4 slots per hour (15min each)
            min={new Date(2024, 0, 1, 6, 0)} // Start at 6 AM
            max={new Date(2024, 0, 1, 22, 0)} // End at 10 PM
            // Styling
            eventPropGetter={eventStyleGetter}
            dayPropGetter={dayPropGetter}
            slotPropGetter={slotPropGetter}
            // Custom components
            components={components}
            // Remove popup-based overflow detection
            showMultiDayTimes={false} // Don't show times for multi-day events
            // Drag and drop
            draggableAccessor={() => true}
            // Formats
            formats={formats}
          />
        )}
      </div>

      {/* Event Creation Modal */}
      <EventModal
        refetchCalendarEvents={refetchCalendarEvents}
        key={modalData?.start?.toISOString()}
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialData={modalData}
      />
    </Skeleton>
  )
}

// Export types for external use
