import { useTheme } from "./context/ThemeContext"
import { ArrowLeft, ArrowRight, Circle } from "./icons"
import { Button, Div, isTauri } from "./platform"
import { colors } from "./styles/theme"

const Controls = () => {
  const { addHapticFeedback } = useTheme()

  // Only render in Tauri
  if (!isTauri()) return null

  // Window controls using Tauri API
  const handleClose = async () => {
    addHapticFeedback()
    try {
      const tauri =
        (window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__

      if (tauri?.window) {
        await tauri.window.getCurrent().close()
      } else if (tauri?.invoke) {
        await tauri.invoke("plugin:window|close")
      }
    } catch (error) {
      console.error("Failed to close window:", error)
    }
  }

  const handleMinimize = async () => {
    addHapticFeedback()
    try {
      const tauri =
        (window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__

      if (tauri?.window) {
        await tauri.window.getCurrent().minimize()
      } else if (tauri?.invoke) {
        await tauri.invoke("plugin:window|minimize")
      }
    } catch (error) {
      console.error("Failed to minimize window:", error)
    }
  }

  const handleMaximize = async () => {
    addHapticFeedback()
    try {
      const tauri =
        (window as any).__TAURI__ || (window as any).__TAURI_INTERNALS__

      if (tauri?.window) {
        const appWindow = tauri.window.getCurrent()
        const isMaximized = await appWindow.isMaximized()
        if (isMaximized) {
          await appWindow.unmaximize()
        } else {
          await appWindow.maximize()
        }
      } else if (tauri?.invoke) {
        await tauri.invoke("plugin:window|toggle_maximize")
      }
    } catch (error) {
      console.error("Failed to toggle maximize:", error)
    }
  }

  // Browser navigation
  const handleBack = () => {
    addHapticFeedback()
    if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back()
    }
  }

  const handleForward = () => {
    addHapticFeedback()
    if (typeof window !== "undefined") {
      window.history.forward()
    }
  }

  return (
    <Div
      style={{
        display: "flex",
        marginBottom: ".75rem",
        gap: "0.25rem",
      }}
    >
      {/* Traffic Lights */}
      <Button
        onClick={handleClose}
        title="Close"
        style={{
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow)",
          zIndex: 10000,
          position: "relative",
          color: colors.red[500],
        }}
        className={"link ghost"}
      >
        <Circle size={12.5} fill={colors.red[500]} color={colors.red[500]} />
      </Button>
      <Button
        onClick={handleMinimize}
        title="Minimize"
        style={{
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow)",
          zIndex: 10000,
          position: "relative",
          color: colors.orange[500],
        }}
        className={"link ghost"}
      >
        <Circle
          size={12.5}
          fill={colors.orange[500]}
          color={colors.orange[500]}
        />
      </Button>
      <Button
        onClick={handleMaximize}
        title="Maximize"
        style={{
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "var(--shadow)",
          zIndex: 10000,
          position: "relative",
          color: colors.green[500],
        }}
        className={"link ghost"}
      >
        <Circle
          size={12.5}
          fill={colors.green[500]}
          color={colors.green[500]}
        />
      </Button>

      {/* Navigation Arrows */}
      <Div
        style={{
          marginLeft: "auto",
          gap: "0.25rem",
          display: "flex",
          position: "relative",
          marginRight: -10,
        }}
      >
        <Button
          onClick={handleBack}
          title="Back"
          style={{
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow)",
            zIndex: 10000,
            color: colors.blue[500],
          }}
          className={"link ghost"}
        >
          <ArrowLeft size={17.5} color={colors.blue[500]} />
        </Button>
        <Button
          onClick={handleForward}
          title="Forward"
          style={{
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "var(--shadow)",
            zIndex: 10000,
            position: "relative",
            color: colors.gray[500],
          }}
          className={"link ghost"}
        >
          <ArrowRight size={17.5} color={colors.gray[500]} />
        </Button>
      </Div>
    </Div>
  )
}

export default Controls
