"use client"

import React, { useEffect } from "react"
import styles from "./AddTask.module.scss"
import clsx from "clsx"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import Loading from "./Loading"
import { Task } from "./FocusButton"
import sanitizeHtml from "sanitize-html"
import { useAppContext } from "./context/AppContext"
import { API_URL, apiFetch, GUEST_TASKS_COUNT } from "./utils"
import SignIn from "./SignIn"
import Subscribe from "./Subscribe"
import { ArrowLeft } from "lucide-react"
import { useWindowHistory } from "./hooks/useWindowHistory"
import { useTranslation } from "react-i18next"
import { toast, useNavigation } from "./platform"
import { useAuth } from "./context/providers"

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
  const { t } = useTranslation()

  const { addParams, removeParams } = useNavigation()
  const {
    handleSubmit: handleNewTaskSubmit,
    formState: { errors: newTaskErrors },
    reset: resetNewTask,
    register: registerNewTask,
  } = useForm<z.infer<typeof NewTaskSchema>>({
    mode: "onChange",
    resolver: zodResolver(NewTaskSchema),
    defaultValues: {
      title: "",
    },
  })

  useEffect(() => {
    addParams({ addTask: "true" })
    trackEvent({ name: "add_task" })
    return () => {
      removeParams("addTask")
    }
  }, [])

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

  const onAddTask = handleNewTaskSubmit(async (data) => {
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

    // setTasks((prevTasks) => [...prevTasks, newTask])
    setIsAddingTask(false)
    resetNewTask()
  })
  return (
    <div className={styles.addTask}>
      {tasksCount <= totalTasksCount && user?.role !== "admin" ? (
        <div className={styles.addTaskMaxCountReached}>
          <span className={styles.addTaskMaxCountReachedText}>
            {t("Max tasks count reached")}
          </span>
          {!user ? <SignIn /> : <Subscribe />}
          <button
            className={clsx(styles.cancelAddTaskButton, "link")}
            onClick={() => onCancel()}
          >
            <ArrowLeft size={14} />
            {t("Back")}
          </button>
        </div>
      ) : (
        <form id="addTaskForm" onSubmit={onAddTask}>
          <h3 className={styles.addTaskTitle}>{t("Add a task")}</h3>
          <input
            data-testid="add-task-input"
            className={clsx(
              styles.addTaskInput,
              newTaskErrors.title && styles.inputError,
            )}
            {...registerNewTask("title")}
            placeholder="Task title"
            type="text"
          />
          {newTaskErrors.title && (
            <div data-testid="add-task-error" className={styles.fieldError}>
              {newTaskErrors.title?.message}
            </div>
          )}
          <div className={styles.addTaskButtons}>
            <button data-testid="add-task-button" type="submit">
              {isAddingTask ? (
                <Loading color="#fff" width={18} height={18} />
              ) : (
                t("Add")
              )}
            </button>
            <button
              type="button"
              className={clsx(styles.cancelAddTaskButton, "transparent")}
              onClick={() => {
                onCancel()
              }}
            >
              {t("Cancel")}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default AddTask
