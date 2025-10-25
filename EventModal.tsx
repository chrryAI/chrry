"use client"

import React, { useEffect, useState } from "react"
import {
  Calendar,
  Palette,
  Circle,
  MapPin,
  Users,
  Type,
  Clock11,
  Clock12,
  CalendarClock,
  Info,
  Trash2,
  Pencil,
} from "./icons"
import styles from "./EventModal.module.scss"
import clsx from "clsx"
import Modal from "./Modal"
import Checkbox from "./Checkbox"
import { COLORS, useAppContext } from "./context/AppContext"
import { useForm, Controller, type SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  formCalendarEventSchema,
  type FormCalendarEventInput,
} from "./utils/calendarValidation"
import { z } from "zod"
import {
  CalendarEventFormData,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
} from "./lib"
import toast from "react-hot-toast"
import Loading from "./Loading"
import TextWithLinks from "./TextWithLinks"
import MarkdownContent from "./MarkdownContent"
import ConfirmButton from "./ConfirmButton"
import { useAuth, useData } from "./context/providers"

// Use the unified schema - single source of truth!

const getColorOptions = (t: (key: string) => string) =>
  [
    { value: "blue", label: t("Blue"), color: COLORS.blue },
    { value: "green", label: t("Green"), color: COLORS.green },
    { value: "red", label: t("Red"), color: COLORS.red },
    { value: "orange", label: t("Orange"), color: COLORS.orange },
    { value: "violet", label: t("Violet"), color: COLORS.violet },
    { value: "purple", label: t("Purple"), color: COLORS.purple },
  ] as const

// Helper function to convert Date to local datetime-local string
const formatDateForInput = (date: Date, isAllDay: boolean): string => {
  if (!(date instanceof Date)) return ""

  if (isAllDay) {
    // For all-day events, just return the date part in local timezone
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  } else {
    // For datetime, format in local timezone
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }
}

export type modalData =
  | {
      description?: string | null
      location?: string | null
      color?: string | null
      start: Date
      end: Date
      title?: string
      eventId?: string
      isAllDay?: boolean
      category?: string | null
      timezone?: string | null
      reminders?:
        | {
            type: "email" | "notification" | "popup"
            minutesBefore: number
            sent?: boolean
          }[]
        | null
        | undefined
      attendees?:
        | {
            email: string
            name?: string
            status: "pending" | "accepted" | "declined"
            isOrganizer?: boolean
          }[]
        | null
    }
  | undefined

export default function EventModal({
  isOpen,
  onClose,
  initialData,
  refetchCalendarEvents,
}: {
  isOpen: boolean
  onClose: () => void
  initialData?: modalData
  refetchCalendarEvents: () => Promise<void>
}) {
  const { t } = useAppContext()
  const { token } = useAuth()
  const colorOptions = getColorOptions(t)

  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    setFocus,
    reset,
  } = useForm({
    resolver: zodResolver(formCalendarEventSchema),
    mode: "onChange",
    defaultValues: {
      title: initialData?.title ?? "",
      description: initialData?.description ?? "",
      startTime: initialData?.start ?? new Date(),
      endTime: initialData?.end ?? new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
      location: initialData?.location ?? "",
      color: (initialData?.color as any) ?? "blue",
      category: initialData?.category ?? "",
      isAllDay: initialData?.isAllDay ?? false,
      timezone:
        initialData?.timezone ??
        Intl.DateTimeFormat().resolvedOptions().timeZone ??
        "UTC",
      attendees: [] as Array<{
        email: string
        name?: string
        status: "pending" | "accepted" | "declined"
        isOrganizer: boolean
      }>,
      reminders: [] as Array<{
        type: "email" | "notification" | "popup"
        minutesBefore: number
        sent: boolean
      }>,
      isRecurring: false,
      status: "confirmed" as const,
      visibility: "private" as const,
    },
  })

  const [canEditDescription, setCanEditDescription] = useState(
    !initialData?.description,
  )

  const eventId = initialData?.eventId

  const { actions } = useData()

  // Focus flow: when startTime changes, move to endTime; when endTime changes, to location
  const startTime = watch("startTime")
  const endTime = watch("endTime")
  useEffect(() => {
    if (startTime) setFocus("endTime")
  }, [startTime, setFocus])
  useEffect(() => {
    if (endTime) setFocus("location")
  }, [endTime, setFocus])

  const onSubmit: SubmitHandler<CalendarEventFormData> = async (data) => {
    if (!token) return
    setIsSaving(true)

    try {
      const response = eventId
        ? await actions.updateCalendarEvent({
            id: eventId,
            event: data,
          })
        : await actions.createCalendarEvent(data)

      if (response.error) {
        toast.error(response.error)
        return
      }

      await refetchCalendarEvents()
      toast.success("Saved")
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setIsSaving(false)
    }
    onClose()
    reset()
  }

  const handleDelete = async () => {
    if (!token || !eventId) return

    setIsDeleting(true)

    try {
      const response = await actions.deleteCalendarEvent(eventId)

      if (response.error) {
        toast.error(response.error)
        return
      }

      await refetchCalendarEvents()
      toast.success(t("Event deleted"))
      onClose()
      reset()
    } catch (error) {
      console.error(error)
      toast.error(t("Failed to delete event"))
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      hideOnClickOutside={false}
      icon={<CalendarClock />}
      onToggle={(open) => {
        if (open == undefined) return
        if (!open) onClose()
      }}
      isModalOpen={isOpen}
      hasCloseButton={true}
      title={eventId ? t("Edit Event") : t("Create Event")}
    >
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Title */}
        <div className={styles.field}>
          <div className={styles.fieldIcon}>
            <Type size={16} />
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder={t("Add title")}
              className={styles.titleInput}
              autoFocus
              {...register("title")}
            />
          </div>
          {errors.title && (
            <div className={styles.error} role="alert">
              {errors.title.message}
            </div>
          )}
        </div>

        {/* All Day Toggle */}
        <div className={styles.field}>
          <div className={styles.fieldIcon}>
            <Calendar size={16} />
          </div>
          <Controller
            control={control}
            name="isAllDay"
            render={({ field }) => (
              <Checkbox
                checked={!!field.value}
                onChange={() => field.onChange(!field.value)}
              >
                {t("All day")}
              </Checkbox>
            )}
          />
        </div>

        {/* Date and Time */}
        <div className={styles.fieldWrapper}>
          <div className={styles.field}>
            <Clock12 size={16} />
            <label htmlFor="start">{t("Start")}</label>
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <input
                  id="start"
                  type={
                    (watch("isAllDay") as boolean) ? "date" : "datetime-local"
                  }
                  className={styles.dateTimeInput}
                  value={formatDateForInput(field.value, !!watch("isAllDay"))}
                  onChange={(e) => {
                    const v = e.target.value

                    field.onChange(new Date(v))
                  }}
                />
              )}
            />
          </div>
          {errors.startTime && (
            <div className={styles.error} role="alert">
              {errors.startTime.message}
            </div>
          )}
        </div>
        <div className={styles.fieldWrapper}>
          <div className={styles.field}>
            <Clock11 size={16} />
            <label htmlFor="end">{t("End")}</label>
            <Controller
              control={control}
              name="endTime"
              render={({ field }) => (
                <input
                  id="end"
                  type={
                    (watch("isAllDay") as boolean) ? "date" : "datetime-local"
                  }
                  className={styles.dateTimeInput}
                  value={formatDateForInput(field.value, !!watch("isAllDay"))}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(new Date(v))
                  }}
                />
              )}
            />
          </div>
          {errors.endTime && (
            <div className={styles.error} role="alert">
              {errors.endTime.message}
            </div>
          )}
        </div>
        {/* Location */}
        <div className={styles.field}>
          <div className={styles.fieldIcon}>
            <MapPin size={16} />
          </div>
          <input
            type="text"
            placeholder={t("Add location")}
            className={styles.input}
            {...register("location")}
          />
        </div>

        {/* Description */}
        <div style={{ alignItems: "flex-start" }} className={styles.field}>
          {canEditDescription ? (
            <>
              <div className={styles.fieldIcon}>
                <Info size={16} />
              </div>
              <div className={styles.descriptionEdit}>
                <textarea
                  placeholder={t("Add description")}
                  className={styles.textarea}
                  rows={3}
                  {...register("description")}
                />
                {eventId && (
                  <button onClick={() => setCanEditDescription(false)}>
                    Cancel
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className={styles.descriptionView}>
              <MarkdownContent
                content={initialData?.description || ""}
                className={styles.descriptionView}
              />
            </div>
          )}
        </div>

        {/* Color */}
        <div className={styles.field}>
          <div className={styles.fieldIcon}>
            <Palette size={16} />
          </div>
          <div className={styles.colorSection}>
            <span className={styles.colorLabel}>{t("Color")}</span>
            <div className={styles.colorOptions}>
              {colorOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={clsx(
                    "link",
                    styles.colorOption,
                    watch("color") === option.value && styles.selected,
                  )}
                  onClick={() => setValue("color", option.value)}
                  title={option.label}
                >
                  <Circle size={20} fill={option.color} color={option.color} />
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.actions}>
          <div style={{ display: "flex", gap: "10px" }}>
            <button
              type="button"
              onClick={() => onClose()}
              className="transparent"
            >
              {t("Cancel")}
            </button>
            {eventId && (
              <ConfirmButton
                onConfirm={handleDelete}
                confirm={
                  <>
                    {isDeleting ? (
                      <Loading size={16} />
                    ) : (
                      <Trash2 color="var(--accent-0)" size={16} />
                    )}
                    {t("Are you sure?")}
                  </>
                }
                className="transparent"
                disabled={isDeleting}
                style={{ color: "var(--error)" }}
              >
                <Trash2 color="var(--accent-0)" size={16} />
                {t("Delete")}
              </ConfirmButton>
            )}
          </div>
          {!canEditDescription && (
            <button
              type="button"
              className="inverted"
              onClick={() => setCanEditDescription(true)}
            >
              <Pencil size={16} /> {t("Edit description")}
            </button>
          )}

          <button type="submit" disabled={isSubmitting || isSaving}>
            {isSubmitting || isSaving ? <Loading size={18} /> : t("Save")}
          </button>
        </div>
      </form>
    </Modal>
  )
}
