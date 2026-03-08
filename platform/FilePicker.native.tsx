import { forwardRef, useImperativeHandle } from "react"
import { View } from "react-native"

export interface FilePickerProps {
  accept?: string
  multiple?: boolean
  onChange?: (event: any) => void
  style?: any
  className?: string
  id?: string
}

const FilePicker = forwardRef<any, FilePickerProps>(({ style }, ref) => {
  useImperativeHandle(ref, () => ({
    click: () => {
      console.warn(
        "FilePicker.click() is not implemented on native yet. You need to install a library like expo-document-picker or react-native-document-picker.",
      )
    },
  }))

  return <View style={style} />
})

FilePicker.displayName = "FilePicker"

export default FilePicker
