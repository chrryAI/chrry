"use client"
import React, { useEffect, useState } from "react"
import { Modal as RNModal } from "react-native"
import { CircleX } from "./icons"
import { useAuth } from "./context/providers"
import {
  Button,
  Div,
  H4,
  toRem,
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
  borderHeader = true,
  dataTestId,
  hideOnClickOutside = true,
  style,
  ...props
}: {
  hideOnClickOutside?: boolean
  params?: string
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
  style?: any
}) {
  const { viewPortWidth } = usePlatform()
  const { isDrawerOpen } = useTheme()

  const hasHydrated = useHasHydrated()

  const { track } = useAuth()

  const [isModalOpen, setIsModalOpen] = useState(
    props.isModalOpen !== undefined ? props.isModalOpen : false,
  )

  useEffect(() => {
    if (props.isModalOpen !== undefined) {
      setIsModalOpen(props.isModalOpen)
    }
  }, [props.isModalOpen])

  const toggleModal = () => {
    const newState = !isModalOpen
    setIsModalOpen(newState)
    onToggle?.(newState)

    if (event && newState) {
      track(event)
    }
  }

  const styles = useModalStyles()
  const { utilities } = useStyles()

  return (
    <RNModal
      visible={hasHydrated && isModalOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={toggleModal}
    >
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
      </Div>
    </RNModal>
  )
}
