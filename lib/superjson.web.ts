/**
 * Web-specific superjson wrapper
 * Uses actual superjson for proper Date serialization
 */
import superjson from "superjson"

export const stringify = (data: any): string => {
  return superjson.stringify(data)
}

export const parse = (data: string): any => {
  return superjson.parse(data)
}
