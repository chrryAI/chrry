import React, { useEffect, useRef } from "react"
import { useTheme } from "./platform"

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
}

interface ParticleBackgroundProps {
  starCount?: number
  className?: string
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  starCount = 150,
  className = "",
}) => {
  const { isDark } = useTheme()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationFrameRef = useRef<number>(0)

  console.log("🌌 ParticleBackground: Rendering, isDarkMode:", isDark)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      console.error("❌ ParticleBackground: Canvas ref is null")
      return
    }

    const ctx = canvas.getContext("2d")
    if (!ctx) {
      console.error("❌ ParticleBackground: Could not get 2d context")
      return
    }

    console.log("✅ ParticleBackground: Canvas initialized", {
      width: window.innerWidth,
      height: window.innerHeight,
    })

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Initialize stars (static positions, twinkling)
    const initStars = () => {
      starsRef.current = Array.from({ length: starCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5, // 0.5-2.5px
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005, // Slow twinkle
        twinklePhase: Math.random() * Math.PI * 2,
      }))
      console.log(`✨ ParticleBackground: Created ${starCount} stars`)
    }
    initStars()

    let frameCount = 0

    // Animation loop
    const animate = () => {
      // Clear canvas completely each frame
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      starsRef.current.forEach((star) => {
        // Update twinkle phase
        star.twinklePhase += star.twinkleSpeed

        // Calculate pulsing opacity (sine wave for smooth grow/shrink)
        const twinkle = Math.sin(star.twinklePhase) * 0.5 + 0.5 // 0 to 1
        const opacity = star.opacity * twinkle

        // Draw star
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
        ctx.fill()

        // Optional: Add subtle glow for brighter stars
        if (opacity > 0.6) {
          const gradient = ctx.createRadialGradient(
            star.x,
            star.y,
            0,
            star.x,
            star.y,
            star.size * 3,
          )
          gradient.addColorStop(0, `rgba(255, 255, 255, ${opacity * 0.3})`)
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)")
          ctx.fillStyle = gradient
          ctx.fill()
        }
      })

      frameCount++
      if (frameCount === 1) {
        console.log("🎬 ParticleBackground: First frame rendered")
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      console.log("🛑 ParticleBackground: Cleaning up")
      window.removeEventListener("resize", resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [starCount])

  // Render canvas even if not dark mode (for debugging)
  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 10,
        background: "#000",
        pointerEvents: "none",
      }}
    />
  )
}
