// "use client"

// import React, { useState } from "react"
// import { COLORS, useAppContext } from "./context/AppContext"
// import {
//   TrendingUp,
//   MousePointerClick,
//   Coins,
//   CircleArrowLeft,
//   Eye,
//   Award,
// } from "./icons"
// import Logo from "./Logo"
// import Loading from "./Loading"
// import clsx from "clsx"
// import { useTheme } from "./platform"
// import { useAuth, useNavigationContext } from "./context/providers"
// import Skeleton from "./Skeleton"

// interface GrapeConsumerStats {
//   hasGrapeConsent: boolean
//   stats?: {
//     adsViewed: number
//     adsClicked: number
//     creditsEarned: number
//     creditsRedeemed: number
//     currentStreak: number
//     totalEarnings: number
//     thisMonth: number
//     status: string
//   }
//   recentAds?: Array<{
//     id: string
//     title: string
//     credits: number
//     viewedAt: string
//   }>
// }

// export default function GrapeConsumerDashboard() {
//   const { t } = useAppContext()

//   const { addHapticFeedback } = useTheme()
//   const { user, token, API_URL, FRONTEND_URL } = useAuth()
//   const { router, setIsNewChat } = useNavigationContext()

//   // TODO: Replace with real SWR hook
//   const [grapeStats, setGrapeStats] = useState<GrapeConsumerStats>({
//     hasGrapeConsent: true,
//     stats: {
//       adsViewed: 127,
//       adsClicked: 45,
//       creditsEarned: 380,
//       creditsRedeemed: 150,
//       currentStreak: 7,
//       totalEarnings: 380,
//       thisMonth: 120,
//       status: "active",
//     },
//     recentAds: [
//       {
//         id: "1",
//         title: "Expo - React Native Framework",
//         credits: 5,
//         viewedAt: "2025-11-11T10:00:00Z",
//       },
//       {
//         id: "2",
//         title: "Notion - Productivity Tool",
//         credits: 3,
//         viewedAt: "2025-11-10T15:30:00Z",
//       },
//     ],
//   })

//   const loadingGrapeStats = false

//   if (!grapeStats) {
//     return (
//       <div className={styles.affiliate}>
//         <div className={styles.loading}>
//           <Loading />
//         </div>
//       </div>
//     )
//   }

//   if (loadingGrapeStats || (grapeStats && !grapeStats?.hasGrapeConsent)) {
//     return (
//       <div className={styles.affiliate}>
//         <div className={styles.loading}>
//           <Loading />
//         </div>
//       </div>
//     )
//   }

//   return (
//     <Skeleton>
//       <div className={styles.affiliate}>
//         <div className={styles.dashboard}>
//           <div className={styles.header}>
//             <h1>
//               <button type="button"
//                 className="link"
//                 onClick={() => {
//                   // Go back to Grape onboarding
//                   router.push("/grape")
//                 }}
//               >
//                 <CircleArrowLeft />
//               </button>
//               🍇 {t("Grape Earnings")}
//             </h1>
//             <div className={styles.status}>
//               <span
//                 className={clsx(
//                   styles.statusBadge,
//                   grapeStats.stats?.status === "active"
//                     ? styles.active
//                     : styles.inactive,
//                 )}
//               >
//                 {grapeStats.stats?.status === "active"
//                   ? t("Active")
//                   : t("Inactive")}
//               </span>
//             </div>
//           </div>

//           <div className={styles.statsGrid}>
//             <div className={styles.statCard}>
//               <div className={styles.statIcon}>
//                 <Eye color={COLORS.violet} size={32} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statLabel}>{t("Ads Viewed")}</div>
//                 <div className={styles.statValue}>
//                   {grapeStats.stats?.adsViewed || 0}
//                 </div>
//               </div>
//             </div>

//             <div className={styles.statCard}>
//               <div className={styles.statIcon}>
//                 <MousePointerClick color={COLORS.orange} size={32} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statLabel}>{t("Ads Clicked")}</div>
//                 <div className={styles.statValue}>
//                   {grapeStats.stats?.adsClicked || 0}
//                 </div>
//               </div>
//             </div>

//             <div className={styles.statCard}>
//               <div className={styles.statIcon}>
//                 <Coins color={COLORS.blue} size={32} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statLabel}>{t("Credits Earned")}</div>
//                 <div className={styles.statValue}>
//                   {grapeStats.stats?.creditsEarned || 0}
//                 </div>
//               </div>
//             </div>

//             <div className={styles.statCard}>
//               <div className={styles.statIcon}>
//                 <TrendingUp color={COLORS.green} size={32} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statLabel}>{t("This Month")}</div>
//                 <div className={styles.statValue}>
//                   {grapeStats.stats?.thisMonth || 0}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Streak Section */}
//           {grapeStats.stats && grapeStats.stats.currentStreak > 0 && (
//             <div className={styles.payoutSection}>
//               <div className={styles.pendingPayoutInfo}>
//                 <div className={styles.pendingBadge}>
//                   <Award size={20} />
//                   {t("{{streak}} Day Streak!", {
//                     streak: grapeStats.stats.currentStreak,
//                   })}
//                 </div>
//                 <p className={styles.pendingNote}>
//                   🔥{" "}
//                   {t(
//                     "Keep viewing ads daily to maintain your streak and earn bonus credits!",
//                   )}
//                 </p>
//               </div>
//             </div>
//           )}

//           <div className={styles.referralsSection}>
//             <h2>{t("Recent Activity")}</h2>
//             <div className={styles.referralsGrid}>
//               <div className={styles.referralStat}>
//                 <div className={styles.referralLabel}>{t("Viewed")}</div>
//                 <div className={styles.referralValue}>
//                   {grapeStats.stats?.adsViewed || 0}
//                 </div>
//               </div>
//               <div className={styles.referralStat}>
//                 <div className={styles.referralLabel}>{t("Clicked")}</div>
//                 <div className={styles.referralValue}>
//                   {grapeStats.stats?.adsClicked || 0}
//                 </div>
//               </div>
//               <div className={styles.referralStat}>
//                 <div className={styles.referralLabel}>{t("Earned")}</div>
//                 <div className={styles.referralValue}>
//                   {grapeStats.stats?.creditsEarned || 0}
//                 </div>
//               </div>
//               <div className={styles.referralStat}>
//                 <div className={styles.referralLabel}>{t("Redeemed")}</div>
//                 <div className={styles.referralValue}>
//                   {grapeStats.stats?.creditsRedeemed || 0}
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className={styles.info}>
//             <h3>{t("How It Works")}</h3>
//             <ul>
//               <li>{t("View relevant ads and earn credits")}</li>
//               <li>{t("Click ads to earn bonus credits")}</li>
//               <li>{t("Maintain daily streak for 2x credits")}</li>
//               <li>{t("Redeem credits for premium features")}</li>
//             </ul>
//           </div>

//           <div className={styles.footer}>
//             <a
//               href={`${FRONTEND_URL}`}
//               className={clsx("link", styles.logo)}
//               onClick={(e) => {
//                 if (e.metaKey || e.ctrlKey) {
//                   return
//                 }
//                 e.preventDefault()
//                 setIsNewChat({
//                        value: true,
//                      })
//               }}
//             >
//               <Logo isVivid size={32} /> {"Vex"}
//             </a>
//           </div>
//         </div>
//       </div>
//     </Skeleton>
//   )
// }
