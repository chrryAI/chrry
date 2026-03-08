import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import MarkdownContent, { createOverrides } from "../MarkdownContent.web"
import { mockAppContext, mockTheme } from "./mocks/mockContexts"

// Mock dependencies
vi.mock("../context/AppContext", () => ({
  useAppContext: () => mockAppContext,
}))

vi.mock("../platform", async (importOriginal) => {
  const actual = (await importOriginal()) as any
  return {
    ...actual,
    useTheme: () => mockTheme,
    Div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    Button: ({ children, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
  }
})

vi.mock("../platform/usePlatformStyles", () => ({
  usePlatformStyles: (styles: any) => styles,
}))

// Mock components used in overrides
vi.mock("../Img", () => ({
  default: ({ src, alt }: any) => (
    <img src={src} alt={alt} data-testid="custom-img" />
  ),
}))

vi.mock("../TextWithLinks", () => ({
  default: ({ text, href, onClick }: any) => (
    <a href={href} onClick={onClick} data-testid="custom-link">
      {text}
    </a>
  ),
}))

vi.mock("../Store", () => ({
  default: () => <div data-testid="custom-store">Store Component</div>,
}))

vi.mock("react-syntax-highlighter", () => ({
  Prism: ({ children, language }: any) => (
    <pre data-testid="syntax-highlighter" data-language={language}>
      {children}
    </pre>
  ),
}))

describe("MarkdownContent", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("renders basic markdown content", () => {
    render(<MarkdownContent content="Hello **world**" />)
    expect(screen.getByText("Hello")).toBeDefined()
    expect(screen.getByText("world")).toBeDefined()
    // Markdown-to-jsx renders strong tags for **
    const strongElement = screen.getByText("world")
    expect(strongElement.tagName).toBe("STRONG")
  })

  it("renders code blocks with custom component", () => {
    const code = "console.log('test')"
    const markdown = `\`\`\`javascript\n${code}\n\`\`\``

    render(<MarkdownContent content={markdown} />)

    const codeBlock = screen.getByTestId("syntax-highlighter")
    expect(codeBlock).toBeDefined()
    expect(codeBlock.getAttribute("data-language")).toBe("javascript")
    expect(codeBlock.textContent).toContain(code)
  })

  it("renders inline code correctly", () => {
    render(<MarkdownContent content="Use `code` here" />)
    const inlineCode = screen.getByText("code")
    expect(inlineCode.tagName).toBe("CODE")
  })

  it("renders links with custom TextWithLinks component", () => {
    render(<MarkdownContent content="[Link](https://example.com)" />)
    const link = screen.getByTestId("custom-link")
    expect(link).toBeDefined()
    expect(link.getAttribute("href")).toBe("https://example.com")
    expect(link.textContent).toBe("Link")
  })

  it("renders images with custom Img component", () => {
    render(<MarkdownContent content="![Alt text](image.jpg)" />)
    const img = screen.getByTestId("custom-img")
    expect(img).toBeDefined()
    expect(img.getAttribute("src")).toBe("image.jpg")
    expect(img.getAttribute("alt")).toBe("Alt text")
  })

  it("handles citations correctly", () => {
    const content = "This is a fact [1]."
    const webSearchResults = [
      { title: "Source 1", url: "https://source1.com", snippet: "Snippet 1" },
    ]

    render(
      <MarkdownContent content={content} webSearchResults={webSearchResults} />,
    )

    const citation = screen.getByTestId("custom-link")
    expect(citation).toBeDefined()
    expect(citation.textContent).toBe("[1]")
    expect(citation.getAttribute("href")).toBe("https://source1.com")
  })

  it("renders custom components like <StoreCompact />", () => {
    render(<MarkdownContent content="<StoreCompact />" />)
    expect(screen.getByTestId("custom-store")).toBeDefined()
  })

  it("memoizes options correctly and updates content on props change", () => {
    const { rerender } = render(<MarkdownContent content="Initial" />)
    expect(screen.getByText("Initial")).toBeDefined()

    // Rerender with different content should update
    rerender(<MarkdownContent content="Updated" />)
    expect(screen.getByText("Updated")).toBeDefined()
  })

  it("creates overrides object with correct structure", () => {
    const overrides = createOverrides({
      addHapticFeedback: vi.fn(),
      galleryContainerStyles: {},
      imageStyles: {},
    })

    expect(overrides.code).toBeDefined()
    expect(overrides.a).toBeDefined()
    expect(overrides.img).toBeDefined()
    expect(overrides.p).toBeDefined()
    expect(overrides.div).toBeDefined()
    expect(overrides.ul).toBeDefined()
    expect(overrides.ol).toBeDefined()
    expect(overrides.li).toBeDefined()
    expect(overrides.h1).toBeDefined()
    expect(overrides.h2).toBeDefined()
    expect(overrides.h3).toBeDefined()
    expect(overrides.h4).toBeDefined()
    expect(overrides.blockquote).toBeDefined()
    expect(overrides.table).toBeDefined()
    expect(overrides.thead).toBeDefined()
    expect(overrides.tbody).toBeDefined()
    expect(overrides.tr).toBeDefined()
    expect(overrides.th).toBeDefined()
    expect(overrides.td).toBeDefined()
    expect(overrides.StoreCompact).toBeDefined()
    expect(overrides.PWAGallery).toBeDefined()
  })

  it("executes overrides methods", () => {
    const overrides = createOverrides({
      addHapticFeedback: vi.fn(),
      galleryContainerStyles: {},
      imageStyles: {},
    })

    // Test code override
    const codeResult = overrides.code({
      children: "console.log",
      className: "lang-js",
    })
    expect(codeResult).toBeDefined()

    // Test link override
    const linkResult = overrides.a({
      href: "https://example.com",
      children: "link",
    })
    expect(linkResult).toBeDefined()

    // Test img override
    const imgResult = overrides.img({ src: "test.jpg", alt: "test" })
    expect(imgResult).toBeDefined()
  })
})
