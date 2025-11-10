"use client"
import React, { useEffect, useState } from "react"
import styles from "./Subscribe.module.scss"

import { user, subscription } from "./types"
import { animate, stagger } from "motion"
import {
  useAuth,
  useChat,
  useNavigationContext,
  useData,
  useError,
} from "./context/providers"
import { usePlatform, useTheme } from "./platform"

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
  Link,
} from "./icons"
import toast from "react-hot-toast"
import Loading from "./Loading"
import { useAppContext } from "./context/AppContext"
import { apiFetch } from "./utils"
import Modal from "./Modal"
import ConfirmButton from "./ConfirmButton"
import Logo from "./Logo"

import Img from "./Image"
import { getFeatures } from "./utils/subscription"
import A from "./A"

export default function Subscribe({
  customerEmail,
  className,
}: {
  customerEmail?: string // Optional for existing customers
  onSuccess?: () => void
  onCancel?: () => void
  className?: string
}) {
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

  // Error context
  const { captureException } = useError()

  // Theme context
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

  const handleCheckout = async (part: "subscription" | "gift") => {
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

  const [purchaseType, setPurchaseType] = useState<
    "subscribe" | "gift" | "credits" | undefined
  >()

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
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()
    if (data.success) {
      track({ name: "subscribe_payment_verified" })
      if (isExtensionRedirect) {
        setPurchaseType("subscribe")
        toast.success(t(`${t("Subscribed")}. ${t("Reload your extension")} 🧩`))
      } else {
        setPurchaseType(
          data.gift ? "gift" : data.credits ? "credits" : "subscribe",
        )

        toast.success(
          data.gift
            ? t(`🥰 ${t("Thank you for your gift")}`)
            : data.credits
              ? t(`${t("Credits updated")}`)
              : t(`${t("Subscribed")}`),
        )

        setGiftedFingerPrint(data.fingerprint)
      }

      fetchSession()
      setIsModalOpen(false)
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get("checkout") === "success") {
      const sessionId = params.get("session_id")
      if (!sessionId) {
        return
      }

      verifyPayment(sessionId)
    }
  }, [])

  const [selectedPlan, setSelectedPlan] = useState<
    "plus" | "pro" | "member" | "credits"
  >(
    (searchParams.get("plan") as
      | "plus"
      | "pro"
      | "member"
      | "credits"
      | "plus") ?? "plus",
  )

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
    if (!isModalOpen && searchParams.get("plan")) removeParam("plan")
  }, [isModalOpen, searchParams])

  useEffect(() => {
    isModalOpen && selectedPlan && animateFeatures()
  }, [isModalOpen, selectedPlan])

  const animateFeatures = (): void => {
    const prefersReducedMotion =
      reduceMotion ||
      (typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches)

    if (prefersReducedMotion) {
      setTimeout(() => {
        const list = document?.querySelector(".features")
        const listitem = document?.querySelectorAll(".feature")

        if (list) {
          ;(list as HTMLElement).style.opacity = "1"
        }
        listitem?.forEach((item) => {
          ;(item as HTMLElement).style.opacity = "1"
        })
      }, 100)
      // Just make visible without animation
    } else {
      // Always ensure menu is visible by default

      setTimeout(() => {
        if (typeof window !== "undefined") {
          animate([
            [".features", { opacity: [0, 1] }, { duration: 0 }],
            [
              ".feature",
              {
                y: [-10, 0],
                opacity: [0, 1],
                transform: ["translateX(-10px)", "none"],
              },
              {
                delay: stagger(0.05),
                duration: 0.1,
              },
            ],
          ])
        }
      }, 100)
      // Only animate if we haven't before and don't prefer reduced motion
    }
  }

  useEffect(() => {
    if (isModalOpen) return
    setIsAdding(false)
    setIsInviting(false)
    setUserToGift(null)
    setSelectedPlan("plus")
    setIsGifting(false)
    setSearch("")
  }, [isModalOpen])

  const shouldShowGift = () => {
    // Not in gifting mode
    if (isGifting && !userToGift) return false

    // In gifting mode but no user found yet (for credits)
    // if (selectedPlan === "credits" && !userToGift) return false

    // Found a user to gift to, but they already have this plan
    if (userToGift?.subscription?.plan === selectedPlan) return false

    // All other gifting scenarios are valid
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

  return (
    <>
      <Modal
        hideOnClickOutside={false}
        hasCloseButton
        dataTestId="subscribe-modal"
        isModalOpen={isModalOpen}
        params="?subscribe=true"
        className={styles.subscribeModal}
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
        <div key={`selectedPlan-${selectedPlan}`} className={styles.plans}>
          <button
            onClick={() => {
              addHapticFeedback()
              setSelectedPlan("member")
              setUserToGift(null)
              setIsGifting(false)
              setIsInviting(false)
            }}
            className={clsx(
              selectedPlan === "member" ? "inverted" : "transparent",
            )}
          >
            <UsersRound size={14} /> {t("Free")}
          </button>
          <button
            onClick={() => {
              addHapticFeedback()
              setSelectedPlan("credits")
              setIsGifting(false)
              setIsInviting(false)
            }}
            className={clsx(
              selectedPlan === "credits" ? "inverted" : "transparent",
            )}
          >
            <Coins size={14} /> {t("Credits")}
          </button>
          <button
            onClick={() => {
              addHapticFeedback()
              setSelectedPlan("plus")
              setIsGifting(false)
              setIsInviting(false)
            }}
            className={clsx(
              selectedPlan === "plus" ? "inverted" : "transparent",
            )}
          >
            <Plus size={14} /> {t("Plus")}
          </button>
          <button
            onClick={() => {
              addHapticFeedback()
              setSelectedPlan("pro")
              setIsGifting(false)
              setIsInviting(false)
            }}
            className={clsx(
              selectedPlan === "pro" ? "inverted" : "transparent",
            )}
          >
            <SmilePlus size={14} /> {t("Pro")}
          </button>
        </div>
        <ul
          data-testid={`subscribe-features`}
          className={clsx(styles.features, "features")}
        >
          <li className={clsx(styles.feature, "feature")}>
            <A href={"mailto:iliyan@chrry.ai"} className={"link"}>
              <Img logo="isVivid" icon="heart" width={16} height={16} />
              {t("Need a white label like Vex? ")}&#8594; iliyan@chrry.ai
            </A>
          </li>
          {(selectedPlan === "plus"
            ? plusFeatures
            : selectedPlan === "member"
              ? memberFeatures
              : selectedPlan === "pro"
                ? proFeatures
                : selectedPlan === "credits"
                  ? creditsFeatures
                  : []
          ).map((feature, i) => (
            <li className={clsx(styles.feature, "feature")} key={i}>
              {feature.emoji} {feature.text}
            </li>
          ))}
          {affiliateCode ? (
            (selectedPlan === "plus" ||
              selectedPlan === "pro" ||
              selectedPlan === "credits") && (
              <li
                className={clsx(styles.feature, "feature")}
                style={{ color: "var(--accent-4)" }}
              >
                🎁 {t("+30% bonus credits from referral")}
              </li>
            )
          ) : (
            <>
              <li className={clsx(styles.feature, "feature")}>
                <A openInNewTab href={"https://chrry.dev"} className={"link"}>
                  <Img logo="chrry" width={16} height={16} />
                  {t("Open Source")}
                </A>
              </li>
              <li className={clsx(styles.feature, "feature")}>
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
              </li>
            </>
          )}
        </ul>

        <div className={styles.gift}>
          {userToGift?.subscription && selectedPlan !== "credits" ? (
            <div className={styles.userToGift}>
              <button
                className={clsx("transparent", styles.backButton)}
                onClick={() => {
                  addHapticFeedback()
                  setUserToGift(null)
                }}
              >
                <ArrowLeft size={20} />
              </button>

              <p>
                {userToGift?.email} {t(`already subscribed`)}
              </p>
            </div>
          ) : userToGift ? (
            <div>
              <div className={styles.userToGift}>
                <button
                  className={clsx("transparent", styles.backButton)}
                  onClick={() => {
                    addHapticFeedback()
                    setUserToGift(null)
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
                <p className={styles.collaboratorEmail}>{userToGift?.email}</p>
              </div>
            </div>
          ) : (
            isGifting && (
              <div className={styles.invite}>
                <button
                  className={clsx("transparent", styles.backButton)}
                  onClick={() => {
                    addHapticFeedback()
                    setIsGifting(false)
                    setSearch("")
                    setUserToGift(null)
                    setIsInviting(false)
                  }}
                >
                  <ArrowLeft size={20} />
                </button>

                <input
                  data-testid="subscribe-gift-input"
                  className={styles.inviteInput}
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setIsInviting(false)
                  }}
                  type="email"
                  placeholder={`🥰 ${t("Search by email")}*`}
                />
                <button
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
                </button>
              </div>
            )
          )}
        </div>

        <div className={styles.checkoutButtonContainer}>
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
                <button
                  data-testid="subscribe-checkout"
                  onClick={() => {
                    addHapticFeedback()
                    handlePlanChange("pro")
                  }}
                  className={clsx(styles.checkoutButton)}
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
                </button>
              )}
              {canBuyCredits() || canSubscribe() ? (
                <button
                  data-testid="subscribe-checkout"
                  onClick={() => {
                    addHapticFeedback()
                    handleCheckout("subscription")
                  }}
                  className={clsx(styles.checkoutButton)}
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
                        <span>
                          {t("credits_pricing", {
                            credits: ADDITIONAL_CREDITS,
                            price: `${CREDITS_PRICE}.00`,
                          })}
                        </span>
                      ) : (
                        <span>
                          {t("pricing", {
                            freeDays: FREE_DAYS,
                            price:
                              selectedPlan === "plus" ? PLUS_PRICE : PRO_PRICE,
                          })}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ) : (
                hasCurrentPlan() && (
                  <>
                    {!user && guest?.subscription && (
                      <button
                        onClick={() => {
                          addHapticFeedback()
                          setSignInPart("register")
                        }}
                        className={clsx("link", styles.button)}
                      >
                        <LogIn size={20} />
                        {t("Migrate your subscription")}
                      </button>
                    )}
                    <ConfirmButton
                      className={clsx(
                        "transparent",
                        styles.cancelSubscriptionButton,
                      )}
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
                      <span style={{ marginLeft: "auto", fontSize: 13 }}>
                        €
                        {t("{{price}}/month", {
                          price:
                            selectedPlan === "pro" ? PRO_PRICE : PLUS_PRICE,
                        })}
                      </span>
                    </ConfirmButton>
                  </>
                )
              )}
              {shouldShowGift() && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  {isInviting && (
                    <button
                      className={clsx("transparent", styles.backButton)}
                      onClick={() => {
                        addHapticFeedback()
                        setIsInviting(false)
                      }}
                    >
                      <ArrowLeft size={22} />
                    </button>
                  )}
                  <button
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
                    className={clsx("inverted", styles.giftButton)}
                  >
                    {loading && part === "gift" ? (
                      <Loading width={22} height={22} />
                    ) : (
                      <>
                        <>🎁</>
                        <span> {isInviting ? t("Invite") : t("Gift")}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </>
          ) : guest ? (
            <>
              <button
                onClick={() => {
                  addHapticFeedback()
                  setSignInPart("register")
                }}
                className={clsx("inverted", styles.button)}
              >
                <UserRoundPlus size={20} />
                {t("Register")}
              </button>
              <button
                onClick={() => {
                  addHapticFeedback()
                  setSignInPart("login")
                }}
                className={clsx("link", styles.button)}
              >
                <LogIn size={18} />
                {"Login"}
              </button>
            </>
          ) : (
            !user?.subscription && (
              <button
                data-testid="current-plan"
                className={clsx("transparent", styles.currentPlanButton)}
              >
                <UserRound size={20} /> {t("Current Plan")}
              </button>
            )
          )}
        </div>
        {isGifting ? (
          <div className={styles.subscribeAsGuest}>
            *
            {t(
              selectedPlan === "credits"
                ? "You can gift credits to anyone with an email"
                : "You can gift subscription anyone with an email",
            )}
          </div>
        ) : !user && (selectedPlan === "pro" || selectedPlan === "plus") ? (
          guest?.subscription ? (
            <></>
          ) : (
            <div className={styles.subscribeAsGuest}>
              {t("Subscribe as guest!")}
              <button
                onClick={() => {
                  addHapticFeedback()
                  setSignInPart("login")
                }}
                className="link"
                style={{ marginLeft: "8px" }}
              >
                {t("Already have an account?")}
              </button>
              <p>*{t("You can migrate your account whenever you want")}</p>
            </div>
          )
        ) : null}
      </Modal>
      {user?.subscription || guest?.subscription ? (
        <>
          {(() => {
            const subs = user?.subscription || guest?.subscription
            if (!subs) return

            return (
              <button
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
                className={clsx(styles.plusButton, className)}
              >
                <Img
                  icon={subs.plan === "pro" ? "raspberry" : "strawberry"}
                  showLoading={false}
                  size={18}
                />
                {t(subs.plan === "pro" ? "Pro" : "Plus")}
              </button>
            )
          })()}

          {/* {isDevelopment && (
          <span style={{ color: "var(--accent-6)", fontSize: 11 }}>(dev)</span>
        )} */}
        </>
      ) : (
        <button
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
          className={clsx(
            "transparent small",
            styles.subscribeButton,
            className,
          )}
        >
          <Img icon="strawberry" showLoading={false} size={18} />
          {t("Plus")}
        </button>
      )}

      {purchaseType && (
        <input data-testid="purchase-type" type="hidden" value={purchaseType} />
      )}

      {/* {giftedFingerPrint} */}
    </>
  )
}
