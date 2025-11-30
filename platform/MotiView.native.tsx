import React from "react"
import { View } from "react-native"

/**
 * Native MotiView wrapper - simplified to avoid Reanimated issues
 * Just renders children without animations for now
 */
export const MotiView = ({ children, style, ...props }: any) => {
  return (
    <View style={style} {...props}>
      {children}
    </View>
  )
}

export type MotiViewProps = any
