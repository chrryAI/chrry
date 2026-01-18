import { FRONTEND_URL } from ".."
import console from "../../utils/log"

const registerServiceWorker =
  async (): Promise<ServiceWorkerRegistration | null> => {
    // Temporarily disable service worker to prevent reload loop
    return null

    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(
          `${FRONTEND_URL}/sw.js`,
          {
            scope: "/",
            type: "classic", // Explicitly disable module mode
            updateViaCache: "none", // Always check for SW updates
          },
        )

        // Check for updates immediately
        registration.update()

        // Listen for new service worker installation
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing
          if (!newWorker) return

          // Track if this is an update (not first install)
          const isUpdate = !!navigator.serviceWorker.controller

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "activated" && isUpdate) {
              // Only reload on updates, not first install
              console.log("Service worker updated, reloading page...")
              window.location.reload()
            } else if (newWorker.state === "activated") {
              console.log("Service worker installed (first time)")
            }
          })
        })

        // Listen for controller change (new SW took over)
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          console.log("Service worker controller changed")
        })

        console.log("Service Worker registered successfully")
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

/**
 * Manually check for service worker updates
 */
export const checkForServiceWorkerUpdate = async (): Promise<boolean> => {
  if ("serviceWorker" in navigator) {
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration) {
      await registration.update()
      return true
    }
  }
  return false
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
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey) as any,
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
  // Ensure the buffer is explicitly typed as ArrayBuffer, not ArrayBufferLike
  return new Uint8Array(outputArray.buffer as ArrayBuffer)
}

export default registerServiceWorker
