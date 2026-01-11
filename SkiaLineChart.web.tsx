import React, { useRef, useEffect, useState } from "react"
import { useTheme } from "./context/ThemeContext"
import { useTranslation } from "react-i18next"
import { Dataset } from "./utils/chartTypes"
import { createSmoothPathPoints } from "./utils/chartUtils"
import { Div, Text } from "./platform"

export interface SkiaLineChartProps {
  datasets: Dataset[]
  height: number
  width?: number
  yAxisSuffix?: string
  animated?: boolean
  animationDuration?: number
  pointColor?: string
}

// Helper to generate rainbow colors
function generateRainbowColorsFromBase(
  count: number,
  baseColor: string,
): string[] {
  const colors = []
  for (let i = 0; i < count; i++) {
    const hue = (i / count) * 360
    colors.push(`hsl(${hue}, 70%, 60%)`)
  }
  return colors
}

const SkiaLineChart: React.FC<SkiaLineChartProps> = ({
  datasets,
  height,
  width = 600,
  yAxisSuffix = "",
  animated = true,
  animationDuration = 500,
  pointColor,
}) => {
  const { t } = useTranslation()
  const { colors } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(animated ? 0 : 1)

  // Find global max value
  const allValues = datasets.flatMap((ds) => ds.data.map((d) => d.value))
  const maxValue = Math.max(...allValues, 0.1) * 1.1
  const minValue = 0

  // Chart padding
  const paddingLeft = 0
  const paddingBottom = 28
  const chartWidth = width - paddingLeft
  const chartHeight = height - paddingBottom - 12

  // Animation effect
  useEffect(() => {
    if (!animated) {
      setProgress(1)
      return
    }

    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      const newProgress = Math.min(elapsed / animationDuration, 1)
      setProgress(newProgress)

      if (newProgress < 1) {
        requestAnimationFrame(animate)
      }
    }
    animate()
  }, [datasets, animated, animationDuration])

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid lines
    ctx.strokeStyle = colors.shade2
    ctx.lineWidth = 0.5
    ;[0.25, 0.5, 0.75, 1].forEach((level) => {
      const y = paddingBottom + chartHeight - chartHeight * level
      ctx.beginPath()
      ctx.moveTo(paddingLeft, y)
      ctx.lineTo(paddingLeft + chartWidth, y)
      ctx.stroke()
    })

    // Draw dataset lines
    datasets.forEach((dataset) => {
      if (dataset.data.length < 2) return

      const xStep = chartWidth / (dataset.data.length - 1)

      // Convert data to x,y coordinates
      const points = dataset.data.map((d, idx) => {
        const x = paddingLeft + idx * xStep
        const normalizedValue = (d.value - minValue) / (maxValue - minValue)
        const y = paddingBottom + chartHeight - normalizedValue * chartHeight
        return { x, y }
      })

      // Get smooth path points
      const smoothPoints = createSmoothPathPoints(points, progress)

      // Create gradient
      const gradient = ctx.createLinearGradient(
        paddingLeft,
        0,
        paddingLeft + chartWidth,
        0,
      )
      const rainbowColors = generateRainbowColorsFromBase(
        Math.max(dataset.data.length, 6),
        dataset.color,
      )
      rainbowColors.forEach((color, i) => {
        gradient.addColorStop(i / (rainbowColors.length - 1), color)
      })

      // Draw path
      ctx.strokeStyle = gradient
      ctx.lineWidth = 5
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.globalAlpha = progress

      ctx.beginPath()
      smoothPoints.forEach((point, i) => {
        if (point.type === "move") {
          ctx.moveTo(point.x, point.y)
        } else if (
          point.type === "cubic" &&
          point.c1x &&
          point.c1y &&
          point.c2x &&
          point.c2y
        ) {
          ctx.bezierCurveTo(
            point.c1x,
            point.c1y,
            point.c2x,
            point.c2y,
            point.x,
            point.y,
          )
        }
      })
      ctx.stroke()
      ctx.globalAlpha = 1
    })
  }, [
    datasets,
    width,
    height,
    colors,
    maxValue,
    minValue,
    progress,
    paddingLeft,
    paddingBottom,
    chartWidth,
    chartHeight,
  ])

  return (
    <Div
      style={{
        overflow: "hidden",
        paddingLeft: "8px",
        paddingRight: "8px",
        position: "relative",
      }}
    >
      <Div style={{ position: "relative" }}>
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          style={{
            display: "block",
          }}
        />

        {/* Y-axis labels */}
        <Div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            height: "100%",
            width: "30px",
          }}
        >
          {[0, 0.25, 0.5, 0.75, 1].map((level) => {
            const labelValue = (maxValue * level).toFixed(1)
            return (
              <Text
                key={`label-${level}`}
                style={{
                  position: "absolute",
                  left: "2px",
                  top: `${paddingBottom + chartHeight - chartHeight * level - 8}px`,
                  color: colors.shade6,
                  fontSize: "10px",
                  opacity: progress,
                  width: `${paddingLeft - 6}px`,
                  textAlign: "right",
                }}
              >
                {`${labelValue}${yAxisSuffix}`}
              </Text>
            )
          })}
        </Div>

        {/* X-axis labels */}
        <Div
          style={{
            position: "absolute",
            bottom: "0",
            left: "0",
            width: "100%",
            height: "20px",
          }}
        >
          {datasets[0]?.data?.map((point, index) => {
            const x =
              paddingLeft +
              (chartWidth / (datasets[0]?.data?.length ?? 1 - 1)) * index
            return (
              <Text
                key={`x-label-${index}`}
                style={{
                  position: "absolute",
                  left: `${x - 18}px`,
                  top: `${height - paddingBottom + 2}px`,
                  color: colors.shade8,
                  fontSize: "11px",
                  opacity: progress,
                  width: "36px",
                  textAlign: "center",
                }}
              >
                {point.label}
              </Text>
            )
          })}
        </Div>
      </Div>

      {datasets.length === 0 && (
        <Div
          style={{
            position: "absolute",
            top: "0",
            left: "0",
            right: "0",
            bottom: "0",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: "14px",
              fontWeight: "500",
              color: colors.foreground,
            }}
          >
            {t("Nothing here yet")}
          </Text>
        </Div>
      )}
    </Div>
  )
}

export default SkiaLineChart
