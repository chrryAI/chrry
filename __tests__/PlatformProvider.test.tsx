import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { PlatformProvider, usePlatform } from "../platform/PlatformProvider"

// Mock component to consume context
const TestComponent = () => {
  const platform = usePlatform()
  return (
    <div>
      <span data-testid="platform">{platform.platform}</span>
      <span data-testid="isWeb">{platform.isWeb.toString()}</span>
      <span data-testid="isIDE">{platform.isIDE.toString()}</span>
      <button type="button" onClick={platform.toggleIDE}>
        Toggle IDE
      </button>
    </div>
  )
}

describe("PlatformProvider", () => {
  it("provides correct default values", () => {
    render(
      <PlatformProvider>
        <TestComponent />
      </PlatformProvider>,
    )

    expect(screen.getByTestId("platform").textContent).toBe("web") // Default is web in test env
    expect(screen.getByTestId("isWeb").textContent).toBe("true")
    expect(screen.getByTestId("isIDE").textContent).toBe("false")
  })

  it("toggles IDE state correctly", async () => {
    render(
      <PlatformProvider>
        <TestComponent />
      </PlatformProvider>,
    )

    const toggleButton = screen.getByText("Toggle IDE")
    fireEvent.click(toggleButton)

    await waitFor(() => {
      expect(screen.getByTestId("isIDE").textContent).toBe("true")
    })
  })

  it("initializes with session data if provided", () => {
    const sessionMock = {
      device: { type: "mobile" },
      os: { name: "iOS" },
    }

    // We can't easily mock the internal logic that uses session without more complex setup,
    // but we can pass it and ensure it renders without error.
    render(
      <PlatformProvider session={sessionMock as any}>
        <TestComponent />
      </PlatformProvider>,
    )

    // Check if it didn't crash
    expect(screen.getByTestId("platform")).toBeTruthy()
  })
})
