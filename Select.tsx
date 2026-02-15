"use client"

import React from "react"
import { CircleArrowDown } from "./icons"

import {
  Div,
  Select as PlatformSelect,
  type SelectProps as PlatformSelectProps,
} from "./platform"
import { useSelectStyles } from "./Select.styles"

export interface SelectProps extends Omit<PlatformSelectProps, "options"> {
  options: { value: string; label: string }[]
  dataTestId?: string
}

export default function Select({
  options,
  defaultValue,
  value,
  name,
  onChange,
  onValueChange,
  style,
  id,
  disabled,
  required,
  dataTestId,
  ...rest
}: SelectProps) {
  const styles = useSelectStyles()
  const generatedId = React.useId()

  return (
    <Div style={{ ...styles.customSelect.style, ...style }}>
      <PlatformSelect
        className={"select"}
        name={name}
        dataTestId={dataTestId}
        id={id || generatedId}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
        options={options}
        style={{ ...styles.select.style }}
        {...styles.select.handlers}
        {...rest}
      />
      <CircleArrowDown
        size={15}
        color="var(--shade-6)"
        style={styles.icon.style}
      />
    </Div>
  )
}
