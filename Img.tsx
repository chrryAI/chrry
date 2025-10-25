"use client"

import React, { useState, useEffect } from "react"

import { useImgStyles } from "./Img.styles"
import Loading from "./Loading"
import { ImageIcon } from "./icons"
import { Div } from "./platform"
import { useReducedMotion } from "./platform/animations" // Auto-resolves to .web or .native
import { useInView } from "./platform/useInView" // Auto-resolves to .web or .native
import { AnimatedImage } from "./platform/AnimatedImage" // Auto-resolves to .web or .native
import { apiFetch } from "./utils"
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
    // Check if we're on web (blob URLs only work on web)
    const isWeb = typeof window !== "undefined" && "createObjectURL" in URL

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

      // Web: Use blob URLs for better caching and CORS handling
      const response = await fetch(url)
      if (!response.ok) {
        // Silently fail for 404s - image doesn't exist
        if (response.status === 404) {
          setError(null)
          setIsLoading(false)
          return
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const img = new Image()
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      img.src = blobUrl

      try {
        await img.decode()
        const width = img.width
        const height = img.height
        handleDimensionsChange?.({ width, height })
        onLoad?.()
      } catch (e) {}

      // Cache the blob URL
      imageCache.set(url, blobUrl)
      setImageSrc(blobUrl)
    } catch (e) {
      // Don't show error for network/CORS issues - just fail silently
      setError(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (src) {
      setImageSrc(null)
      setError(null)
    }
  }, [src])

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

  // React Spring animation with reduced motion support
  const reduceMotion = useReducedMotion()

  // Rest of your component remains the same...
  if (imageSrc) {
    return (
      <Div
        ref={ref}
        className={containerClass}
        style={{ ...imgStyles.container.style, width, height }}
      >
        <AnimatedImage
          src={imageSrc}
          alt={alt}
          className={className}
          style={{
            ...imgStyles.img.style,
            width,
            height,
          }}
          isLoaded={isLoaded}
          reduceMotion={reduceMotion}
          onLoad={() => {
            setIsLoaded(true)
            onLoad?.()
          }}
          dataTestId={dataTestId}
        />
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
        <Div style={imgStyles.loadingPlaceholder.style}>
          <Loading />
        </Div>
      )}
    </Div>
  )
}
