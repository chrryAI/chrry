"use client"

import React from "react"
import { useCheckboxStyles } from "./Checkbox.styles"
import { Div, Input, Label, Span } from "./platform"

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
    const generatedId = React.useId()
    const inputId = `checkbox-${generatedId}`

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      e.stopPropagation()
      if (!disabled && onChange) {
        onChange(e.target.checked)
      }
    }

    return (
      <Label
        htmlFor={inputId}
        className={"formSwitch"}
        data-testid={dataTestId ? `${dataTestId}-wrapper` : undefined}
        style={{
          ...styles.formSwitch.style,
          ...(disabled && { opacity: 0.5 }),
          ...style,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {/* Hidden native input for accessibility and form integration */}
        <Input
          id={inputId}
          ref={ref}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={handleChange}
          style={{
            position: "absolute",
            width: 1,
            height: 1,
            padding: 0,
            margin: -1,
            overflow: "hidden",
            clip: "rect(0, 0, 0, 0)",
            whiteSpace: "nowrap",
            border: 0,
            opacity: 0,
          }}
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
      </Label>
    )
  },
)

Checkbox.displayName = "Checkbox"

export default Checkbox
