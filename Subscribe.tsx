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
} from "./context/providers"
import { Button, Div, Input, P, Span, usePlatform, useTheme } from "./platform"
import { v4 as uuidv4 } from "uuid"

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
} from "./icons"
import toast from "react-hot-toast"
import Loading from "./Loading"
import { useAppContext } from "./context/AppContext"
import { apiFetch, isE2E } from "./utils"
import Modal from "./Modal"
import ConfirmButton from "./ConfirmButton"

import Img from "./Image"
import { getFeatures } from "./utils/subscription"
import A from "./A"
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
  const [isGifting, setIsGifting] = useState(false)

  // Split contexts for better organization
  const { t } = useAppContext()

  // Auth context
  const {
    user,
    fetchSession,
    token,
    isExtensionRedirect,
    guest,
    track,
    fingerprint,
    setSignInPart,
  } = useAuth()

  // Chat context
  const { threadId } = useChat()

  // Navigation context (router is the wrapper)
  const { router, searchParams, removeParam } = useNavigationContext()

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

  const { plusFeatures, memberFeatures, proFeatures, creditsFeatures } =
    getFeatures({
      t,
      ADDITIONAL_CREDITS,
      CREDITS_PRICE,
    })

  const { captureException } = useError()

  const { addHapticFeedback, reduceMotion } = useTheme()
  const [isModalOpen, setIsModalOpen] = React.useState<boolean | undefined>(
    searchParams.get("subscribe") === "true" || undefined,
  )

  useEffect(() => {
    if (searchParams.get("subscribe") === "true") {
      setIsModalOpen(true)
    }
  }, [searchParams])

  const [part, setPart] = useState<"subscription" | "gift">("subscription")

  const purchaseTypeParam = searchParams.get("purchaseType")

  const [purchaseType, setPurchaseType] = useState<"subscription" | "gift">(
    (purchaseTypeParam as "subscription" | "gift") || "subscription",
  )

  const handleCheckout = async (part: "subscription" | "gift") => {
    setPurchaseType(part)
    setPart(part)
    track({ name: "subscribe_checkout" })
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

        return `${FRONTEND_URL}/?${params.toString()}&session_id={CHECKOUT_SESSION_ID}`
      })()

      const checkoutCancelUrl = (() => {
        params.set("checkout", "cancel")
        return `${FRONTEND_URL}/?${params.toString()}`
      })()

      console.log("Checkout success URL:", checkoutSuccessUrl)
      console.log("Checkout cancel URL:", checkoutCancelUrl)

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

  const [checkoutFingerPrint, setCheckoutFingerPrintInternal] = useState<
    string | null
  >()

  const setCheckoutFingerPrint = (fp: string) => {
    if (!isE2E) return
    setCheckoutFingerPrintInternal(fp)
  }

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

  const verifyPayment = async (sessionId: string) => {
    track({ name: "subscribe_verify_payment" })
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
        checkoutFingerPrint,
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    if (data.success) {
      track({ name: "subscribe_payment_verified" })
      setPurchaseType(data.gift ? "gift" : "subscription")
      toast.success(
        data.gift
          ? t(`🥰 ${t("Thank you for your gift")}`)
          : data.credits
            ? t(`${t("Credits updated")}`)
            : t(`${t("Subscribed")}`),
      )
      setCheckoutFingerPrint(uuidv4())

      await fetchSession()
      // Delay modal close to allow state to update
      setTimeout(() => setIsModalOpen(false), 100)
    } else {
      if (data.error) {
        toast.error(data.error)
        track({
          name: "subscribe_payment_verification_failed",
          props: { error: data.error },
        })
      } else {
        track({ name: "subscribe_payment_verification_failed" })
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
    if (checkoutFingerPrint) return
    setCheckoutFingerPrint(uuidv4())
  }, [checkoutFingerPrint])

  useEffect(() => {
    if (!checkoutFingerPrint) return
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
  }, [checkoutFingerPrint])

  const [selectedPlan, setSelectedPlanInternal] = useState<
    "plus" | "pro" | "member" | "credits"
  >(
    (searchParams.get("plan") as
      | "plus"
      | "pro"
      | "member"
      | "credits"
      | "plus") ?? "plus",
  )

  const setSelectedPlan = (plan: "plus" | "pro" | "member" | "credits") => {
    setSelectedPlanInternal(plan)
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
            : []
  const shouldShowGift = () => {
    if (isGifting && !userToGift) return false

    if (userToGift?.subscription?.plan === selectedPlan) return false

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
  const canSubscribe = () => !hasSubscription() && !isGifting && !isInviting
  const hasCurrentPlan = () =>
    currentPlan() === selectedPlan && !isGifting && !isInviting
  const canShowGiftButton = () =>
    selectedPlan !== "member" &&
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
        onToggle={(open) => setIsModalOpen(open)}
        title={
          <>
            {selectedPlan === "credits" ? (
              <Img icon="chrry" size={28} />
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
              : t(
                  selectedPlan === "credits"
                    ? "Chrry"
                    : selectedPlan === "pro"
                      ? "Raspberry"
                      : selectedPlan === "plus"
                        ? "Strawberry"
                        : "Chrry",
                )}
          </>
        }
      >
        <Div
          key={`selectedPlan-${selectedPlan}`}
          style={{ ...styles.plans.style }}
        >
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
              <MotiView
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
              </MotiView>
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
                    {t("Open Source")}
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

        <Div style={{ ...styles.checkoutButtonContainer.style }}>
          {selectedPlan !== "member" ? (
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
                  data-testid="subscribe-checkout"
                  onClick={() => {
                    addHapticFeedback()
                    handleCheckout("subscription")
                  }}
                  style={{ ...styles.checkoutButton.style }}
                >
                  {loading && part === "subscription" ? (
                    <Loading color="#fff" />
                  ) : (
                    <>
                      {selectedPlan === "plus" || selectedPlan === "credits" ? (
                        <Coins />
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
                          {t("pricing", {
                            freeDays: FREE_DAYS,
                            price:
                              selectedPlan === "plus" ? PLUS_PRICE : PRO_PRICE,
                          })}
                        </Span>
                      )}
                    </>
                  )}
                </Button>
              ) : (
                hasCurrentPlan() && (
                  <>
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
                  </>
                )
              )}
              {shouldShowGift() && (
                <Div
                  style={{
                    display: "flex",
                    alignItems: "center",
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
                style={{ ...utilities.inverted.style, ...styles.button.style }}
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
                style={{ ...utilities.link.style, ...styles.button.style }}
              >
                <LogIn size={18} />
                {"Login"}
              </Button>
            </>
          ) : (
            !user?.subscription && (
              <Button
                className="transparent"
                data-testid="current-plan"
                style={{
                  ...utilities.transparent.style,
                  ...styles.currentPlanButton.style,
                }}
              >
                <UserRound size={20} /> {t("Current Plan")}
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
                      url: `${FRONTEND_URL}?subscribe=true&extension=true&plan=${subs.plan}`,
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
        is && (
          <Button
            className="transparent"
            data-gifted-fingerprint={checkoutFingerPrint}
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
        )
      )}
      <Input
        key={purchaseType}
        data-testid="purchase-type"
        type="hidden"
        value={purchaseType}
      />
    </Div>
  )
}
