import type React from "react"
import { StyleSheet, View } from "react-native"

export interface VideoProps {
  src: string
  autoPlay?: boolean
  loop?: boolean
  muted?: boolean
  playsInline?: boolean
  controls?: boolean
  style?: any
  className?: string
  width?: number | string
  height?: number | string
}

const Video: React.FC<VideoProps> = ({ style, width, height }) => {
  // Extract objectFit from style for cross-platform compatibility
  // On web, objectFit is a CSS property. On native, we'd use resizeMode on Video component
  const { objectFit, ...restStyle } = style || {}

  // Map objectFit to resizeMode for when you implement a real Video component
  // const resizeMode = objectFit === 'cover' ? 'cover' : objectFit === 'contain' ? 'contain' : 'stretch'

  // React Native doesn't have built-in video support
  // You would need to use expo-av or react-native-video
  // For now, return a placeholder View
  // When implementing with expo-av or react-native-video, use:
  // <Video source={{ uri: src }} resizeMode={resizeMode} style={restStyle} />

  return (
    <View
      style={[
        styles.placeholder,
        restStyle,
        width && { width },
        height && { height },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  placeholder: {
    backgroundColor: "#000",
    borderRadius: 8,
  },
})

export default Video
