"use client"

/// <reference types="chrome" />

import React, { useContext, useEffect, useState } from "react"
import styles from "./EnableNotifications.module.scss"
import { BellDot, BellRing } from "./icons"
import clsx from "clsx"

import Loading from "./Loading"
import { customPushSubscription, pushSubscription } from "./types"
import registerServiceWorker, {
  subscribeToPushNotifications,
} from "./utils/registerServiceWorker"
import { useAppContext } from "./context/AppContext"
import { useAuth } from "./context/providers"
import { apiFetch } from "./utils"
import { usePlatform } from "./platform"
import { useMediaQuery } from "usehooks-ts"
import { platform } from "os"
import AddToHomeScreen from "./AddToHomeScreen"
import toast from "react-hot-toast"
import Weather from "./Weather"

export default function EnableNotifications({
  className,
  text = "Notifications",
  onLocationClick,
}: {
  text?: string
  className?: string
  onLocationClick?: (location: string) => void
}) {
  const [isMounted, setIsMounted] = useState(false)

  // Split contexts for better organization
  const { t } = useAppContext()

  const { isExtension } = usePlatform()

  // Auth context
  const { user, token, guest, API_URL } = useAuth()

  // Platform context
  const { os, isStandalone, device } = usePlatform()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const [swRegistration, setSwRegistration] =
    useState<ServiceWorkerRegistration | null>(null)

  const [isSubscribed, setIsSubscribed] = useState<boolean | undefined>(
    undefined,
  )

  const [showAddToHomeScreen, setShowAddToHomeScreen] = useState(false)

  async function addPushSubscription(
    subscription: PushSubscription,
    p256dh: ArrayBuffer,
    auth: ArrayBuffer,
  ) {
    const response = await apiFetch(`${API_URL}/pushSubscriptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(
            String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh))),
          ),
          auth: btoa(
            String.fromCharCode.apply(null, Array.from(new Uint8Array(auth))),
          ),
        },
      }),
    })

    const result = await response.json()
    return result
  }

  const [pushSubscription, setPushSubscription] =
    useState<customPushSubscription | null>()

  useEffect(() => {
    if (!token) return

    // Handle extension notifications - just check permission status
    if (isExtension) {
      if (typeof chrome !== "undefined" && chrome.notifications) {
        chrome.notifications.getPermissionLevel((level) => {
          setIsSubscribed(level === "granted")
        })
      } else {
        setIsSubscribed(false)
      }
      return
    }
    const initializeServiceWorker = async () => {
      // First check if notification permission is already granted
      if ("Notification" in window) {
        const permission = Notification.permission

        if (permission === "granted") {
          // If already granted, check for subscription
          const registration = await registerServiceWorker()
          if (registration) {
            setSwRegistration(registration)
            const subscription =
              await registration.pushManager.getSubscription()

            if (subscription) {
              const result = await apiFetch(`${API_URL}/pushSubscription`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ endpoint: subscription.endpoint }),
              })

              const data = await result.json()

              if (data.subscription) {
                setPushSubscription(data.subscription)
                setIsSubscribed(true)
                return
              } else {
                const p256dh = subscription.getKey("p256dh")
                const auth = subscription.getKey("auth")

                if ((user || guest) && p256dh && auth) {
                  const result = await addPushSubscription(
                    subscription,
                    p256dh,
                    auth,
                  )

                  if (!result.error && result.subscription) {
                    setPushSubscription(result.subscription)
                    setIsSubscribed(true)
                  } else {
                    toast.error(result.error)
                  }
                }

                return
              }
            }
          }
        }
      }

      // If we get here, either permission isn't granted or no subscription exists
      const registration = await registerServiceWorker()
      if (registration) {
        setSwRegistration(registration)
        setIsSubscribed(false)
      }
    }

    initializeServiceWorker()
  }, [token])

  const handleSubscribe = async () => {
    // Handle extension notifications - just request permission, no database storage
    if (isExtension) {
      if (typeof chrome !== "undefined" && chrome.notifications) {
        chrome.notifications.getPermissionLevel((level) => {
          if (level === "granted") {
            setIsSubscribed(true)
          } else {
            chrome.permissions.request(
              { permissions: ["notifications"] },
              (granted) => {
                setIsSubscribed(granted)
              },
            )
          }
        })
      }
      return
    }

    if (!isStandalone && (os === "ios" || os === "android")) {
      setShowAddToHomeScreen(true)
      return
    }
    if (swRegistration && !pushSubscription) {
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!

      const subscription = await subscribeToPushNotifications(
        swRegistration,
        publicVapidKey,
      )
      if (subscription) {
        setIsSubscribed(true)

        const p256dh = subscription.getKey("p256dh")
        const auth = subscription.getKey("auth")

        if (user && p256dh && auth) {
          addPushSubscription(subscription, p256dh, auth)
        }
      }
    }
  }

  // Show notification button for extensions if permission not granted, for web if service worker ready
  const shouldShow =
    (device === "desktop" || isStandalone) &&
    !isExtension &&
    (user || guest)?.lastMessage &&
    isSubscribed === false &&
    swRegistration

  return (
    <div className={clsx(styles.enableNotificationsContainer, className)}>
      <Weather
        onLocationClick={onLocationClick}
        showLocation={!shouldShow}
        className={clsx(
          styles.weather,
          !shouldShow && styles.withoutNotifications,
        )}
      />

      {isMounted && shouldShow && (
        <div className={clsx(styles.enableNotifications, os && styles[os])}>
          <button
            data-testid="enableNotificationsButton"
            onClick={handleSubscribe}
            className={clsx(styles.enableNotificationsButton, "small")}
            disabled={!swRegistration}
          >
            <BellRing size={16} /> {t(text)}
          </button>
        </div>
      )}
    </div>
  )
}
