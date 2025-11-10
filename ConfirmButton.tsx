"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "./platform"

const ConfirmButton = ({
  children,
  confirm,
  onConfirm,
  transparent,
  resetOnClickOutside = true,
  dataTestId,
  style,
  title,
  disabled,
  confirmTitle,
  onClick,
  ...rest
}: {
  children: React.ReactNode
  confirm: React.ReactNode
  className?: string
  onConfirm: () => void
  transparent?: boolean
  resetOnClickOutside?: boolean
  disabled?: boolean
  dataTestId?: string
  style?: React.CSSProperties
  title?: string
  confirmTitle?: string
  onClick?: () => void
}): React.ReactElement => {
  const [sure, setSure] = useState(false)
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

  return (
    <Button
      title={!sure ? title : confirmTitle}
      disabled={disabled}
      data-testid={dataTestId}
      ref={buttonRef}
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
      <>{sure ? confirm : children}</>
    </Button>
  )
}

export default ConfirmButton
