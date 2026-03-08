/**
 * Generated from Chat.module.scss
 * Auto-converted SCSS to Unified Styles
 *
 * Works on both web and native! 🎉
 */

export const ChatStyleDefs = {
  chatContainerWrapper: {
    position: "fixed",
    zIndex: 1000,
    bottom: 3,
    padding: "0 10px",
    maxWidth: 620,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    flex: 1,
    gap: 12,
    left: "50%",
    transform: "translateX(-50%)",
  },
  standalone: {
    bottom: 10,
  },
  drawerOpen: {
    left: "calc(50% + 7.65625rem)",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  chat: {
    position: "relative",
    flex: 1,
    border: "1px solid var(--accent-1)",
    boxShadow: "0px 0px 5px var(--accent-1)",
    borderRadius: "var(--radius)",
    padding: 5,
    paddingBottom: 35,
    marginBottom: 3,
    backgroundColor: "var(--shade-1-transparent)",
    paddingRight: 19,
  },
  chatFloating: {
    backgroundColor: "var(--shade-2-transparent)",
    border: "1px dashed var(--shade-3)",
    boxShadow: "none",
    bottom: 3,
  },
  floatingVideoContainer: {
    width: 29,
    height: 29,
  },
  floatingVideo: {
    width: 25,
    height: 25,
  },
  floatingSendButton: {
    width: 26,
    height: 26,
  },
  hourlyLimit: {
    fontSize: 12,
    color: "var(--shade-6)",
    display: "flex",
    alignItems: "center",
    gap: 5,
    position: "relative",
  },
  speechConversation: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  conversation: {
    display: "flex",
    flexDirection: "column",
    gap: 15,
  },
  speechUsageStats: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  statItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 12,
  },
  statLabel: {
    color: "var(--shade-6)",
    fontWeight: 500,
  },
  statValue: {
    color: "var(--shade-8)",
    fontFamily: "var(--font-mono)",
  },
  speechActions: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },
  top: {
    marginBottom: 10,
  },
  topChatFloating: {
    zIndex: 1001,
    padding: "0 5px",
    gap: 5,
    position: "relative",
    marginBottom: 3,
    display: "flex",
    alignItems: "center",
  },
  topChatFloatingTopInner: {
    backgroundColor: "var(--shade-1)",
    border: "1px solid var(--shade-2)",
    padding: "3px 5px",
    borderRadius: "var(--radius)",
  },
  collaborationStep3: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  collaborationStep3Div: {
    backgroundColor: "var(--shade-2-transparent)",
    border: "1px solid var(--shade-2)",
    padding: 5,
    borderRadius: "var(--radius)",
  },
  debateAgentButton: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  debateAgentButtonDisabled: {
    backgroundColor: "var(--shade-1-transparent)",
  },
  plusIcon: {
    position: "absolute",
    bottom: -5,
    right: -5,
  },
  scrollDownButton: {
    base: {
      marginLeft: "auto",
    },
    hover: {
      transform: "scale(1.15)",
    },
  },
  chatContainer: {
    display: "flex",
    flexDirection: "column",
    flex: 1,
  },
  chatContainerFloating: {
    bottom: 5,
    zIndex: 1000,
  },
  brandHelp: {
    textAlign: "center",
    fontSize: 17,
    lineHeight: 1.2,
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginTop: 0,
    marginBottom: 13,
    fontWeight: "normal",
  },
  collaborationTooltip: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    position: "relative",
    bottom: 5,
  },
  shareTooltip: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
    position: "relative",
    bottom: 5,
  },
  tooltip: {
    backgroundColor: "var(--shade-2-transparent)",
    border: "1px solid var(--shade-2)",
    zIndex: 9999,
    borderRadius: "var(--radius)",
    padding: 10,
    position: "relative",
    marginBottom: 10,
  },
  generateImagesButtonContainer: {
    display: "none",
  },
  collaborateButton: {
    position: "relative",
  },
  collaborateButtonSparkles: {
    position: "absolute",
    top: 17,
    left: 22,
  },
  content: {
    textAlign: "center",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  creditInfoText: {
    display: "flex",
    alignItems: "center",
    gap: 3,
  },
  creditCost: {
    gap: 5,
    fontSize: 12,
    display: "none",
  },
  instructionsBottom: {
    display: "flex",
    fontSize: 13,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  subscribeButton: {
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  loginButton: {
    fontSize: 13,
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  attachButtons: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  filePreviewArea: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
    padding: 12,
    backgroundColor: "var(--shade-1)",
    borderBottom: "1px solid var(--shade-2)",
    margin: "-3px -10px 0 -10px",
    position: "relative",
    left: 7,
    borderRadius: 16,
  },
  filePreview: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    backgroundColor: "var(--shade-0)",
    border: "1px solid var(--shade-2)",
    borderRadius: 12,
    fontSize: 14,
    color: "var(--accent-6)",
  },
  filePreviewImage: {
    width: 32,
    height: 32,
    borderRadius: 4,
    objectFit: "cover",
    backgroundColor: "var(--shade-2)",
  },
  filePreviewIcon: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "var(--shade-2)",
    borderRadius: 4,
    color: "var(--accent-5)",
  },
  filePreviewInfo: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  filePreviewName: {
    fontWeight: 500,
    fontSize: 13,
    maxWidth: 80,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  filePreviewSize: {
    fontSize: 11,
    color: "var(--accent-4)",
  },
  filePreviewClear: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: "50%",
    color: "var(--accent-0)",
    border: "2px solid var(--shade-0)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
  },
  attachButtonSelected: {
    color: "var(--accent-4)",
    backgroundColor: "var(--shade-1)",
  },
  attachButtonDisabled: {
    color: "var(--shade-2)",
  },
  voiceButtonListening: {},
  quotaDisplay: {
    borderTop: "1px solid var(--shade-2)",
    padding: "5px 0",
    fontSize: 13,
    position: "relative",
    left: 6,
  },
  quotaHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontWeight: 500,
    marginBottom: 8,
    color: "var(--accent-6)",
  },
  quotaItems: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  quotaItem: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "var(--shade-6)",
  },
  quotaReset: {
    marginLeft: "auto",
    fontSize: 12,
    color: "var(--shade-5)",
  },
  capabilitiesLabel: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 3,
  },
  creditInfo: {
    fontSize: 13,
    color: "var(--shade-7)",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "5px 10px",
    gap: 5,
    textAlign: "center",
  },
  standaloneIos: {
    marginBottom: 8,
  },
  creditInfoStandalone: {},
  chatFooter: {
    position: "absolute",
    bottom: 3,
    padding: "5px 10px",
    left: 0,
    right: 0,
    display: "flex",
    alignItems: "flex-end",
  },
  sendButton: {
    display: "flex",
  },
  attachButton: {
    display: "flex",
  },
  voiceButton: {
    display: "flex",
  },
  chatFooterButtons: {
    display: "flex",
    alignItems: "flex-end",
    gap: 13,
    marginLeft: "auto",
    fontSize: 12,
  },
  chatTextArea: {
    width: "100%",
    display: "flex",
    minHeight: 58,
    paddingTop: 0,
    overflowY: "hidden",
    paddingRight: 0,
    position: "relative",
    bottom: 3,
    transform: "translateY(10px)",
    border: "none",
    outline: "none",
    backgroundColor: "transparent",
  },
  agentButtonModal: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  agentButtonModalActive: {
    backgroundColor: "var(--accent-6)",
  },
  agentButtonModalInactive: {
    backgroundColor: "var(--shade-3)",
    color: "var(--shade-1)",
  },
  favorite: {
    backgroundColor: "var(--accent-1)",
  },
  current: {
    backgroundColor: "var(--accent-4)",
  },
  agentButtonContainer: {
    display: "flex",
    alignItems: "center",
    gap: 15,
  },
  speechModalTitle: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  speechModalTitleButton: {
    marginLeft: "auto",
  },
  title: {
    fontDisplay: "swap",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontSize: "clamp(1.2rem, 4vw, 1.625rem)",
    margin: "0 0 15px 0",
    gap: 5,
  },
  modalTitle: {
    margin: 0,
  },
  modalContent: {
    display: "flex",
    flexDirection: "column",
    gap: 13,
  },
  buttonContainer: {
    display: "flex",
    alignItems: "center",
    gap: 15,
    flex: 1,
    width: "100%",
  },
  stateLabel: {
    fontSize: 14,
    color: "var(--shade-7)",
    marginLeft: "auto",
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  stateLabelContainer: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    marginLeft: "auto",
  },
  suggestionsContainer: {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    alignItems: "center",
    gap: 13,
  },
  enableTasksButton: {
    display: "flex",
    alignItems: "center",
    gap: 5,
  },
  suggestions: {
    display: "flex",
    flexDirection: "column",
    gap: 9,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  suggestion: {
    display: "flex",
    alignItems: "center",
    gap: 5,
    color: "var(--shade-6)",
    fontSize: 14,
    textAlign: "center",
  },
  suggestionSelected: {
    color: "var(--accent-6)",
  },
  suggestionsList: {
    opacity: 0,
  },
  suggestionItem: {
    opacity: 0,
  },
  imageGenerationButton: {
    position: "absolute",
    right: 8,
    top: 8,
  },
  agentModalDescription: {
    fontSize: 14,
    color: "var(--shade-7)",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 10,
  },
  agentButton: {
    base: {
      display: "flex",
      alignItems: "center",
      gap: 3,
    },
    disabled: {
      backgroundColor: "var(--shade-1-transparent)",
    },
  },
  agentName: {
    maxWidth: 75,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  agentModal: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    alignItems: "flex-start",
    maxWidth: 599,
  },
  video: {
    width: 30,
    height: 30,
    objectFit: "cover",
    borderRadius: "50%",
  },
  videoContainer: {
    position: "relative",
    backgroundColor: "#000",
    width: 34,
    height: 34,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "var(--shadow)",
    right: -2,
    border: "1px solid transparent",
  },
} as const

import { createStyleHook } from "./styles/createStyleHook"
import { createUnifiedStyles } from "./styles/createUnifiedStyles"

export const ChatStyles = createUnifiedStyles(ChatStyleDefs)

// Type for the hook return value
type ChatStylesHook = {
  [K in keyof typeof ChatStyleDefs]: {
    className?: string
    style?: Record<string, any>
  }
}

// Create the style hook using the factory
export const useChatStyles = createStyleHook<ChatStylesHook>(ChatStyles)
