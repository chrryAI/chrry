import { usePlatform } from "../platform"

export function useResponsiveCount(
  breakpoints: { height: number; count: number }[],
  offset = 0,
) {
  const { viewPortHeight } = usePlatform()

  for (const { height, count } of breakpoints) {
    if (viewPortHeight < height + offset) return count
  }
  return breakpoints?.[breakpoints.length - 1]?.count!
}
