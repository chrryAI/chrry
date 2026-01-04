import React from "react"
import EmojiPickerModal from "rn-emoji-keyboard"
import { EmojiPickerProps } from "./EmojiPicker"

const EmojiPicker = ({
  onEmojiClick,
  open,
  onClose,
  isDark,
}: EmojiPickerProps) => {
  return (
    <EmojiPickerModal
      onEmojiSelected={(emojiObject) => {
        onEmojiClick({ emoji: emojiObject.emoji })
      }}
      open={open}
      onClose={onClose}
      theme={{
        container: isDark ? "#1a1a1a" : "#ffffff",
        header: isDark ? "#1a1a1a" : "#ffffff",
        category: {
          icon: isDark ? "#ffffff" : "#000000",
          iconActive: "#007AFF",
          container: isDark ? "#1a1a1a" : "#ffffff",
          containerActive: isDark ? "#2a2a2a" : "#f0f0f0",
        },
      }}
    />
  )
}

export default EmojiPicker
