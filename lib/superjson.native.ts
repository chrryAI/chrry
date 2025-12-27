/**
 * Native-specific superjson wrapper
 * Uses superjson/dist/index workaround for React Native
 * See: https://stackoverflow.com/questions/77336033/import-superjson-in-react-native
 */
import superjson from "superjson/dist/index"

export const stringify = (data: any): string => {
  return superjson.stringify(data)
}

export const parse = (data: string): any => {
  return superjson.parse(data)
}
