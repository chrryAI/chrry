import React from "react"
import EmojiPickerReact, {
  EmojiClickData,
  Theme,
  SuggestionMode,
} from "emoji-picker-react"
import { EmojiPickerProps } from "./EmojiPicker"
import { Div } from "./platform"

const EmojiPicker = ({
  onEmojiClick,
  open,
  onClose,
  isDark,
  width,
  height,
  previewConfig,
  skinTonesDisabled,
  lazyLoadEmojis,
}: EmojiPickerProps) => {
  if (!open) return null

  return (
    <Div
      style={{
        position: "absolute",
        zIndex: 1000,
        bottom: "100%",
        left: 0,
        marginBottom: 10,
      }}
    >
      <Div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 999,
        }}
        onClick={onClose}
      />
      <Div style={{ position: "relative", zIndex: 1000 }}>
        <EmojiPickerReact
          onEmojiClick={(emojiData: EmojiClickData) => {
            onEmojiClick({ emoji: emojiData.emoji })
          }}
          theme={isDark ? Theme.DARK : Theme.LIGHT}
          suggestedEmojisMode={SuggestionMode.RECENT}
          lazyLoadEmojis={lazyLoadEmojis}
          width={width}
          height={height}
          previewConfig={previewConfig}
          skinTonesDisabled={skinTonesDisabled}
        />
      </Div>
    </Div>
  )
}

export default EmojiPicker
