"use client"

import { useEffect, useRef, useState } from "react"
import { useAuth } from "./context/providers"
import { Trash2 } from "./icons"
import Loading from "./Loading"
import { Button, Span } from "./platform"

const ConfirmButton = ({
  children = (
    <>
      <Trash2 color="var(--accent-1)" size={16} />
    </>
  ),
  confirm,
  onConfirm,
  transparent,
  resetOnClickOutside = true,
  dataTestId,
  style,
  title,
  confirmTitle,
  disabled,
  onClick,
  processing,
  dataDeleted,
  "aria-label": ariaLabel,
  ...rest
}: {
  children?: React.ReactNode
  confirm?: React.ReactNode
  className?: string
  onConfirm: () => void
  transparent?: boolean
  resetOnClickOutside?: boolean
  disabled?: boolean
  dataTestId?: string
  style?: React.CSSProperties
  title?: string
  confirmTitle?: string
  processing?: boolean
  dataDeleted?: boolean
  onClick?: () => void
  "aria-label"?: string
}): React.ReactElement => {
  const { burn } = useAuth()
  const [sure, setSure] = useState(burn)

  useEffect(() => {
    setSure(burn)
  }, [burn])

  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        resetOnClickOutside && setSure(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Smart label handling for accessibility
  // 1. Prefer explicit aria-label
  // 2. Fallback to title
  // 3. Fallback to "Delete" default
  const baseLabel = ariaLabel || title || "Delete"
  const accessibleLabel = sure
    ? confirmTitle || `Confirm ${baseLabel}`
    : baseLabel

  return (
    <Button
      title={!sure ? title : confirmTitle}
      aria-label={accessibleLabel}
      disabled={disabled}
      data-testid={dataTestId}
      ref={buttonRef}
      data-deleted={dataDeleted}
      style={{
        ...(transparent
          ? {
              backgroundColor: sure ? "var(--background)" : "transparent",
              color: sure ? "var(--accent-0)" : "var(--link-color)",
              padding: sure ? "0.5rem 1rem" : "0",
              border: sure ? "1px solid var(--accent-0)" : "none",
            }
          : undefined),
        ...style,
      }}
      type="button"
      onClick={() => {
        onClick?.()
        if (!sure) {
          setSure(true)
          return
        }

        onConfirm()
      }}
      {...rest}
    >
      <>
        {sure ? (
          confirm ? (
            confirm
          ) : (
            <>
              {processing ? (
                <Loading color="var(--accent-0)" size={16} />
              ) : (
                <Span style={{ width: "16px", height: "16px" }}>🔥</Span>
              )}
            </>
          )
        ) : (
          children
        )}
      </>
    </Button>
  )
}

export default ConfirmButton
