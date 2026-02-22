import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"
import { Input, Select, TextArea } from "../platform/PlatformPrimitives"

describe("PlatformPrimitives - Input", () => {
  it("renders correctly", () => {
    render(<Input placeholder="Test Input" />)
    expect(screen.getByPlaceholderText("Test Input")).toBeTruthy()
  })

  it("handles error prop correctly", () => {
    render(<Input placeholder="Error Input" error={true} />)
    const input = screen.getByPlaceholderText("Error Input")
    expect(input.getAttribute("aria-invalid")).toBe("true")
    expect(input.getAttribute("data-error")).toBe("true")
  })

  it("handles explicit aria-invalid", () => {
    render(<Input placeholder="Explicit Invalid" aria-invalid="grammar" />)
    const input = screen.getByPlaceholderText("Explicit Invalid")
    expect(input.getAttribute("aria-invalid")).toBe("grammar")
  })

  it("prioritizes error prop over aria-invalid", () => {
    render(
      <Input placeholder="Priority Test" error={true} aria-invalid="false" />,
    )
    const input = screen.getByPlaceholderText("Priority Test")
    expect(input.getAttribute("aria-invalid")).toBe("true")
  })

  it("passes aria-describedby", () => {
    render(<Input placeholder="Described Input" aria-describedby="desc-id" />)
    const input = screen.getByPlaceholderText("Described Input")
    expect(input.getAttribute("aria-describedby")).toBe("desc-id")
  })
})

describe("PlatformPrimitives - TextArea", () => {
  it("handles error prop correctly", () => {
    render(<TextArea placeholder="Error TextArea" error={true} />)
    const textarea = screen.getByPlaceholderText("Error TextArea")
    expect(textarea.getAttribute("aria-invalid")).toBe("true")
    expect(textarea.getAttribute("data-error")).toBe("true")
  })
})

describe("PlatformPrimitives - Select", () => {
  it("handles error prop correctly", () => {
    render(
      <Select dataTestId="error-select" error={true}>
        <option value="1">One</option>
      </Select>,
    )
    const select = screen.getByTestId("error-select")
    expect(select.getAttribute("aria-invalid")).toBe("true")
    expect(select.getAttribute("data-error")).toBe("true")
  })
})
