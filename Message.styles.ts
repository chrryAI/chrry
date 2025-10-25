/**
 * Generated from Message.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const MessageStyleDefs = {
  owner: {
    alignSelf: "flex-end",
  },
  video: {
    width: 35,
    height: 35,
    borderRadius: "50%",
    backgroundColor: "black",
  },
  userMessage: {
    backgroundColor: "var(--shade-1)",
    border: "1px solid var(--shade-2)",
    borderRadius: "var(--radius)",
    padding: 10,
    position: "relative",
    width: "100%",
    boxShadow: 5,
  },
  userMessageOwner: {
    alignSelf: "flex-end",
  },
  updateModalDescription: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    fontSize: 14,
  },
  updateModalDescriptionItem: {
    display: "flex",
    gap: 5,
    paddingBottom: 0,
  },
  appIcon: {
    display: "flex",
    alignItems: "center",
    flexDirection: "column",
    fontSize: 12,
    gap: 5,
    fontWeight: 500,
  },
  updateModalDescriptionButton: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  thinking: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    fontSize: 13,
    color: "var(--shade-7)",
  },
  sparklesButton: {
    color: "var(--accent-1)",
  },
  agentMessage: {
    display: "flex",
    flexDirection: "column",
    padding: 10,
    width: "auto",
    fontSize: 15,
    minWidth: 200,
  },
  userMessageFiles: {
    margin: "8px 0 5px 0",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  playButton: {
    fontSize: 12,
  },
  userMessageImages: {
    margin: "10px 0 5px 0",
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    borderRadius: 20,
    maxWidth: "100%",
    width: 250,
  },
  userMessageVideo: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    margin: "10px 0 5px 0",
    maxWidth: "100%",
    width: 250,
    borderRadius: 20,
  },
  userMessageAudio: {
    margin: "10px 0 5px 0",
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  userMessageTime: {
    display: "none",
  },
  userImage: {
    borderRadius: "50%",
  },
  name: {
    fontSize: 13,
    color: "var(--shade-5)",
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  agentMessageImages: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  imageContainer: {
    borderRadius: 13,
    width: "100%",
    height: "100%",
    minWidth: 300,
    minHeight: 300,
    backgroundColor: "var(--shade-2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  downloadButton: {
    base: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      border: "none",
      borderRadius: 6,
      color: "white",
      padding: 6,
      opacity: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    hover: {
      backgroundColor: "rgba(0, 0, 0, 0.9)",
    },
  },
  agentMessageContent: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  message: {
    display: "flex",
    flexDirection: "column",
  },
  userMessageContainer: {
    display: "flex",
    gap: 8,
    alignItems: "flex-start",
    flexDirection: "column",
  },
  agentMessageTime: {
    alignSelf: "center",
  },
  agentMessageTimeUserMessageTime: {
    alignSelf: "center",
  },
  footer: {
    display: "flex",
    gap: 15,
    alignItems: "center",
    marginTop: 15,
    fontSize: 12,
  },
  left: {
    display: "flex",
    gap: 9,
    alignItems: "center",
  },
  agentWebStreaming: {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  likeButtons: {
    display: "flex",
    gap: 10,
    marginLeft: "auto",
  },
  agent: {
    display: "flex",
    alignItems: "center",
  },
  agentIcon: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--accent-1)",
  },
  agentIconAgentIcon: {
    color: "var(--accent-6)",
  },
  agentIconTablet: {
    display: "none",
    alignSelf: "flex-start",
  },
  agentIconMobile: {
    display: "flex",
  },
  webSearchResults: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    marginTop: 10,
    flexWrap: "wrap",
  },
  webSearchResultTitle: {
    fontSize: 13,
    display: "flex",
    flexDirection: "row",
    gap: 5,
  },
  webSearchResultSnippet: {
    fontSize: 12,
    color: "var(--shade-6)",
  },
  typingIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "4px 8px",
    margin: "4px 0",
    backgroundColor: "var(--shade-1)",
    borderRadius: 8,
    fontSize: 12,
    color: "var(--shade-5)",
    border: "1px solid var(--shade-2)",
  },
  typingText: {
    opacity: 0.8,
  },
  dots: {
    display: "inline-flex",
    gap: 2,
    alignItems: "center",
  },
  nameWithPresence: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  presenceIndicator: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    flexShrink: 0,
  },
  online: {
    backgroundColor: "var(--accent-4)",
  },
  offline: {
    backgroundColor: "var(--shade-3)",
  },
} as const

import { createUnifiedStyles } from "chrry/styles/createUnifiedStyles"
import { useInteractiveStyles } from "chrry/styles/useInteractiveStyles"

export const MessageStyles = createUnifiedStyles(MessageStyleDefs)

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
export type MessageStylesHook = {
  [K in keyof typeof MessageStyleDefs]: (typeof MessageStyleDefs)[K] extends {
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
export const useMessageStyles = (): MessageStylesHook => {
  // Call all hooks upfront in a stable order (Rules of Hooks compliant)
  const styleResults: Partial<Record<keyof typeof MessageStyleDefs, any>> = {}

  // Use Object.keys to ensure consistent iteration order across environments
  const keys = Object.keys(MessageStyleDefs) as Array<
    keyof typeof MessageStyleDefs
  >

  for (const className of keys) {
    const styleDef = MessageStyleDefs[className]

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

  return styleResults as MessageStylesHook
}
