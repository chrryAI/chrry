// @vitest-environment happy-dom

import { act } from "@testing-library/react"
import React from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Make React globally available
global.React = React

import Loading from "../Loading"

// Mock platform components
vi.mock("../platform", async () => {
  return {
    Div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  }
})

// Mock icons
vi.mock("../icons", () => ({
  LoaderCircle: (props: any) => <svg data-testid="loader-circle" {...props} />,
}))

// Mock hooks
vi.mock("../hooks", () => ({
  useHasHydrated: () => true,
}))

// Mock styles
vi.mock("../Loading.styles", () => ({
  useLoadingStyles: () => ({
    loadingCircle: { style: {} },
    loadingWrapper: { style: {} },
  }),
}))

describe("Loading", () => {
  let container: HTMLDivElement
  let root: any

  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(async () => {
    await act(async () => {
      root.unmount()
    })
    container.remove()
  })

  it("renders with role status and aria-label by default", async () => {
    await act(async () => {
      root.render(<Loading />)
    })

    const loader = container.querySelector("[data-testid='imgLoading']")
    expect(loader).toBeTruthy()
    expect(loader?.getAttribute("role")).toBe("status")
    expect(loader?.getAttribute("aria-label")).toBe("Loading")
  })

  it("renders with role status and aria-label when fullScreen is true", async () => {
    await act(async () => {
      root.render(<Loading fullScreen />)
    })

    const wrapper = container.querySelector(".fullScreen")
    expect(wrapper).toBeTruthy()
    expect(wrapper?.getAttribute("role")).toBe("status")
    expect(wrapper?.getAttribute("aria-label")).toBe("Loading")
  })

  it("accepts custom aria-label", async () => {
    await act(async () => {
      root.render(<Loading aria-label="Processing" />)
    })

    const loader = container.querySelector("[data-testid='imgLoading']")
    expect(loader).toBeTruthy()
    expect(loader?.getAttribute("aria-label")).toBe("Processing")
  })
})
