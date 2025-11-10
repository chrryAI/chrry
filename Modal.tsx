"use client"
import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import styles from "./Modal.module.scss"
import clsx from "clsx"
import { CircleX } from "./icons"
import { useRouter } from "./hooks/useWindowHistory"
import { useAppContext } from "./context/AppContext"
import { useAuth, useNavigationContext } from "./context/providers"
import { useNavigation, useTheme } from "./platform"
import { useHasHydrated } from "./hooks"

export default function Modal({
  title,
  hasCloseButton,
  children,
  onToggle,
  className,
  event,
  params,
  icon,
  scrollable,
  borderHeader = true,
  dataTestId,
  hideOnClickOutside = true,
  ...props
}: {
  hideOnClickOutside?: boolean
  params?: string
  isModalOpen?: boolean
  hasCloseButton?: boolean
  children: React.ReactNode
  title: React.ReactNode
  onToggle?: (open: boolean) => void
  className?: string
  event?: {
    name: string
    props?: Record<string, any>
  }
  scrollable?: boolean
  borderHeader?: boolean
  icon?: React.ReactNode
  dataTestId?: string
}) {
  // Split contexts
  const { track } = useAuth()
  const { addParams, removeParams } = useNavigation()
  const { isDrawerOpen } = useTheme()
  const innerRef = React.useRef<HTMLDivElement>(null)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(
    props.isModalOpen ?? false,
  )

  const hasHydrated = useHasHydrated()

  useEffect(() => {
    setIsModalOpen(props.isModalOpen ?? false)
  }, [props.isModalOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        innerRef.current &&
        !innerRef.current.contains(event.target as Node)
      ) {
        if (isModalOpen && hideOnClickOutside) {
          onToggle ? onToggle?.(false) : setIsModalOpen(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isModalOpen, hideOnClickOutside])

  useEffect(() => {
    if (isModalOpen) {
      if (params) {
        const urlParams = new URLSearchParams(params.split("?")[1] || "")
        const paramKey = Array.from(urlParams.entries())[0]?.[0]
        const paramValue = Array.from(urlParams.entries())[0]?.[1]

        if (paramKey) {
          addParams({ [paramKey]: paramValue || "true" })
        }
      }
      event && track({ ...event, name: event.name + "_open" })
    } else {
      if (params) {
        const urlParams = new URLSearchParams(params.split("?")[1] || "")
        const paramToRemove = Array.from(urlParams.entries())[0]?.[0]

        if (paramToRemove) {
          removeParams([paramToRemove])
        }
      }
    }
  }, [isModalOpen])

  useEffect(() => {
    if (isModalOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY

      // Lock the body scroll
      document.body.style.position = "fixed"
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = "100%"
      document.body.style.overflow = "hidden"

      return () => {
        // Restore the body scroll
        document.body.style.position = ""
        document.body.style.top = ""
        document.body.style.width = ""
        document.body.style.overflow = ""

        // Restore the scroll position
        window.scrollTo(0, scrollY)
      }
    }
  }, [isModalOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggle ? onToggle?.(false) : setIsModalOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isModalOpen])

  return (
    hasHydrated &&
    isModalOpen &&
    createPortal(
      <div className={clsx(styles.modal)} role="dialog" aria-modal="true">
        <div
          className={clsx(
            styles.main,
            className,
            isDrawerOpen && styles.isDrawerOpen,
          )}
        >
          <div
            data-testid={dataTestId}
            className={clsx(styles.inner)}
            ref={innerRef}
          >
            <h4
              className={clsx(
                styles.header,
                borderHeader && styles.borderHeader,
              )}
            >
              {icon}
              <div className={styles.title}>{title}</div>

              {hasCloseButton && (
                <button
                  data-testid={
                    dataTestId
                      ? `${dataTestId}-close-button`
                      : "modal-close-button"
                  }
                  className={clsx(styles.close, "link")}
                  onClick={() => {
                    onToggle ? onToggle?.(false) : setIsModalOpen(false)
                  }}
                >
                  <CircleX size={24} />
                </button>
              )}
            </h4>
            <div
              className={clsx(styles.content, scrollable && styles.scrollable)}
            >
              {children}
            </div>
          </div>
        </div>
      </div>,
      document.getElementById("skeleton") || document.body,
    )
  )
}
