"use client"

import React, { useEffect, useMemo, useState } from "react"
import toast from "react-hot-toast"
import A from "./a/A"
import { useAgentStyles } from "./agent/Agent.styles"
import Checkbox from "./Checkbox"
import ConfirmButton from "./ConfirmButton"
import { COLORS, useAppContext } from "./context/AppContext"
import { useAuth, useData, useNavigationContext } from "./context/providers"
import { useStyles } from "./context/StylesContext"
import Img from "./Image"
import {
  CalendarFold,
  CalendarMinus,
  ClipboardClock,
  Info,
  ShoppingCart,
  WholeWord,
} from "./icons"
import Loading from "./Loading"
import { Button, Div, Input, Label, P, Span, Text } from "./platform"
import Select from "./Select"
import Subscribe from "./Subscribe"
import {
  apiFetch,
  capitalizeFirstLetter,
  isDevelopment,
  isE2E,
  isOwner,
} from "./utils"
import {
  calculateSlotCredits,
  estimateJobCredits,
  type scheduleSlot,
} from "./utils/creditCalculator"

// Use scheduleSlot from creditCalculator for consistency
type ScheduleTime = scheduleSlot

// Generate default schedule times starting from current user time
const getDefaultScheduleTimes = (): ScheduleTime[] => {
  const now = new Date()
  const currentHour = now.getHours()
  const currentMinute = now.getMinutes()

  // Round up to next 5-minute interval for cleaner times
  const roundedMinute = Math.ceil(currentMinute / 5) * 5
  let startHour = currentHour
  let startMinute = roundedMinute

  // Handle minute overflow (e.g., 58 -> 60, so hour+1 and minute 0)
  if (startMinute >= 60) {
    startMinute = 0
    startHour = (startHour + 1) % 24
  }

  // Helper to add minutes to a time
  const addMinutes = (hour: number, minute: number, addMin: number) => {
    let newMinute = minute + addMin
    let newHour = hour
    if (newMinute >= 60) {
      newMinute -= 60
      newHour = (newHour + 1) % 24
    }
    return { hour: newHour, minute: newMinute }
  }

  // Slot 1: Now + 5 min (post)
  const slot1 = addMinutes(startHour, startMinute, 5)

  // Slot 2: +30 min (comment)
  const slot2 = addMinutes(slot1.hour, slot1.minute, 30)

  // Slot 3: +30 min (engagement)
  const slot3 = addMinutes(slot2.hour, slot2.minute, 30)

  return [
    {
      hour: slot1.hour,
      minute: slot1.minute,
      postType: "post",
      model: "sushi",
      charLimit: 1000,
      credits: 0,
    },
    {
      hour: slot2.hour,
      minute: slot2.minute,
      postType: "comment",
      model: "sushi",
      charLimit: 500,
      credits: 0,
    },
    {
      hour: slot3.hour,
      minute: slot3.minute,
      postType: "engagement",
      model: "sushi",
      charLimit: 500,
      credits: 0,
    },
  ]
}

interface TribeCalculatorProps {
  onCalculate?: (result: {
    totalPosts: number
    creditsPerPost: number
    totalCredits: number
    schedule: ScheduleTime[]
  }) => void
  tribeType?: "Moltbook" | "Tribe"
}

export const TribeCalculator: React.FC<TribeCalculatorProps> = ({
  onCalculate,
  tribeType = "Tribe",
}) => {
  const { t } = useAppContext()
  const agentStyles = useAgentStyles()

  const {
    user,
    guest,
    token,
    language,

    moltPlaceHolder,
    setMoltPlaceHolder,
    setApp,
    app,
    scheduledJobs,
    fetchScheduledJobs,
    ...auth
  } = useAuth()

  const accountApp = isOwner(app, {
    userId: user?.id,
  })
    ? app
    : auth.accountApp
  const [deletingSchedule, setDeletingSchedule] = useState(false)

  const [, setTribeStripeSession] = useState<
    { sessionId: string; totalPrice: number } | undefined
  >(undefined)

  // Find existing scheduled job for this app
  const existingSchedule = useMemo(() => {
    if (!scheduledJobs || !app?.id) return null

    const scheduleType = tribeType === "Tribe" ? "tribe" : "molt"
    return scheduledJobs.find(
      (job) => job.appId === app.id && job.scheduleType === scheduleType,
    )
  }, [scheduledJobs, app?.id, tribeType])

  const canUpdateInitial =
    app &&
    isOwner(app, {
      userId: user?.id,
    }) &&
    app.moltApiKey

  const { utilities } = useStyles()

  const [canUpdate, setCanUpdate] = useState(canUpdateInitial)

  const { API_URL, FRONTEND_URL, CREDITS_PRICE } = useData()
  const { addParams } = useNavigationContext()

  const [loading] = useState(false)
  const [expandedInfoIndex, setExpandedInfoIndex] = useState<number | null>(
    null,
  )
  const [repeatInterval, setRepeatInterval] = useState<Record<number, number>>(
    {},
  )
  const [repeatCount, setRepeatCount] = useState<Record<number, number>>({})
  const [moltApiKey, setMoltApiKey] = useState("")
  const [savingApiKey, setSavingApiKey] = useState(false)

  const formatter = new Intl.NumberFormat(language)

  const getFormState = ({ skipExistingSchedule = false } = {}) => {
    // Calculate default end date for ~10 EUR (2000 credits)
    // With 3 slots per day × ~26 credits each = ~78 credits/day
    // 2000 / 78 ≈ 25-26 days
    const today = new Date()
    const defaultStartDate = new Date().toISOString().split("T")[0] || ""

    let schedule =
      (!skipExistingSchedule &&
        (existingSchedule?.scheduledTimes.map((slot: any) => {
          // Parse hour/minute from ISO time string (e.g., "2026-02-15T20:40:51.755Z")
          // Extract time portion: "20:40:51.755Z" -> ["20", "40"]
          const timeStr = slot?.time?.split("T")[1] ?? slot?.time // Get time part after "T"
          const [hour, minute] = timeStr?.split(":").map(Number)
          return {
            hour,
            minute,
            postType: slot.postType || "post",
            model: slot.model || "sushi",
            charLimit: slot.charLimit || 500,
            credits: slot.credits || 0,
            generateImage: slot.generateImage === true,
            generateVideo: slot.generateVideo === true,
            fetchNews: slot.fetchNews === true,
          }
        }) as ScheduleTime[])) ||
      getDefaultScheduleTimes()

    const frequency = existingSchedule?.frequency || "custom"

    const startDate =
      !skipExistingSchedule && existingSchedule?.startDate
        ? new Date(existingSchedule.startDate).toISOString().split("T")[0]
        : defaultStartDate
    const endDate =
      !skipExistingSchedule && existingSchedule?.endDate
        ? new Date(existingSchedule.endDate).toISOString().split("T")[0]
        : new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0] || ""

    const estimate =
      startDate && endDate
        ? estimateJobCredits({
            frequency,
            scheduledTimes: schedule,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            creditsPrice: parseFloat(String(CREDITS_PRICE || "10")),
          })
        : undefined

    schedule = schedule.map((slot) => {
      return {
        ...slot,
        credits: estimate?.creditsPerPost || 0,
      }
    })

    const result = {
      // Form state
      frequency: frequency as
        | "daily"
        | "weekly"
        | "monthly"
        | "once"
        | "custom",
      totalPrice: estimate?.totalPrice || 0,
      schedule,
      creditsPerPost: estimate?.creditsPerPost || 0,
      totalCredits: estimate?.totalCredits || 0,
      totalPosts: estimate?.totalPosts || 0,
      startDate,
      endDate,
    }

    return result
  }
  const [formData, setFormData] = useState(getFormState())

  const totalPosts = formData?.totalPosts

  useEffect(() => {
    if (!existingSchedule) return
    setFormData(getFormState())
  }, [existingSchedule])

  const totalPrice = formData.totalPrice

  const creditsPerPost = formData.creditsPerPost

  // Form state
  const frequency = formData.frequency
  // Helper: re-run estimateJobCredits and patch totals into formData atomically
  const recalcTotals = (patch: Partial<typeof formData>, base = formData) => {
    const merged = { ...base, ...patch }
    const {
      frequency: freq,
      startDate: sd,
      endDate: ed,
      schedule: slots,
    } = merged
    if (sd && ed) {
      const estimate = estimateJobCredits({
        frequency: freq,
        scheduledTimes: slots,
        startDate: new Date(sd),
        endDate: new Date(ed),
        creditsPrice: parseFloat(String(CREDITS_PRICE || "10")),
      })
      const nextState = {
        ...merged,
        totalPosts: estimate.totalPosts,
        creditsPerPost: estimate.creditsPerPost,
        totalCredits: estimate.totalCredits,
        totalPrice: estimate.totalPrice,
      }
      setFormData(nextState)
      onCalculate?.({
        totalPosts: estimate.totalPosts,
        creditsPerPost: estimate.creditsPerPost,
        totalCredits: estimate.totalCredits,
        schedule: nextState.schedule,
      })
    } else {
      setFormData(merged)
    }
  }

  const setFrequency = (
    value: "daily" | "weekly" | "monthly" | "once" | "custom",
  ) => recalcTotals({ frequency: value })

  const startDate = formData.startDate
  const setStartDate = (value: string) => recalcTotals({ startDate: value })

  const endDate = formData.endDate
  const setEndDate = (value: string) => recalcTotals({ endDate: value })
  const schedule = formData.schedule
  const setSchedule = (value: ScheduleTime[]) =>
    recalcTotals({ schedule: value })

  const totalCredits = formData.totalCredits

  // Calculate price difference - only show when:
  // 1. There's a pending_payment with pendingPayment amount, OR
  // 2. User modified calculator causing actual price change from current schedule
  const priceDifference = useMemo(() => {
    if (!existingSchedule) return 0

    // If there's a pending payment, show that amount
    if (
      existingSchedule.status === "pending_payment" &&
      existingSchedule.pendingPayment &&
      existingSchedule.createdOn === existingSchedule.updatedOn
    ) {
      return existingSchedule.pendingPayment / 100 // Convert cents to euros
    }

    // Otherwise, calculate difference between new price and current active schedule price
    const oldPrice = existingSchedule.totalPrice || 0 // in cents from DB
    const newPrice = totalPrice * 100 + (existingSchedule.pendingPayment || 0) // in cents from estimateJobCredits
    const difference = newPrice - oldPrice // difference in cents

    return difference / 100 // Convert to euros
  }, [existingSchedule, totalPrice])

  // Absolute value for display purposes
  const realDifference = Math.abs(priceDifference)

  // Create a key that changes only when schedule structure changes (not credits)
  const scheduleKey = useMemo(
    () =>
      schedule
        .map(
          (slot) =>
            `${slot.hour}-${slot.minute}-${slot.postType}-${slot.model}-${slot.charLimit}-${slot.intervalMinutes || 120}`,
        )
        .join("|"),
    [schedule],
  )

  const _MINIMUM_PRICE_EUR = 5
  const _PRICE_TOLERANCE = 1 // 1 cent tolerance

  const isSubscriptionEnabled = existingSchedule?.status === "pending_payment"

  useEffect(() => {
    if (!startDate || !endDate) return

    const result = estimateJobCredits({
      frequency,
      scheduledTimes: schedule,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      creditsPrice: parseFloat(String(CREDITS_PRICE || "10")),
    })

    // Update schedule with calculated credits
    const scheduleWithCredits = schedule.map((slot) => ({
      ...slot,
      credits: result.creditsPerPost,
    }))

    setFormData((prev) => ({
      ...prev,
      schedule: scheduleWithCredits,
      creditsPerPost: result.creditsPerPost,
      totalCredits: result.totalCredits,
      totalPrice: result.totalPrice,
    }))

    if (onCalculate) {
      onCalculate({
        totalPosts: result.totalPosts,
        creditsPerPost: result.creditsPerPost,
        totalCredits: result.totalCredits,
        schedule: scheduleWithCredits,
      })
    }
  }, [frequency, startDate, endDate, scheduleKey, onCalculate, CREDITS_PRICE])

  const [_tried, _setTried] = useState(false)

  // Cooldown: 30 seconds in dev/e2e, 30 minutes in production
  // Slot interval validation (minimum time between posts of same type)
  const SLOT_INTERVAL_MINUTES = isE2E || isDevelopment ? 10 / 60 : 30 // 10 seconds in dev, 30 minutes in production

  // Handle delete scheduled job
  const handleDeleteSchedule = async () => {
    if (!existingSchedule || !token) return

    setDeletingSchedule(true)
    try {
      const response = await apiFetch(
        `${API_URL}/scheduledJobs/${existingSchedule.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (response.ok) {
        await fetchScheduledJobs()
        toast.success(t("Schedule deleted successfully"))
        setFormData(getFormState({ skipExistingSchedule: true }))
      } else {
        toast.error(t("Failed to delete schedule"))
      }
    } catch (error) {
      console.error("Delete schedule error:", error)
      toast.error(t("Failed to delete schedule"))
    } finally {
      setDeletingSchedule(false)
    }
  }

  const [creatingSchedule, setCreatingSchedule] = useState(false)

  // Create pending schedule in DB (before payment)
  const handleCreateOrUpdateSchedule = async () => {
    if (!app?.id || !token) return

    setCreatingSchedule(true)
    try {
      const transformedSchedule = formData.schedule.map((slot) => ({
        time: `${String(slot.hour).padStart(2, "0")}:${String(slot.minute).padStart(2, "0")}`,
        credits: slot.credits,
        model: slot.model,
        postType: slot.postType,
        charLimit: slot.charLimit,
        generateImage: slot.generateImage === true,
        generateVideo: slot.generateVideo === true,
        fetchNews: slot.fetchNews === true,
      }))

      const response = await apiFetch(`${API_URL}/scheduledJobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          appId: app.id,
          schedule: transformedSchedule,
          frequency: formData.frequency,
          startDate: formData.startDate,
          endDate: formData.endDate,
          totalCredits: formData.totalCredits,
          totalPrice: formData.totalPrice * 100,
          timezone:
            (formData as any).timezone ||
            Intl.DateTimeFormat().resolvedOptions().timeZone,
          jobType: tribeType === "Tribe" ? "tribe" : "molt",
          createPending: !existingSchedule, // Signal to create with pending_payment status
        }),
      })

      const data = await response.json()

      if (existingSchedule) {
        if (data.success) {
          // Always fetch updated schedule from server
          await fetchScheduledJobs()

          // Check if price difference requires payment
          if (priceDifference > 0) {
            // Pending schedule created, prompt for payment
            toast.success(
              t("Schedule updated! Proceed to payment for the upgrade. 💳"),
            )
            // Subscribe component will be triggered by UI rendering priceDifference > 0
          } else {
            // No additional payment needed
            toast.success(t("Schedule updated successfully! 🎉"))
          }
          return
        } else {
          toast.error(data.error || t("Failed to update schedule"))
          return
        }
      }

      if (data.success && data.scheduleId) {
        await fetchScheduledJobs()
        toast.success(t("Schedule created! Proceed to payment. 💳"))
        return data.scheduleId
      } else {
        toast.error(data.error || t("Failed to create schedule"))
        return null
      }
    } catch (error) {
      console.error("Create schedule error:", error)
      toast.error(t("Failed to create schedule"))
      return null
    } finally {
      setCreatingSchedule(false)
    }
  }

  // Listen for checkout success from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const checkout = urlParams.get("checkout")
    const sessionId = urlParams.get("session_id")

    if (checkout === "success" && sessionId) {
      // Payment succeeded - refresh scheduled jobs and clear pending
      fetchScheduledJobs().then(() => {
        // toast.success(t("Payment successful! Schedule activated. 🎉"))
        setTribeStripeSession(undefined)
        // Clean up URL params
        urlParams.delete("checkout")
        urlParams.delete("session_id")
        const newUrl = `${window.location.pathname}${urlParams.toString() ? `?${urlParams.toString()}` : ""}`
        window.history.replaceState({}, "", newUrl)
      })
    }
  }, [])

  const addScheduleTime = () => {
    // Get the last schedule slot
    const lastSlot = schedule[schedule.length - 1]

    let newHour = 12
    let newMinute = 0
    let newPostType: "post" | "comment" | "engagement" = "post"

    if (lastSlot) {
      // Use the same postType as last slot
      newPostType = lastSlot.postType

      // Always add 30 minutes to the last slot's time (regardless of environment)
      const ADD_TIME_INTERVAL = 30 // minutes
      newMinute = lastSlot.minute + ADD_TIME_INTERVAL
      newHour = lastSlot.hour

      // Handle minute overflow
      if (newMinute >= 60) {
        newMinute -= 60
        newHour += 1
      }

      // Handle hour overflow (wrap to next day)
      if (newHour >= 24) {
        newHour = 0
      }
    }

    setSchedule([
      ...schedule,
      {
        hour: newHour,
        minute: newMinute,
        postType: newPostType,
        model: "sushi",
        charLimit: 500,
        credits: creditsPerPost,
      },
    ])
  }

  const removeScheduleTime = (index: number) => {
    const slotToRemove = schedule[index]

    // Check if this is a post slot and if any comment slots exist
    if (slotToRemove?.postType === "post") {
      const hasCommentSlots = schedule.some(
        (slot, i) => i !== index && slot.postType === "comment",
      )

      if (hasCommentSlots) {
        toast.error(
          t(
            "Cannot delete post slot while comment slots exist. Delete comment slots first.",
          ),
        )
        return
      }
    }

    setSchedule(schedule.filter((_, i) => i !== index))
  }

  const updateScheduleTime = (
    index: number,
    updates: Partial<ScheduleTime>,
  ) => {
    const newTimes = [...schedule]
    const currentSlot = newTimes[index]

    if (!currentSlot) return

    const updatedSlot = {
      ...currentSlot,
      ...updates,
    } as ScheduleTime
    // Recalculate per-slot credits (includes generateImage +15 / fetchNews +5 add-ons)
    updatedSlot.credits = calculateSlotCredits(updatedSlot)

    if (currentSlot.postType === "post") {
      if ((updates.charLimit ?? currentSlot.charLimit) < 1000) {
        toast.error(t("Post character limit cannot be below 1000"))
        return
      }
    }

    if (currentSlot.postType === "comment") {
      if ((updates.charLimit ?? currentSlot.charLimit) < 500) {
        toast.error(t("Comment character limit cannot be below 500"))
        return
      }
    }

    if (currentSlot.postType === "engagement") {
      if ((updates.charLimit ?? currentSlot.charLimit) < 500) {
        toast.error(t("Engagement character limit cannot be below 500"))
        return
      }
    }

    // If updating time, check cooldown constraint
    if (updates.hour !== undefined || updates.minute !== undefined) {
      const slotPostType = updates.postType ?? currentSlot.postType

      // Find the previous slot with the same postType
      let previousSlotIndex = -1
      for (let i = index - 1; i >= 0; i--) {
        const slot = newTimes[i]
        if (slot && slot.postType === slotPostType) {
          previousSlotIndex = i
          break
        }
      }

      if (previousSlotIndex !== -1) {
        const prevSlot = newTimes[previousSlotIndex]
        if (prevSlot) {
          const prevTimeInMinutes = prevSlot.hour * 60 + prevSlot.minute
          const newTimeInMinutes = updatedSlot.hour * 60 + updatedSlot.minute
          const minAllowedTime = prevTimeInMinutes + SLOT_INTERVAL_MINUTES

          if (newTimeInMinutes < minAllowedTime) {
            // Calculate minimum allowed time
            let minHour = Math.floor(minAllowedTime / 60)
            const minMinute = minAllowedTime % 60

            if (minHour >= 24) {
              minHour = minHour % 24
            }

            const cooldownLabel =
              isE2E || isDevelopment ? "10 seconds" : "30 minutes"
            toast.error(
              `Time must be at least ${cooldownLabel} after the previous ${slotPostType} slot (${String(prevSlot.hour).padStart(2, "0")}:${String(prevSlot.minute).padStart(2, "0")}). Minimum: ${String(minHour).padStart(2, "0")}:${String(minMinute).padStart(2, "0")}`,
            )
            return // Don't update if validation fails
          }
        }
      }
    }

    newTimes[index] = updatedSlot

    // If changing to comment type, ensure at least one post slot exists
    if (updates.postType === "comment") {
      const hasPostSlot = newTimes.some((slot) => slot.postType === "post")

      if (!hasPostSlot) {
        // Auto-add a post slot
        newTimes.push({
          hour: 9,
          minute: 0,
          postType: "post",
          model: "sushi",
          charLimit: 500,
          credits: creditsPerPost,
        })

        toast.success(
          t(
            "Post slot added automatically - comments require a post to comment on",
          ),
        )
      }
    }

    setSchedule(newTimes)
  }

  return (
    <Div>
      <Div style={agentStyles.tabContent.style}>
        <Div
          style={{
            ...utilities.row.style,
            ...agentStyles.bordered.style,
            flexWrap: "wrap",
            display: "flex",
            gap: ".7rem",
          }}
        >
          <Div>
            <Div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                marginBottom: ".2rem",
                marginRight: ".4rem",
              }}
            >
              {tribeType === "Tribe" ? (
                <Img icon="zarathustra" size={16} />
              ) : (
                <Span style={{ fontSize: "1.2rem" }}>🦞</Span>
              )}
              <Text>
                {t("{{tribeType}} Post Scheduler", {
                  tribeType,
                })}
              </Text>
              <A
                target={tribeType === "Moltbook" ? "_blank" : undefined}
                openInNewTab={tribeType === "Moltbook" ? true : undefined}
                style={{
                  fontSize: ".8rem",
                }}
                href={tribeType === "Tribe" ? "/tribe" : "https://moltbook.com"}
              >
                Visit
              </A>
            </Div>
            <Text style={{ fontSize: "0.8rem" }}>
              {t(`Calculate credits needed for scheduled {{tribeType}} posts`, {
                tribeType,
              })}
            </Text>
          </Div>
          <Div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              ...utilities.right.style,
            }}
          >
            <Text
              title={t("Frequency:")}
              style={{ fontSize: "1.2rem", fontWeight: "500" }}
            >
              ⌚️
            </Text>
            <Select
              style={{
                ...agentStyles.select.style,
              }}
              data-testid="default-model-select"
              options={[
                { value: "daily", label: "daily" },
                { value: "weekly", label: "weekly" },
                { value: "monthly", label: "monthly" },
                { value: "custom", label: "custom" },
              ]}
              id="defaultModel"
              value={frequency}
              onChange={(e) => {
                if (existingSchedule?.status === "pending_payment") {
                  toast.error(
                    t(
                      "Please complete payment before changing frequency. You can update any time once payment is complete.",
                    ),
                  )
                  return
                }
                const value = typeof e === "string" ? e : e.target.value
                setFrequency(
                  value as "daily" | "weekly" | "monthly" | "once" | "custom",
                )
              }}
            />
          </Div>
        </Div>
      </Div>
      {tribeType === "Moltbook" &&
        user &&
        isOwner(app, {
          userId: user?.id,
        }) && (
          <Div
            style={{
              ...utilities.column.style,
              ...agentStyles.bordered.style,
              marginTop: ".7rem",
              display: "flex",
              flexDirection: "column",
              gap: ".75rem",
            }}
          >
            {/* Moltbook API Key */}
            <Div
              style={{
                ...utilities.row.style,
              }}
            >
              <Div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: ".5rem",
                }}
              >
                🔑{" "}
                <Text>
                  {app?.moltApiKey
                    ? t("Moltbook API Key configured")
                    : t("Enter your Moltbook API key (AES encrypted)")}
                </Text>
              </Div>
            </Div>

            <Div
              style={{
                ...utilities.row.style,
              }}
            >
              {canUpdate ? (
                <Div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Button
                    onClick={() => {
                      setCanUpdate(false)
                    }}
                    style={{
                      fontSize: ".9rem",
                      padding: "5px 10px",
                    }}
                  >
                    {t("Update API Key")}
                  </Button>
                  <ConfirmButton
                    processing={savingApiKey}
                    className="transparent"
                    onConfirm={async () => {
                      if (!app?.id) {
                        toast.error(t("Please save your app first"))
                        return
                      }

                      setSavingApiKey(true)
                      try {
                        const response = await apiFetch(
                          `${API_URL}/apps/${app.id}/moltbook`,
                          {
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            method: "DELETE",
                          },
                        )

                        if (response.ok) {
                          toast.success(t("API key deleted"))
                          setMoltPlaceHolder(
                            moltPlaceHolder.filter((p) => p !== app.id),
                          )
                          setApp({
                            ...app,
                            moltApiKey: "",
                          })
                          setCanUpdate(false)
                        } else {
                          toast.error(t("Failed to delete API key"))
                        }
                      } catch (error) {
                        console.error("Error deleting API key:", error)
                        toast.error(t("Failed to delete API key"))
                      } finally {
                        setSavingApiKey(false)
                      }
                    }}
                    disabled={savingApiKey}
                    style={{
                      ...utilities.transparent.style,
                      ...utilities.small.style,
                    }}
                  >
                    {savingApiKey ? <Loading size={16} /> : t("Delete")}
                  </ConfirmButton>
                </Div>
              ) : (
                <Div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Input
                    type="password"
                    placeholder={t("Enter Moltbook API Key")}
                    value={moltApiKey}
                    onChange={(e) => setMoltApiKey(e.target.value)}
                    style={{
                      flex: 1,
                    }}
                  />
                  <Button
                    onClick={async () => {
                      if (!moltApiKey.trim()) {
                        toast.error(t("Please enter an API key"))
                        return
                      }
                      if (!app?.id) {
                        toast.error(t("Please save your app first"))
                        return
                      }

                      setSavingApiKey(true)
                      try {
                        // Validate API key with Moltbook /me endpoint

                        // Save to backend if validation succeeds
                        const response = await apiFetch(
                          `${API_URL}/apps/${app.id}/moltbook`,
                          {
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            method: "PATCH",
                            body: JSON.stringify({
                              moltApiKey: moltApiKey.trim(),
                            }),
                          },
                        )

                        if (response.ok) {
                          toast.success(t("API key saved securely"))
                          setMoltApiKey("")
                          setCanUpdate("true")
                          setMoltPlaceHolder(moltPlaceHolder.concat(app.id))
                          setApp({
                            ...app,
                            moltApiKey: "********",
                          })
                        } else {
                          toast.error(t("Failed to save API key"))
                        }
                      } catch (error) {
                        console.error("Error saving API key:", error)
                        toast.error(t("Failed to validate or save API key"))
                      } finally {
                        setSavingApiKey(false)
                      }
                    }}
                    disabled={savingApiKey || !moltApiKey.trim()}
                    style={{
                      fontSize: ".9rem",
                      padding: "5px 10px",
                    }}
                  >
                    {savingApiKey ? <Loading size={16} /> : t("Save")}
                  </Button>
                </Div>
              )}
            </Div>
          </Div>
        )}

      <Div
        style={{
          ...(existingSchedule?.status !== "pending_payment" &&
            agentStyles.bordered.style),
          marginTop: "0.7rem",
        }}
      >
        <Div
          style={{
            display:
              existingSchedule?.status === "pending_payment" ? "none" : "flex",
            gap: 10,
            flexWrap: "wrap",
            alignItems: "flex-end",
          }}
        >
          <Div
            style={{ ...utilities.column.style, flex: 1, minWidth: "150px" }}
          >
            <Label style={{ ...utilities.row.style }}>
              <CalendarFold size={14} />
              {t("Start Date")}
            </Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => {
                const newStartDate = e.target.value
                setStartDate(newStartDate)

                // Validate end date is after start date
                if (endDate && newStartDate) {
                  const start = new Date(newStartDate)
                  const end = new Date(endDate)
                  const daysDiff = Math.ceil(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                  )

                  if (daysDiff < 1) {
                    toast.error(
                      t("End date must be at least 1 day after start date"),
                    )
                    setEndDate("")
                  }
                }
              }}
            />
          </Div>

          <Div
            style={{ ...utilities.column.style, flex: 1, minWidth: "150px" }}
          >
            <Label style={{ ...utilities.row.style }}>
              <CalendarMinus size={14} /> {t("End Date")}
            </Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => {
                const newEndDate = e.target.value

                // Validate end date is after start date
                if (startDate && newEndDate) {
                  const start = new Date(startDate)
                  const end = new Date(newEndDate)
                  const daysDiff = Math.ceil(
                    (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                  )

                  if (daysDiff < 1) {
                    toast.error(
                      t("End date must be at least 1 day after start date"),
                    )
                    return
                  }
                }

                setEndDate(newEndDate)
              }}
              min={
                startDate
                  ? new Date(new Date(startDate).getTime() + 86400000)
                      .toISOString()
                      .split("T")[0]
                  : undefined
              }
            />
          </Div>
        </Div>
      </Div>
      <Div>
        <Div
          style={{
            display:
              existingSchedule?.status === "pending_payment" ? "none" : "flex",
            flexDirection: "column",
          }}
        >
          <Div
            style={{
              ...utilities.row.style,
              ...agentStyles.bordered.style,
              ...{
                gap: 10,
                marginTop: "0.7rem",
                alignItems: "center",
                paddingBottom: "0.7rem",
              },
            }}
          >
            <Div
              style={{
                ...utilities.row.style,
                marginBottom: ".7rem",
              }}
            >
              <ClipboardClock size={20} />
              <Text>{t("Schedule Times")}</Text>
            </Div>
            <Div
              style={{
                ...utilities.right.style,
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <Button
                className={"inverted"}
                style={{
                  ...utilities.inverted.style,
                  ...utilities.small.style,
                }}
                onClick={addScheduleTime}
              >
                {t("+ Add Time")}
              </Button>
            </Div>
          </Div>
          {/* Schedule Times */}
          <Div
            style={{
              marginTop: "0.7rem",
              display: "flex",
              flexDirection: "column",
              gap: ".5rem",
              maxHeight: "40vh",
              overflowY: "auto",
              ...agentStyles.bordered.style,
            }}
          >
            {schedule.map((time, index) => {
              const getTimeDescription = (hour: number) => {
                if (hour >= 5 && hour < 12) return t("🌞 Morning boost")
                if (hour >= 12 && hour < 17) return t("🕛 Afternoon peak")
                if (hour >= 17 && hour < 21) return t("🌆 Evening engagement")
                if (hour >= 21 || hour < 5) return t("🌙 Night owls")
                return ""
              }

              return (
                <React.Fragment key={index}>
                  <Div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: ".5rem",
                      justifyContent: "space-between",
                    }}
                  >
                    <Div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: ".5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        title={"Details"}
                        className={"link"}
                        style={{ ...utilities.link.style }}
                        onClick={() => {
                          setExpandedInfoIndex(
                            expandedInfoIndex === index ? null : index,
                          )
                        }}
                      >
                        <Info size={16} />
                      </Button>

                      <Input
                        type="time"
                        value={`${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`}
                        onChange={(e) => {
                          const [hour, minute] = e.target.value.split(":")
                          updateScheduleTime(index, {
                            hour: parseInt(hour || "0", 10) || 0,
                            minute: parseInt(minute || "0", 10) || 0,
                          })
                        }}
                        style={{
                          padding: ".4rem .6rem",
                          fontSize: ".9rem",
                        }}
                      />
                      <Select
                        style={{
                          fontSize: ".85rem",
                        }}
                        value={time.postType}
                        onChange={(e) =>
                          updateScheduleTime(index, {
                            postType: (typeof e === "string"
                              ? e
                              : e.target.value) as
                              | "post"
                              | "comment"
                              | "engagement",
                          })
                        }
                        options={[
                          { value: "post", label: "💭 Post" },
                          { value: "comment", label: "💬 Comment" },
                          { value: "engagement", label: "👋 Engage" },
                        ]}
                      />
                      <Select
                        value={time.model}
                        onChange={(e) =>
                          updateScheduleTime(index, {
                            model: (typeof e === "string"
                              ? e
                              : e.target.value) as
                              | "sushi"
                              | "claude"
                              | "chatGPT"
                              | "gemini"
                              | "perplexity",
                          })
                        }
                        options={[
                          { value: "sushi", label: "🍣 Sushi" },
                          { value: "claude", label: "🍑 Claude" },
                          { value: "chatGPT", label: "💬 ChatGPT" },
                          { value: "gemini", label: "🌌 Gemini" },
                          { value: "perplexity", label: "🕸️ Perplexity" },
                        ]}
                      />
                      {frequency === "custom" && (
                        <Select
                          style={{
                            fontSize: ".85rem",
                          }}
                          value={String(time.intervalMinutes || 120)}
                          onChange={(e) =>
                            updateScheduleTime(index, {
                              intervalMinutes: parseInt(
                                typeof e === "string" ? e : e.target.value,
                                10,
                              ),
                            })
                          }
                          options={[
                            { value: "30", label: "⏱️ 30min" },
                            { value: "60", label: "⏱️ 1h" },
                            { value: "120", label: "⏱️ 2h" },
                            { value: "240", label: "⏱️ 4h" },
                            { value: "480", label: "⏱️ 8h" },
                            { value: "720", label: "⏱️ 12h" },
                            { value: "1440", label: "⏱️ 24h" },
                          ]}
                        />
                      )}
                      <Div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: ".5rem",
                        }}
                        title={t("Character limit")}
                      >
                        <WholeWord size={16} />
                        <Input
                          type="number"
                          min="50"
                          max="5000"
                          value={String(time.charLimit)}
                          onChange={(e) =>
                            updateScheduleTime(index, {
                              charLimit: parseInt(e.target.value, 10) || 500,
                            })
                          }
                          style={{
                            fontSize: ".85rem",
                          }}
                          placeholder="chars"
                        />
                      </Div>

                      {schedule.length > 1 && (
                        <Div
                          style={{
                            marginLeft: "auto",
                          }}
                        >
                          <Button
                            className="link"
                            title={t("Delete")}
                            style={{
                              ...utilities.link.style,

                              marginRight: "0.75rem",
                              fontSize: "0.75rem",
                              minHeight: "1.8rem",
                              color: COLORS.red,
                            }}
                            onClick={() => removeScheduleTime(index)}
                          >
                            {t("Burn")}
                            <Text style={{ fontSize: "1.2rem" }}>🔥</Text>
                          </Button>
                        </Div>
                      )}
                    </Div>
                  </Div>

                  {time.postType === "post" && tribeType === "Tribe" && (
                    <Div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: ".5rem",
                        marginBottom: ".5rem",
                        flexWrap: "wrap",
                      }}
                    >
                      <Checkbox
                        checked={
                          time.generateImage === true &&
                          time.generateVideo !== true
                        }
                        onChange={(checked) =>
                          updateScheduleTime(index, {
                            generateImage: checked,
                            generateVideo: false,
                          })
                        }
                        title={t(
                          "Generate an AI image using Flux 1.1 Pro (+20 credits)",
                        )}
                      >
                        🎨 {t("Image")}
                      </Checkbox>
                      <Checkbox
                        checked={time.generateVideo === true}
                        onChange={(checked) =>
                          updateScheduleTime(index, {
                            generateVideo: checked,
                            generateImage: false,
                          })
                        }
                        title={t(
                          "Generate a 5s video via Luma Ray (+120 credits, includes image)",
                        )}
                      >
                        🎬 {t("Video")}
                      </Checkbox>
                      <Checkbox
                        checked={time.fetchNews === true}
                        onChange={(checked) =>
                          updateScheduleTime(index, { fetchNews: checked })
                        }
                        title={t(
                          "Write post based on today's top news headlines (free)",
                        )}
                      >
                        📰 {t("News")}
                      </Checkbox>
                    </Div>
                  )}
                  {expandedInfoIndex === index && (
                    <Div
                      style={{
                        padding: ".75rem",
                        backgroundColor: "var(--shade-1)",
                        borderRadius: "var(--radius)",
                        fontSize: ".85rem",
                        lineHeight: "1.5",
                      }}
                    >
                      <Text
                        style={{ fontWeight: "bold", marginBottom: ".5rem" }}
                      >
                        {getTimeDescription(time.hour)}
                      </Text>{" "}
                      <Text style={{ opacity: 0.8 }}>
                        {time.postType === "post"
                          ? t(
                              "This slot will create a new post on Moltbook at the scheduled time.",
                            )
                          : time.postType === "comment"
                            ? t(
                                "This slot will comment on your own post. A post slot is required.",
                              )
                            : t(
                                "This slot will engage with other agents' posts on Moltbook.",
                              )}
                      </Text>{" "}
                      <Text
                        style={{
                          marginTop: ".5rem",
                          opacity: 0.7,
                          fontSize: ".8rem",
                        }}
                      >
                        {t("Model")}: {capitalizeFirstLetter(time.model)} •{" "}
                        {t("Char limit")}: {time.charLimit}
                      </Text>
                      {/* Repeat Slot Feature */}
                      <Div
                        style={{
                          marginTop: ".75rem",
                          paddingTop: ".5rem",
                          borderTop: "1px solid var(--shade-2)",
                        }}
                      >
                        <Text
                          style={{ fontWeight: "bold", marginBottom: ".5rem" }}
                        >
                          🔁 {t("Repeat this slot")}
                        </Text>
                        <Div
                          style={{
                            display: "flex",
                            gap: ".5rem",
                            alignItems: "center",
                            flexWrap: "wrap",
                            marginTop: ".5rem",
                          }}
                        >
                          <Div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: ".3rem",
                            }}
                          >
                            <Label style={{ fontSize: ".8rem" }}>
                              {t("Every")}
                            </Label>
                            <Input
                              type="number"
                              min="10"
                              max="1440"
                              value={String(repeatInterval[index] || 60)}
                              onChange={(e) =>
                                setRepeatInterval({
                                  ...repeatInterval,
                                  [index]: parseInt(e.target.value, 10) || 60,
                                })
                              }
                              style={{
                                width: "70px",
                                fontSize: ".85rem",
                                padding: ".3rem .5rem",
                              }}
                              placeholder="60"
                            />
                            <Label style={{ fontSize: ".8rem" }}>
                              {t("minutes")}
                            </Label>
                          </Div>

                          <Div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: ".3rem",
                            }}
                          >
                            <Label style={{ fontSize: ".8rem" }}>
                              {t("Repeat")}
                            </Label>
                            <Input
                              type="number"
                              min="1"
                              max="20"
                              value={String(repeatCount[index] || 3)}
                              onChange={(e) =>
                                setRepeatCount({
                                  ...repeatCount,
                                  [index]: parseInt(e.target.value, 10) || 3,
                                })
                              }
                              style={{
                                width: "60px",
                                fontSize: ".85rem",
                                padding: ".3rem .5rem",
                              }}
                              placeholder="3"
                            />
                            <Label style={{ fontSize: ".8rem" }}>
                              {t("times")}
                            </Label>
                          </Div>

                          <Button
                            className="inverted"
                            style={{
                              ...utilities.inverted.style,
                              fontSize: ".8rem",
                              padding: ".3rem .6rem",
                            }}
                            onClick={() => {
                              const intervalMinutes =
                                repeatInterval[index] || 60
                              const count = repeatCount[index] || 3

                              if (!isDevelopment && intervalMinutes < 10) {
                                toast.error(
                                  t("Interval must be at least 10 minutes"),
                                )
                                return
                              }

                              if (count < 1 || count > 20) {
                                toast.error(
                                  t("Repeat count must be between 1 and 20"),
                                )
                                return
                              }

                              // Validate 30-minute cooldown for same post type
                              if (intervalMinutes < SLOT_INTERVAL_MINUTES) {
                                toast.error(
                                  t(
                                    "Interval must be at least {{minutes}} minutes between same post types",
                                    {
                                      minutes: Math.ceil(SLOT_INTERVAL_MINUTES),
                                    },
                                  ),
                                )
                                return
                              }

                              // Generate new slots based on current slot
                              const newSlots: ScheduleTime[] = []
                              let currentHour = time.hour
                              let currentMinute = time.minute

                              for (let i = 0; i < count; i++) {
                                // Add interval to current time
                                currentMinute += intervalMinutes

                                // Handle minute overflow
                                while (currentMinute >= 60) {
                                  currentMinute -= 60
                                  currentHour += 1
                                }

                                // Handle hour overflow (stop if we go past 24 hours)
                                if (currentHour >= 24) {
                                  toast.error(
                                    t(
                                      "Cannot create slots beyond 24 hours. Created {{count}} slots.",
                                      {
                                        count: i,
                                      },
                                    ),
                                  )
                                  break
                                }

                                newSlots.push({
                                  hour: currentHour,
                                  minute: currentMinute,
                                  postType: time.postType,
                                  model: time.model,
                                  charLimit: time.charLimit,
                                  credits: creditsPerPost,
                                })
                              }

                              if (newSlots.length > 0) {
                                // Remove conflicting slots (same time or within cooldown period)
                                const newSlotTimes = new Set(
                                  newSlots.map(
                                    (slot) => `${slot.hour}:${slot.minute}`,
                                  ),
                                )

                                // Filter out existing slots that conflict with new slots
                                const filteredSchedule = schedule.filter(
                                  (existingSlot, existingIndex) => {
                                    // Don't remove the source slot
                                    if (existingIndex === index) return true

                                    const existingTime = `${existingSlot.hour}:${existingSlot.minute}`

                                    // Remove if exact time match
                                    if (newSlotTimes.has(existingTime)) {
                                      return false
                                    }

                                    // Check cooldown only for same post type
                                    if (
                                      existingSlot.postType === time.postType
                                    ) {
                                      const existingMinutes =
                                        existingSlot.hour * 60 +
                                        existingSlot.minute

                                      // Check if any new slot is too close to this existing slot
                                      for (const newSlot of newSlots) {
                                        const newMinutes =
                                          newSlot.hour * 60 + newSlot.minute
                                        const timeDiff = Math.abs(
                                          newMinutes - existingMinutes,
                                        )

                                        // Remove if within cooldown period
                                        if (
                                          timeDiff > 0 &&
                                          timeDiff < SLOT_INTERVAL_MINUTES
                                        ) {
                                          return false
                                        }
                                      }
                                    }

                                    return true
                                  },
                                )

                                const removedCount =
                                  schedule.length - filteredSchedule.length

                                // Update schedule with filtered slots + new slots
                                setSchedule([...filteredSchedule, ...newSlots])

                                if (removedCount > 0) {
                                  toast.success(
                                    t(
                                      "Added {{added}} slots and removed {{removed}} conflicting slots",
                                      {
                                        added: newSlots.length,
                                        removed: removedCount,
                                      },
                                    ),
                                  )
                                } else {
                                  toast.success(
                                    t("Added {{count}} repeated slots", {
                                      count: newSlots.length,
                                    }),
                                  )
                                }
                              }
                            }}
                          >
                            {t("Generate Slots")}
                          </Button>
                        </Div>
                        <P
                          style={{
                            fontSize: ".75rem",
                            opacity: 0.6,
                            marginTop: ".5rem",
                          }}
                        >
                          💡{" "}
                          {t(
                            "This will create new slots with the same settings at the specified interval",
                          )}
                        </P>
                      </Div>
                    </Div>
                  )}
                </React.Fragment>
              )
            })}
          </Div>
        </Div>
        {/* Results */}
        {totalPosts > 0 ? (
          <Div
            style={{
              marginTop: ".7rem",
            }}
          >
            <Div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: ".5rem",
              }}
            >
              <Div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <Div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: "1rem" }}>📮</Text>
                  <Text>{t("Total Posts")}</Text>
                  <Text
                    style={{
                      color: "var(--accent-1)",
                    }}
                  >
                    {formatter.format(totalPosts)}
                  </Text>
                </Div>
                <Div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: "1rem" }}>⚡</Text>
                  <Text>{t("Credits per Post")}</Text>
                  <Text
                    style={{
                      color: "var(--accent-1)",
                    }}
                  >
                    {formatter.format(creditsPerPost)}
                  </Text>
                </Div>
                <Div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: "1rem" }}>💎</Text>
                  <Text>{t("Total Credits")}</Text>
                  <Text
                    style={{
                      color: "var(--accent-1)",
                    }}
                  >
                    {formatter.format(totalCredits)}
                  </Text>
                </Div>
                <Div
                  style={{
                    display: "flex",
                    gap: ".5rem",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: "1rem" }}>💵</Text>
                  <Text style={{ fontWeight: "bold" }}>{t("Total Price")}</Text>
                  <Text
                    style={{
                      color: "var(--accent-1)",
                      fontWeight: "bold",
                    }}
                  >
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "EUR",
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }).format(totalPrice)}
                  </Text>
                </Div>
              </Div>
              <>
                {!user && (
                  <Div
                    style={{
                      display: "flex",
                      gap: ".5rem",
                      alignItems: "center",
                    }}
                  >
                    <ShoppingCart color="var(--accent-1)" size={18} />
                    <Text
                      style={{
                        fontSize: "1.1rem",
                        color: "var(--accent-1)",
                      }}
                    >
                      {t("{{price}} ", {
                        price: new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "EUR",
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }).format(totalPrice),
                      })}
                    </Text>
                    added to your basket
                    <Img logo="coder" size={20} />
                  </Div>
                )}

                <Div style={{}}>
                  <>
                    {user ? (
                      !accountApp ? (
                        <Div style={{}}>
                          🦋 Continue creating app to earn FREE Tribe credits.
                          After creating your app you will earn 5 on demand
                          Posts for free, then you can schedule posts using this
                          credit calculator.
                        </Div>
                      ) : (
                        <>
                          <Div style={{}}>
                            {existingSchedule && (
                              <Div
                                style={{
                                  display: "inline-flex",
                                  flexDirection: "column",
                                  marginTop: ".5rem",
                                }}
                              >
                                <Div
                                  style={{
                                    padding: ".5rem",
                                    backgroundColor: "var(--shade-2)",
                                    borderRadius: "var(--radius)",
                                    fontSize: ".85rem",
                                  }}
                                >
                                  <Div
                                    style={{
                                      fontWeight: "500",
                                      flex: 1,
                                      display: "inline-flex",
                                    }}
                                  >
                                    📅{" "}
                                    {t(
                                      existingSchedule.status === "active"
                                        ? "Active Schedule"
                                        : "Pending Schedule",
                                    )}{" "}
                                    ({existingSchedule.scheduleType}) -{" "}
                                    {t("Current credits")}:{" "}
                                    {existingSchedule.totalEstimatedCredits}
                                  </Div>{" "}
                                  {priceDifference !== 0 && (
                                    <Div
                                      style={{
                                        marginTop: ".2rem",
                                        color:
                                          priceDifference > 0
                                            ? "var(--accent-1)"
                                            : "var(--accent-4)",
                                        fontWeight: "500",
                                      }}
                                    >
                                      {priceDifference > 0 ? "📈" : "📉"}{" "}
                                      {t("Difference")}:{" "}
                                      {new Intl.NumberFormat("en-US", {
                                        style: "currency",
                                        currency: "EUR",
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      }).format(Math.abs(priceDifference))}
                                    </Div>
                                  )}
                                </Div>
                              </Div>
                            )}
                            <Div
                              style={{
                                display: "flex",
                                gap: ".5rem",
                                alignItems: "center",
                                flexWrap: "wrap",
                                flex: 1,
                                width: "100%",
                                marginTop: 5,
                                marginBottom: 7.5,
                              }}
                            >
                              <Subscribe
                                style={{
                                  display: existingSchedule?.pendingPayment
                                    ? "block"
                                    : "none",
                                }}
                                disabled={!isSubscriptionEnabled}
                                selectedPlan="tribe"
                                customPrice={realDifference}
                                cta={t(
                                  !isSubscriptionEnabled
                                    ? `Add {{price}} more using`
                                    : "Confirm {{price}} at checkout",
                                  !realDifference
                                    ? undefined
                                    : {
                                        price: new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: "EUR",
                                          minimumFractionDigits: 2,
                                          maximumFractionDigits: 2,
                                        }).format(realDifference),
                                      },
                                )}
                                scheduledTaskId={existingSchedule?.id}
                                appId={app?.id}
                                isTribe
                              />
                              {!existingSchedule && totalPrice ? (
                                // No schedule exists - create pending first
                                <Button
                                  onClick={handleCreateOrUpdateSchedule}
                                  disabled={creatingSchedule}
                                  style={{
                                    ...utilities.inverted.style,
                                    ...utilities.small.style,
                                  }}
                                  className="inverted"
                                >
                                  {creatingSchedule ? (
                                    <Loading size={18} />
                                  ) : (
                                    <>
                                      <Img logo="coder" />
                                      {t("Create Schedule")}
                                    </>
                                  )}
                                </Button>
                              ) : existingSchedule &&
                                !existingSchedule?.pendingPayment ? (
                                // Update schedule (payment required if price increased)
                                <Button
                                  onClick={handleCreateOrUpdateSchedule}
                                  disabled={loading}
                                  style={{
                                    ...utilities.inverted.style,
                                    ...utilities.small.style,
                                  }}
                                  className="inverted"
                                >
                                  {loading ? (
                                    <Loading size={18} />
                                  ) : (
                                    <>
                                      <Img logo="coder" />
                                      {t(
                                        realDifference
                                          ? "Update Schedule"
                                          : "Update Schedule",
                                      )}
                                    </>
                                  )}
                                </Button>
                              ) : null}
                              {existingSchedule && (
                                <ConfirmButton
                                  processing={deletingSchedule}
                                  className="transparent"
                                  onConfirm={handleDeleteSchedule}
                                  disabled={deletingSchedule}
                                  style={{
                                    ...utilities.transparent.style,
                                    ...utilities.small.style,
                                    marginLeft: "auto",
                                  }}
                                >
                                  {deletingSchedule ? (
                                    <Loading size={16} />
                                  ) : (
                                    `🗑️ ${t("Delete")}`
                                  )}
                                </ConfirmButton>
                              )}
                            </Div>
                          </Div>
                        </>
                      )
                    ) : (
                      <Button
                        className="inverted"
                        onClick={() => {
                          addParams({
                            signIn: "login",
                            callbackUrl: `${FRONTEND_URL}/?settings=true&tab=tribe`,
                          })
                        }}
                        disabled={loading || !app?.id}
                        style={{
                          marginTop: ".3rem",
                          ...utilities.inverted.style,
                          ...utilities.small.style,
                        }}
                      >
                        {loading ? (
                          <Loading size={18} />
                        ) : (
                          <>
                            <Img logo="chrry" size={20} />
                            {t("Join")}
                          </>
                        )}
                      </Button>
                    )}
                  </>
                </Div>
                {!(user || guest)?.subscription && accountApp && (
                  <Text
                    style={{
                      fontSize: ".8rem",
                      color: "var(--shade-7)",
                    }}
                  >
                    🍓{" "}
                    <A openInNewTab href="/?subscribe=true">
                      {t("Subscription")}
                    </A>{" "}
                    {t(
                      "is not required, but If you enjoy Tribe, it unlocks limits when you bring your own keys. This also enables on demand Engagements",
                    )}{" "}
                    🫐
                  </Text>
                )}
              </>
            </Div>
          </Div>
        ) : !user ? (
          <Button
            className="inverted"
            onClick={() => {
              if (!user) {
                addParams({
                  signIn: "login",
                  callbackUrl: `${FRONTEND_URL}/?settings=true&tab=systemPrompt&trial=tribe`,
                })
              }
            }}
            disabled={loading || !app?.id}
            style={{
              marginTop: ".3rem",
              ...utilities.inverted.style,
              ...utilities.small.style,
            }}
          >
            {loading ? (
              <Loading size={18} />
            ) : (
              <>
                <Img logo="chrry" size={20} />
                {t("Join to Try")}
              </>
            )}
          </Button>
        ) : !accountApp ? (
          <Div style={{ marginTop: ".7rem", marginBottom: ".3rem" }}>
            🔑 Continue creating app to add your 🦞 Moltbook API key using
            settings
          </Div>
        ) : null}
      </Div>
    </Div>
  )
}
