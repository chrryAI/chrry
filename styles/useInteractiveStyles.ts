/**
 * Interactive styles hook - handles hover, active, focus states
 * Works on both web and native!
 */

import { useState, CSSProperties } from "react"
import { useTheme } from "./theme"

type StyleObject = CSSProperties | Record<string, any>

interface InteractiveStylesOptions {
  baseStyle?: StyleObject
  hoverStyle?: StyleObject
  activeStyle?: StyleObject
  focusStyle?: StyleObject
  disabledStyle?: StyleObject
  disabled?: boolean
}

interface InteractiveStylesReturn {
  style: StyleObject
  handlers: {
    onMouseEnter: () => void
    onMouseLeave: () => void
    onMouseDown: () => void
    onMouseUp: () => void
    onFocus: () => void
    onBlur: () => void
    onPressIn: () => void
    onPressOut: () => void
  }
  state: {
    isHovered: boolean
    isPressed: boolean
    isFocused: boolean
  }
}

export function useInteractiveStyles(
  options: InteractiveStylesOptions = {},
): InteractiveStylesReturn {
  const {
    baseStyle = {},
    hoverStyle = {},
    activeStyle = {},
    focusStyle = {},
    disabledStyle = {},
    disabled = false,
  } = options

  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  // Compute final style based on state
  const computedStyle = {
    ...baseStyle,
    ...(isHovered && !disabled ? hoverStyle : {}),
    ...(isPressed && !disabled ? activeStyle : {}),
    ...(isFocused && !disabled ? focusStyle : {}),
    ...(disabled ? disabledStyle : {}),
  }

  // Event handlers
  const handlers = {
    onMouseEnter: () => !disabled && setIsHovered(true),
    onMouseLeave: () => {
      setIsHovered(false)
      setIsPressed(false)
    },
    onMouseDown: () => !disabled && setIsPressed(true),
    onMouseUp: () => setIsPressed(false),
    onFocus: () => !disabled && setIsFocused(true),
    onBlur: () => setIsFocused(false),
    // React Native equivalents
    onPressIn: () => !disabled && setIsPressed(true),
    onPressOut: () => setIsPressed(false),
  }

  return {
    style: computedStyle,
    handlers,
    state: { isHovered, isPressed, isFocused },
  }
}

// Preset interactive styles
export function useLinkInteractive(
  baseStyle: StyleObject = {},
): InteractiveStylesReturn {
  const theme = useTheme()

  return useInteractiveStyles({
    baseStyle: {
      ...baseStyle,
      color: theme.linkColor,
      cursor: "pointer",
    },
    hoverStyle: {
      color: theme.accent5,
    },
    activeStyle: {
      transform: "translateY(1px)",
    },
    disabledStyle: {
      opacity: 0.5,
      cursor: "default",
    },
  })
}

export function useButtonInteractive(
  baseStyle: StyleObject = {},
): InteractiveStylesReturn {
  const theme = useTheme()

  return useInteractiveStyles({
    baseStyle: {
      ...baseStyle,
      backgroundColor: theme.linkColor,
      color: "#fff",
    },
    hoverStyle: {
      backgroundColor: theme.accent5,
    },
    activeStyle: {
      transform: "translateY(1px)",
    },
    disabledStyle: {
      backgroundColor: theme.background,
      color: theme.foreground,
      opacity: 0.7,
      cursor: "default",
    },
  })
}
