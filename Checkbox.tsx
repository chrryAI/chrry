"use client"

import React from "react"
import { useCheckboxStyles } from "./Checkbox.styles"
import { Div, Input, Span } from "./platform"

type CheckboxProps = {
  children: React.ReactNode
  className?: string
  checked?: boolean
  disabled?: boolean
  onChange?: (checked: boolean) => void
  style?: React.CSSProperties
  dataTestId?: string
}

const Checkbox: React.FC<CheckboxProps> = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(
  (
    { children, className, checked, disabled, onChange, style, dataTestId },
    ref,
  ) => {
    const styles = useCheckboxStyles()

    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && onChange) {
        onChange(!checked)
      }
    }

    return (
      <Div
        onClick={handleClick}
        className={"formSwitch"}
        data-testid={`${dataTestId}-wrapper`}
        style={{
          ...styles.formSwitch.style,
          ...(disabled && { opacity: 0.5, cursor: "not-allowed" }),
          ...style,
        }}
      >
        {/* Hidden native input for accessibility and form integration */}
        <Input
          id={dataTestId}
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          style={{ display: "none" }}
          data-testid={dataTestId}
        />
        {/* Custom toggle switch */}
        <Div
          className="formSwitchTrack"
          style={{
            ...styles.formSwitchTrack.style,
            ...(checked && styles.formSwitchTrackChecked.style),
          }}
        >
          <Div
            className="formSwitchThumb"
            style={{
              ...styles.formSwitchThumb.style,
              ...(checked && styles.formSwitchThumbChecked.style),
            }}
          />
        </Div>
        <Span className="checkboxLabel" style={styles.formSwitchLabel.style}>
          {children}
        </Span>
      </Div>
    )
  },
)

Checkbox.displayName = "Checkbox"

export default Checkbox
