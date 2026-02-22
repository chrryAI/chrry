"use client"

import { useData } from "./context/providers"
import Img from "./Img"
import { usePlatform } from "./platform"
import type { app } from "./types"

export default function Logo({
  className,
  showLoading,
  size,
  isMagenta,
  isVivid,
  isLifeOS,
  slug,
  app,
}: {
  className?: string
  size: number
  showLoading?: boolean
  isLifeOS?: boolean
  isMagenta?: boolean
  isVivid?: boolean
  app?: app | null
  slug?: "Atlas" | "Peach" | "Vault" | "Bloom" | string | null
}) {
  const { isExtension } = usePlatform()
  const { FRONTEND_URL } = useData()

  const logoSrc = isLifeOS
    ? `${FRONTEND_URL}/icons/lifeOS-128.png`
    : isExtension
      ? `/icons/icon-128${isMagenta ? "-m" : ""}${isVivid ? "-v" : ""}.png` // Local extension asset
      : `${FRONTEND_URL}/icons/icon-128${isMagenta ? "-m" : ""}${isVivid ? "-v" : ""}.png` // Remote web asset

  const appImage = slug
    ? `${FRONTEND_URL}/images/apps/${slug.toLowerCase()}.png`
    : app && ["atlas", "bloom", "vault", "peach"].includes(app.slug)
      ? `${FRONTEND_URL}/images/apps/${app.slug}.png`
      : app?.images?.[0]?.url
        ? app?.images?.[0]?.url
        : app
          ? `${FRONTEND_URL}/images/pacman/space-invader.png`
          : logoSrc

  return (
    <Img
      key={appImage || logoSrc}
      className={className}
      showLoading={showLoading}
      width={size}
      height={size}
      src={appImage || logoSrc}
      alt={app?.title || slug || "Vex"}
    />
  )
}
