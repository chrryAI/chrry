"use client"

import clsx from "clsx"
import { defaultLocale } from "./locales"
import Thread from "./Thread"
import { app } from "./types"
import { useAuth } from "./context/providers"

export default function Home({
  className,
  slug,
}: {
  className?: string
  app?: app
  slug?: string
}): React.ReactElement {
  const { language } = useAuth()

  return (
    <div
      data-url={language === defaultLocale ? "/" : `/${language}`}
      className={clsx(className)}
    >
      <Thread isHome />
    </div>
  )
}
