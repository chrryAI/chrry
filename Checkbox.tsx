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
}

const Checkbox: React.FC<CheckboxProps> = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ children, className, checked, disabled, onChange, style }, ref) => {
  const styles = useCheckboxStyles()

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!checked)
    }
  }

  return (
    <Div
      onClick={handleClick}
      className={"formSwitch"}
      style={{
        ...styles.formSwitch.style,
        ...(disabled && { opacity: 0.5, cursor: "not-allowed" }),
        ...style,
      }}
    >
      {/* Hidden native input for accessibility and form integration */}
      <Input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        style={{ display: "none" }}
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
})

Checkbox.displayName = "Checkbox"

export default Checkbox
