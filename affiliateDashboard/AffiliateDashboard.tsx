"use client"

import React, { useEffect } from "react"
import { COLORS, useAppContext } from "../context/AppContext"
import toast from "react-hot-toast"
import {
  Copy,
  TrendingUp,
  MousePointerClick,
  Coins,
  UserRoundPlus,
  CircleArrowLeft,
  Link,
  Clock,
  Share,
} from "../icons"
import Logo from "../Logo"
import Loading from "../Loading"
import clsx from "clsx"
import { apiFetch } from "../utils"
import { Button, Div, H1, H2, H3, P, Span, useTheme } from "../platform"
import { useAuth, useData, useNavigationContext } from "../context/providers"
import Skeleton from "../Skeleton"
import { useAffiliateDashboardStyles } from "./AffiliateDashboard.styles"

export default function AffiliateDashboard() {
  const { t } = useAppContext()

  const styles = useAffiliateDashboardStyles()

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
    return <Loading />
  }

  if (
    loadingAffiliateStats ||
    (affiliateStats && !affiliateStats?.hasAffiliateLink)
  ) {
    return <Loading fullScreen />
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
      <Div style={styles.affiliate.style}>
        <Div style={styles.dashboard.style}>
          <Div style={styles.header.style}>
            <H1 style={styles.h1.style}>
              <Button
                className="link"
                onClick={() => {
                  router.push("/affiliate")
                }}
              >
                <CircleArrowLeft />
              </Button>
              {t("Dashboard")}
            </H1>
            <Div style={styles.status.style}>
              <Span
                style={{
                  ...styles.statusBadge.style,
                  ...(affiliateStats.stats?.status === "active"
                    ? styles.active.style
                    : styles.inactive.style),
                }}
              >
                {affiliateStats.stats?.status === "active"
                  ? t("Active")
                  : t("Inactive")}
              </Span>
            </Div>
          </Div>

          <Div style={styles.linkSection.style}>
            <H2 style={styles.linkSectionH2.style}>
              🤩 {t("Your Affiliate Link")}
            </H2>
            <Div style={styles.linkBox.style}>
              <Link color={COLORS.blue} size={20} />
              <input
                id="affiliateLink"
                type="text"
                value={affiliateStats.affiliateLink}
                readOnly
                style={styles.linkInput.style}
              />
              <Button style={styles.copyButton.style} onClick={copyLink}>
                <Copy size={16} />
              </Button>
              <Button onClick={() => copyShareText()}>
                <Share size={16} />
                {t("Copy Post")}
              </Button>
            </Div>
            <P style={styles.linkHelp.style}>
              {t(
                "Share this link to earn {{commission}} commission on all subscriptions!",
                { commission: "20%" },
              )}
            </P>
          </Div>

          <Div style={styles.statsGrid.style}>
            <Div style={styles.statCard.style}>
              <Div style={styles.statIcon.style}>
                <MousePointerClick color={COLORS.violet} size={32} />
              </Div>
              <Div style={styles.statContent.style}>
                <Div style={styles.statLabel.style}>{t("Clicks")}</Div>
                <Div style={styles.statValue.style}>
                  {affiliateStats.stats?.clicks || 0}
                </Div>
              </Div>
            </Div>

            <Div style={styles.statCard.style}>
              <Div style={styles.statIcon.style}>
                <UserRoundPlus color={COLORS.orange} size={32} />
              </Div>
              <Div style={styles.statContent.style}>
                <Div style={styles.statLabel.style}>{t("Conversions")}</Div>
                <Div style={styles.statValue.style}>
                  {affiliateStats.stats?.conversions || 0}
                </Div>
              </Div>
            </Div>

            <Div style={styles.statCard.style}>
              <Div style={styles.statIcon.style}>
                <Coins color={COLORS.blue} size={32} />
              </Div>
              <Div style={styles.statContent.style}>
                <Div style={styles.statLabel.style}>
                  {t("Commission Earned")}
                </Div>
                <Div style={styles.statValue.style}>
                  €
                  {(
                    (affiliateStats.stats?.commissionEarned || 0) / 100
                  ).toFixed(2)}
                </Div>
              </Div>
            </Div>

            <Div style={styles.statCard.style}>
              <Div style={styles.statIcon.style}>
                <TrendingUp color={COLORS.green} size={32} />
              </Div>
              <Div style={styles.statContent.style}>
                <Div style={styles.statLabel.style}>
                  {t("Commission Pending")}
                </Div>
                <Div style={styles.statValue.style}>
                  €
                  {(
                    (affiliateStats.stats?.commissionPending || 0) / 100
                  ).toFixed(2)}
                </Div>
              </Div>
            </Div>
          </Div>

          {/* Payout Request Section */}
          {affiliateStats.stats &&
            affiliateStats.stats.commissionPending >= 5000 && (
              <Div style={styles.payoutSection.style}>
                {affiliateStats.pendingPayout ? (
                  <Div style={styles.pendingPayoutInfo.style}>
                    <Div style={styles.pendingBadge.style}>
                      <Clock size={20} />
                      {t("Payout Pending")}
                    </Div>
                    <P style={styles.pendingAmount.style}>
                      €{(affiliateStats.pendingPayout.amount / 100).toFixed(2)}
                    </P>
                    <P style={styles.pendingDate.style}>
                      {t("Requested on {{date}}", {
                        date: new Date(
                          affiliateStats.pendingPayout.requestedOn,
                        ).toLocaleDateString(),
                      })}
                    </P>
                    <P style={styles.pendingNote.style}>
                      {t(
                        "Your payout is being processed. You'll be notified once completed.",
                      )}
                    </P>
                  </Div>
                ) : (
                  <>
                    <Button
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
                    </Button>
                    <P style={styles.payoutNote.style}>
                      {t("Minimum payout: {{amount}}", { amount: "€50" })}
                    </P>
                  </>
                )}
              </Div>
            )}

          <Div style={styles.referralsSection.style}>
            <H2 style={styles.referralsSectionH2.style}>{t("Referrals")}</H2>
            <Div style={styles.referralsGrid.style}>
              <Div style={styles.referralStat.style}>
                <Div style={styles.referralLabel.style}>{t("Total")}</Div>
                <Div style={styles.referralValue.style}>
                  {affiliateStats.referrals?.total || 0}
                </Div>
              </Div>
              <Div style={styles.referralStat.style}>
                <Div style={styles.referralLabel.style}>{t("Pending")}</Div>
                <Div style={styles.referralValue.style}>
                  {affiliateStats.referrals?.pending || 0}
                </Div>
              </Div>
              <Div style={styles.referralStat.style}>
                <Div style={styles.referralLabel.style}>{t("Converted")}</Div>
                <Div style={styles.referralValue.style}>
                  {affiliateStats.referrals?.converted || 0}
                </Div>
              </Div>
              <Div style={styles.referralStat.style}>
                <Div style={styles.referralLabel.style}>{t("Paid")}</Div>
                <Div style={styles.referralValue.style}>
                  {affiliateStats.referrals?.paid || 0}
                </Div>
              </Div>
            </Div>
          </Div>

          <Div style={styles.info.style}>
            <H3 style={styles.infoH3.style}> {t("Program Details")}</H3>
            <Div style={styles.infoUl.style}>
              <P style={styles.infoUlLi.style}>
                {t("Commission Rate: {{rate}}", {
                  rate: affiliateStats.stats?.commissionRate,
                })}
                %
              </P>
              <P style={styles.infoUlLi.style}>
                {t("Referrals get {{bonus}} bonus credits on first purchase", {
                  bonus: "30%",
                })}
              </P>
              <P style={styles.infoUlLi.style}>
                {t("Cookie Duration {{duration}}", { duration: "30 days" })}
              </P>
              <P style={styles.infoUlLi.style}>
                {t("Minimum Payout {{payout}}", { payout: "€50" })}
              </P>
            </Div>
          </Div>
          <Div style={styles.footer.style}>
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
          </Div>
        </Div>
      </Div>
    </Skeleton>
  )
}
