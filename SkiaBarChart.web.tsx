import { useEffect, useRef } from "react"
import { useTheme } from "./context/ThemeContext"
import { Div, Text } from "./platform"
import { type BarData, emojiMap, type Mood } from "./utils/chartTypes"

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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maxValue = Math.max(...data.map((d) => d.value), 1)
  const barWidth = Math.max(18, Math.floor(width / (data.length * 1.5)))
  const gap = Math.floor((width - data.length * barWidth) / (data.length + 1))

  // Mood-based color logic
  function getBarColor(val: number) {
    if (val >= 75) return colors.accent4 // green
    if (val >= 45) return colors.accent1 // yellow
    return colors.accent0 // red
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw bars
    data.forEach((d, i) => {
      const barHeight = (d.value / maxValue) * (height - 40)
      const x = gap + i * (barWidth + gap)
      const y = height - barHeight - 20

      // Draw rounded rectangle (bar)
      ctx.fillStyle = getBarColor(d.value)
      ctx.globalAlpha = 0.8
      ctx.beginPath()
      const radius = 20
      ctx.moveTo(x, y + barHeight)
      ctx.lineTo(x, y + radius)
      ctx.quadraticCurveTo(x, y, x + radius, y)
      ctx.lineTo(x + barWidth - radius, y)
      ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius)
      ctx.lineTo(x + barWidth, y + barHeight)
      ctx.closePath()
      ctx.fill()

      // Draw label
      ctx.globalAlpha = 1
      ctx.fillStyle = colors.shade6
      ctx.font = "12px Inter, sans-serif"
      ctx.textAlign = "center"
      ctx.fillText(d.label, x + barWidth / 2, height - 2)
    })
  }, [data, width, height, colors, maxValue, barWidth, gap])

  return (
    <Div
      style={{
        width: `${width}px`,
        height: `${height + 34}px`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: "block",
        }}
      />
      {/* Emoji+Value labels below chart */}
      <Div
        style={{
          display: "flex",
          flexDirection: "row",
          width: `${width}px`,
          justifyContent: "center",
          marginTop: "10px",
        }}
      >
        {data.map((d, i) => (
          <Div
            key={i}
            style={{
              width: `${barWidth + 20}px`,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: "16px",
                color: colors.foreground,
                textAlign: "center",
              }}
            >
              {formatter(d.value, d.mood)}
            </Text>
          </Div>
        ))}
      </Div>
    </Div>
  )
}
