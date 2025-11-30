"use client"

import React, { useState } from "react"
import { COLORS, useAppContext } from "./context/AppContext"
import toast from "react-hot-toast"
import {
  TrendingUp,
  MousePointerClick,
  Coins,
  UserRoundPlus,
  SmilePlus,
} from "./icons"
import Img from "./Image"
import { useAuth, useData } from "./context/providers"
import {
  Button,
  Div,
  H1,
  H2,
  H3,
  P,
  Strong,
  useNavigation,
  usePlatform,
  useTheme,
} from "./platform"
import { useHasHydrated } from "./hooks"
import Skeleton from "./Skeleton"
import { getSiteConfig } from "./utils/siteConfig"
import { apiFetch } from "./utils"
import { useAffiliateStyles } from "./Affiliate.styles"
import { useStyles } from "./context/StylesContext"

export default function Affiliate() {
  const { user, token, API_URL, FRONTEND_URL } = useAuth()
  const router = useNavigation()
  const { t } = useAppContext()

  const styles = useAffiliateStyles()
  const { utilities } = useStyles()

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
      <Div style={styles.affiliate.style}>
        <Div>
          <Div style={styles.hero.style}>
            <Img
              showLoading={false}
              src={`${FRONTEND_URL}/images/pacman/heart.png`}
              alt="Heart"
              width={50}
              height={50}
            />
            <H1 style={styles.h1.style}>
              {" "}
              {t("{{app}} Affiliate Program", { app: config.name })}
            </H1>

            <P style={styles.subtitle.style}>
              {t(
                "Earn {{commission}} commission by sharing {{app}} with your audience",
                { commission: "20%", app: config.name },
              )}
            </P>

            {loadingAffiliateStats
              ? null
              : affiliateStats?.hasAffiliateLink && (
                  <Button
                    className="inverted"
                    style={{
                      ...styles.goToDashboard.style,
                      ...utilities.inverted.style,
                    }}
                    onClick={() => {
                      router.push("/affiliate/dashboard")
                    }}
                  >
                    <TrendingUp size={16} /> {t("Go to Dashboard")}
                  </Button>
                )}
          </Div>

          <Div style={styles.benefits.style}>
            <H2 style={styles.h2.style}>🤩 {t("Why Join?")}</H2>
            <Div style={styles.benefitGrid.style}>
              <Div style={styles.benefit.style}>
                <Coins color={COLORS.blue} size={32} />
                <H3 style={styles.h3.style}> {t("20% Commission")}</H3>
                <P>{t("Earn 20% recurring commission on all referrals")}</P>
              </Div>
              <Div style={styles.benefit.style}>
                <UserRoundPlus color={COLORS.orange} size={32} />
                <H3 style={styles.h3.style}> {t("30% Bonus Credits")}</H3>
                <P>
                  {t("Your referrals get 30% bonus credits on their purchase")}
                </P>
              </Div>
              <Div style={styles.benefit.style}>
                <TrendingUp color={COLORS.green} size={32} />
                <H3 style={styles.h3.style}> {t("Real-Time Dashboard")}</H3>
                <P>
                  {t("Track clicks, conversions, and earnings in real-time")}
                </P>
              </Div>
              <Div style={styles.benefit.style}>
                <MousePointerClick color={COLORS.violet} size={32} />
                <H3 style={styles.h3.style}> {t("30-Day Cookie")}</H3>
                <P>
                  {t("Get credit for conversions up to 30 days after click")}
                </P>
              </Div>
            </Div>
          </Div>

          <Div style={styles.earnings.style}>
            <H2 style={styles.earningsh2.style}>
              💰 {t("Potential Earnings")}
            </H2>
            <Div style={styles.earningsGrid.style}>
              <Div
                style={{
                  ...styles.earningCard.style,
                  ...styles.earningCardPlus.style,
                }}
              >
                <Img icon="strawberry" size={40} />

                <H3 style={styles.earningCardh3.style}> {t("Plus")}</H3>
                <Div style={styles.price.style}>
                  {t("{{price}}/month", { price: "€9.99" })}
                </Div>
                <Div style={styles.commission.style}>
                  <Strong>
                    {t("{{commission}}/month per subscriber", {
                      commission: "€1.99",
                    })}
                  </Strong>
                </Div>
                <P style={styles.detail.style}>
                  {t("{{commission}} of {{price}}/month recurring", {
                    commission: "20%",
                    price: "€9.99",
                  })}
                </P>
              </Div>
              <Div
                style={{
                  ...styles.earningCard.style,
                  ...styles.earningCardPro.style,
                }}
              >
                <Img icon="raspberry" size={40} />
                <H3> {t("Pro")}</H3>
                <Div style={styles.price.style}>
                  {t("{{price}}/month", { price: "€19.99" })}
                </Div>
                <Div style={styles.commission.style}>
                  <Strong>
                    {t("{{commission}}/month per subscriber", {
                      commission: "€3.99",
                    })}
                  </Strong>
                </Div>
                <P style={styles.detail.style}>
                  {t("{{commission}} of {{price}}/month recurring", {
                    commission: "20%",
                    price: "€19.99",
                  })}
                </P>
              </Div>
            </Div>
            <Div style={styles.example.style}>
              <P>
                <Strong>{t("Example")}:</Strong>{" "}
                {t(
                  "Refer {{count}} Pro users = {{commission}}/month recurring",
                  {
                    count: 10,
                    commission: "€39.90",
                  },
                )}
              </P>
            </Div>
          </Div>

          <Div style={styles.howItWorks.style}>
            <H2> {t("How It Works")}</H2>
            <Div style={styles.steps.style}>
              <Div style={styles.step.style}>
                <Div style={styles.stepNumber.style}>1</Div>
                <H3> {t("Get Your Link")}</H3>
                <P> {t("Create your unique affiliate link instantly")}</P>
              </Div>
              <Div style={styles.step.style}>
                <Div style={styles.stepNumber.style}>2</Div>
                <H3> {t("Share")}</H3>
                <P>
                  {" "}
                  {t(
                    "Share with your audience on social media, blog, or email",
                  )}
                </P>
              </Div>
              <Div style={styles.step.style}>
                <Div style={styles.stepNumber.style}>3</Div>
                <H3> {t("Earn")}</H3>
                <P>
                  {t("Get {{commission}} commission when they subscribe", {
                    commission: "20%",
                  })}
                </P>
              </Div>
            </Div>
          </Div>

          <Div style={styles.cta.style}>
            {!affiliateStats?.hasAffiliateLink && (
              <Button
                className={"inverted"}
                disabled={creating}
                style={{
                  ...utilities.button.style,
                  ...utilities.inverted.style,
                  ...utilities.large.style,
                  ...styles.joinButton.style,
                }}
              >
                <SmilePlus size={20} />
                {creating
                  ? t("Creating...")
                  : user
                    ? t("Join Affiliate Program")
                    : t("Sign In to Join")}
              </Button>
            )}
          </Div>
        </Div>
      </Div>
    </Skeleton>
  )
}
