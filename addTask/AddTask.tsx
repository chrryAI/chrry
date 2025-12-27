"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
import { customZodResolver } from "../utils/customZodResolver"
import { z } from "zod"
import Loading from "../Loading"
import { Task } from "../FocusButton"
import sanitizeHtml from "sanitize-html"
import { useAppContext } from "../context/AppContext"
import { API_URL, apiFetch, GUEST_TASKS_COUNT } from "../utils"
import SignIn from "../SignIn"
import Subscribe from "../Subscribe"
import { ArrowLeft } from "../icons"
import { Button, Div, H3, Input, Span, toast, useNavigation } from "../platform"
import { useAuth } from "../context/providers"
import { useAddTaskStyles } from "./AddTask.styles"
import { useStyles } from "../context/StylesContext"

const NewTaskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
})

const AddTask = ({
  onAdd,
  onCancel,
  totalTasksCount,
}: {
  onAdd: (task: Task) => Promise<void>
  onCancel: () => void
  totalTasksCount: number
}) => {
  const { t } = useAppContext()
  const styles = useAddTaskStyles()
  const { utilities } = useStyles()

  const { addParams, removeParams } = useNavigation()
  const {
    formState: { errors },
    reset: resetNewTask,
    register: registerNewTask,
    handleSubmit,
  } = useForm<z.infer<typeof NewTaskSchema>>({
    resolver: customZodResolver(NewTaskSchema),
    mode: "onSubmit",
    defaultValues: {
      title: "",
    },
  })

  const { token, guest, user, language, track: trackEvent } = useAuth()
  const [isAddingTask, setIsAddingTask] = React.useState(false)

  useEffect(() => {
    ;(
      document.querySelector(
        '#addTaskForm input[name="title"]',
      ) as HTMLInputElement
    )?.focus()
  }, [])

  const tasksCount = guest
    ? guest.tasksCount
    : user
      ? user.tasksCount
      : GUEST_TASKS_COUNT

  const onAddTask = handleSubmit(async (data) => {
    const now = new Date()
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: sanitizeHtml(data.title),
      createdOn: now,
      modifiedOn: now,
      total: [],
      order: 0,
    }

    setIsAddingTask(true)

    try {
      await apiFetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...newTask,
          language,
        }),
      }).catch((error) => {
        toast.error("Error adding task")
        console.error("Error adding task:", error)
      })

      trackEvent({ name: "task_add" })
      toast.success("Task added")
      await onAdd(newTask)
    } catch (error) {
      toast.error("Error adding task")
      console.error("Error adding task:", error)
    } finally {
      setIsAddingTask(false)
    }

    setIsAddingTask(false)
    resetNewTask()
  })

  return (
    <Div style={styles.addTask.style}>
      {tasksCount <= totalTasksCount && user?.role !== "admin" ? (
        <Div style={styles.addTaskMaxCountReached.style}>
          <Span style={styles.addTaskMaxCountReachedText.style}>
            {t("Max tasks count reached")}
          </Span>
          {!user ? <SignIn /> : <Subscribe />}
          <Button onClick={() => onCancel()}>
            <ArrowLeft size={14} />
            {t("Back")}
          </Button>
        </Div>
      ) : (
        <Div id="addTaskForm">
          <H3 style={styles.addTaskTitle.style}>{t("Add a task")}</H3>
          <Input
            data-testid="add-task-input"
            style={{
              ...(errors.title ? styles.inputError.style : {}),
              ...styles.input.style,
            }}
            {...registerNewTask("title")}
            placeholder="Task title"
            type="text"
          />
          {errors.title && (
            <Div data-testid="add-task-error" style={styles.fieldError.style}>
              {errors.title?.message}
            </Div>
          )}
          <Div style={styles.addTaskButtons.style}>
            <Button
              data-testid="add-task-button"
              type="button"
              onClick={onAddTask}
              style={{ padding: "10px 20px", cursor: "pointer" }}
            >
              {isAddingTask ? (
                <Loading color="#fff" width={18} height={18} />
              ) : (
                t("Add")
              )}
            </Button>
            <Button
              type="button"
              style={utilities.transparent.style}
              onClick={() => {
                onCancel()
              }}
            >
              {t("Cancel")}
            </Button>
          </Div>
        </Div>
      )}
    </Div>
  )
}

export default AddTask
