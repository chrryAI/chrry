"use client"

import { type ReactElement, useMemo } from "react"
import { getImageSrc } from "./lib"
import type { appWithStore } from "./types"
import { generateAppMetadata } from "./utils"

// Simplified list of most common splash screens
const splashScreenConfigs = [
  // iPhone landscape
  {
    media:
      "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    file: "iPhone_17_Pro_Max__iPhone_16_Pro_Max_landscape.png",
  },
  {
    media:
      "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    file: "iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_landscape.png",
  },
  {
    media:
      "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    file: "iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_landscape.png",
  },
  {
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    file: "iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png",
  },
  // iPhone portrait
  {
    media:
      "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    file: "iPhone_17_Pro_Max__iPhone_16_Pro_Max_portrait.png",
  },
  {
    media:
      "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    file: "iPhone_16_Plus__iPhone_15_Pro_Max__iPhone_15_Plus__iPhone_14_Pro_Max_portrait.png",
  },
  {
    media:
      "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    file: "iPhone_16__iPhone_15_Pro__iPhone_15__iPhone_14_Pro_portrait.png",
  },
  {
    media:
      "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    file: "iPhone_16e__iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png",
  },
]

export default function AppMetadata({
  app,
  translations,
  locale,
  currentDomain,
}: {
  app?: appWithStore
  translations: Record<string, any>
  locale: string
  currentDomain: string
}): ReactElement {
  // Get slug from app prop, fallback to "vex"

  // Get title from app context, fallback to "Vex"

  const _iconSrc = app
    ? getImageSrc({
        app,
        size: 180,
      })
    : undefined

  const meta = app
    ? generateAppMetadata({
        app,
        translations,
        locale,
        currentDomain,
      })
    : undefined

  // Get icon from app context or use resize endpoint for proper sizing
  const iconHref = useMemo(() => {
    if (!app) return "/icons/icon-180.png"

    // Use resize endpoint to ensure proper sizing and centering
    const baseIcon = app.images?.[0]?.url || `/images/apps/${app.slug}.png`
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://chrry.dev/api"

    return `${apiUrl}/resize?url=${encodeURIComponent(baseIcon)}&w=180&h=180&fit=contain&q=100`
  }, [app])

  const basePath = `/splash_screens`
  // const manifestPath =
  //   app?.slug === "vex" ? undefined : `/manifests/${app?.slug}.webmanifest`

  // Only show splash screens for vex (main app) - other apps may not have them
  const showSplashScreens = true

  const manifestPath = meta?.manifest?.toString()

  const appTitle = meta?.title?.toString()

  return (
    <>
      {/* Manifest */}
      {manifestPath && (
        <link key="manifest" rel="manifest" href={manifestPath} />
      )}
      {/* App Icon */}
      <link key="apple-touch-icon" rel="apple-touch-icon" href={iconHref} />
      <link
        key="apple-touch-icon-180"
        rel="apple-touch-icon"
        sizes="180x180"
        href={iconHref}
      />
      {/* App Title */}
      <meta
        key="apple-mobile-web-app-title"
        name="apple-mobile-web-app-title"
        content={appTitle}
      />
      {/* Splash Screens - only for main app */}
      {showSplashScreens &&
        splashScreenConfigs.map((config, index) => (
          <link
            key={`splash-${index}`}
            rel="apple-touch-startup-image"
            media={`screen and ${config.media}`}
            href={`${basePath}/${config.file}`}
          />
        ))}
    </>
  )
}
