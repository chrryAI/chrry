"use client"
import React, { useEffect, useState } from "react"

import { user, subscription } from "./types"
import { MotiView } from "./platform/MotiView"
import {
  useAuth,
  useChat,
  useNavigationContext,
  useData,
  useError,
  useApp,
} from "./context/providers"
import { capitalizeFirstLetter } from "@chrryai/chrry/utils"

import { Button, Div, Input, P, Span, usePlatform, useTheme } from "./platform"

import clsx from "clsx"
import {
  ArrowLeft,
  CircleX,
  Coins,
  SmilePlus,
  LogIn,
  Plus,
  Search,
  UserRound,
  UsersRound,
  UserRoundPlus,
  CircleArrowDown,
  CircleArrowUp,
  AtSign,
  Sparkles,
} from "./icons"
import { Building2 } from "lucide-react"
import { ANALYTICS_EVENTS } from "./utils/analyticsEvents"
import toast from "react-hot-toast"
import Loading from "./Loading"
import { useAppContext } from "./context/AppContext"
import { apiFetch } from "./utils"
import Modal from "./Modal"
import ConfirmButton from "./ConfirmButton"

import Img from "./Image"
import { getFeatures } from "./utils/subscription"
import A from "./a/A"
import { useSubscribeStyles } from "./Subscribe.styles"
import { useStyles } from "./context/StylesContext"
import { useHasHydrated } from "./hooks"

export default function Subscribe({
  customerEmail,
  style,
}: {
  customerEmail?: string // Optional for existing customers
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
  style?: React.CSSProperties
}) {
  const styles = useSubscribeStyles()
  const { utilities } = useStyles()

  const [loading, setLoading] = useState(false)

  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
  const {
    user,
    fetchSession,
    token,
    isExtensionRedirect,
    guest,
    plausible,
    accountApp,
    app,
    setSignInPart,
    setAsk,
    setAbout,
  } = useAuth()

  // Chat context
  const { threadId } = useChat()

  // Navigation context (router is the wrapper)
  const { router, searchParams, removeParam } = useNavigationContext()

  // URL state persistence helper - only update when modal is open
  const updateURLParam = (key: string, value: string) => {
    if (typeof window === "undefined") return
    if (!isModalOpen) return // Don't update URL when modal is closed
    const params = new URLSearchParams(window.location.search)
    params.set(key, value)
    const newUrl = `${window.location.pathname}?${params.toString()}`
    window.history.replaceState({}, "", newUrl)
  }

  const [isGifting, setIsGiftingInternal] = useState(
    searchParams.get("isGifting") === "true",
  )

  const setIsGifting = (value: boolean) => {
    setIsGiftingInternal(value)
    updateURLParam("isGifting", value.toString())
  }

  // Data context
  const {
    affiliateCode,
    API_URL,
    FRONTEND_URL,
    ADDITIONAL_CREDITS,
    CREDITS_PRICE,
    FREE_DAYS,
    PLUS_PRICE,
    PRO_PRICE,
    actions,
  } = useData()

  const { isExtension, BrowserInstance } = usePlatform()

  const {
    plusFeatures,
    memberFeatures,
    proFeatures,
    creditsFeatures,
    grapeFreeFeatures,
    grapePlusFeatures,
    grapeProFeatures,
    pearFreeFeatures,
    pearPlusFeatures,
    pearProFeatures,
    sushiFreeFeatures,
    sushiCoderFeatures,
    sushiArchitectFeatures,
    watermelonFeatures,
    watermelonPlusFeatures,
  } = getFeatures({
    t,
    ADDITIONAL_CREDITS,
    CREDITS_PRICE,
  })

  const { captureException } = useError()
  const { setAppStatus } = useApp()

  const { addHapticFeedback, reduceMotion } = useTheme()
  const [isModalOpen, setIsModalOpen] = React.useState<boolean | undefined>(
    searchParams.get("subscribe") === "true" || undefined,
  )

  useEffect(() => {
    if (searchParams.get("subscribe") === "true") {
      setIsModalOpen(true)
    }
  }, [searchParams])

  const [part, setPartInternal] = useState<"subscription" | "gift">(
    (searchParams.get("part") as "subscription" | "gift") ?? "subscription",
  )

  const setPart = (value: "subscription" | "gift") => {
    setPartInternal(value)
    updateURLParam("part", value)
  }

  const purchaseTypeParam = searchParams.get("purchaseType")

  const [purchaseType, setPurchaseTypeInternal] = useState<
    "subscription" | "gift"
  >((purchaseTypeParam as "subscription") || "subscription")

  const setPurchaseType = (value: "subscription" | "gift") => {
    setPurchaseTypeInternal(value)
    updateURLParam("purchaseType", value)
  }

  const handleCheckout = async (part: "subscription" | "gift") => {
    setPurchaseType(part)
    setPart(part)
    plausible({ name: ANALYTICS_EVENTS.SUBSCRIBE_CHECKOUT })
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set("extension", isExtensionRedirect ? "true" : "false")
      user?.id && params.set("userId", user.id)
      userToGift && params.set("email", userToGift.email)
      isInviting && params.set("email", search)
      guest?.id && params.set("guestId", guest.id)

      const checkoutSuccessUrl = (() => {
        params.set("checkout", "success")
        params.set("purchaseType", part)
        // fingerprint && params.set("fp", fingerprint)
        user && token && params.set("auth_token", token)
        // guest && fingerprint && params.set("fp", fingerprint)

        return `${FRONTEND_URL}/?${params.toString()}&session_id={CHECKOUT_SESSION_ID}`
      })()

      const checkoutCancelUrl = (() => {
        params.set("checkout", "cancel")
        return `${FRONTEND_URL}/?${params.toString()}`
      })()

      // return

      const response = await apiFetch(`${API_URL}/createSubscription`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          customerEmail,
          isExtension: isExtensionRedirect,
          successUrl: checkoutSuccessUrl,
          cancelUrl: checkoutCancelUrl,
          userId: user?.id,
          guestId: guest?.id,
          plan: selectedPlan,
          tier:
            selectedPlan === "grape"
              ? grapeTier
              : selectedPlan === "pear"
                ? pearTier
                : selectedPlan === "coder"
                  ? sushiTier
                  : selectedPlan === "watermelon"
                    ? watermelonTier
                    : undefined,
          affiliateCode,
        }),
      })

      const data = await response.json()
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (err) {
      captureException(err)
      console.error("Checkout error:", err)
      toast.error("Failed to initiate checkout")
      setLoading(false)
    }
  }

  useEffect(() => {
    !isModalOpen &&
      (user || guest) &&
      setSelectedPlan((user || guest)?.subscription?.plan || "plus")
  }, [isModalOpen, user, guest])

  const cleanSessionId = (sessionId: string | null): string => {
    if (!sessionId) return ""

    // Decode URI component first
    let cleaned = decodeURIComponent(sessionId)

    // Remove all question marks (not just trailing)
    cleaned = cleaned.replace(/\?/g, "")

    // Trim whitespace
    cleaned = cleaned.trim()

    return cleaned
  }

  const [giftedFingerPrint, setGiftedFingerPrint] = useState<string | null>(
    null,
  )

  const handlePlanChange = async (newPlan: "plus" | "pro") => {
    setLoading(true)
    try {
      const response = await apiFetch(`${API_URL}/subscriptions/changePlan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          newPlan,
          userId: user?.id,
          guestId: guest?.id,
        }),
      })

      const data = await response.json()
      if (data.success) {
        await fetchSession()
        toast.success(
          newPlan === "pro"
            ? t(`Successfully upgraded to Pro`, {
                newPlan,
              })
            : t(`Successfully downgraded to Plus`),
        )
        // Refresh user data
      } else {
        toast.error(data.error)
      }
    } catch (error) {
      toast.error("Failed to change plan")
    } finally {
      setLoading(false)
    }
  }

  const [loggedIn, setLoggedIn] = useState<boolean>(
    searchParams.get("loggedIn") === "true",
  )

  useEffect(() => {
    if (searchParams.get("loggedIn") === "true") {
      setLoggedIn(true)
    }
  }, [searchParams])

  useEffect(() => {
    if (!user && loggedIn) {
      setSignInPart("login")
    }
  }, [user, loggedIn])

  const verifyPayment = async (sessionId: string) => {
    plausible({ name: ANALYTICS_EVENTS.SUBSCRIBE_VERIFY_PAYMENT })
    const params = new URLSearchParams(window.location.search)
    const isExtensionRedirect = params.get("extension") === "true"
    const userId = params.get("userId")
    const guestId = params.get("guestId")
    const email = params.get("email")
    // Skip if already processed
    const lastProcessed = localStorage.getItem(`session_id`)
    if (lastProcessed === sessionId) return

    localStorage.setItem(`session_id`, sessionId)
    const response = await apiFetch(`${API_URL}/verifyPayment`, {
      method: "POST",
      body: JSON.stringify({
        session_id: cleanSessionId(sessionId),
        userId,
        guestId,
        email,
        plan: selectedPlan,
        tier:
          selectedPlan === "grape"
            ? grapeTier
            : selectedPlan === "pear"
              ? pearTier
              : selectedPlan === "coder"
                ? sushiTier
                : selectedPlan === "watermelon"
                  ? watermelonTier
                  : undefined,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    if (data.success) {
      plausible({ name: ANALYTICS_EVENTS.SUBSCRIBE_VERIFY_PAYMENT })
      if (isExtensionRedirect) {
        toast.success(t(`${t("Subscribed")}. ${t("Reload your extension")} 🧩`))
      } else {
        setPurchaseType(data.gift ? "gift" : "subscription")
        toast.success(
          data.gift
            ? t(`🥰 ${t("Thank you for your gift")}`)
            : data.credits
              ? t(`${t("Credits updated")}`)
              : t(`${t("Subscribed")}`),
        )

        setGiftedFingerPrint(data.fingerprint)
      }

      await fetchSession()
      // Delay modal close to allow state to update
      setTimeout(() => setIsModalOpen(false), 100)
    } else {
      if (data.error) {
        toast.error(data.error)
        plausible({
          name: ANALYTICS_EVENTS.SUBSCRIBE_PAYMENT_VERIFICATION_FAILED,
          props: { error: data.error },
        })
      } else {
        plausible({
          name: ANALYTICS_EVENTS.SUBSCRIBE_PAYMENT_VERIFICATION_FAILED,
        })
        toast.error(t("Payment verification failed"))
      }
    }
  }

  const [isDeletingSubscription, setIsDeletingSubscription] = useState(false)

  const [search, setSearch] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [isInviting, setIsInviting] = useState(false)

  const [userToGift, setUserToGift] = useState<
    (user & { subscription?: subscription }) | null
  >(null)

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSearch = async () => {
    // Validate email format
    if (!isValidEmail(search)) {
      toast.error(t("Please enter a valid email address"))
      return
    }

    try {
      setIsAdding(true)
      const result = await apiFetch(
        `${API_URL}/users?search=${encodeURIComponent(search)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!result.ok) {
        setIsAdding(false)
        if (result.status === 404) {
          setIsInviting(true)
          setIsGifting(false)
          return
        }
        toast.error(t("Failed to fetch users"))
        return
      }

      const data = await result.json()

      if (data.user) {
        setSearch("")
        setUserToGift(data.user)

        return
      }
    } catch (error) {
      toast.error(t("Failed to fetch users"))
    } finally {
      setIsAdding(false)
    }
  }

  const is = useHasHydrated()

  useEffect(() => {
    if (!is) return
    if (typeof window === "undefined" || !window.location) return
    const params = new URLSearchParams(window.location.search)
    if (params.get("checkout") === "success") {
      const sessionId = params.get("session_id")
      if (!sessionId) {
        return
      }

      setTimeout(() => {
        verifyPayment(sessionId)
      }, 100)
    }
  }, [is])

  const [grapeTier, setGrapeTierInternal] = useState<"free" | "plus" | "pro">(
    (searchParams.get("grapeTier") as "free" | "plus" | "pro") ?? "free",
  )
  const [pearTier, setPearTierInternal] = useState<"free" | "plus" | "pro">(
    (searchParams.get("pearTier") as "free" | "plus" | "pro") ?? "free",
  )
  const [sushiTier, setSushiTierInternal] = useState<
    "free" | "coder" | "architect"
  >((searchParams.get("sushiTier") as "free" | "coder" | "architect") ?? "free")
  const [watermelonTier, setWatermelonTierInternal] = useState<
    "standard" | "plus"
  >((searchParams.get("watermelonTier") as "standard" | "plus") ?? "standard")

  const setGrapeTier = (tier: "free" | "plus" | "pro") => {
    setGrapeTierInternal(tier)
    updateURLParam("grapeTier", tier)
    plausible({
      name: ANALYTICS_EVENTS.SUBSCRIBE_TIER_VIEW,
      props: { plan: "grape", tier },
    })
    if (showContact) {
      setShowContact(false)
    }
  }

  const setPearTier = (tier: "free" | "plus" | "pro") => {
    setPearTierInternal(tier)
    updateURLParam("pearTier", tier)
    plausible({
      name: ANALYTICS_EVENTS.SUBSCRIBE_TIER_VIEW,
      props: { plan: "pear", tier },
    })
    if (showContact) {
      setShowContact(false)
    }
  }

  const setSushiTier = (tier: "free" | "coder" | "architect") => {
    setSushiTierInternal(tier)
    updateURLParam("sushiTier", tier)
    plausible({
      name: ANALYTICS_EVENTS.SUBSCRIBE_TIER_VIEW,
      props: { plan: "sushi", tier },
    })
    if (showContact) {
      setShowContact(false)
    }
  }

  const setWatermelonTier = (tier: "standard" | "plus") => {
    setWatermelonTierInternal(tier)
    updateURLParam("watermelonTier", tier)
    plausible({
      name: ANALYTICS_EVENTS.SUBSCRIBE_TIER_VIEW,
      props: { plan: "watermelon", tier },
    })
    if (showContact) {
      setShowContact(false)
    }
  }

  // ... (keeping other lines unchanged conceptually, but replace block needs contiguous)

  const [selectedPlan, setSelectedPlanInternal] = useState<
    | "plus"
    | "pro"
    | "member"
    | "credits"
    | "coder"
    | "coderPlus"
    | "pear"
    | "pearPlus"
    | "grape"
    | "grapePlus"
    | "sushi"
    | "architect"
    | "watermelon"
    | "watermelonPlus"
  >(
    (searchParams.get("plan") as
      | "plus"
      | "pro"
      | "member"
      | "credits"
      | "plus") ?? "plus",
  )

  const setSelectedPlan = (
    plan:
      | "plus"
      | "pro"
      | "member"
      | "credits"
      | "coder"
      | "coderPlus"
      | "pear"
      | "pearPlus"
      | "grape"
      | "grapePlus"
      | "architect"
      | "watermelon"
      | "watermelonPlus",
  ) => {
    setSelectedPlanInternal(plan)
    updateURLParam("plan", plan)
    setAnimationKey((prev) => prev + 1)
  }

  useEffect(() => {
    if (isModalOpen) return
    if (user || guest) {
      ;(user || guest)?.subscription?.plan &&
        setSelectedPlan((user || guest)?.subscription?.plan ?? "plus")
    }
  }, [user, guest, selectedPlan, isModalOpen])

  useEffect(() => {
    if (searchParams.get("plan")) {
      setSelectedPlan(
        searchParams.get("plan") as "plus" | "pro" | "member" | "credits",
      )
    }
  }, [searchParams])

  useEffect(() => {
    if (isModalOpen) return
    setIsAdding(false)
    setIsInviting(false)
    setUserToGift(null)
    setSelectedPlan("plus")
    setIsGifting(false)
    setSearch("")
  }, [isModalOpen])

  const features =
    selectedPlan === "plus"
      ? plusFeatures
      : selectedPlan === "member"
        ? memberFeatures
        : selectedPlan === "pro"
          ? proFeatures
          : selectedPlan === "credits"
            ? creditsFeatures
            : selectedPlan === "grape"
              ? grapeTier === "free"
                ? grapeFreeFeatures
                : grapeTier === "plus"
                  ? grapePlusFeatures
                  : grapeProFeatures
              : selectedPlan === "pear"
                ? pearTier === "free"
                  ? pearFreeFeatures
                  : pearTier === "plus"
                    ? pearPlusFeatures
                    : pearProFeatures
                : selectedPlan === "coder"
                  ? sushiTier === "free"
                    ? sushiFreeFeatures
                    : sushiTier === "coder"
                      ? sushiCoderFeatures
                      : sushiArchitectFeatures
                  : selectedPlan === "watermelon"
                    ? watermelonTier === "standard"
                      ? watermelonFeatures
                      : watermelonPlusFeatures
                    : []
  const shouldShowGift = () => {
    if (isGifting && !userToGift) return false

    if (userToGift?.subscription?.plan === selectedPlan) return false

    // Disable gift for Grape and Pear plans (premium pricing)
    if (
      selectedPlan === "grape" ||
      selectedPlan === "pear" ||
      selectedPlan === "coder" ||
      selectedPlan === "watermelon"
    )
      return false

    return true
  }

  const getCurrentSubscription = () => (user || guest)?.subscription
  const hasSubscription = () => !!getCurrentSubscription()
  const currentPlan = () => getCurrentSubscription()?.plan

  const canDowngradeToPlus = () =>
    selectedPlan === "plus" && currentPlan() === "pro"
  const canUpgradeToPro = () =>
    selectedPlan === "pro" && currentPlan() === "plus"
  const canBuyCredits = () =>
    selectedPlan === "credits" && !isGifting && !isInviting

  const isContact = !!(
    ["coder", "architect"].includes(selectedPlan) ||
    selectedPlan === "watermelon" ||
    (selectedPlan === "grape" && grapeTier) ||
    (selectedPlan === "pear" && pearTier)
  )
  const [contact, setContact] = useState<boolean>(isContact)

  const [showContact, setShowContactInternal] = useState(
    searchParams.get("showContact") === "true",
  )

  const setShowContact = (value: boolean) => {
    setShowContactInternal(value)
    updateURLParam("showContact", value.toString())
  }

  useEffect(() => {
    if (isContact) {
      setContact(true)
      return
    }

    setContact(false)
    setShowContact(false)
  }, [isContact])
  const canSubscribe = () =>
    !hasSubscription() &&
    !isGifting &&
    !isInviting &&
    !(selectedPlan === "grape" && grapeTier === "free") &&
    !(selectedPlan === "pear" && pearTier === "free") &&
    !(selectedPlan === "coder" && sushiTier === "free")
  const hasCurrentPlan = () =>
    currentPlan() === selectedPlan && !isGifting && !isInviting
  const canShowGiftButton = () =>
    selectedPlan !== "member" &&
    selectedPlan !== "grape" &&
    selectedPlan !== "pear" &&
    selectedPlan !== "coder" &&
    (canBuyCredits() ||
      canSubscribe() ||
      !userToGift ||
      !userToGift?.subscription)

  const [animationKey, setAnimationKey] = useState(0)

  return (
    <Div style={style}>
      <Modal
        hideOnClickOutside={false}
        hasCloseButton
        dataTestId="subscribe-modal"
        isModalOpen={isModalOpen}
        params="?subscribe=true"
        onToggle={(open) => {
          setIsModalOpen(open)
          // Clear URL params when modal closes
          if (!open && typeof window !== "undefined") {
            const newUrl = window.location.pathname
            window.history.replaceState({}, "", newUrl)
          }
        }}
        title={
          <>
            {selectedPlan === "credits" ? (
              <Img icon="chrry" size={28} />
            ) : selectedPlan === "grape" ? (
              <Img logo="grape" size={30} />
            ) : selectedPlan === "pear" ? (
              <Img logo="pear" size={30} />
            ) : selectedPlan === "coder" ? (
              <Img logo="sushi" size={30} />
            ) : selectedPlan === "watermelon" ? (
              <Img logo="watermelon" size={30} />
            ) : (
              <Img
                icon={
                  selectedPlan === "pro"
                    ? "raspberry"
                    : selectedPlan === "plus"
                      ? "strawberry"
                      : "chrry"
                }
                showLoading={false}
                size={30}
              />
            )}
            {selectedPlan === "member"
              ? t("Free")
              : selectedPlan === "grape"
                ? t("Grape")
                : selectedPlan === "pear"
                  ? t("Pear")
                  : selectedPlan === "coder"
                    ? t("Sushi")
                    : selectedPlan === "watermelon"
                      ? t("Watermelon")
                      : t(
                          selectedPlan === "credits"
                            ? "Chrry"
                            : selectedPlan === "pro"
                              ? "Raspberry"
                              : selectedPlan === "plus"
                                ? "Strawberry"
                                : "Chrry",
                        )}
            <Div
              style={{
                display: "flex",
                alignItems: "center",
                marginLeft: "auto",
              }}
            >
              <Button
                onClick={() => {
                  addHapticFeedback()
                  const emoji =
                    selectedPlan === "credits"
                      ? "💰"
                      : selectedPlan === "grape"
                        ? "🍇"
                        : selectedPlan === "pear"
                          ? "🍐"
                          : selectedPlan === "coder"
                            ? "🍣"
                            : selectedPlan === "watermelon"
                              ? "🍉"
                              : "🍒"
                  setAsk(
                    `${emoji} ${t(`Tell me more about {{selectedPlan}} plan`, {
                      selectedPlan: capitalizeFirstLetter(selectedPlan),
                      // tier: sushiTier || grapeTier || pearTier,
                    })}`,
                  )
                  setAbout("subscribe")
                  setIsModalOpen(false)
                }}
                className="button link"
                style={{ fontWeight: "normal" }}
              >
                <Sparkles size={18} />
                {t("Ask AI")}
              </Button>
            </Div>
          </>
        }
      >
        <Div
          key={`selectedPlan-${selectedPlan}`}
          style={{ ...styles.plans.style }}
        >
          {selectedPlan === "grape" ? (
            // Grape Tier Selection
            <>
              <Button
                className="transparent"
                onClick={() => {
                  addHapticFeedback()
                  setGrapeTier("free")
                }}
                style={{
                  ...(grapeTier === "free"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <UsersRound size={14} /> {t("Free")}
              </Button>
              <Button
                onClick={() => {
                  addHapticFeedback()
                  setGrapeTier("plus")
                }}
                style={{
                  ...(grapeTier === "plus"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <Plus size={14} /> {t("Plus")}
              </Button>
              <Button
                onClick={() => {
                  addHapticFeedback()
                  setGrapeTier("pro")
                }}
                style={{
                  ...(grapeTier === "pro"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <SmilePlus size={14} /> {t("Pro")}
              </Button>
            </>
          ) : selectedPlan === "pear" ? (
            // Pear Tier Selection
            <>
              <Button
                className="transparent"
                onClick={() => {
                  addHapticFeedback()
                  setPearTier("free")
                }}
                style={{
                  ...(pearTier === "free"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <UsersRound size={14} /> {t("Free")}
              </Button>
              <Button
                onClick={() => {
                  addHapticFeedback()
                  setPearTier("plus")
                }}
                style={{
                  ...(pearTier === "plus"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <Plus size={14} /> {t("Plus")}
              </Button>
              <Button
                onClick={() => {
                  addHapticFeedback()
                  setPearTier("pro")
                }}
                style={{
                  ...(pearTier === "pro"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <SmilePlus size={14} /> {t("Pro")}
              </Button>
            </>
          ) : selectedPlan === "coder" ? (
            // Sushi Tier Selection
            <>
              <Button
                className="transparent"
                onClick={() => {
                  addHapticFeedback()
                  setSushiTier("free")
                }}
                style={{
                  ...(sushiTier === "free"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <Img logo="sushi" size={18} /> {t("Free")}
              </Button>
              <Button
                className="transparent"
                onClick={() => {
                  addHapticFeedback()
                  setSushiTier("coder")
                }}
                style={{
                  ...(sushiTier === "coder"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <Img logo="coder" size={18} /> {t("Coder")}
              </Button>
              <Button
                className="transparent"
                onClick={() => {
                  addHapticFeedback()
                  setSushiTier("architect")
                }}
                style={{
                  ...(sushiTier === "architect"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <Img logo="architect" size={18} /> {t("Architect")}
              </Button>
            </>
          ) : selectedPlan === "watermelon" ? (
            // Watermelon Tier Selection
            <>
              <Button
                className="transparent"
                onClick={() => {
                  addHapticFeedback()
                  setWatermelonTier("standard")
                }}
                style={{
                  ...(watermelonTier === "standard"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <Img logo="watermelon" size={18} /> {t("Agency")}
              </Button>
              <Button
                className="transparent"
                onClick={() => {
                  addHapticFeedback()
                  setWatermelonTier("plus")
                }}
                style={{
                  ...(watermelonTier === "plus"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <Img icon="zarathustra" size={18} /> {t("Sovereign")}
              </Button>
            </>
          ) : (
            // Regular subscription buttons
            <>
              <Button
                data-testid="member-button"
                onClick={() => {
                  addHapticFeedback()
                  setSelectedPlan("member")
                  setUserToGift(null)
                  setIsGifting(false)
                  setIsInviting(false)
                }}
                style={{
                  ...(selectedPlan === "member"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <UsersRound size={14} /> {t("Free")}
              </Button>
              <Button
                onClick={() => {
                  addHapticFeedback()
                  setSelectedPlan("credits")
                  setIsGifting(false)
                  setIsInviting(false)
                }}
                style={{
                  ...(selectedPlan === "credits"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <Coins size={14} /> {t("Credits")}
              </Button>
              <Button
                onClick={() => {
                  addHapticFeedback()
                  setSelectedPlan("plus")
                  setIsGifting(false)
                  setIsInviting(false)
                }}
                style={{
                  ...(selectedPlan === "plus"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <Plus size={14} /> {t("Plus")}
              </Button>
              <Button
                onClick={() => {
                  addHapticFeedback()
                  setSelectedPlan("pro")
                  setIsGifting(false)
                  setIsInviting(false)
                }}
                style={{
                  ...(selectedPlan === "pro"
                    ? utilities.inverted.style
                    : utilities.transparent.style),
                }}
              >
                <SmilePlus size={14} /> {t("Pro")}
              </Button>
            </>
          )}
        </Div>
        <Div
          data-testid={`subscribe-features`}
          className={"features"}
          style={{ ...styles.features.style }}
        >
          {features.map((feature, i) => (
            <MotiView
              key={`${i + 1}-${animationKey}`}
              from={{ opacity: 0, translateY: 0, translateX: -10 }}
              animate={{ opacity: 1, translateY: 0, translateX: 0 }}
              transition={{
                duration: reduceMotion ? 0 : 100,
                delay: reduceMotion ? 0 : (i + 1) * 25,
              }}
            >
              <Div className={"feature"} style={{ ...styles.feature.style }}>
                {feature.emoji} {feature.text}
              </Div>
            </MotiView>
          ))}
          {affiliateCode ? (
            (selectedPlan === "plus" ||
              selectedPlan === "pro" ||
              selectedPlan === "credits") && (
              <MotiView
                key={`999-${animationKey}`}
                from={{ opacity: 0, translateY: 0, translateX: -10 }}
                animate={{ opacity: 1, translateY: 0, translateX: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 100,
                  delay: reduceMotion ? 0 : (features.length + 1) * 25,
                }}
              >
                <Div
                  style={{ ...styles.feature.style, color: "var(--accent-4)" }}
                >
                  🎁 {t("+30% bonus credits from referral")}
                </Div>
              </MotiView>
            )
          ) : (
            <>
              {/* <MotiView
                key={`0-${animationKey}`}
                from={{ opacity: 0, translateY: 0, translateX: -10 }}
                animate={{ opacity: 1, translateY: 0, translateX: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 100,
                  delay: reduceMotion ? 0 : 0,
                }}
              >
                <Div className={clsx(styles.feature, "feature")}>
                  <A href={"mailto:iliyan@chrry.ai"} className={"link"}>
                    <Img logo="isVivid" icon="heart" width={16} height={16} />
                    {t("Need a white label like Vex?")}
                  </A>
                </Div>
              </MotiView> */}
              <MotiView
                key={`1000-${animationKey}`}
                from={{ opacity: 0, translateY: 0, translateX: -10 }}
                animate={{ opacity: 1, translateY: 0, translateX: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 100,
                  delay: reduceMotion
                    ? 0
                    : ((selectedPlan === "plus"
                        ? plusFeatures
                        : selectedPlan === "member"
                          ? memberFeatures
                          : selectedPlan === "pro"
                            ? proFeatures
                            : selectedPlan === "credits"
                              ? creditsFeatures
                              : []
                      ).length +
                        1) *
                      25,
                }}
              >
                <Div className={clsx(styles.feature, "feature")}>
                  <A openInNewTab href={"https://chrry.dev"} className={"link"}>
                    <Img logo="chrry" width={16} height={16} />
                    {t("AGPLv3")}. {t("Open Source")}
                  </A>
                </Div>
              </MotiView>
              <MotiView
                key={`1001-${animationKey}`}
                from={{ opacity: 0, translateY: 0, translateX: -10 }}
                animate={{ opacity: 1, translateY: 0, translateX: 0 }}
                transition={{
                  duration: reduceMotion ? 0 : 100,
                  delay: reduceMotion
                    ? 0
                    : ((selectedPlan === "plus"
                        ? plusFeatures
                        : selectedPlan === "member"
                          ? memberFeatures
                          : selectedPlan === "pro"
                            ? proFeatures
                            : selectedPlan === "credits"
                              ? creditsFeatures
                              : []
                      ).length +
                        2) *
                      25,
                }}
              >
                <Div className={clsx(styles.feature, "feature")}>
                  <A
                    style={{
                      color: "#f87171",
                    }}
                    href={"/affiliate"}
                    className={"link"}
                  >
                    <Img
                      showLoading={false}
                      icon="heart"
                      width={16}
                      height={16}
                    />{" "}
                    {t("Affiliate")}
                  </A>
                </Div>
              </MotiView>
            </>
          )}
          <Div
            key={`selectedPlan-${selectedPlan}`}
            style={{
              ...styles.plans.style,
              marginBottom: "0rem",
              marginTop: "0.2rem",
            }}
          >
            <Button
              className="transparent"
              data-testid="grape-button"
              onClick={() => {
                addHapticFeedback()
                setSelectedPlan(selectedPlan === "grape" ? "member" : "grape")
                setUserToGift(null)
                setIsGifting(false)
                setIsInviting(false)
              }}
              style={{
                ...(selectedPlan === "grape"
                  ? utilities.inverted.style
                  : utilities.transparent.style),
              }}
            >
              {selectedPlan === "grape" ? (
                <>
                  <Img icon="chrry" width={18} height={18} /> {t("Chrry")}
                </>
              ) : (
                <>
                  <Img logo="grape" width={18} height={18} /> {t("Grape")}
                </>
              )}
            </Button>

            <Button
              className="transparent"
              onClick={() => {
                addHapticFeedback()
                setSelectedPlan(selectedPlan === "pear" ? "member" : "pear")
                setIsGifting(false)
                setIsInviting(false)
              }}
              style={{
                ...(selectedPlan === "pear"
                  ? utilities.inverted.style
                  : utilities.transparent.style),
              }}
            >
              {selectedPlan === "pear" ? (
                <>
                  <Img icon="chrry" width={18} height={18} /> {t("Chrry")}
                </>
              ) : (
                <>
                  <Img logo="pear" width={18} height={18} /> {t("Pear")}
                </>
              )}
            </Button>
            <Button
              className="transparent"
              onClick={() => {
                addHapticFeedback()
                setSelectedPlan(selectedPlan === "coder" ? "member" : "coder")
                setIsGifting(false)
                setIsInviting(false)
              }}
              style={{
                ...(selectedPlan === "coder"
                  ? utilities.inverted.style
                  : utilities.transparent.style),
              }}
            >
              {selectedPlan === "coder" ? (
                <>
                  <Img icon="chrry" width={18} height={18} /> {t("Chrry")}
                </>
              ) : (
                <>
                  <Img logo="sushi" width={18} height={18} /> {t("Sushi")}
                </>
              )}
            </Button>

            {/* <Button
              className="transparent"
              onClick={() => {
                addHapticFeedback()
                setSelectedPlan("coder")
                setIsGifting(false)
                setIsInviting(false)
              }}
              style={{
                ...(selectedPlan === "coder"
                  ? utilities.inverted.style
                  : utilities.transparent.style),
              }}
            >
              <Img logo="coder" width={18} height={18} /> {t("Coder")}
            </Button>
            <Button
              className="transparent"
              onClick={() => {
                addHapticFeedback()
                setSelectedPlan("architect")
                setIsGifting(false)
                setIsInviting(false)
              }}
              style={{
                ...(selectedPlan === "architect"
                  ? utilities.inverted.style
                  : utilities.transparent.style),
              }}
            >
              <Img logo="architect" width={18} height={18} /> {t("Architect")}
            </Button> */}
            <Button
              className="transparent"
              onClick={() => {
                addHapticFeedback()
                setSelectedPlan(
                  selectedPlan === "watermelon" ? "member" : "watermelon",
                )
                setIsGifting(false)
                setIsInviting(false)
              }}
              style={{
                ...(selectedPlan === "watermelon"
                  ? utilities.inverted.style
                  : utilities.transparent.style),
              }}
            >
              {selectedPlan === "watermelon" ? (
                <>
                  <Img icon="chrry" width={18} height={18} /> {t("Chrry")}
                </>
              ) : (
                <>
                  <Img logo="watermelon" width={18} height={18} /> {t("WM")}
                </>
              )}
            </Button>
          </Div>
        </Div>
        <Div style={{ ...styles.gift.style }}>
          {userToGift?.subscription && selectedPlan !== "credits" ? (
            <Div style={{ ...styles.userToGift.style }}>
              <Button
                style={{ ...styles.backButton.style }}
                onClick={() => {
                  addHapticFeedback()
                  setUserToGift(null)
                }}
              >
                <ArrowLeft size={20} />
              </Button>

              <p>
                {userToGift?.email} {t(`already subscribed`)}
              </p>
            </Div>
          ) : userToGift ? (
            <Div style={{ ...styles.userToGift.style }}>
              <Div style={{ ...styles.userToGift.style }}>
                <Button
                  style={{ ...styles.backButton.style }}
                  onClick={() => {
                    addHapticFeedback()
                    setUserToGift(null)
                  }}
                >
                  <ArrowLeft size={20} />
                </Button>
                <P>{userToGift?.email}</P>
              </Div>
            </Div>
          ) : (
            isGifting && (
              <Div style={{ ...styles.invite.style }}>
                <Button
                  style={{
                    ...utilities.transparent.style,
                    ...styles.backButton.style,
                  }}
                  className="transparent"
                  onClick={() => {
                    addHapticFeedback()
                    setIsGifting(false)
                    setSearch("")
                    setUserToGift(null)
                    setIsInviting(false)
                  }}
                >
                  <ArrowLeft size={20} />
                </Button>

                <Input
                  data-testid="subscribe-gift-input"
                  style={{ ...styles.inviteInput.style }}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setIsInviting(false)
                  }}
                  type="email"
                  placeholder={`🥰 ${t("Search by email")}*`}
                />
                <Button
                  data-testid="subscribe-gift-search"
                  onClick={() => {
                    addHapticFeedback()
                    handleSearch()
                  }}
                >
                  {isAdding ? (
                    <Loading width={22} color="white" height={22} />
                  ) : (
                    <>
                      <Search size={22} />
                    </>
                  )}
                </Button>
              </Div>
            )
          )}
        </Div>
        <Div style={{ ...styles.checkoutButtonContainer.style, marginTop: -3 }}>
          {selectedPlan !== "member" &&
          (selectedPlan === "watermelon" ||
            selectedPlan === "pro" ||
            selectedPlan === "plus" ||
            selectedPlan === "credits" ||
            (selectedPlan === "grape" && grapeTier !== "free") ||
            (selectedPlan === "pear" && pearTier !== "free") ||
            (selectedPlan === "architect" && pearTier !== "free") ||
            (selectedPlan === "coder" && sushiTier !== "free")) ? (
            <>
              {canDowngradeToPlus() && (
                <ConfirmButton
                  confirm={
                    <>
                      {loading && part === "subscription" ? (
                        <Loading size={20} />
                      ) : (
                        <>
                          <CircleArrowDown size={20} />
                        </>
                      )}
                      {t("Are you sure?")}{" "}
                    </>
                  }
                  data-testid="subscribe-checkout"
                  onConfirm={() => {
                    addHapticFeedback()
                    handlePlanChange("plus")
                  }}
                  className={clsx(styles.checkoutButton, "transparent")}
                >
                  {loading && part === "subscription" ? (
                    <Loading size={20} color="#fff" />
                  ) : (
                    <>
                      <CircleArrowDown size={20} />
                      {t("Downgrade with", {
                        price: PLUS_PRICE,
                      })}
                    </>
                  )}
                </ConfirmButton>
              )}
              {canUpgradeToPro() && (
                <Button
                  data-testid="subscribe-checkout"
                  onClick={() => {
                    addHapticFeedback()
                    handlePlanChange("pro")
                  }}
                  style={{ ...styles.checkoutButton.style }}
                >
                  {loading && part === "subscription" ? (
                    <Loading size={20} color="#fff" />
                  ) : (
                    <>
                      <CircleArrowUp size={20} />
                      {t("Upgrade for", {
                        price: PRO_PRICE,
                      })}
                    </>
                  )}
                </Button>
              )}
              {canBuyCredits() || canSubscribe() ? (
                <Button
                  className="small"
                  data-testid="subscribe-checkout"
                  onClick={() => {
                    addHapticFeedback()

                    if (contact) {
                      setShowContact(true)

                      if (showContact) {
                        window.location.href = "mailto:iliyan@chrry.ai"
                        return
                      }
                      return
                    }
                    handleCheckout("subscription")
                  }}
                  style={{
                    ...styles.checkoutButton.style,
                    marginTop: ".5rem",
                  }}
                >
                  {loading && part === "subscription" ? (
                    <Loading color="#fff" />
                  ) : (
                    <>
                      {selectedPlan === "plus" || selectedPlan === "credits" ? (
                        <Coins />
                      ) : showContact ? (
                        <AtSign />
                      ) : (
                        <SmilePlus />
                      )}
                      {selectedPlan === "credits" ? (
                        <Span>
                          {t("credits_pricing", {
                            credits: ADDITIONAL_CREDITS,
                            price: `${CREDITS_PRICE}.00`,
                          })}
                        </Span>
                      ) : (
                        <Span>
                          {t(showContact ? "Contact" : "pricing", {
                            freeDays: FREE_DAYS,
                            price:
                              selectedPlan === "grape"
                                ? grapeTier === "plus"
                                  ? "50" // Grape Plus: €50/month
                                  : "500" // Grape Pro: €500/month
                                : selectedPlan === "pear"
                                  ? pearTier === "plus"
                                    ? "50" // Pear Plus: €50/month
                                    : "500" // Pear Pro: €500/month
                                  : selectedPlan === "coder"
                                    ? sushiTier === "coder"
                                      ? "50"
                                      : "500"
                                    : selectedPlan === "watermelon"
                                      ? watermelonTier === "standard"
                                        ? "1000"
                                        : "5000"
                                      : selectedPlan === "plus"
                                        ? PLUS_PRICE
                                        : PRO_PRICE,
                          })}
                        </Span>
                      )}
                    </>
                  )}
                </Button>
              ) : (
                hasCurrentPlan() && (
                  <Div>
                    {!user && guest?.subscription && (
                      <Button
                        data-testid="migrate-button"
                        className="link"
                        onClick={() => {
                          addHapticFeedback()
                          setSignInPart("register")
                        }}
                        style={{ ...utilities.link.style }}
                      >
                        <LogIn size={20} />
                        {t("Migrate your subscription")}
                      </Button>
                    )}
                    <ConfirmButton
                      className="transparent"
                      style={{
                        ...utilities.transparent.style,
                        ...styles.cancelSubscriptionButton.style,
                      }}
                      confirm={
                        <>
                          {isDeletingSubscription ? (
                            <Loading width={16} height={16} />
                          ) : (
                            <CircleX color="var(--accent-0)" size={16} />
                          )}
                          {t("Are you sure?")}
                        </>
                      }
                      onConfirm={async () => {
                        if (!token) {
                          captureException("User not authenticated")
                          return
                        }

                        try {
                          setIsDeletingSubscription(true)
                          const result = await actions.deleteSubscription()

                          if (result.error || !result) {
                            toast.error(t("Failed to cancel subscription"))
                            return
                          }
                        } catch (error) {
                          captureException(error)
                          console.error("Failed to cancel subscription:", error)
                          toast.error(t("Failed to cancel subscription"))
                        } finally {
                          setIsDeletingSubscription(false)
                        }

                        toast.success(t("Subscription cancelled successfully"))

                        await fetchSession()
                      }}
                    >
                      <CircleX size={16} color="var(--accent-0)" />{" "}
                      {t("Cancel subscription")}
                      <Span style={{ marginLeft: "auto", fontSize: 13 }}>
                        €
                        {t("{{price}}/month", {
                          price:
                            selectedPlan === "pro" ? PRO_PRICE : PLUS_PRICE,
                        })}
                      </Span>
                    </ConfirmButton>
                  </Div>
                )
              )}
              {shouldShowGift() && (
                <Div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isInviting && (
                    <Button
                      className="transparent"
                      style={{
                        ...utilities.transparent.style,
                        ...styles.backButton.style,
                      }}
                      onClick={() => {
                        addHapticFeedback()
                        setIsInviting(false)
                      }}
                    >
                      <ArrowLeft size={22} />
                    </Button>
                  )}
                  <Button
                    className="inverted"
                    data-testid="subscribe-gift"
                    data-part={isInviting ? "invite" : "gift"}
                    onClick={() => {
                      addHapticFeedback()
                      if (!isGifting && !isInviting) {
                        setIsGifting(true)
                        return
                      }

                      handleCheckout("gift")
                    }}
                    style={{
                      ...utilities.inverted.style,
                      ...styles.giftButton.style,
                    }}
                  >
                    {loading && part === "gift" ? (
                      <Loading width={22} height={22} />
                    ) : (
                      <>
                        <>🎁</>
                        <Span> {isInviting ? t("Invite") : t("Gift")}</Span>
                      </>
                    )}
                  </Button>
                </Div>
              )}
            </>
          ) : guest ? (
            <>
              <Button
                className="inverted"
                onClick={() => {
                  addHapticFeedback()
                  setSignInPart("register")
                }}
                style={{
                  ...utilities.inverted.style,
                  ...styles.button.style,
                  marginTop: ".3rem",
                }}
              >
                <UserRoundPlus size={20} />
                {t("Register")}
              </Button>
              <Button
                data-testid="login-button"
                className="link"
                onClick={() => {
                  addHapticFeedback()
                  setSignInPart("login")
                }}
                style={{
                  ...utilities.link.style,
                  ...styles.button.style,
                  marginTop: ".3rem",
                }}
              >
                <LogIn size={18} />
                {t("Login")}
              </Button>
            </>
          ) : (
            !user?.subscription &&
            (selectedPlan === "member" ||
              (selectedPlan === "grape" && grapeTier === "free") ||
              ((selectedPlan === "sushi" ||
                selectedPlan === "coder" ||
                selectedPlan === "architect") &&
                sushiTier === "free") ||
              (selectedPlan === "pear" && pearTier === "free")) && (
              <Button
                className={accountApp ? "transparent" : "inverted"}
                data-testid="current-plan"
                style={{
                  ...styles.currentPlanButton.style,
                  marginTop: 7.5,
                  padding: "5px 10px",
                  fontSize: 15,
                }}
                onClick={() => {
                  if (!accountApp) {
                    setAppStatus({
                      part: "highlights",
                      step: "add",
                    })
                    setIsModalOpen(false)
                  }
                }}
              >
                {!accountApp && app ? (
                  <Img
                    logo={
                      selectedPlan === "grape"
                        ? "grape"
                        : selectedPlan === "pear"
                          ? "pear"
                          : selectedPlan === "coder" ||
                              selectedPlan === "sushi" ||
                              selectedPlan === "architect"
                            ? "sushi"
                            : selectedPlan === "member"
                              ? "chrry"
                              : "watermelon"
                    }
                    size={26}
                  />
                ) : (
                  <UserRound size={20} />
                )}{" "}
                {t(accountApp ? "Current Plan" : "Create your agent")}
              </Button>
            )
          )}
        </Div>
        {isGifting ? (
          <Div style={{ ...styles.subscribeAsGuest.style }}>
            *
            {t(
              selectedPlan === "credits"
                ? "You can gift credits to anyone with an email"
                : "You can gift subscription anyone with an email",
            )}
          </Div>
        ) : !user && (selectedPlan === "pro" || selectedPlan === "plus") ? (
          guest?.subscription ? (
            <></>
          ) : (
            <Div style={{ ...styles.subscribeAsGuest.style }}>
              {t("Subscribe as guest!")}
              <Button
                onClick={() => {
                  addHapticFeedback()
                  setSignInPart("login")
                }}
                className="link"
                style={{ marginLeft: "8px" }}
              >
                {t("Already have an account?")}
              </Button>
              <p>*{t("You can migrate your account whenever you want")}</p>
            </Div>
          )
        ) : null}
      </Modal>
      {user?.subscription || guest?.subscription ? (
        <>
          {(() => {
            const subs = user?.subscription || guest?.subscription
            if (!subs) return

            return (
              <Button
                onClick={() => {
                  if (isExtension) {
                    BrowserInstance?.runtime?.sendMessage({
                      action: "openInSameTab",
                      url: `${FRONTEND_URL}?subscribe=true&extension=true&plan=${subs.plan}&loggedIn=${!!user}`,
                    })

                    return
                  }
                  addHapticFeedback()
                  setIsModalOpen(true)
                }}
                data-testid={`${subs.plan}-button`}
                style={{ ...styles.plusButton.style, ...style }}
              >
                <Img
                  icon={subs.plan === "pro" ? "raspberry" : "strawberry"}
                  showLoading={false}
                  size={18}
                />
                {t(subs.plan === "pro" ? "Pro" : "Plus")}
              </Button>
            )
          })()}

          {/* {isDevelopment && (
          <span style={{ color: "var(--accent-6)", fontSize: 11 }}>(dev)</span>
        )} */}
        </>
      ) : (
        <Button
          className="transparent"
          data-gifted-fingerprint={giftedFingerPrint}
          data-testid={`subscribe-button`}
          id="subscribeButton"
          onClick={() => {
            addHapticFeedback()
            if (isExtension) {
              BrowserInstance?.runtime?.sendMessage({
                action: "openInSameTab",
                url: `${FRONTEND_URL}?subscribe=true&extension=true`,
              })

              return
            }
            setIsModalOpen(true)
          }}
          disabled={loading}
          style={{
            ...utilities.transparent.style,
            ...utilities.small.style,
            ...styles.subscribeButton.style,
          }}
        >
          <Img icon="strawberry" showLoading={false} size={18} />
          {t("Plus")}
        </Button>
      )}
      {giftedFingerPrint && (
        <Input
          data-testid="gifted-fingerprint"
          type="hidden"
          value={giftedFingerPrint}
        />
      )}
      <Input data-testid="purchase-type" type="hidden" value={purchaseType} />
    </Div>
  )
}
