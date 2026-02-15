// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import React from "react"
import { createRoot } from "react-dom/client"
import { act } from "@testing-library/react"

// Make React globally available
global.React = React

import Agent from "../agent/Agent"
import {
  mockAuth,
  mockChat,
  mockApp,
  mockNavigation,
  mockPlatform,
  mockTheme,
  mockData,
  mockAppContext,
  mockStyles,
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
      <button {...props}>{children}</button>
    ),
    Span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    P: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    Input: ({ ...props }: any) => (
      <input
        {...props}
        data-testid={props["data-testid"] || props.dataTestId}
      />
    ),
    Label: ({ children, ...props }: any) => (
      <label {...props}>{children}</label>
    ),
    TextArea: ({ ...props }: any) => <textarea {...props} />,
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
}))

vi.mock("react-hook-form", async () => {
  const actual = await vi.importActual("react-hook-form")
  return {
    ...actual,
    useForm: () => ({
      ...mockApp.appForm,
      // Override handleSubmit to execute the callback immediately for testing
      handleSubmit: (fn: any) => (e: any) => {
        if (e) e.preventDefault()
        return fn({ name: "test", apiKey: "test" })
      },
    }),
    Controller: ({ render, field }: any) =>
      render({
        field: {
          onChange: vi.fn(),
          value: "",
          name: field,
        },
        fieldState: {},
      }),
  }
})

// Mock other components
vi.mock("../Modal", () => ({
  default: ({ children, isModalOpen, onToggle }: any) =>
    isModalOpen ? (
      <div data-testid="modal">
        <button data-testid="close-modal" onClick={() => onToggle(false)}>
          Close
        </button>
        {children}
      </div>
    ) : null,
}))
vi.mock("../Loading", () => ({ default: () => <div data-testid="loading" /> }))
vi.mock("../Image", () => ({ default: () => <div data-testid="image" /> }))
vi.mock("../Select", () => ({
  default: (props: any) => (
    <select {...props} data-testid={props["data-testid"] || props.dataTestId} />
  ),
}))
vi.mock("../Checkbox", () => ({
  default: ({ children, ...props }: any) => (
    <div data-testid={props.dataTestId}>
      <input type="checkbox" {...props} />
      {children}
    </div>
  ),
}))
vi.mock("../ColorScheme", () => ({
  default: () => <div data-testid="color-scheme" />,
}))
vi.mock("../ThemeSwitcher", () => ({
  default: () => <div data-testid="theme-switcher" />,
}))
vi.mock("../TribeCalculator", () => ({
  TribeCalculator: () => <div data-testid="tribe-calculator" />,
}))

describe("Agent", () => {
  let container: HTMLDivElement
  let root: any

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
    vi.clearAllMocks()
    // Reset mock states
    mockApp.reset()
    mockChat.reset()
    mockAuth.reset()
    mockNavigation.reset()
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it("renders settings button", async () => {
    await act(async () => {
      root.render(<Agent />)
    })

    const button = container.querySelector(
      "[data-testid='app-settings-button']",
    )
    expect(button).toBeTruthy()
  })

  it("verifies setAppStatus is called when settings button is clicked", async () => {
    // Mock the setAppStatus function to verify interaction
    const setAppStatusSpy = vi.spyOn(mockApp, "setAppStatus")

    await act(async () => {
      root.render(<Agent />)
    })

    const settingsButton = container.querySelector(
      "[data-testid='app-settings-button']",
    )
    expect(settingsButton).toBeTruthy()

    if (settingsButton) {
      await act(async () => {
        settingsButton.dispatchEvent(new MouseEvent("click", { bubbles: true }))
      })
      expect(setAppStatusSpy).toHaveBeenCalledWith({ part: "settings" })
    }
  })

  it("renders modal content when isAgentModalOpen is true", async () => {
    mockApp.isAgentModalOpen = true

    await act(async () => {
      root.render(<Agent />)
    })

    expect(container.querySelector("[data-testid='modal']")).toBeTruthy()

    // Reset
    mockApp.isAgentModalOpen = false
  })

  it("renders settings tab content by default", async () => {
    mockApp.isAgentModalOpen = true
    mockApp.tab = "settings"
    // Also ensure appFormWatcher has necessary data to show default model etc?
    // Agent uses appFormWatcher for defaultModel value
    // The mockApp defines appFormWatcher

    await act(async () => {
      root.render(<Agent />)
    })

    expect(container.querySelector("[data-testid='settings-tab']")).toBeTruthy()

    // Select component mock uses data-testid from props.
    // In Agent.tsx: <Select data-testid="default-model-select" ... />
    // Wait, the prop is passed as `data-testid` (lowercase) in Agent.tsx code provided in memory?
    // Let's check Agent.tsx code provided in memory.
    // Line 448: <Select ... data-testid="default-model-select" ... />
    // My mock Select: vi.mock("../Select", () => ({ default: (props: any) => <select {...props} data-testid={props.dataTestId} /> }))
    // The mock uses `props.dataTestId` (camelCase) but the component passes `data-testid` (kebab-case).
    // I need to fix the mock to use `props['data-testid']` or `props.dataTestId`.
    // Or update the mock to spread props first.

    // Actually, looking at Agent.tsx code in memory:
    // <Select ... data-testid="default-model-select" ... />
    // So props has "data-testid".
    // My mock: <select {...props} data-testid={props.dataTestId} />
    // If props has "data-testid", spreading props will add it to select.
    // But then `data-testid={props.dataTestId}` might override it with undefined if dataTestId is not present.
    // Let's fix the mock.

    // Also check if `temperature-input` is rendered.
    // In Agent.tsx: <Input ... data-testid="temperature-input" ... />
    // My mock Input: <input {...props} />
    // This should work as spreading props includes data-testid.
  })

  it("switches to extend tab", async () => {
    mockApp.isAgentModalOpen = true
    mockApp.tab = "extends"

    await act(async () => {
      root.render(<Agent />)
    })

    // Tab content for "extend" should be visible
    // We check for elements specific to that tab
    expect(
      container.querySelector("[data-testid='visibility-select']"),
    ).toBeTruthy()
    expect(
      container.querySelector("[data-testid='calendar-checkbox']"),
    ).toBeTruthy()
  })

  it("switches to monetization tab", async () => {
    mockApp.isAgentModalOpen = true
    mockApp.tab = "monetization"

    await act(async () => {
      root.render(<Agent />)
    })

    expect(container.querySelector("[data-testid='tier-select']")).toBeTruthy()
  })

  it("switches to api tab", async () => {
    mockApp.isAgentModalOpen = true
    mockApp.tab = "api"

    await act(async () => {
      root.render(<Agent />)
    })

    // Input mock uses spread props: <Input {...props} />
    // The Controller mock returns an Input with some props.
    // But Input mock in Agent.tsx test file is: <input {...props} />
    // Let's check how Controller is mocked.
    /*
        Controller: ({ render, field }) => render({
            field: { ... },
            fieldState: {}
        }),
        */
    // And inside Agent.tsx:
    /*
        <Controller
            name="apiKeys.openai"
            control={control}
            render={({ field }) => (
                <Input
                    dataTestId="openai-api-key"
                    ...
        */
    // Note: Agent.tsx uses dataTestId (camelCase) for Input.
    // My mock Input: <input {...props} />
    // React/HTML attributes are lowercase. `dataTestId` prop won't be a valid attribute `data-testid` unless mapped.
    // I need to update Input mock to handle dataTestId -> data-testid mapping.

    expect(
      container.querySelector("[data-testid='openai-api-key']"),
    ).toBeTruthy()
  })
})
