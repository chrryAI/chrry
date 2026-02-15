import { expect, test } from "vitest"
import { simpleRedact } from "./redaction"

test("simpleRedact should redact emails", () => {
  const input = "Contact me at test@example.com for more info."
  const expected = "Contact me at [REDACTED] for more info."
  expect(simpleRedact(input)).toBe(expected)
})

test("simpleRedact should redact phone numbers", () => {
  const input = "Call me at 123-456-7890."
  const expected = "Call me at [REDACTED]."
  expect(simpleRedact(input)).toBe(expected)
})

test("simpleRedact should redact multiple PIIs", () => {
  const input = "Email: test@example.com, Phone: (555) 123-4567"
  const expected = "Email: [REDACTED], Phone: [REDACTED]"
  expect(simpleRedact(input)).toBe(expected)
})

test("simpleRedact should handle empty strings", () => {
  expect(simpleRedact("")).toBe("")
})

test("simpleRedact should not change safe text", () => {
  const input = "Hello world, this is a safe message."
  expect(simpleRedact(input)).toBe(input)
})
