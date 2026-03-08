export interface EmojiPickerProps {
  onEmojiClick: (emojiData: { emoji: string }) => void
  open: boolean
  onClose: () => void
  isDark?: boolean
  width?: number | string
  height?: number | string
  previewConfig?: {
    showPreview?: boolean
    defaultEmoji?: string
    defaultCaption?: string
  }
  skinTonesDisabled?: boolean
  lazyLoadEmojis?: boolean
}

const EmojiPicker = (props: EmojiPickerProps) => {
  // Default to web implementation for SSR/Web
  const WebEmojiPicker = require("./EmojiPicker.web").default
  return <WebEmojiPicker {...props} />
}

export default EmojiPicker
