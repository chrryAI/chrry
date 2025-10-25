"use client"

import styles from "./Affiliate.module.scss"
import React, { useState } from "react"
import { COLORS, useAppContext } from "chrry/context/AppContext"
import toast from "react-hot-toast"
import {
  TrendingUp,
  MousePointerClick,
  Coins,
  UserRoundPlus,
  SmilePlus,
} from "chrry/icons"
import Logo from "chrry/Logo"
import clsx from "clsx"
import Img from "chrry/Image"
import { useAuth, useData } from "chrry/context/providers"
import { useNavigation, usePlatform, useTheme } from "chrry/platform"
import { useHasHydrated } from "./hooks"
import Skeleton from "./Skeleton"
import { getSiteConfig } from "./utils/siteConfig"
import { apiFetch } from "./utils"

export default function Affiliate() {
  const { user, token, API_URL, FRONTEND_URL } = useAuth()
  const router = useNavigation()
  const { t } = useAppContext()

  const is = useHasHydrated()

  const { addHapticFeedback } = useTheme()

  const { affiliateStats, refetchAffiliateData, loadingAffiliateStats } =
    useData()

  const [creating, setCreating] = useState(false)

  const createAffiliateLink = async () => {
    addHapticFeedback()
    if (!user) {
      router.push("/affiliate?subscribe=true&plan=member")
      return
    }

    setCreating(true)
    try {
      const res = await apiFetch(`${API_URL}/affiliates`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()

      if (data.success) {
        refetchAffiliateData()
        router.push("/affiliate/dashboard")
      }
    } catch (error) {
      console.error("Failed to create affiliate link:", error)
      toast.error("Failed to create affiliate link")
    } finally {
      setCreating(false)
    }
  }

  const config = getSiteConfig()

  const isChrryAI = config.mode === "chrryAI"

  if (!is) return null

  return (
    <Skeleton>
      <div className={styles.affiliate}>
        <div className={styles.marketing}>
          <div className={styles.hero}>
            <Img
              showLoading={false}
              src={`${FRONTEND_URL}/images/pacman/heart.png`}
              alt="Heart"
              width={50}
              height={50}
            />
            <h1> {t("{{app}} Affiliate Program", { app: config.name })}</h1>

            <p className={styles.subtitle}>
              {t(
                "Earn {{commission}} commission by sharing {{app}} with your audience",
                { commission: "20%", app: config.name },
              )}
            </p>

            {loadingAffiliateStats
              ? null
              : affiliateStats?.hasAffiliateLink && (
                  <button
                    className={clsx(styles.goToDashboard, "inverted")}
                    onClick={() => {
                      router.push("/affiliate/dashboard")
                    }}
                  >
                    <TrendingUp size={16} /> {t("Go to Dashboard")}
                  </button>
                )}
          </div>

          <div className={styles.benefits}>
            <h2>🤩 {t("Why Join?")}</h2>
            <div className={styles.benefitGrid}>
              <div className={styles.benefit}>
                <Coins color={COLORS.blue} size={32} />
                <h3> {t("20% Commission")}</h3>
                <p>{t("Earn 20% recurring commission on all referrals")}</p>
              </div>
              <div className={styles.benefit}>
                <UserRoundPlus color={COLORS.orange} size={32} />
                <h3> {t("30% Bonus Credits")}</h3>
                <p>
                  {t("Your referrals get 30% bonus credits on their purchase")}
                </p>
              </div>
              <div className={styles.benefit}>
                <TrendingUp color={COLORS.green} size={32} />
                <h3> {t("Real-Time Dashboard")}</h3>
                <p>
                  {t("Track clicks, conversions, and earnings in real-time")}
                </p>
              </div>
              <div className={styles.benefit}>
                <MousePointerClick color={COLORS.violet} size={32} />
                <h3> {t("30-Day Cookie")}</h3>
                <p>
                  {t("Get credit for conversions up to 30 days after click")}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.earnings}>
            <h2>💰 {t("Potential Earnings")}</h2>
            <div className={styles.earningsGrid}>
              <div className={clsx(styles.earningCard, styles.plus)}>
                <Img icon="strawberry" size={40} />

                <h3> {t("Plus Plan")}</h3>
                <div className={styles.price}>
                  {t("{{price}}/month", { price: "€9.99" })}
                </div>
                <div className={styles.commission}>
                  <strong>
                    {t("{{commission}}/month per subscriber", {
                      commission: "€1.99",
                    })}
                  </strong>
                </div>
                <p className={styles.detail}>
                  {t("{{commission}} of {{price}}/month recurring", {
                    commission: "20%",
                    price: "€9.99",
                  })}
                </p>
              </div>
              <div className={clsx(styles.earningCard, styles.pro)}>
                <Img icon="raspberry" size={40} />
                <h3> {t("Pro Plan")}</h3>
                <div className={styles.price}>
                  {t("{{price}}/month", { price: "€19.99" })}
                </div>
                <div className={styles.commission}>
                  <strong>
                    {t("{{commission}}/month per subscriber", {
                      commission: "€3.99",
                    })}
                  </strong>
                </div>
                <p className={styles.detail}>
                  {t("{{commission}} of {{price}}/month recurring", {
                    commission: "20%",
                    price: "€19.99",
                  })}
                </p>
              </div>
            </div>
            <div className={styles.example}>
              <p>
                <strong>{t("Example")}:</strong>{" "}
                {t(
                  "Refer {{count}} Pro users = {{commission}}/month recurring",
                  {
                    count: 10,
                    commission: "€39.90",
                  },
                )}
              </p>
            </div>
          </div>

          <div className={styles.howItWorks}>
            <h2> {t("How It Works")}</h2>
            <div className={styles.steps}>
              <div className={styles.step}>
                <div className={styles.stepNumber}>1</div>
                <h3> {t("Get Your Link")}</h3>
                <p> {t("Create your unique affiliate link instantly")}</p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>2</div>
                <h3> {t("Share")}</h3>
                <p>
                  {" "}
                  {t(
                    "Share with your audience on social media, blog, or email",
                  )}
                </p>
              </div>
              <div className={styles.step}>
                <div className={styles.stepNumber}>3</div>
                <h3> {t("Earn")}</h3>
                <p>
                  {t("Get {{commission}} commission when they subscribe", {
                    commission: "20%",
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className={styles.cta}>
            {!affiliateStats?.hasAffiliateLink && (
              <button
                className={clsx("button inverted large", styles.joinButton)}
                onClick={createAffiliateLink}
                disabled={creating}
              >
                <SmilePlus size={20} />
                {creating
                  ? t("Creating...")
                  : user
                    ? t("Join Affiliate Program")
                    : t("Sign In to Join")}
              </button>
            )}
          </div>
        </div>
      </div>
    </Skeleton>
  )
}
