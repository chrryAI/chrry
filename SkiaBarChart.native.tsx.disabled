import React from "react"
import { View } from "react-native"
import {
  Canvas,
  Rect,
  Path,
  Skia,
  Text as SkiaText,
  Group,
  useFont,
} from "@shopify/react-native-skia"
import { useTheme } from "./context/ThemeContext"
import { BarData, Mood, emojiMap } from "./utils/chartTypes"
import { getMoodValue } from "./utils/chartUtils"
import { Text } from "./platform/PlatformPrimitives"

interface SkiaBarChartProps {
  data: BarData[]
  height: number
  width?: number
  barColor?: string
  formatter?: (value: number, mood: string) => string
}

const DEFAULT_BAR_COLOR = "#6C63FF"

export default function SkiaBarChart({
  data,
  height,
  width = 320,
  barColor = DEFAULT_BAR_COLOR,
  formatter = (value, mood) =>
    `${emojiMap[mood as Mood] || emojiMap.neutral} ${value}`,
}: SkiaBarChartProps) {
  const { colors } = useTheme()
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const barWidth = Math.max(18, Math.floor(width / (data.length * 1.5)))
  const gap = Math.floor((width - data.length * barWidth) / (data.length + 1))

  // Load fonts
  const font = useFont(
    require("../../apps/blossom/assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
    12,
  )
  const fontLabel = useFont(
    require("../../apps/blossom/assets/fonts/Inter-VariableFont_opsz,wght.ttf"),
    14,
  )

  // Mood-based color logic
  function getBarColor(val: number) {
    if (val >= 75) return colors.accent4 // green
    if (val >= 45) return colors.accent1 // yellow
    return colors.accent0 // red
  }

  if (!font || !fontLabel) return null

  return (
    <View
      style={{
        width,
        height: height + 34,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Canvas
        style={{
          width,
          height,
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {data.map((d, i) => {
          const barHeight = (d.value / maxValue) * (height - 40)
          const x = gap + i * (barWidth + gap)
          const y = height - barHeight - 20
          const labelWidth = font.getTextWidth(d.label)

          return (
            <Group key={i}>
              {/* Draw bar with rounded top corners (radius 20) using Path */}
              <Path
                path={(() => {
                  const p = Skia.Path.Make()
                  // Start at bottom left
                  p.moveTo(x, y + barHeight)
                  // Line up to top left + radius
                  p.lineTo(x, y + 20)
                  // Top left corner (quadratic curve)
                  p.quadTo(x, y, x + 20, y)
                  // Top edge
                  p.lineTo(x + barWidth - 20, y)
                  // Top right corner (quadratic curve)
                  p.quadTo(x + barWidth, y, x + barWidth, y + 20)
                  // Down to bottom right
                  p.lineTo(x + barWidth, y + barHeight)
                  // Close path
                  p.close()
                  return p
                })()}
                color={getBarColor(d.value)}
                opacity={0.8}
              />
              {/* Month label below bar */}
              <SkiaText
                x={x + barWidth / 2 - labelWidth / 2}
                y={height - 2}
                font={font}
                color={colors.shade6}
                text={d.label}
              />
            </Group>
          )
        })}
      </Canvas>
      {/* Emoji+Value labels below chart, aligned with bars */}
      <View
        style={{
          flexDirection: "row",
          width,
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        {data.map((d, i) => (
          <View
            key={i}
            style={{
              width: barWidth + 20,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                color: colors.foreground,
                textAlign: "center",
              }}
            >
              {formatter(d.value, d.mood)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}
