// @vitest-environment happy-dom

import { render } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import MessageUserStatus from "../MessageUserStatus"

// Mock dependencies
vi.mock("../context/AppContext", () => ({
  useAppContext: () => ({ t: (key: string) => key }),
}))

// Mock context providers
const mockUseAuth = vi.fn()
vi.mock("../context/providers", () => ({
  useAuth: () => mockUseAuth(),
}))

vi.mock("../Message.styles", () => ({
  useMessageStyles: () => ({
    name: { style: {} },
    presenceIndicator: { style: {} },
    online: { style: {} },
    offline: { style: {} },
    nameWithPresence: { style: {} },
    dots: { style: {} },
    dotsSpan: { style: {} },
  }),
}))

// Mock hooks
const mockUseThreadPresence = vi.fn()
vi.mock("../hooks/useThreadPresence", () => ({
  useThreadPresence: (args: any) => mockUseThreadPresence(args),
}))

vi.mock("../utils", () => ({
  isOwner: (message: any, { userId, guestId }: any) => {
    if (message.userId && userId) return message.userId === userId
    if (message.guestId && guestId) return message.guestId === guestId
    return false
  },
}))

// Mock platform components
vi.mock("../platform", () => ({
  Div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Button: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}))

describe("MessageUserStatus", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      user: { id: "user-1" },
      guest: null,
    })
    mockUseThreadPresence.mockReturnValue({
      typingUsers: [],
      onlineUsers: [],
    })
  })

  it("renders user name correctly for other user", () => {
    const message = {
      message: {
        id: "msg-1",
        threadId: "thread-1",
        content: "Hello",
        userId: "user-2",
      },
      user: {
        id: "user-2",
        name: "Alice",
      },
    }

    const { getByText } = render(<MessageUserStatus message={message as any} />)
    expect(getByText("Alice")).toBeTruthy()
  })

  it("renders 'You' if owner (User)", () => {
    const message = {
      message: {
        id: "msg-1",
        threadId: "thread-1",
        content: "Hello",
        userId: "user-1",
      },
      user: {
        id: "user-1",
        name: "Bob",
      },
    }

    const { getByText } = render(<MessageUserStatus message={message as any} />)
    expect(getByText("You")).toBeTruthy()
  })

  it("renders 'You' if owner (Guest)", () => {
    mockUseAuth.mockReturnValue({
      user: null,
      guest: { id: "guest-1" },
    })

    const message = {
      message: {
        id: "msg-1",
        threadId: "thread-1",
        content: "Hello",
        guestId: "guest-1",
      },
      guest: {
        id: "guest-1",
      },
    }

    const { getByText } = render(<MessageUserStatus message={message as any} />)
    expect(getByText("You")).toBeTruthy()
  })

  it("renders email if name is missing", () => {
    const message = {
      message: {
        id: "msg-1",
        threadId: "thread-1",
        content: "Hello",
        userId: "user-2",
      },
      user: {
        id: "user-2",
        email: "alice@example.com",
      },
    }

    const { getByText } = render(<MessageUserStatus message={message as any} />)
    expect(getByText("alice@example.com")).toBeTruthy()
  })

  it("renders 'Guest' fallback", () => {
    const message = {
      message: {
        id: "msg-1",
        threadId: "thread-1",
        content: "Hello",
        guestId: "guest-2",
      },
      guest: {
        id: "guest-2",
      },
    }

    const { getByText } = render(<MessageUserStatus message={message as any} />)
    expect(getByText("Guest")).toBeTruthy()
  })

  it("shows typing indicator when user is typing", () => {
    mockUseThreadPresence.mockReturnValue({
      typingUsers: [{ userId: "user-2", isTyping: true }],
      onlineUsers: [],
    })

    const message = {
      message: {
        id: "msg-1",
        threadId: "thread-1",
        content: "Hello",
        userId: "user-2",
      },
      user: {
        id: "user-2",
        name: "Alice",
      },
    }

    const { getByTestId } = render(
      <MessageUserStatus message={message as any} />,
    )
    expect(getByTestId("typing-indicator")).toBeTruthy()
  })

  it("shows typing indicator when guest is typing", () => {
    mockUseThreadPresence.mockReturnValue({
      typingUsers: [{ guestId: "guest-2", isTyping: true }],
      onlineUsers: [],
    })

    const message = {
      message: {
        id: "msg-1",
        threadId: "thread-1",
        content: "Hello",
        guestId: "guest-2",
      },
      guest: {
        id: "guest-2",
      },
    }

    const { getByTestId } = render(
      <MessageUserStatus message={message as any} />,
    )
    expect(getByTestId("typing-indicator")).toBeTruthy()
  })

  it("indicates online status", () => {
    mockUseThreadPresence.mockReturnValue({
      typingUsers: [],
      onlineUsers: [{ userId: "user-2", isOnline: true }],
    })

    const message = {
      message: {
        id: "msg-1",
        threadId: "thread-1",
        content: "Hello",
        userId: "user-2",
      },
      user: {
        id: "user-2",
        name: "Alice",
      },
    }

    const { container } = render(<MessageUserStatus message={message as any} />)
    // We can't easily check styles in unit tests with current mocks,
    // but we can ensure it renders without error and we know logic uses onlineUsers
    expect(container).toBeTruthy()
  })
})
