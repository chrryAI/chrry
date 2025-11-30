/**
 * Test suite for SCSS to TypeScript converter
 * Ensures all features work correctly
 */

const fs = require("fs")
const path = require("path")
const { execFileSync } = require("child_process")

describe("SCSS to TypeScript Converter", () => {
  const testScssPath = path.join(__dirname, "TestComponent.module.scss")
  const testOutputPath = path.join(__dirname, "TestComponent.styles.ts")
  const scriptPath = path.join(
    __dirname,
    "../../../scripts/scss-to-universal.js",
  )

  beforeAll(() => {
    // Generate the test output
    // Use execFileSync to prevent shell injection
    execFileSync("node", [scriptPath, testScssPath, testOutputPath])
  })

  afterAll(() => {
    // Clean up generated file
    if (fs.existsSync(testOutputPath)) {
      fs.unlinkSync(testOutputPath)
    }
  })

  test("should generate TypeScript file", () => {
    expect(fs.existsSync(testOutputPath)).toBe(true)
  })

  test("should have correct imports", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    expect(content).toContain("import { createUnifiedStyles }")
    expect(content).toContain("import { useInteractiveStyles }")
  })

  test("should convert basic styles", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    expect(content).toContain("container:")
    expect(content).toContain("display:")
    expect(content).toContain("flexDirection:")
  })

  test("should convert toRem.toRem() to numbers", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    // toRem.toRem(10) should become 10
    expect(content).toContain("gap: 10")
    // toRem.toRem(16) should become 16
    expect(content).toContain("padding: 16")
  })

  test("should convert CSS variables to __CSS_VAR__ markers", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    expect(content).toContain("__CSS_VAR__--background")
    expect(content).toContain("__CSS_VAR__--foreground")
    expect(content).toContain("__CSS_VAR__--accent-6")
  })

  test("should detect interactive states", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    expect(content).toContain("button: {")
    expect(content).toContain("base: {")
    expect(content).toContain("hover: {")
    expect(content).toContain("active: {")
    expect(content).toContain("focus: {")
    expect(content).toContain("disabled: {")
  })

  test("should generate interactive hook for styles with pseudo-classes", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    expect(content).toContain("useInteractiveStyles")
  })

  test("should handle responsive font sizes", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    // 4vw should be preserved as string
    expect(content).toContain("fontSize: '4vw'")
  })

  test("should convert colors correctly", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    expect(content).toContain("color: '#fff'")
  })

  test("should handle multiple interactive states on same element", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    const buttonMatch = content.match(
      /button:\s*{[\s\S]*?base:[\s\S]*?hover:[\s\S]*?active:[\s\S]*?focus:[\s\S]*?disabled:/g,
    )
    expect(buttonMatch).toBeTruthy()
  })

  test("should preserve property order", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    const containerIndex = content.indexOf("container:")
    const buttonIndex = content.indexOf("button:")
    const linkIndex = content.indexOf("link:")

    expect(containerIndex).toBeLessThan(buttonIndex)
    expect(buttonIndex).toBeLessThan(linkIndex)
  })

  test("should handle box-shadow", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    expect(content).toContain("boxShadow")
  })

  test("should convert kebab-case to camelCase", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    expect(content).toContain("backgroundColor")
    expect(content).toContain("borderRadius")
    expect(content).toContain("flexDirection")
    expect(content).toContain("alignItems")
    expect(content).toContain("justifyContent")
  })

  test("should generate proper TypeScript types", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    expect(content).toContain("type TestComponentStylesHook")
    expect(content).toContain("export const useTestComponentStyles")
  })

  test("should handle non-interactive styles without base wrapper", () => {
    const content = fs.readFileSync(testOutputPath, "utf-8")
    // Container has no interactive states, should be flat
    expect(content).toMatch(/container:\s*{[^}]*display:/)
    // Should NOT have container.base
    expect(content).not.toMatch(/container:\s*{[^}]*base:/)
  })
})
