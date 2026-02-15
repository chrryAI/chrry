"use client"
import React, { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import { CircleX } from "./icons"
import { useAuth } from "./context/providers"
import {
  Button,
  Div,
  H4,
  toRem,
  useNavigation,
  usePlatform,
  useTheme,
  Video,
} from "./platform"
import { useHasHydrated } from "./hooks"
import { FRONTEND_URL } from "./utils"
import { useModalStyles } from "./Modal.styles"
import { useStyles } from "./context/StylesContext"

export default function Modal({
  title,
  hasCloseButton,
  children,
  onToggle,
  event,
  params,
  icon,
  scrollable,
  id,
  borderHeader = true,
  dataTestId,
  hideOnClickOutside = true,
  style,
  ...props
}: {
  hideOnClickOutside?: boolean
  params?: string
  id?: string
  isModalOpen?: boolean
  hasCloseButton?: boolean
  children: React.ReactNode
  title: React.ReactNode
  onToggle?: (open: boolean) => void
  event?: {
    name: string
    props?: Record<string, any>
  }
  scrollable?: boolean
  borderHeader?: boolean
  icon?: React.ReactNode | "blob"
  dataTestId?: string
  style?: React.CSSProperties
}) {
  const { viewPortHeight, viewPortWidth } = usePlatform()
  const styles = useModalStyles()
  const { utilities } = useStyles()
  // Split contexts
  const { plausible } = useAuth()
  const { addParams, removeParams, searchParams } = useNavigation()
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

    if (typeof window !== "undefined" && document.addEventListener) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => {
        document.removeEventListener("mousedown", handleClickOutside)
      }
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
      event && plausible({ ...event, name: event.name + "_open" })
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
      if (typeof window !== "undefined" && document.body) {
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
    }
  }, [isModalOpen])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onToggle ? onToggle?.(false) : setIsModalOpen(false)
      }
    }

    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("keydown", handleKeyDown)
      return () => {
        window.removeEventListener("keydown", handleKeyDown)
      }
    }
  }, [isModalOpen])

  useEffect(() => {
    if (isModalOpen && innerRef.current) {
      innerRef.current.focus()
    }
  }, [isModalOpen])

  return (
    hasHydrated &&
    isModalOpen &&
    createPortal(
      <Div style={{ ...styles.modal.style }} role="dialog" aria-modal="true">
        <Div
          style={{
            ...styles.main.style,
            ...(isDrawerOpen ? styles.mainIsDrawerOpen.style : {}),
            maxWidth: viewPortWidth < 501 ? "100%" : toRem(450),
            minWidth: viewPortWidth > 501 ? toRem(450) : undefined,
            width:
              viewPortWidth < 431
                ? "inherit"
                : viewPortWidth < 501
                  ? "100%"
                  : "auto",

            ...style,
          }}
        >
          <Div
            className="slideUp"
            data-testid={dataTestId}
            style={styles.inner.style}
            ref={innerRef}
            id={id}
            tabIndex={-1}
          >
            <H4
              style={{
                ...styles.header.style,
                ...(borderHeader
                  ? { borderBottom: "1px dashed var(--shade-2)" }
                  : {}),
              }}
            >
              {icon === "blob" ? (
                <Video
                  style={styles.video.style}
                  src={`${FRONTEND_URL}/video/blob.mp4`}
                  autoPlay
                  loop
                  muted
                  playsInline
                ></Video>
              ) : (
                icon
              )}
              <Div style={styles.title.style}>{title}</Div>

              {hasCloseButton && (
                <Button
                  className="link"
                  data-testid={
                    dataTestId
                      ? `${dataTestId}-close-button`
                      : "modal-close-button"
                  }
                  style={{ ...styles.close.style, ...utilities.link.style }}
                  aria-label="Close modal"
                  onClick={() => {
                    onToggle ? onToggle?.(false) : setIsModalOpen(false)
                  }}
                >
                  <CircleX size={24} />
                </Button>
              )}
            </H4>
            <Div
              style={{
                ...styles.content.style,
                ...(scrollable ? styles.contentScrollable.style : {}),
              }}
            >
              {children}
            </Div>
          </Div>
        </Div>
      </Div>,
      document.getElementById("skeleton") || document.body,
    )
  )
}
