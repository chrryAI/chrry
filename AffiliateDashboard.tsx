"use client"

import styles from "./AffiliateDashboard.module.scss"
import React, { useEffect, useState } from "react"
import { COLORS, useAppContext } from "chrry/context/AppContext"
import toast from "react-hot-toast"
import {
  Copy,
  TrendingUp,
  Users,
  DollarSign,
  MousePointerClick,
  Coins,
  UserRoundPlus,
  UserPlus,
  SmilePlus,
  CircleArrowLeft,
  Link,
  Clock,
  Twitter,
  Share,
} from "chrry/icons"
import Logo from "chrry/Logo"
import Loading from "chrry/Loading"
import clsx from "clsx"
import Img from "chrry/Img"
import { apiFetch } from "chrry/utils"
import useSWR from "swr"
import { FaTwitter, FaLinkedin, FaFacebook } from "react-icons/fa"
import { useNavigation, useTheme } from "chrry/platform"
import { useAuth, useData, useNavigationContext } from "chrry/context/providers"
import Skeleton from "./Skeleton"

interface AffiliateStats {
  hasAffiliateLink: boolean
  code?: string
  affiliateLink?: string
  stats?: {
    clicks: number
    conversions: number
    totalRevenue: number
    commissionEarned: number
    commissionPaid: number
    commissionPending: number
    commissionRate: number
    status: string
  }
  referrals?: {
    total: number
    pending: number
    converted: number
    paid: number
  }
  createdOn?: string
  pendingPayout?: {
    id: string
    amount: number
    status: string
    requestedOn: string
  }
}

export default function AffiliateDashboard() {
  const { t } = useAppContext()

  const { affiliateStats, refetchAffiliateData, loadingAffiliateStats } =
    useData()
  const { addHapticFeedback } = useTheme()

  const { user, token, API_URL, FRONTEND_URL } = useAuth()
  const { router, setIsNewChat } = useNavigationContext()

  const copyLink = () => {
    if (affiliateStats?.affiliateLink) {
      navigator.clipboard.writeText(affiliateStats.affiliateLink)
      toast.success("Copied")
    }
  }

  useEffect(() => {
    if (affiliateStats === null) {
      router.push("/affiliate")
    }
  }, [affiliateStats])

  if (!affiliateStats) {
    return (
      <div className={styles.affiliate}>
        <div className={styles.loading}>
          <Loading />
        </div>
      </div>
    )
  }

  if (
    loadingAffiliateStats ||
    (affiliateStats && !affiliateStats?.hasAffiliateLink)
  ) {
    return (
      <div className={styles.affiliate}>
        <div className={styles.loading}>
          <Loading />
        </div>
      </div>
    )
  }

  const copyShareText = () => {
    navigator.clipboard.writeText(
      `💰 ${t("Earning passive income with @askvexAI affiliate program!")}\n\n` +
        `${t("{{commission}} recurring commission on all referrals.", { commission: "20%" })}\n\n` +
        `${t("Try Vex with {{bonus}} bonus credits:", { bonus: "30%" })}\n` +
        `${affiliateStats.affiliateLink}`,
    )

    toast.success(t("Copied"))
  }

  // Show stats dashboard if has affiliate link
  return (
    <Skeleton>
      <div className={styles.affiliate}>
        <div className={styles.dashboard}>
          <div className={styles.header}>
            <h1>
              <button
                className="link"
                onClick={() => {
                  router.push("/affiliate")
                }}
              >
                <CircleArrowLeft />
              </button>
              {t("Dashboard")}
            </h1>
            <div className={styles.status}>
              <span
                className={clsx(
                  styles.statusBadge,
                  affiliateStats.stats?.status === "active"
                    ? styles.active
                    : styles.inactive,
                )}
              >
                {affiliateStats.stats?.status === "active"
                  ? t("Active")
                  : t("Inactive")}
              </span>
            </div>
          </div>

          <div className={styles.linkSection}>
            <h2>🤩 {t("Your Affiliate Link")}</h2>
            <div className={styles.linkBox}>
              <Link color={COLORS.blue} size={20} />
              <input
                id="affiliateLink"
                type="text"
                value={affiliateStats.affiliateLink}
                readOnly
                className={styles.linkInput}
              />
              <button
                className={clsx("inverted", styles.copyButton)}
                onClick={copyLink}
              >
                <Copy size={16} />
              </button>
              <button onClick={() => copyShareText()}>
                <Share size={16} />
                {t("Copy Post")}
              </button>
            </div>
            <p className={styles.linkHelp}>
              {t(
                "Share this link to earn {{commission}} commission on all subscriptions!",
                { commission: "20%" },
              )}
            </p>
          </div>

          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <MousePointerClick color={COLORS.violet} size={32} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>{t("Clicks")}</div>
                <div className={styles.statValue}>
                  {affiliateStats.stats?.clicks || 0}
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <UserRoundPlus color={COLORS.orange} size={32} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>{t("Conversions")}</div>
                <div className={styles.statValue}>
                  {affiliateStats.stats?.conversions || 0}
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <Coins color={COLORS.blue} size={32} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>{t("Commission Earned")}</div>
                <div className={styles.statValue}>
                  €
                  {(
                    (affiliateStats.stats?.commissionEarned || 0) / 100
                  ).toFixed(2)}
                </div>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statIcon}>
                <TrendingUp color={COLORS.green} size={32} />
              </div>
              <div className={styles.statContent}>
                <div className={styles.statLabel}>
                  {t("Commission Pending")}
                </div>
                <div className={styles.statValue}>
                  €
                  {(
                    (affiliateStats.stats?.commissionPending || 0) / 100
                  ).toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Payout Request Section */}
          {affiliateStats.stats &&
            affiliateStats.stats.commissionPending >= 5000 && (
              <div className={styles.payoutSection}>
                {affiliateStats.pendingPayout ? (
                  <div className={styles.pendingPayoutInfo}>
                    <div className={styles.pendingBadge}>
                      <Clock size={20} />
                      {t("Payout Pending")}
                    </div>
                    <p className={styles.pendingAmount}>
                      €{(affiliateStats.pendingPayout.amount / 100).toFixed(2)}
                    </p>
                    <p className={styles.pendingDate}>
                      {t("Requested on {{date}}", {
                        date: new Date(
                          affiliateStats.pendingPayout.requestedOn,
                        ).toLocaleDateString(),
                      })}
                    </p>
                    <p className={styles.pendingNote}>
                      {t(
                        "Your payout is being processed. You'll be notified once completed.",
                      )}
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      className={clsx("button inverted", styles.payoutButton)}
                      onClick={async () => {
                        addHapticFeedback()
                        try {
                          const res = await apiFetch(
                            `${API_URL}/affiliates/payout`,
                            {
                              method: "POST",
                              headers: { Authorization: `Bearer ${token}` },
                            },
                          )
                          const data = await res.json()

                          if (data.success) {
                            toast.success(t("Payout requested successfully!"))
                            refetchAffiliateData() // Refresh stats
                          } else {
                            toast.error(
                              data.error || t("Failed to request payout"),
                            )
                          }
                        } catch (error) {
                          console.error("Payout request failed:", error)
                          toast.error(t("Failed to request payout"))
                        }
                      }}
                    >
                      <Coins size={20} />
                      {t("Request Payout")} (€
                      {(
                        (affiliateStats.stats.commissionPending || 0) / 100
                      ).toFixed(2)}
                      )
                    </button>
                    <p className={styles.payoutNote}>
                      {t("Minimum payout: {{amount}}", { amount: "€50" })}
                    </p>
                  </>
                )}
              </div>
            )}

          <div className={styles.referralsSection}>
            <h2>{t("Referrals")}</h2>
            <div className={styles.referralsGrid}>
              <div className={styles.referralStat}>
                <div className={styles.referralLabel}>{t("Total")}</div>
                <div className={styles.referralValue}>
                  {affiliateStats.referrals?.total || 0}
                </div>
              </div>
              <div className={styles.referralStat}>
                <div className={styles.referralLabel}>{t("Pending")}</div>
                <div className={styles.referralValue}>
                  {affiliateStats.referrals?.pending || 0}
                </div>
              </div>
              <div className={styles.referralStat}>
                <div className={styles.referralLabel}>{t("Converted")}</div>
                <div className={styles.referralValue}>
                  {affiliateStats.referrals?.converted || 0}
                </div>
              </div>
              <div className={styles.referralStat}>
                <div className={styles.referralLabel}>{t("Paid")}</div>
                <div className={styles.referralValue}>
                  {affiliateStats.referrals?.paid || 0}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.info}>
            <h3> {t("Program Details")}</h3>
            <ul>
              <li>
                {t("Commission Rate: {{rate}}", {
                  rate: affiliateStats.stats?.commissionRate,
                })}
                %
              </li>
              <li>
                {t("Referrals get {{bonus}} bonus credits on first purchase", {
                  bonus: "30%",
                })}
              </li>
              <li>
                {t("Cookie Duration {{duration}}", { duration: "30 days" })}
              </li>
              <li>{t("Minimum Payout {{payout}}", { payout: "€50" })}</li>
            </ul>
          </div>
          <div className={styles.footer}>
            <a
              href={`${FRONTEND_URL}`}
              className={clsx("link", styles.logo)}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey) {
                  return
                }
                e.preventDefault()
                setIsNewChat(true)
              }}
            >
              <Logo isVivid size={32} /> {"Vex"}
            </a>
          </div>
        </div>
      </div>
    </Skeleton>
  )
}
