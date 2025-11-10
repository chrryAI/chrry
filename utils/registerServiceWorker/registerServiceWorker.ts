import { FRONTEND_URL } from ".."

const registerServiceWorker =
  async (): Promise<ServiceWorkerRegistration | null> => {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          `${FRONTEND_URL}/sw.js`,
          {
            scope: "/",
            type: "classic", // Explicitly disable module mode
          },
        )
        return registration
      } catch (error) {
        console.error("Service Worker registration failed:", error)
        return null
      }
    } else {
      console.log("Service workers are not supported in this browser")
      return null
    }
  }

export const subscribeToPushNotifications = async (
  registration: ServiceWorkerRegistration,
  publicVapidKey: string,
): Promise<PushSubscription | null> => {
  if (!publicVapidKey) {
    throw new Error("VAPID public key is missing")
  }

  try {
    const permissionResult = await Notification.requestPermission()
    if (permissionResult === "granted") {
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
        }))
      console.log("User is subscribed:", subscription)
      return subscription
    } else {
      console.log("Notification permission denied")
      return null
    }
  } catch (error) {
    console.error("Error subscribing to push notifications:", error)
    return null
  }
}

// Utility to convert VAPID key
const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  if (!base64String) {
    throw new Error("base64String is undefined or empty")
  }
  // Ensure the base64 string is properly padded
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")

  // Check if base64 is valid before decoding
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new Error("Invalid base64 string")
  }

  // Decode base64 to binary string
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export default registerServiceWorker
