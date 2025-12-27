// "use client"

// import React, { useState } from "react"
// import { COLORS, useAppContext } from "./context/AppContext"
// import toast from "react-hot-toast"
// import {
//   TrendingUp,
//   MousePointerClick,
//   Coins,
//   CircleArrowLeft,
//   Eye,
//   Target,
//   Plus,
// } from "./icons"
// import Logo from "./Logo"
// import Loading from "./Loading"
// import clsx from "clsx"
// import { useTheme } from "./platform"
// import { useAuth, useNavigationContext } from "./context/providers"
// import Skeleton from "./Skeleton"

// interface GrapeAdvertiserStats {
//   hasAdvertiserAccount: boolean
//   stats?: {
//     activeCampaigns: number
//     totalImpressions: number
//     totalClicks: number
//     totalConversions: number
//     totalSpent: number
//     avgCTR: number
//     avgCPC: number
//     status: string
//   }
//   campaigns?: Array<{
//     id: string
//     name: string
//     status: string
//     impressions: number
//     clicks: number
//     spent: number
//   }>
// }

// export default function GrapeAdvertiserDashboard() {
//   const { t } = useAppContext()

//   const { addHapticFeedback } = useTheme()
//   const { user, token, API_URL, FRONTEND_URL } = useAuth()
//   const { router, setIsNewChat } = useNavigationContext()

//   // TODO: Replace with real SWR hook
//   const [grapeStats, setGrapeStats] = useState<GrapeAdvertiserStats>({
//     hasAdvertiserAccount: true,
//     stats: {
//       activeCampaigns: 3,
//       totalImpressions: 45230,
//       totalClicks: 1567,
//       totalConversions: 89,
//       totalSpent: 45000, // cents
//       avgCTR: 3.46,
//       avgCPC: 28.7, // cents
//       status: "active",
//     },
//     campaigns: [
//       {
//         id: "1",
//         name: "React Native Tools",
//         status: "active",
//         impressions: 15000,
//         clicks: 520,
//         spent: 15000,
//       },
//       {
//         id: "2",
//         name: "Productivity Apps",
//         status: "active",
//         impressions: 20000,
//         clicks: 680,
//         spent: 20000,
//       },
//       {
//         id: "3",
//         name: "AI Services",
//         status: "paused",
//         impressions: 10230,
//         clicks: 367,
//         spent: 10000,
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

//   if (loadingGrapeStats || (grapeStats && !grapeStats?.hasAdvertiserAccount)) {
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
//               <button
//                 className="link"
//                 onClick={() => {
//                   router.push("/grape")
//                 }}
//               >
//                 <CircleArrowLeft />
//               </button>
//               📢 {t("Advertising")}
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

//           <div className={styles.linkSection}>
//             <h2>🚀 {t("Create New Campaign")}</h2>
//             <div className={styles.linkBox}>
//               <button
//                 className={clsx("inverted", styles.copyButton)}
//                 onClick={() => {
//                   addHapticFeedback()
//                   toast.success(t("Campaign creation coming soon!"))
//                 }}
//               >
//                 <Plus size={16} />
//                 {t("New Campaign")}
//               </button>
//             </div>
//             <p className={styles.linkHelp}>
//               {t(
//                 "Create targeted ad campaigns and reach engaged users across Chrry apps",
//               )}
//             </p>
//           </div>

//           <div className={styles.statsGrid}>
//             <div className={styles.statCard}>
//               <div className={styles.statIcon}>
//                 <Eye color={COLORS.violet} size={32} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statLabel}>{t("Impressions")}</div>
//                 <div className={styles.statValue}>
//                   {grapeStats.stats?.totalImpressions?.toLocaleString() || 0}
//                 </div>
//               </div>
//             </div>

//             <div className={styles.statCard}>
//               <div className={styles.statIcon}>
//                 <MousePointerClick color={COLORS.orange} size={32} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statLabel}>{t("Clicks")}</div>
//                 <div className={styles.statValue}>
//                   {grapeStats.stats?.totalClicks?.toLocaleString() || 0}
//                 </div>
//               </div>
//             </div>

//             <div className={styles.statCard}>
//               <div className={styles.statIcon}>
//                 <TrendingUp color={COLORS.blue} size={32} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statLabel}>{t("CTR")}</div>
//                 <div className={styles.statValue}>
//                   {grapeStats.stats?.avgCTR?.toFixed(2) || 0}%
//                 </div>
//               </div>
//             </div>

//             <div className={styles.statCard}>
//               <div className={styles.statIcon}>
//                 <Coins color={COLORS.green} size={32} />
//               </div>
//               <div className={styles.statContent}>
//                 <div className={styles.statLabel}>{t("Total Spent")}</div>
//                 <div className={styles.statValue}>
//                   €{((grapeStats.stats?.totalSpent || 0) / 100).toFixed(2)}
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className={styles.referralsSection}>
//             <h2>{t("Campaign Performance")}</h2>
//             <div className={styles.referralsGrid}>
//               <div className={styles.referralStat}>
//                 <div className={styles.referralLabel}>{t("Active")}</div>
//                 <div className={styles.referralValue}>
//                   {grapeStats.stats?.activeCampaigns || 0}
//                 </div>
//               </div>
//               <div className={styles.referralStat}>
//                 <div className={styles.referralLabel}>{t("Impressions")}</div>
//                 <div className={styles.referralValue}>
//                   {(grapeStats.stats?.totalImpressions || 0) >= 1000
//                     ? `${((grapeStats.stats?.totalImpressions || 0) / 1000).toFixed(1)}k`
//                     : grapeStats.stats?.totalImpressions || 0}
//                 </div>
//               </div>
//               <div className={styles.referralStat}>
//                 <div className={styles.referralLabel}>{t("Conversions")}</div>
//                 <div className={styles.referralValue}>
//                   {grapeStats.stats?.totalConversions || 0}
//                 </div>
//               </div>
//               <div className={styles.referralStat}>
//                 <div className={styles.referralLabel}>{t("Avg CPC")}</div>
//                 <div className={styles.referralValue}>
//                   €{((grapeStats.stats?.avgCPC || 0) / 100).toFixed(2)}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Active Campaigns List */}
//           {grapeStats.campaigns && grapeStats.campaigns.length > 0 && (
//             <div className={styles.payoutSection}>
//               <h3>{t("Active Campaigns")}</h3>
//               {grapeStats.campaigns.map((campaign) => (
//                 <div key={campaign.id} className={styles.pendingPayoutInfo}>
//                   <div className={styles.pendingBadge}>
//                     <Target size={20} />
//                     {campaign.name}
//                   </div>
//                   <p className={styles.pendingAmount}>
//                     {campaign.impressions.toLocaleString()} {t("impressions")} ·{" "}
//                     {campaign.clicks} {t("clicks")}
//                   </p>
//                   <p className={styles.pendingNote}>
//                     {t("Spent")}: €{(campaign.spent / 100).toFixed(2)} ·{" "}
//                     {t("Status")}: {campaign.status}
//                   </p>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className={styles.info}>
//             <h3>{t("Advertising Features")}</h3>
//             <ul>
//               <li>{t("Context-aware targeting (no tracking)")}</li>
//               <li>{t("Performance-based pricing (CPC/CPM)")}</li>
//               <li>{t("Real-time analytics and reporting")}</li>
//               <li>
//                 {t("Minimum budget: {{amount}}", { amount: "€500/month" })}
//               </li>
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
//                 setIsNewChat(true)
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
