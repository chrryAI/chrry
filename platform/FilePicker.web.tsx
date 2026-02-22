"use client"

import { forwardRef } from "react"

export interface FilePickerProps {
  accept?: string
  multiple?: boolean
  onChange?: (event: any) => void
  style?: any
  className?: string
  id?: string
}

const FilePicker = forwardRef<HTMLInputElement, FilePickerProps>(
  ({ accept, multiple, onChange, style, className, id }, ref) => {
    return (
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={onChange}
        style={style}
        className={className}
        id={id}
      />
    )
  },
)

FilePicker.displayName = "FilePicker"

export default FilePicker
