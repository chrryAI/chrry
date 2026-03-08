// @vitest-environment happy-dom

import { act } from "@testing-library/react"
import React from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// Make React globally available
global.React = React

import Checkbox from "../Checkbox"

// Mock platform components
vi.mock("../platform", async () => {
  return {
    Div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Input: ({ children, ...props }: any) => <input {...props} />,
    Label: ({ children, ...props }: any) => (
      <label {...props}>{children}</label>
    ),
    Span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  }
})

// Mock styles
vi.mock("../Checkbox.styles", () => ({
  useCheckboxStyles: () => ({
    formSwitch: { style: {} },
    formSwitchTrack: { style: {} },
    formSwitchTrackChecked: { style: {} },
    formSwitchThumb: { style: {} },
    formSwitchThumbChecked: { style: {} },
    formSwitchLabel: { style: {} },
  }),
}))

describe("Checkbox", () => {
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

  it("applies focus styles to track when input is focused", async () => {
    await act(async () => {
      root.render(<Checkbox>Test Checkbox</Checkbox>)
    })

    const input = container.querySelector("input")
    const track = container.querySelector(".formSwitchTrack") as HTMLElement

    expect(input).toBeTruthy()
    expect(track).toBeTruthy()

    // Initial state: no outline
    // Note: styles are applied as inline styles.
    // In the mock, formSwitchTrack.style is empty.
    // So track.style.outline should be empty string.
    expect(track.style.outline).toBe("")

    // Focus input
    await act(async () => {
      input?.focus()
      // We dispatch the event manually because React's onFocus doesn't always fire with just .focus() in JSDOM depending on version
      input?.dispatchEvent(new Event("focus", { bubbles: true }))
    })

    // Expect outline to be present
    expect(track.style.outlineStyle).toBe("solid")
    expect(track.style.outlineWidth).toBe("2px")

    // Blur input
    await act(async () => {
      input?.blur()
      input?.dispatchEvent(new Event("blur", { bubbles: true }))
    })

    // Expect outline to be gone
    expect(track.style.outlineStyle).toBe("")
  })
})
