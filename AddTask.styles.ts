/**
 * Generated from AddTask.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const AddTaskStyleDefs = {
  addTask: {
    margin: "5px 0 20px 0",
    display: "block",
    width: "100%",
    height: 50,
    padding: 10,
    marginBottom: 10,
  },
  addTaskButtons: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  addTaskMaxCountReached: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--foreground)",
    gap: 15,
    flexDirection: "column",
  },
  addTaskMaxCountReachedText: {
    color: "var(--shade-6)",
    fontSize: 15,
  },
  addTaskTitle: {
    margin: 0,
    marginBottom: 5,
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { createStyleHook } from "chrry/styles/createStyleHook"

export const AddTaskStyles = createUnifiedStyles(AddTaskStyleDefs)

// Type for the hook return value
type AddTaskStylesHook = {
  [K in keyof typeof AddTaskStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useAddTaskStyles =
  createStyleHook<AddTaskStylesHook>(AddTaskStyles)
