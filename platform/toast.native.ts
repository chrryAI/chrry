// Platform-agnostic toast for React Native
import Toast from "react-native-toast-message"

const toast = (message: string) => {
  Toast.show({
    type: "info",
    text1: message,
  })
  return null
}

toast.success = (message: string) => {
  Toast.show({
    type: "success",
    text1: message,
  })
  return null
}

toast.error = (message: string) => {
  Toast.show({
    type: "error",
    text1: message,
  })
  return null
}

toast.loading = (message: string) => {
  Toast.show({
    type: "info",
    text1: message,
  })
  return null
}

toast.dismiss = () => {
  Toast.hide()
}

toast.promise = <T>(
  promise: Promise<T>,
  msgs: {
    loading: string
    success: string
    error: string
  },
): Promise<T> => {
  Toast.show({
    type: "info",
    text1: msgs.loading,
  })

  return promise
    .then((result) => {
      Toast.show({
        type: "success",
        text1: msgs.success,
      })
      return result
    })
    .catch((error) => {
      Toast.show({
        type: "error",
        text1: msgs.error,
      })
      throw error
    })
}

export default toast
export { toast }
