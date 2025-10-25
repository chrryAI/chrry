"use client"
import { app, appWithStore, store } from "./types"

import React, { useEffect } from "react"
import Img from "./Img"
import { COLORS, useAppContext } from "./context/AppContext"
import { usePlatform } from "./platform"
import { useApp, useData } from "./context/providers"
import {
  DeepSeek,
  OpenAI,
  Claude,
  Gemini,
  Flux,
  Perplexity,
} from "@lobehub/icons"

export default function ImageComponent(props: {
  slug?: "atlas" | "peach" | "vault" | "bloom"

  className?: string
  size?: number
  title?: string
  showLoading?: boolean
  dataTestId?: string
  src?: string
  logo?: "lifeOS" | "isMagenta" | "isVivid" | "vex" | "chrry"
  icon?:
    | "spaceInvader"
    | "pacman"
    | "heart"
    | "plus"
    | "hamster"
    | "frog"
    | "calendar"
    | "deepSeek"
    | "perplexity"
    | "claude"
    | "chatGPT"
    | "gemini"
    | "flux"
    | "chrry"
    | "raspberry"
    | "strawberry"

  app?: appWithStore
  width?: number | string
  height?: number | string
  style?: React.CSSProperties
  alt?: string
  containerClass?: string
  onLoad?: () => void
  store?: store
}) {
  const {
    className,
    showLoading,
    size = 128,
    slug,
    logo,
    app,
    store,
    title,
    alt,
    src,
    icon,
    width,
    height,
    style,
    containerClass,
    dataTestId,
    onLoad,
  } = props

  const { isExtension } = usePlatform()

  const { PROD_FRONTEND_URL, FRONTEND_URL } = useData()

  const BASE_URL = isExtension ? PROD_FRONTEND_URL : FRONTEND_URL

  const { appFormWatcher, canEditApp } = useApp()
  const iconSrc = icon
    ? icon === "spaceInvader"
      ? `${BASE_URL}/images/pacman/space-invader.png`
      : icon === "pacman"
        ? `${BASE_URL}/images/pacman/pacman.png`
        : icon === "heart"
          ? `${BASE_URL}/images/pacman/heart.png`
          : icon === "plus"
            ? `${BASE_URL}/icons/plus-128.png`
            : icon === "hamster"
              ? `${BASE_URL}/hamster.png`
              : icon === "frog"
                ? `${BASE_URL}/frog.png`
                : icon === "calendar"
                  ? `${BASE_URL}/icons/calendar-128.png`
                  : `${BASE_URL}/icons/${icon}-128.png`
    : null

  const logoSrc =
    logo === "chrry" || store?.slug === "explore"
      ? `${BASE_URL}/logo/cherry-500.png`
      : logo === "lifeOS" || store?.slug === "lifeOS"
        ? `${BASE_URL}/icons/lifeOS-128.png`
        : logo === "vex" || store?.slug === "vex"
          ? `${BASE_URL}/icons/icon-128.png`
          : logo
            ? `${BASE_URL}/icons/icon-128${logo === "isMagenta" ? "-m" : ""}${logo === "isVivid" ? "-v" : ""}.png`
            : null // Remote web asset

  // Pick the right image size based on requested size
  // images array: [512px, 192px, 180px, 128px, 32px]
  const getImageBySize = (size: number) => {
    if (!app?.images?.length) return null
    if (size <= 32) return app.images[4]?.url // 32px
    if (size <= 128) return app.images[3]?.url // 128px
    if (size <= 180) return app.images[2]?.url // 180px
    if (size <= 192) return app.images[1]?.url // 192px
    return app.images[0]?.url // 512px
  }

  const appImageSrc =
    logo || store
      ? null
      : app &&
          ["atlas", "bloom", "vault", "peach", "vex", "chrry"].includes(
            app.slug,
          )
        ? `${BASE_URL}/images/apps/${app.slug}.png`
        : getImageBySize(size) ||
          app?.image ||
          (slug
            ? `${BASE_URL}/icons/${slug}-128.png`
            : canEditApp
              ? appFormWatcher.image || iconSrc
              : iconSrc) // Remote web asset

  const finalSrc =
    src ||
    logoSrc ||
    (!app && iconSrc) ||
    appImageSrc ||
    `${BASE_URL}/images/pacman/space-invader.png`

  useEffect(() => {
    setTimeout(() => {
      onLoad?.()
    }, 500)
  }, [app?.onlyAgent && !app.image])

  const finalWidth = parseInt(width?.toString() || size?.toString())
  const finalHeight = parseInt(height?.toString() || size?.toString())
  let finalSize = parseInt(size?.toString() || finalWidth.toString())
  finalSize = finalSize
  if (app?.onlyAgent && !app.image) {
    const color =
      COLORS[app?.themeColor as keyof typeof COLORS] || "var(--accent-6)"
    return app.defaultModel === "deepSeek" ? (
      <DeepSeek color={color} size={finalSize} />
    ) : app.defaultModel === "chatGPT" ? (
      <OpenAI color={color} size={finalSize} />
    ) : app.defaultModel === "claude" ? (
      <Claude color={color} size={finalSize} />
    ) : app.defaultModel === "gemini" ? (
      <Gemini color={color} size={finalSize} />
    ) : app.defaultModel === "flux" ? (
      <Flux color={color} size={finalSize} />
    ) : app.defaultModel === "perplexity" ? (
      <Perplexity color={color} size={finalSize} />
    ) : null
  }

  return (
    <Img
      onLoad={onLoad}
      dataTestId={dataTestId}
      containerClass={containerClass}
      style={style}
      className={className}
      showLoading={showLoading}
      width={finalWidth}
      height={finalHeight}
      title={title}
      src={finalSrc}
      alt={alt || app?.title || logo ? "Vex" : ""}
    />
  )
}
