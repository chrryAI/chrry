import type React from "react"
import { useState } from "react"
import { PanResponder, Text, View } from "react-native"
import { usePlatform } from "./platform"

interface SwipeableTimeControlProps {
  value: number
  onValueChange: (newValue: number) => void
  isMinute?: boolean
  disabled?: boolean
  style?: any
  Up: React.ReactNode
  Down: React.ReactNode
  time: number
}

const SwipeableTimeControl = ({
  value,
  onValueChange,
  isMinute = false,
  disabled = false,
  style,
  Up,
  Down,
}: SwipeableTimeControlProps) => {
  const { os } = usePlatform()
  const [_startY, setStartY] = useState(0)

  const maxValue = isMinute ? 59 : Infinity
  const minValue = 0

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !disabled,
    onMoveShouldSetPanResponder: () => !disabled,
    onPanResponderGrant: () => {
      setStartY(0)
    },
    onPanResponderMove: (_, gestureState) => {
      const sensitivity = os === "ios" ? 30 : 20
      const diff = Math.round(-gestureState.dy / sensitivity)

      if (diff !== 0) {
        const newValue = Math.max(minValue, Math.min(maxValue, value + diff))
        if (newValue !== value) {
          onValueChange(newValue)
        }
      }
    },
  })

  return (
    <View
      {...panResponder.panHandlers}
      style={[
        {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          ...style,
        },
      ]}
    >
      <View>{Up}</View>

      <View style={{ marginVertical: 10 }}>
        <Text
          style={{
            fontSize: 40,
            fontWeight: "200",
            textAlign: "center",
            fontFamily: os === "ios" ? "Menlo" : "monospace",
            color: "#000",
          }}
        >
          {value.toString().padStart(2, "0")}
        </Text>
      </View>

      <View>{Down}</View>
    </View>
  )
}

export default SwipeableTimeControl
