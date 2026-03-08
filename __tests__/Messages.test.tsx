import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import Messages from "../Messages"
import {
  mockApp,
  mockAppContext,
  mockAuth,
  mockChat,
  mockData,
  mockNavigation,
  mockPlatform,
  mockStyles,
  mockTheme,
} from "./mocks/mockContexts"

// Mock dependencies
vi.mock("../context/AppContext", () => ({
  useAppContext: () => mockAppContext,
}))

// We need a more dynamic mock for useAuth to reflect changes in mockAuth object during tests
vi.mock("../context/providers", () => ({
  useAuth: () => ({
    ...mockAuth,
    // Add logic that might be in the real hook
    threadId: mockAuth.threadId || mockAuth.threadIdRef?.current,
  }),
  useChat: () => mockChat,
  useApp: () => mockApp,
  useNavigationContext: () => mockNavigation,
  useData: () => mockData,
  useError: () => ({ captureException: vi.fn() }),
}))

vi.mock("../platform", async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    usePlatform: () => mockPlatform,
    useTheme: () => mockTheme,
    Div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    Video: ({ ...props }: any) => <video {...props} />,
  }
})

vi.mock("../context/StylesContext", () => ({
  useStyles: () => mockStyles,
  useMessagesStyles: () => ({
    messagesContainer: { style: {} },
    loadMoreContainer: { style: {} },
    emptyContainer: { style: {} },
    messages: { style: {} },
    enableCharacterProfilesContainer: { style: {} },
    characterProfileContainer: { style: {} },
    video: { style: {} },
    tags: { style: {} },
  }),
}))

// Mock Message component to inspect props
const MockMessage = vi.fn(({ isTyping, isOnline, message }: any) => (
  <div
    data-testid={`message-${message.message.id}`}
    data-typing={isTyping ? "true" : "false"}
    data-online={isOnline ? "true" : "false"}
  >
    {message.message.content}
  </div>
))

vi.mock("../Message", () => ({
  default: (props: any) => <MockMessage {...props} />,
}))

vi.mock("../Image", () => ({
  default: () => <div data-testid="image" />,
}))

vi.mock("../CharacterProfile", () => ({
  default: ({ characterProfile }: any) => (
    <div data-testid="character-profile">
      {characterProfile?.tags?.join(", ")}
    </div>
  ),
}))

// We need to mock useWebSocket properly to test the callback
let socketCallback: any
vi.mock("../hooks/useWebSocket", () => ({
  useWebSocket: ({ onMessage }: any) => {
    socketCallback = onMessage
    return {}
  },
}))

vi.mock("../hooks/useUserScroll", () => ({
  useUserScroll: () => ({
    isUserScrolling: false,
    hasStoppedScrolling: true,
    resetScrollState: vi.fn(),
  }),
}))

// Mock useThreadPresence
const mockTypingUsers = [
  { userId: "user-2", isTyping: true },
  { guestId: "guest-1", isTyping: true },
]
const mockOnlineUsers = [{ userId: "user-3", isOnline: true }]

vi.mock("../hooks/useThreadPresence", () => ({
  useThreadPresence: () => ({
    typingUsers: mockTypingUsers,
    onlineUsers: mockOnlineUsers,
  }),
}))

describe("Messages", () => {
  const mockMessages = [
    {
      message: {
        id: "msg-1",
        content: "Message from typing user",
        createdOn: new Date().toISOString(),
        threadId: "thread-1",
        role: "user",
      },
      user: { id: "user-2" }, // Matches typing user
    },
    {
      message: {
        id: "msg-2",
        content: "Message from online user",
        createdOn: new Date().toISOString(),
        threadId: "thread-1",
        role: "user",
      },
      user: { id: "user-3" }, // Matches online user
    },
    {
      message: {
        id: "msg-3",
        content: "Message from offline user",
        createdOn: new Date().toISOString(),
        threadId: "thread-1",
        role: "user",
      },
      user: { id: "user-4" }, // Matches no one
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    mockAuth.characterProfilesEnabled = true // Default to true
    mockAuth.threadId = undefined
    mockAuth.threadIdRef = { current: undefined }
  })

  it("renders messages and passes correct presence props", () => {
    render(<Messages messages={mockMessages as any} />)

    // Check typing user message
    const msg1 = screen.getByTestId("message-msg-1")
    expect(msg1.getAttribute("data-typing")).toBe("true")

    // Check online user message
    const msg2 = screen.getByTestId("message-msg-2")
    expect(msg2.getAttribute("data-online")).toBe("true")

    // Check offline user message
    const msg3 = screen.getByTestId("message-msg-3")
    expect(msg3.getAttribute("data-typing")).toBe("false")
    expect(msg3.getAttribute("data-online")).toBe("false")
  })

  it("renders empty state when no messages", () => {
    render(
      <Messages
        messages={[]}
        showEmptyState={true}
        emptyMessage="Nothing here"
      />,
    )
    expect(screen.getByText("Nothing here")).toBeDefined()
  })

  it("renders load more button when nextPage exists", () => {
    const setIsLoadingMore = vi.fn()
    const setUntil = vi.fn()
    render(
      <Messages
        messages={mockMessages as any}
        nextPage={2}
        setIsLoadingMore={setIsLoadingMore}
        setUntil={setUntil}
        until={1}
      />,
    )

    const button = screen.getByText("Load Older")
    fireEvent.click(button)
    expect(setIsLoadingMore).toHaveBeenCalledWith(true)
    expect(setUntil).toHaveBeenCalledWith(2)
  })

  it("handles character profile updates via websocket", async () => {
    const onUpdate = vi.fn()
    mockAuth.threadIdRef = { current: "thread-1" }
    // Ensure character profiles are enabled
    mockAuth.characterProfilesEnabled = true

    // Pass showEmptyState=true to ensure component renders even with empty messages
    render(
      <Messages
        messages={[]}
        showEmptyState={true}
        onCharacterProfileUpdate={onUpdate}
        thread={{ id: "thread-1" } as any}
      />,
    )

    // Simulate generating event
    await act(async () => {
      if (socketCallback) {
        await socketCallback({
          type: "character_tag_creating",
          data: { threadId: "thread-1" },
        })
      }
    })

    expect(onUpdate).toHaveBeenCalled()
    expect(screen.getByText("Generating character tags...")).toBeDefined()

    // Simulate created event
    await act(async () => {
      if (socketCallback) {
        await socketCallback({
          type: "character_tag_created",
          data: {
            threadId: "thread-1",
            tags: ["Hero", "Brave"],
            visibility: "public",
          },
        })
      }
    })

    // Elements appear multiple times, so use getAllByText
    const tags = screen.getAllByText("Hero, Brave")
    expect(tags.length).toBeGreaterThan(0)
  })

  it("renders 'Create Your Agent' button for app owner", () => {
    // Setup conditions for Create Your Agent
    mockAuth.characterProfilesEnabled = false
    mockAuth.app = { id: "chrry" }
    mockAuth.chrry = { id: "chrry" }
    mockAuth.accountApp = null
    mockApp.appStatus = null
    mockApp.suggestSaveApp = false // Ensure this doesn't trigger the "Back to Agent Builder" view

    const messages = [
      {
        message: {
          id: "1",
          content: "hi",
          agentId: "agent-1",
          createdOn: new Date().toISOString(),
        },
      },
    ]

    render(<Messages messages={messages as any} />)

    const button = screen.getByText("Create Your Agent")
    expect(button).toBeDefined()

    fireEvent.click(button)
    expect(mockApp.setAppStatus).toHaveBeenCalledWith({
      part: "highlights",
      step: "add",
    })
  })
})
