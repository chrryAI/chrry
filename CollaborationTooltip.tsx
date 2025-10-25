import React from "react"
import { ChevronLeft, ChevronRight, X } from "./icons"
import styles from "./CollaborationTooltip.module.scss"
import clsx from "clsx"

interface CollaborationTooltipProps {
  isVisible: boolean
  step: number
  totalSteps: number
  title: string
  description: string
  onNext: () => void
  onPrevious: () => void
  onClose: () => void
  targetElement?: string // CSS selector for the element to point to
  position?: "top" | "bottom" | "left" | "right"
}

const CollaborationTooltip: React.FC<CollaborationTooltipProps> = ({
  isVisible,
  step,
  totalSteps,
  title,
  description,
  onNext,
  onPrevious,
  onClose,
  targetElement,
  position = "top",
}) => {
  if (!isVisible) return null

  return (
    <>
      {/* Overlay */}
      <div className={styles.overlay} onClick={onClose} />

      {/* Tooltip */}
      <div
        className={clsx(
          styles.tooltip,
          styles[position],
          targetElement && styles.positioned,
        )}
      >
        {/* Arrow */}
        <div className={styles.arrow} />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.stepIndicator}>
            {step} of {totalSteps}
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>
        </div>

        {/* Navigation */}
        <div className={styles.navigation}>
          <button
            className={clsx(styles.navButton, styles.previousButton)}
            onClick={onPrevious}
            disabled={step === 1}
          >
            <ChevronLeft size={16} />
            Previous
          </button>

          <div className={styles.dots}>
            {Array.from({ length: totalSteps }, (_, i) => (
              <div
                key={i}
                className={clsx(styles.dot, i + 1 === step && styles.active)}
              />
            ))}
          </div>

          <button
            className={clsx(styles.navButton, styles.nextButton)}
            onClick={onNext}
            disabled={step === totalSteps}
          >
            {step === totalSteps ? "Finish" : "Next"}
            {step < totalSteps && <ChevronRight size={16} />}
          </button>
        </div>
      </div>
    </>
  )
}

export default CollaborationTooltip
