import { type ReactElement } from "react"
import { appWithStore } from "./types"
import { getImageSrc } from "./lib"

// Simplified list of most common splash screens
const splashScreenConfigs = [
  // iPhone landscape
  {
    media:
      "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: landscape)",
    file: "iPhone_16_Pro_Max_landscape.png",
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
    file: "iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_landscape.png",
  },
  // iPhone portrait
  {
    media:
      "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)",
    file: "iPhone_16_Pro_Max_portrait.png",
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
    file: "iPhone_14__iPhone_13_Pro__iPhone_13__iPhone_12_Pro__iPhone_12_portrait.png",
  },
]

export default function AppMetadata({
  app,
}: {
  app?: appWithStore
}): ReactElement {
  // Get slug from app prop, fallback to "vex"
  const slug = app?.slug === "chrry" ? "vex" : app?.slug || "vex"

  // Get title from app context, fallback to "Vex"

  const basePath = `/splash_screens/${slug}`

  // Only show splash screens for vex (main app) - other apps may not have them
  const showSplashScreens = slug
    ? ["vex", "peach", "atlas", "bloom", "vault"].includes(slug)
    : false

  return (
    <>
      <link rel="apple-touch-icon" href={getImageSrc({ app, size: 128 }).src} />
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href={getImageSrc({ app, size: 180 }).src}
      />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      <meta name="apple-mobile-web-app-title" content={app?.name} />
      <meta name="mobile-web-app-capable" content="yes" />
      <meta name="mobile-web-app-status-bar-style" content="default" />

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
