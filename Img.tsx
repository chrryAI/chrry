"use client"

import React, { useState, useEffect } from "react"

import { useImgStyles } from "./Img.styles"
import Loading from "./Loading"
import { ImageIcon } from "./icons"
import { Div, Image as PlatformImage, MotiView, useTheme } from "./platform"
import { useInView } from "./platform/useInView" // Auto-resolves to .web or .native
// Simple in-memory cache
const imageCache = new Map<string, string>()

interface ImgProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  width: number | string
  height?: number | string
  src: string
  alt?: string
  className?: string
  onLoad?: () => void
  containerClass?: string
  dataTestId?: string
  style?: React.CSSProperties
  showLoading?: boolean
  priority?: boolean // Skip lazy loading for above-fold images
  handleDimensionsChange?: (dimensions: {
    width: number
    height: number
  }) => void
}

export default function Img({
  src,
  alt,
  width,
  height,
  containerClass,
  className,
  style,
  dataTestId,
  handleDimensionsChange,
  showLoading = true,
  onLoad,
  ...props
}: ImgProps) {
  const imgStyles = useImgStyles()
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)

  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0,
  })

  const loadImage = async (url: string) => {
    // Check if we're on web
    const isWeb = typeof window !== "undefined"

    // Check cache first
    const cachedUrl = imageCache.get(url)
    if (cachedUrl) {
      setImageSrc(cachedUrl)
      setIsLoading(false)

      // Still get dimensions if needed (web only)
      if (handleDimensionsChange && isWeb) {
        const img = new Image()
        img.src = cachedUrl
        try {
          await img.decode()
          handleDimensionsChange({ width: img.width, height: img.height })
        } catch (e) {}
      }
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // On native, just use the URL directly without blob conversion
      if (!isWeb) {
        setImageSrc(url)
        setIsLoading(false)
        return
      }

      // Web: Use Image object to pre-load and get dimensions
      // This uses browser cache and is much faster than fetch+blob
      const img = new Image()
      img.src = url

      try {
        await img.decode()
        const width = img.width
        const height = img.height
        handleDimensionsChange?.({ width, height })

        // Cache the URL
        imageCache.set(url, url)
        setImageSrc(url)
      } catch (e) {
        // Silently fail if decode/load fails (e.g. 404)
      }
    } catch (e) {
      // Don't show error for network/CORS issues - just fail silently
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  // useEffect(() => {
  //   // Reset image state when src changes
  //   setImageSrc(null)
  //   setError(null)
  // }, [src])

  useEffect(() => {
    if (inView && !imageSrc && !error) {
      loadImage(src)
    }
  }, [inView, imageSrc, error, src])

  useEffect(() => {
    return () => {
      // Don't revoke cached URLs, they're shared
      // The cache cleanup should be handled separately
    }
  }, [])

  const { reduceMotion } = useTheme()

  // Moti animation with reduced motion support

  if (imageSrc) {
    return (
      <Div
        ref={ref}
        className={containerClass}
        style={{ ...imgStyles.container.style, width, height, ...style }}
      >
        <MotiView
          from={{
            opacity: 0,
            translateY: reduceMotion ? 0 : 10,
          }}
          animate={{
            opacity: isLoaded ? 1 : 0,
            translateY: 0,
          }}
          transition={{
            type: reduceMotion ? "timing" : "spring",
            duration: reduceMotion ? 0 : 150,
          }}
          style={{ width: "100%", height: "100%" }}
        >
          <PlatformImage
            src={imageSrc}
            alt={alt}
            className={className}
            style={{
              ...imgStyles.img.style,
              width,
              height,
              ...style,
            }}
            onLoad={() => {
              setIsLoaded(true)
              onLoad?.()
            }}
          />
        </MotiView>
      </Div>
    )
  }

  if (error) return <ImageIcon width={width} height={height} />

  return (
    <Div
      ref={ref}
      className={containerClass}
      style={{ ...imgStyles.container.style, width, height }}
    >
      {isLoading && showLoading && (
        <Div style={{ ...imgStyles.loadingPlaceholder.style, width, height }}>
          <Loading />
        </Div>
      )}
    </Div>
  )
}
