// @vitest-environment happy-dom

import { render, screen } from "@testing-library/react"
import React from "react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  mockAuth,
  mockChat,
  mockNavigation,
  mockStyles,
} from "./mocks/mockContexts"

// Make React globally available
global.React = React

import { useTimerContext } from "../context/TimerContext"
import FocusButton from "../FocusButton"

// Mock TimerContext values with TASKS
const mockTimerContext = {
  startAdjustment: vi.fn(),
  stopAdjustment: vi.fn(),
  playKitasaku: false,
  setPlayKitasaku: vi.fn(),
  isLoadingTasks: false,
  playBirds: false,
  setPlayBirds: vi.fn(),
  activePomodoro: null,
  time: 1500,
  isCountingDown: false,
  isPaused: false,
  isFinished: false,
  setTime: vi.fn(),
  startCountdown: vi.fn(),
  fetchTasks: vi.fn(),
  handlePresetTime: vi.fn(),
  replay: false, // Default not replaying
  setReplay: vi.fn(),
  tasks: {
    tasks: [
      {
        id: "task-1",
        title: "Task 1",
        createdOn: new Date(),
        modifiedOn: new Date(),
        order: 0,
      },
      {
        id: "task-2",
        title: "Task 2",
        createdOn: new Date(),
        modifiedOn: new Date(),
        order: 1,
      },
    ],
    totalCount: 2,
    hasNextPage: false,
    nextPage: null,
  },
  setTasks: vi.fn(),
  handleCancel: vi.fn(),
  handlePause: vi.fn(),
  handleResume: vi.fn(),
  presetMin1: 25,
  presetMin2: 15,
  presetMin3: 5,
  setPresetMin1: vi.fn(),
  setPresetMin2: vi.fn(),
  setPresetMin3: vi.fn(),
  selectedTasks: [
    {
      id: "task-1",
      title: "Task 1",
      createdOn: new Date(),
      modifiedOn: new Date(),
      order: 0,
    },
  ], // Task 1 is selected
  setSelectedTasks: vi.fn(),
  remoteTimer: null,
  fetchTimer: vi.fn(),
  playTimerEnd: vi.fn(),
  updateTimer: vi.fn(),
  isCancelled: false,
  timer: null,
  setTimer: vi.fn(),
  setActivePomodoro: vi.fn(),
  setIsCountingDown: vi.fn(),
  setIsPaused: vi.fn(),
  setIsFinished: vi.fn(),
  setStartTime: vi.fn(),
  startTime: 0,
}

// Mock contexts
vi.mock("../context/providers", () => ({
  useAuth: () => mockAuth,
  useChat: () => mockChat,
  useNavigationContext: () => mockNavigation,
}))

vi.mock("../context/providers/AuthProvider", () => ({
  useAuth: () => mockAuth,
}))

vi.mock("../context/AppContext", () => ({
  useAppContext: () => ({ t: (k: string) => k }),
}))

vi.mock("../context/StylesContext", () => ({
  useStyles: () => ({ utilities: mockStyles.utilities }),
}))

vi.mock("../context/ThemeContext", () => ({
  COLORS: {},
  useTheme: () => ({
    setTheme: vi.fn(),
    isDark: false,
    enableSound: true,
    setEnableSound: vi.fn(),
  }),
}))

vi.mock("../context/TimerContext", () => ({
  useTimerContext: vi.fn(),
}))

vi.mock("../hooks", () => ({
  useHasHydrated: () => true,
}))

vi.mock("../FocusButton.styles", () => ({
  useFocusButtonStyles: () => ({
    settingsContainer: { style: {} },
    closeSettingsButton: { style: {} },
    settings: { style: {} },
    settingsSpan: { style: {} },
    additionalSettings: { style: {} },
    settingsFooter: { style: {} },
    discord: { style: {} },
    x: { style: {} },
    main: { style: {} },
    pomodoro: { style: {} },
    timeAdjust: { style: {} },
    active: { style: {} },
    focusButtonPaused: { style: {} },
    greeting: { style: {} },
    letsFocusContainer: { style: {} },
    userName: { style: {} },
    videoContainer: { style: {} },
    videoPlay: { style: {} },
    videoPause: { style: {} },
    video: { style: {} },
    focusButton: { style: {} },
    focusButtonMounted: { style: {} },
    focusButtonCounting: { style: {} },
    focusButtonFinished: { style: {} },
    headerContainer: { style: {} },
    showSettings: { style: {} },
    timeDisplay: { style: {} },
    time: { style: {} },
    separator: { style: {} },
    footerContainer: { style: {} },
    controls: { style: {} },
    controlIcon: { style: {} },
    pauseButton: { style: {} },
    cancelButton: { style: {} },
    taskSection: { style: {} },
    loadingTasks: { style: {} },
    app: { style: {} },
    top: { style: {} },
    newTaskButton: { style: {} },
    tasks: { style: {} },
    task: { style: {} },
    selectedTask: { style: {} },
    selectedTaskCounting: { style: {} },
    selectedTaskPaused: { style: {} },
    selectedTaskFinished: { style: {} },
    taskContent: { style: {} },
    taskTitle: { style: {} },
    taskSelected: { style: {} },
    taskNotSelected: { style: {} },
    taskTime: { style: {} },
    dragHandle: { style: {} },
    greatStart: { style: {} },
    testimonials: { style: {} },
  }),
}))

vi.mock("../platform", async () => {
  const React = await import("react")
  return {
    Button: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <button ref={ref} {...props}>
        {children}
      </button>
    )),
    Div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    Input: ({ children, ...props }: any) => <input {...props} />,
    Main: ({ children, ...props }: any) => <main {...props}>{children}</main>,
    useKeepAwake: vi.fn(),
    usePlatform: () => ({ os: "web", isExtension: false }),
    useTheme: () => ({
      enableSound: true,
      setEnableSound: vi.fn(),
      isDark: false,
      setTheme: vi.fn(),
      colorScheme: "light",
      setIsThemeLocked: vi.fn(),
    }),
    Video: ({ ...props }: any) => <video {...props} />,
    DraggableList: ({ renderItem, data, ...props }: any) => (
      <div>
        {data.map((item: any, index: number) =>
          renderItem({ item, drag: vi.fn(), isActive: false }),
        )}
      </div>
    ),
  }
})

// Mock translation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
  initReactI18next: {
    type: "3rdParty",
    init: vi.fn(),
  },
}))

describe("FocusButton Accessibility Improvements", () => {
  beforeEach(() => {
    vi.mocked(useTimerContext).mockReturnValue(mockTimerContext)
  })

  it("task selection button should have aria-pressed attribute", () => {
    render(<FocusButton />)

    // Task 1 is selected
    const task1Button = screen.getByText("Task 1").closest("button")
    expect(task1Button?.getAttribute("aria-pressed")).toBe("true")

    // Task 2 is NOT selected
    const task2Button = screen.getByText("Task 2").closest("button")
    expect(task2Button?.getAttribute("aria-pressed")).toBe("false")
  })

  it("replay button should have aria-pressed attribute", () => {
    render(<FocusButton />)
    const replayButton = screen.getByTitle("Replay")
    expect(replayButton.getAttribute("aria-pressed")).toBe("false")
  })

  it("should handle undefined selectedTasks gracefully", () => {
    vi.mocked(useTimerContext).mockReturnValue({
      ...mockTimerContext,
      selectedTasks: undefined,
    })

    render(<FocusButton />)

    // Ensure buttons still have aria-pressed="false"
    const task1Button = screen.getByText("Task 1").closest("button")
    expect(task1Button?.getAttribute("aria-pressed")).toBe("false")
  })
})
