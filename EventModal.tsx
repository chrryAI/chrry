"use client"

import { useEffect, useState } from "react"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import toast from "react-hot-toast"
import Checkbox from "./Checkbox"
import ColorScheme from "./ColorScheme"
import ConfirmButton from "./ConfirmButton"
import { COLORS, useAppContext } from "./context/AppContext"
import { useAuth, useData } from "./context/providers"
import { useStyles } from "./context/StylesContext"
import { useEventModalStyles } from "./EventModal.styles"
import {
  Calendar,
  CalendarClock,
  Clock11,
  Clock12,
  Info,
  MapPin,
  Palette,
  Pencil,
  Trash2,
  Type,
} from "./icons"
import Loading from "./Loading"
import type { CalendarEventFormData } from "./lib"
import MarkdownContent from "./MarkdownContent"
import Modal from "./Modal"
import { Button, Div, Form, Input, Label, Span, TextArea } from "./platform"
import { formCalendarEventSchema } from "./utils/calendarValidation"
import { customZodResolver } from "./utils/customZodResolver"

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
const formatDateForInput = (
  date: Date | string | number,
  isAllDay: boolean,
): string => {
  // Convert to Date if it's not already
  const dateObj = date instanceof Date ? date : new Date(date)

  // Check if it's a valid date
  if (Number.isNaN(dateObj.getTime())) return ""

  if (isAllDay) {
    // For all-day events, just return the date part in local timezone
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const day = String(dateObj.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  } else {
    // For datetime, format in local timezone
    const year = dateObj.getFullYear()
    const month = String(dateObj.getMonth() + 1).padStart(2, "0")
    const day = String(dateObj.getDate()).padStart(2, "0")
    const hours = String(dateObj.getHours()).padStart(2, "0")
    const minutes = String(dateObj.getMinutes()).padStart(2, "0")
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
  const styles = useEventModalStyles()
  const { utilities } = useStyles()
  const { t } = useAppContext()
  const { token } = useAuth()
  const _colorOptions = getColorOptions(t)

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
    resolver: customZodResolver(formCalendarEventSchema),
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
        if (open === undefined) return
        if (!open) onClose()
      }}
      isModalOpen={isOpen}
      hasCloseButton={true}
      title={eventId ? t("Edit Event") : t("Create Event")}
    >
      <Form onSubmit={handleSubmit(onSubmit)} style={styles.form.style}>
        {/* Title */}
        <Div style={styles.field.style}>
          <Div style={styles.fieldIcon.style}>
            <Type size={16} />
          </Div>
          <Div style={{ flex: 1 }}>
            <Input
              type="text"
              placeholder={t("Add title")}
              style={styles.titleInput.style}
              autoFocus
              {...register("title")}
            />
          </Div>
          {errors.title && (
            <Div style={styles.error.style} role="alert">
              {(errors.title?.message as string) || ""}
            </Div>
          )}
        </Div>

        {/* All Day Toggle */}
        <Div style={styles.field.style}>
          <Div style={styles.fieldIcon.style}>
            <Calendar size={16} />
          </Div>
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
        </Div>

        {/* Date and Time */}
        <Div>
          <Div style={styles.field.style}>
            <Clock12 size={16} />
            <label htmlFor="start">{t("Start")}</label>
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <Input
                  id="start"
                  className="dateTimeInput"
                  type={
                    (watch("isAllDay") as boolean) ? "date" : "datetime-local"
                  }
                  style={styles.dateTimeInput}
                  value={formatDateForInput(
                    field.value ? new Date(field.value) : new Date(),
                    !!watch("isAllDay"),
                  )}
                  onChange={(e) => {
                    const v = e.target.value

                    field.onChange(new Date(v))
                  }}
                />
              )}
            />
          </Div>
          {errors.startTime && (
            <Div style={styles.error.style} role="alert">
              {(errors.startTime?.message as string) || ""}
            </Div>
          )}
        </Div>
        <Div>
          <Div style={styles.field.style}>
            <Clock11 size={16} />
            <Label htmlFor="end">{t("End")}</Label>
            <Controller
              control={control}
              name="endTime"
              render={({ field }) => (
                <Input
                  id="end"
                  className="dateTimeInput"
                  type={
                    (watch("isAllDay") as boolean) ? "date" : "datetime-local"
                  }
                  style={styles.dateTimeInput.style}
                  value={formatDateForInput(
                    field.value ? new Date(field.value) : new Date(),
                    !!watch("isAllDay"),
                  )}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(new Date(v))
                  }}
                />
              )}
            />
          </Div>
          {errors.endTime && (
            <Div style={styles.fieldWrapperError.style} role="alert">
              {(errors.endTime?.message as string) || ""}
            </Div>
          )}
        </Div>
        {/* Location */}
        <Div style={styles.field.style}>
          <Div style={styles.fieldIcon.style}>
            <MapPin size={16} />
          </Div>
          <Input
            type="text"
            placeholder={t("Add location")}
            style={styles.input.style}
            {...register("location")}
          />
        </Div>

        {/* Description */}
        <Div style={{ ...styles.field.style, alignItems: "flex-start" }}>
          {canEditDescription ? (
            <>
              <Div style={styles.fieldIcon.style}>
                <Info size={16} />
              </Div>
              <Div style={styles.descriptionEdit.style}>
                <TextArea
                  placeholder={t("Add description")}
                  style={styles.textarea.style}
                  rows={3}
                  {...register("description")}
                />
                {eventId && (
                  <Button
                    style={styles.descriptionEditButton.style}
                    onClick={() => setCanEditDescription(false)}
                  >
                    {t("Cancel")}
                  </Button>
                )}
              </Div>
            </>
          ) : (
            <Div
              className="descriptionView"
              style={styles.descriptionView.style}
            >
              <MarkdownContent
                content={initialData?.description || ""}
                style={styles.descriptionView.style}
              />
            </Div>
          )}
        </Div>

        {/* Color */}
        <Div style={styles.field.style}>
          <Div style={styles.fieldIcon.style}>
            <Palette size={16} />
          </Div>
          <Div style={styles.colorSection.style}>
            <Span style={styles.colorLabel}>{t("Color")}</Span>
            <Div state={styles.colorOptions}>
              <ColorScheme
                colorScheme={watch("color")}
                onChange={(color) => setValue("color", color)}
              />
            </Div>
          </Div>
        </Div>
        <Div style={styles.actions.style}>
          <Div style={{ display: "flex", gap: "10px" }}>
            <Button
              type="button"
              onClick={() => onClose()}
              className="transparent"
              style={{ ...utilities.transparent.style }}
            >
              {t("Cancel")}
            </Button>
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
                style={{
                  ...utilities.transparent.style,
                  color: "var(--error)",
                }}
                disabled={isDeleting}
              >
                <Trash2 color="var(--accent-0)" size={16} />
                {t("Delete")}
              </ConfirmButton>
            )}
          </Div>
          {!canEditDescription && (
            <Button
              type="button"
              className="inverted"
              style={{ ...utilities.inverted.style }}
              onClick={() => setCanEditDescription(true)}
            >
              <Pencil size={16} /> {t("Edit description")}
            </Button>
          )}

          <Button type="submit" disabled={isSubmitting || isSaving}>
            {isSubmitting || isSaving ? <Loading size={18} /> : t("Save")}
          </Button>
        </Div>
      </Form>
    </Modal>
  )
}
