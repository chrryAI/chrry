import React from "react"
import styles from "./Checkbox.module.scss"
import clsx from "clsx"

type CheckboxProps = {
  children: React.ReactNode
  className?: string
  checked?: boolean
  disabled?: boolean
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Checkbox: React.FC<CheckboxProps> = React.forwardRef<
  HTMLInputElement,
  CheckboxProps
>(({ children, className, ...rest }, ref) => {
  return (
    <label className={clsx(styles.formSwitch, className)}>
      <input disabled={rest.disabled} {...rest} ref={ref} type="checkbox" />
      <i></i>
      <span className="checkboxLabel">{children}</span>
    </label>
  )
})

export default Checkbox
