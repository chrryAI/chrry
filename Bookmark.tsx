"use client"
import React, { useEffect } from "react"
import clsx from "clsx"
import styles from "./Bookmark.module.scss"
import type { thread } from "./types"
import { useAppContext } from "./context/AppContext"
import { isOwner } from "./utils"
import { updateThread } from "./lib"
import { Star } from "./icons"
import { useAuth, useNavigationContext } from "./context/providers"
import { useNavigation } from "./platform"

export default function Bookmark({
  className,
  thread,
  size = 14,
  onClick,
  children,
  onSave,
  dataTestId,
}: {
  defaultBookmarked?: boolean
  className?: string
  thread: thread
  size?: number
  children?: React.ReactNode
  onClick?: (bookmarked: boolean) => void
  onSave?: () => void
  dataTestId: string
}) {
  const { token, user, guest } = useAuth()

  const { threads } = useNavigationContext()

  const [bookmarked, setBookmarkedInternal] = React.useState(
    thread.bookmarks?.some((b) =>
      isOwner(b, { userId: user?.id, guestId: guest?.id }),
    ),
  )

  useEffect(() => {
    threads?.threads.some(
      (t) =>
        t.id === thread.id &&
        t.bookmarks?.some((b) =>
          isOwner(b, { userId: user?.id, guestId: guest?.id }),
        ),
    )
      ? setBookmarkedInternal(true)
      : setBookmarkedInternal(bookmarked)
  }, [threads, bookmarked])

  const setBookmarked = async (bookmarked: boolean) => {
    setBookmarkedInternal(bookmarked)

    onClick?.(bookmarked)

    token &&
      updateThread({
        id: thread.id,
        bookmarked,
        token,
      }).then(() => {
        onSave?.()
      })
  }

  return (
    <button
      onClick={() => setBookmarked(!bookmarked)}
      className={clsx(
        "link",
        styles.star,
        bookmarked && styles.active,
        className,
      )}
      data-testid={`${dataTestId}-${bookmarked ? "bookmarked" : "not-bookmarked"}`}
    >
      {bookmarked ? (
        <Star size={size} color="var(--accent-1)" fill="var(--accent-1)" />
      ) : (
        <Star size={size} color="var(--shade-3)" />
      )}
      {children}
    </button>
  )
}
