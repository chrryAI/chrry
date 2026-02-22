// @vitest-environment happy-dom

import { act, fireEvent } from "@testing-library/react"
import React from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Make React globally available
global.React = React

import Thread from "../Thread"
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

// Mock the dependencies
vi.mock("../context/AppContext", () => ({
  useAppContext: () => mockAppContext,
  COLORS: {},
}))

vi.mock("../context/providers", () => ({
  useAuth: () => mockAuth,
  useChat: () => mockChat,
  useApp: () => mockApp,
  useNavigationContext: () => mockNavigation,
  useData: () => mockData,
  useError: () => ({ captureException: vi.fn() }),
}))

// Mock platform module
vi.mock("../platform", async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    usePlatform: () => mockPlatform,
    useTheme: () => mockTheme,
    // Mock primitive components to avoid context dependency
    Div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Button: ({ children, ...props }: any) => (
      <button type="button" {...props}>
        {children}
      </button>
    ),
    Span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    A: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    Input: ({ ...props }: any) => <input {...props} />,
  }
})

vi.mock("../context/StylesContext", () => ({
  useStyles: () => mockStyles,
}))

// Mock hooks
vi.mock("../hooks", () => ({
  useHasHydrated: () => true,
  useLocalStorage: () => [true, vi.fn()],
  useSyncedState: () => [false, vi.fn()],
  useCountdown: () => null,
  useThreadMetadata: () => {},
}))
vi.mock("../hooks/useUserScroll", () => ({
  useUserScroll: () => ({
    isUserScrolling: false,
    hasStoppedScrolling: true,
    resetScrollState: vi.fn(),
  }),
}))
vi.mock("../hooks/useThreadPresence", () => ({
  useThreadPresence: () => ({ notifyTyping: vi.fn() }),
}))

// Mock other components
vi.mock("../Messages", () => ({
  default: ({
    onDelete,
    onToggleLike,
    onPlayAudio,
    onCharacterProfileUpdate,
  }: any) => (
    <div data-testid="messages-list">
      <button
        type="button"
        data-testid="trigger-delete"
        onClick={() => onDelete({ id: "msg-1" })}
      />
      <button
        type="button"
        data-testid="trigger-like"
        onClick={() => onToggleLike(true)}
      />
      <button type="button" data-testid="trigger-audio" onClick={onPlayAudio} />
      <button
        type="button"
        data-testid="trigger-cp-update"
        onClick={onCharacterProfileUpdate}
      />
    </div>
  ),
}))
vi.mock("../Chat", () => ({ default: () => <div data-testid="chat-input" /> }))
vi.mock("../Loading", () => ({ default: () => <div data-testid="loading" /> }))
vi.mock("../DeleteThread", () => ({
  default: () => <div data-testid="delete-thread" />,
}))
vi.mock("../EditThread", () => ({
  default: () => <div data-testid="edit-thread" />,
}))
vi.mock("../Share", () => ({
  default: () => <div data-testid="share-thread" />,
}))
vi.mock("../Instructions", () => ({
  default: () => <div data-testid="instructions" />,
}))
vi.mock("../Bookmark", () => ({
  default: () => <div data-testid="bookmark" />,
}))
vi.mock("../CollaborationStatus", () => ({
  default: () => <div data-testid="collaboration-status" />,
}))
vi.mock("../EnableSound", () => ({
  default: () => <div data-testid="enable-sound" />,
}))
vi.mock("../MemoryConsent", () => ({
  default: () => <div data-testid="memory-consent" />,
}))
vi.mock("../Skeleton", () => ({
  default: ({ children }: any) => <div data-testid="skeleton">{children}</div>,
}))
vi.mock("../Focus", () => ({ default: () => <div data-testid="focus-mode" /> }))
vi.mock("../Tribe", () => ({
  default: ({ children }: any) => <div data-testid="tribe">{children}</div>,
}))

describe("Thread", () => {
  let container: HTMLDivElement
  let root: any

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
    mockChat.reset()
    mockAuth.reset()
    mockApp.reset()
    mockNavigation.reset()
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it("renders thread skeleton and components", async () => {
    await act(async () => {
      root.render(<Thread />)
    })

    expect(container.querySelector("[data-testid='skeleton']")).toBeTruthy()
    expect(
      container.querySelector("[data-testid='messages-list']"),
    ).toBeTruthy()
    expect(container.querySelector("[data-testid='chat-input']")).toBeTruthy()
  })

  it("renders header actions when not a visitor", async () => {
    mockNavigation.isVisitor = false
    mockChat.thread = { id: "thread-1", title: "Test Thread", messages: [] }
    // Ensure auth also has threadId set so useAuth returns it
    mockAuth.threadId = "thread-1"
    mockAuth.threadIdRef.current = "thread-1"

    await act(async () => {
      root.render(<Thread />)
    })

    const instructions = container.querySelector("[data-testid='instructions']")
    expect(instructions).toBeTruthy()

    const deleteThread = container.querySelector(
      "[data-testid='delete-thread']",
    )
    expect(deleteThread).toBeTruthy()
  })

  it("shows loading state when loading", async () => {
    mockChat.isLoading = true
    mockChat.isEmpty = true

    await act(async () => {
      root.render(<Thread />)
    })

    expect(container.querySelector("[data-testid='loading']")).toBeTruthy()

    // Reset
    mockChat.isLoading = false
    mockChat.isEmpty = false
  })

  it.skip("triggers stable callbacks correctly", async () => {
    mockChat.thread = { id: "thread-1", title: "Test Thread", messages: [] }
    mockAuth.threadId = "thread-1"
    mockAuth.threadIdRef.current = "thread-1"
    mockChat.messages = [{ message: { id: "1" } }] // Ensure messages for onDelete

    // Mock refetchThread to return a promise
    mockChat.refetchThread.mockResolvedValue({})

    await act(async () => {
      root.render(<Thread />)
    })

    const messagesList = container.querySelector(
      "[data-testid='messages-list']",
    ) as HTMLElement
    expect(messagesList).toBeTruthy()

    // Trigger onCharacterProfileUpdate (should scroll if not floating)
    mockChat.isChatFloating = false
    const cpUpdateButton = container.querySelector(
      "[data-testid='trigger-cp-update']",
    )
    expect(cpUpdateButton).toBeTruthy()
    await act(async () => {
      fireEvent.click(cpUpdateButton!)
    })
    expect(mockChat.scrollToBottom).toHaveBeenCalled()

    // Trigger onPlayAudio
    await act(async () => {
      fireEvent.mouseEnter(messagesList)
    })
    // No direct spy for shouldStopAutoScrollRef, but we verify it doesn't crash

    // Trigger onToggleLike
    const likeButton = container.querySelector("[data-testid='trigger-like']")
    expect(likeButton).toBeTruthy()
    await act(async () => {
      likeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })
    expect(mockChat.refetchThread).toHaveBeenCalled()

    // Trigger onDelete (single message case)
    mockChat.setMessages.mockClear()
    mockChat.refetchThread.mockClear()
    await act(async () => {
      fireEvent.contextMenu(messagesList)
    })
    expect(mockChat.refetchThread).toHaveBeenCalled()
    expect(mockChat.setMessages).toHaveBeenCalledWith([
      { message: { id: "msg-2" } },
    ])

    // Trigger onDelete (multiple messages case)
    mockChat.messages = [{ message: { id: "1" } }, { message: { id: "2" } }]
    // Reset component to pick up new messages ref
    await act(async () => {
      root.render(<Thread />)
    })

    mockChat.setMessages.mockClear()
    await act(async () => {
      fireEvent.contextMenu(messagesList)
    })
    expect(mockChat.refetchThread).toHaveBeenCalled()
    expect(mockChat.setMessages).toHaveBeenCalled() // Called with filtered array
  })

  it.skip("renders focus mode when enabled", async () => {
    mockAuth.showFocus = true
    mockChat.isEmpty = true

    await act(async () => {
      root.render(<Thread />)
    })

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0))
    })

    expect(container.querySelector("[data-testid='focus-mode']")).toBeTruthy()

    // Reset
    mockAuth.showFocus = false
    mockChat.isEmpty = false
  })

  it.skip("handles delete message correctly", async () => {
    mockChat.messages = [
      { message: { id: "msg-1" } },
      { message: { id: "msg-2" } },
    ]
    mockChat.refetchThread.mockResolvedValue({})

    await act(async () => {
      root.render(<Thread />)
    })

    const deleteButton = container.querySelector(
      "[data-testid='trigger-delete']",
    )
    expect(deleteButton).toBeTruthy()

    await act(async () => {
      deleteButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mockChat.refetchThread).toHaveBeenCalled()
    expect(mockChat.setMessages).toHaveBeenCalledWith([
      { message: { id: "msg-2" } },
    ])
  })

  it("handles toggle like correctly", async () => {
    await act(async () => {
      root.render(<Thread />)
    })

    const likeButton = container.querySelector("[data-testid='trigger-like']")
    expect(likeButton).toBeTruthy()

    await act(async () => {
      likeButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mockChat.refetchThread).toHaveBeenCalled()
  })

  it("handles character profile update", async () => {
    mockChat.isChatFloating = false

    await act(async () => {
      root.render(<Thread />)
    })

    const updateButton = container.querySelector(
      "[data-testid='trigger-cp-update']",
    )
    expect(updateButton).toBeTruthy()

    await act(async () => {
      updateButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mockChat.scrollToBottom).toHaveBeenCalled()
  })

  it("handles character profile update when floating", async () => {
    mockChat.isChatFloating = true

    await act(async () => {
      root.render(<Thread />)
    })

    const updateButton = container.querySelector(
      "[data-testid='trigger-cp-update']",
    )
    expect(updateButton).toBeTruthy()

    await act(async () => {
      updateButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(mockChat.scrollToBottom).not.toHaveBeenCalled()
  })

  it("handles play audio", async () => {
    await act(async () => {
      root.render(<Thread />)
    })

    const audioButton = container.querySelector("[data-testid='trigger-audio']")
    expect(audioButton).toBeTruthy()

    // Just verify it doesn't throw and runs
    await act(async () => {
      audioButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })
  })
})
