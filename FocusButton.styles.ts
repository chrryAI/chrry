/**
 * Generated from FocusButton.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const FocusButtonStyleDefs = {
  main: {
    display: "flex",
    flexDirection: "column",
    maxWidth: 320,
    margin: "0 auto",
    gap: 15,
  },
  greeting: {
    fontSize: 15,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    gap: 6,
    color: "var(--shade-6)",
    position: "relative",
    alignSelf: "center",
  },
  accountLink: {
    fontSize: 15,
  },
  hidden: {
    display: "none",
  },
  focusButton: {
    width: 225,
    height: 225,
    borderRadius: "50%",
    margin: "0 auto",
    marginBottom: 5,
    outline: "none",
    fontSize: "1.2rem",
    fontWeight: 500,
    position: "relative",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    flexDirection: "column",
    backgroundColor: "var(--background)",
    border: "1px solid var(--shade-2)",
    color: "var(--foreground)",
  },
  focusButtonMounted: {},
  focusButtonCounting: {
    border: "1px solid var(--accent-4)",
    boxShadow: "0px 0px 5px var(--accent-4)",
  },
  focusButtonPaused: {
    border: "1px solid var(--orange-500)",
  },
  focusButtonFinished: {
    border: "1px solid var(--accent-4)",
  },
  pauseButton: {
    border: "1px solid var(--accent-4) !important",
  },
  additionalSettings: {
    display: "flex",
    gap: 10,
  },
  cookieConsent: {
    marginTop: 5,
    marginBottom: 15,
  },
  timeDisplay: {
    display: "inline-flex",
    alignItems: "center",
    fontFamily: "var(--font-mono)",
    fontSize: 40,
    fontWeight: 500,
    gap: 8,
    position: "relative",
  },
  video: {
    width: 30,
    height: 30,
    objectFit: "cover",
    borderRadius: "50%",
  },
  videoPlay: {
    display: "none",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  videoPause: {
    display: "none",
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
  },
  videoContainer: {
    position: "relative",
    backgroundColor: "#000",
    padding: 2,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "var(--shadow)",
  },
  letsFocusContainer: {
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  userName: {
    color: "var(--accent-5)",
    position: "relative",
    right: 2,
  },
  timeAdjust: {
    padding: "5px 9px",
    color: "var(--shade-6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "var(--radius)",
    backgroundColor: "transparent",
  },
  separator: {
    padding: "0 3px 10px 3px",
    fontFamily: "var(--font-sans)",
  },
  controlIcon: {
    color: "var(--shade-5)",
  },
  settingsContainer: {
    maxWidth: 420,
    margin: "0 auto",
    padding: 10,
    marginTop: 30,
    fontSize: "1rem",
    display: "flex",
    flexDirection: "column",
    gap: 42,
    alignItems: "center",
  },
  settings: {
    display: "flex",
    gap: 10,
    alignItems: "center",
  },
  settingsInput: {
    borderRadius: 10,
    border: "1px solid var(--shade-2)",
    padding: "5px 7px",
    fontSize: "1rem",
    backgroundColor: "var(--background)",
    color: "var(--foreground)",
    opacity: 1,
  },
  settingsSpan: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  controls: {
    gap: 15,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  controlsVisible: {
    display: "flex",
  },
  pomodoro: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    gap: 10,
    padding: "5px 10px",
    fontSize: 15,
  },
  pomodoroActive: {
    borderColor: "var(--accent-4)",
  },
  pomodoroPaused: {
    borderColor: "var(--accent-1)",
  },
  testimonials: {
    marginTop: 15,
  },
  editTaskButton: {
    position: "absolute",
    top: 15,
    right: 15,
    fontSize: 12,
  },
  settingsFooter: {
    fontSize: 12,
    color: "var(--shade-6)",
  },
  quote: {
    color: "var(--shade-7)",
  },
  headerContainer: {
    position: "absolute",
    top: 15,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  showSettings: {
    base: {
      color: "var(--shade-4)",
      padding: 0,
      backgroundColor: "var(--background)",
      border: "none",
      boxShadow: "none",
    },
    hover: {
      color: "var(--shade-4)",
      backgroundColor: "var(--background)",
    },
  },
  replay: {
    base: {
      color: "var(--shade-4)",
      padding: 0,
      backgroundColor: "var(--background)",
      border: "none",
      boxShadow: "none",
    },
    hover: {
      color: "var(--shade-4)",
      backgroundColor: "var(--background)",
    },
  },
  active: {
    color: "var(--accent-4)",
  },
  footerContainer: {
    position: "absolute",
    bottom: 10,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  discord: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    position: "relative",
    top: 4,
  },
  x: {
    top: 1,
  },
  moon: {},
  sun: {
    color: "var(--accent-1)",
  },
  app: {
    fontSize: 14,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--shade-7)",
    marginBottom: 13,
    marginTop: -5,
    gap: 5,
  },
  multiTasking: {
    fontSize: 15,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--shade-6)",
    marginBottom: 10,
    marginTop: 8,
  },
  time: {
    minWidth: 100,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  minutes: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "var(--background)",
  },
  seconds: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
    backgroundColor: "var(--background)",
  },
  taskSection: {
    maxWidth: 420,
    margin: "0 auto",
    padding: 10,
    marginTop: 5,
    fontSize: "1rem",
  },
  addTask: {
    marginBottom: 10,
    display: "block",
    width: "100%",
    height: 50,
    padding: 10,
  },
  newTaskButton: {
    padding: "8px 12px",
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
  },
  showDemoButton: {
    fontSize: 14,
    display: "flex",
    alignItems: "flex-start",
    gap: 3,
    color: "var(--shade-6)",
    bottom: 2,
  },
  editTask: {
    border: "none",
    padding: "13px 13px",
    display: "block",
    width: "100%",
    height: 50,
    marginBottom: 10,
  },
  tasks: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
    paddingRight: 2,
    marginBottom: 20,
  },
  task: {
    base: {
      borderRadius: "var(--radius)",
      border: "1px solid var(--shade-2)",
      padding: "0 15px",
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: 10,
    },
    hover: {
      border: "1px dashed var(--accent-1)",
    },
  },
  link: {
    color: "var(--foreground)",
  },
  selectedTask: {
    border: "1px solid var(--accent-1)",
  },
  selectedTaskCounting: {
    border: "1px solid var(--accent-4)",
    boxShadow: "0px 0px 5px var(--accent-4)",
  },
  selectedTaskPaused: {
    border: "1px solid var(--orange-500)",
  },
  selectedTaskFinished: {
    border: "1px solid var(--accent-4)",
  },
  taskTitle: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 5,
    padding: "10px 0",
  },
  editButton: {
    base: {
      position: "relative",
      textDecorationLine: "none",
      backgroundColor: "transparent",
      boxShadow: "none",
      padding: 0,
      margin: 0,
      color: "var(--foreground)",
      marginLeft: "auto",
    },
    hover: {
      color: "var(--shade-6)",
      textDecorationLine: "none",
      backgroundColor: "transparent",
    },
  },
  taskContent: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  addTaskButtons: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  editTaskButtons: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  loadingTasks: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  cancelButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  cancelEditTaskButton: {
    base: {
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      boxShadow: "none",
      border: "1px solid var(--shade-2)",
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    hover: {
      backgroundColor: "var(--foreground)",
      color: "var(--background)",
    },
  },
  cancelAddTaskButton: {
    base: {
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      boxShadow: "none",
      border: "1px solid var(--shade-2)",
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    hover: {
      backgroundColor: "var(--foreground)",
      color: "var(--background)",
    },
  },
  deleteTaskButton: {
    marginLeft: "auto",
  },
  closeSettingsButton: {
    base: {
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      boxShadow: "none",
      border: "1px solid var(--shade-2)",
      display: "flex",
      alignItems: "center",
      gap: 5,
    },
    hover: {
      backgroundColor: "var(--foreground)",
      color: "var(--background)",
    },
  },
  reportsButton: {
    padding: "8px 12px",
  },
  dragHandle: {
    marginLeft: "auto",
  },
  fieldError: {
    color: "var(--accent-0)",
    fontSize: "0.8rem",
    margin: "-5px 0 10px 0",
  },
  taskTime: {
    marginLeft: "auto",
    fontSize: 12,
    opacity: 0.7,
  },
  taskSelected: {
    position: "relative",
    top: 2,
  },
  taskNotSelected: {
    position: "relative",
    top: 2,
  },
  top: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 15,
  },
  greatStart: {
    fontSize: 13,
    padding: 10,
    paddingTop: 0,
    position: "relative",
    bottom: 5,
    textAlign: "center",
    color: "var(--shade-7)",
  },
} as const

import { createUnifiedStyles } from "./styles/createUnifiedStyles"
import { useInteractiveStyles } from "./styles/useInteractiveStyles"

export const FocusButtonStyles = createUnifiedStyles(FocusButtonStyleDefs)

// ---- Stronger types for style defs and hook results ----

// A minimal shape for a style object. You can expand this later to be more specific
// (e.g., union of CSS properties used across web/native).
type StyleObject = {
  [key: string]: string | number | boolean | StyleObject | undefined
}

// Interactive (hover/focus/etc.) style definition
type InteractiveStyleDef = {
  base: StyleObject
  hover?: StyleObject
  active?: StyleObject
  focus?: StyleObject
  disabled?: StyleObject
}

// Static style definition is simply a style object
type StaticStyleDef = StyleObject

// explicit static result shape for non-interactive classes
type StaticStyleResult = {
  style: StaticStyleDef
  handlers: Record<string, never>
  state: { isHovered: false; isPressed: false; isFocused: false }
}

// interactive style hook result (keeps your existing hook return type)
type InteractiveStyleResult = ReturnType<typeof useInteractiveStyles>

// Create a discriminated mapped type so each key gets the right result type
export type FocusButtonStylesHook = {
  [K in keyof typeof FocusButtonStyleDefs]: (typeof FocusButtonStyleDefs)[K] extends {
    base: any
  }
    ? InteractiveStyleResult
    : StaticStyleResult
}

// Type guard to narrow a StyleDef to InteractiveStyleDef without using any casts
function isInteractiveStyleDef(def: unknown): def is InteractiveStyleDef {
  return (
    typeof def === "object" &&
    def !== null &&
    Object.prototype.hasOwnProperty.call(def, "base")
  )
}

// Create interactive style hooks (safe - calls hooks deterministically)
export const useFocusButtonStyles = (): FocusButtonStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof FocusButtonStyleDefs, any>> =
    {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(FocusButtonStyleDefs) as Array<
    keyof typeof FocusButtonStyleDefs
  >

  for (const className of keys) {
    const styleDef = FocusButtonStyleDefs[className]

    if (isInteractiveStyleDef(styleDef)) {
      // styleDef is narrowed to InteractiveStyleDef here (no any cast needed)
      const {
        base = {},
        hover = {},
        active = {},
        focus = {},
        disabled = {},
      } = styleDef

      // Call useInteractiveStyles for interactive styles
      styleResults[className] = useInteractiveStyles({
        baseStyle: base,
        hoverStyle: hover,
        activeStyle: active,
        focusStyle: focus,
        disabledStyle: disabled,
      })
    } else {
      // Static styles - no hook needed
      // styleDef is narrowed to StaticStyleDef here
      styleResults[className] = {
        style: styleDef as StaticStyleDef,
        handlers: {},
        state: { isHovered: false, isPressed: false, isFocused: false },
      }
    }
  }

  return styleResults as FocusButtonStylesHook
}
