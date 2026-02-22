/**
 * Cross-Platform Toast Component
 * Wraps react-hot-toast for web and provides native alternative
 */

import { type ToasterProps, Toaster as WebToaster } from "react-hot-toast"
import { useData } from "../context/providers/DataProvider"
import { usePlatform } from "./PlatformProvider"

// Use the actual types from react-hot-toast
type ToastProps = ToasterProps

export function Toast({ containerStyle, toastOptions }: ToastProps) {
  const { isWeb } = usePlatform()

  if (isWeb) {
    return (
      <WebToaster containerStyle={containerStyle} toastOptions={toastOptions} />
    )
  }

  // For React Native, we'd use a different toast library
  // like react-native-toast-message or react-native-toast-notifications
  // For now, return null as placeholder
  return null
}

// Convenience component with default Vex styling
export function VexToast() {
  const { FRONTEND_URL } = useData()
  const { isCapacitor, os } = usePlatform()

  const toastConfig: ToastProps = {
    containerStyle: {
      zIndex: 10000,
      ...(isCapacitor && os === "ios" ? { top: 60 } : {}),
    },
    toastOptions: {
      style: {
        fontSize: "0.875rem",
        color: "var(--background)",
        backgroundColor: "var(--foreground)",
        boxShadow: "var(--shadow)",
        borderRadius: "1.25rem",
        zIndex: 10000,
      },
      success: {
        icon: (
          <img
            src={`${FRONTEND_URL}/frog.png`}
            width={24}
            height={24}
            alt="Success"
          />
        ) as any, // Type assertion needed for JSX elements
      },
      error: {
        icon: (
          <img
            src={`${FRONTEND_URL}/hamster.png`}
            width={24}
            height={24}
            alt="Error"
          />
        ) as any, // Type assertion needed for JSX elements
      },
    },
  }

  return <Toast {...toastConfig} />
}
