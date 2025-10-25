/**
 * Cross-platform toast utility
 * Web: Uses react-hot-toast
 * Native: Will use react-native-toast-message (placeholder for now)
 */

import webToast from "react-hot-toast"

// For now, just re-export react-hot-toast
// When adding React Native support, we'll add platform detection here
export const toast = {
  success: (message: string, options?: any) => {
    return webToast.success(message, options)
  },
  error: (message: string, options?: any) => {
    return webToast.error(message, options)
  },
  loading: (message: string, options?: any) => {
    return webToast.loading(message, options)
  },
  custom: (message: string, options?: any) => {
    return webToast(message, options)
  },
  promise: webToast.promise,
  dismiss: webToast.dismiss,
}

export default toast
