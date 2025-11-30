// import React from "react"
// import clsx from "clsx"
// import { Button, Div, Span, useLocalStorage, useNavigation } from "./platform"
// import { Coins } from "./icons"
// import { COLORS } from "./context/ThemeContext"
// import { useState, useEffect } from "react"
// import Modal from "./Modal"
// import Img from "./Image"
// import { useAppContext } from "./context/AppContext"
// import { useAuth } from "./context/providers"

// type GrapeView =
//   | "onboarding"
//   | "consumer-home"
//   | "consumer-stats"
//   | "consumer-earnings"
//   | "advertiser-home"
//   | "advertiser-campaigns"
//   | "advertiser-analytics"
//   | "settings"

// type UserRole = "consumer" | "advertiser" | "both"

// export default function Grape({ style }: { style?: React.CSSProperties }) {
//   const { searchParams } = useNavigation()
//   const [isModalOpen, setIsModalOpen] = useState(
//     searchParams.get("grape") === "true",
//   )

//   const { t } = useAppContext()
//   const { user, guest } = useAuth()

//   // Load role from localStorage or user/guest data
//   const [userRole, setUserRole] = useLocalStorage<UserRole>("grapeRole", "both")

//   const [option, setOption] = useState<UserRole>("consumer")

//   const [currentView, setCurrentView] = useState<GrapeView>("onboarding")

//   useEffect(() => {
//     const grape = searchParams.get("grape")
//     if (grape) {
//       setIsModalOpen(true)
//     }
//   }, [searchParams])

//   useEffect(() => {
//     // Set initial view based on role
//     if (userRole === "consumer") {
//       setCurrentView("consumer-home")
//     } else if (userRole === "advertiser") {
//       setCurrentView("advertiser-home")
//     } else if (userRole === "both") {
//       setCurrentView("consumer-home")
//     } else {
//       setCurrentView("onboarding")
//     }
//   }, [userRole])

//   const handleRoleSelect = (role: UserRole) => {
//     setUserRole(role)
//   }

//   const renderOnboarding = () => (
//     <section>
//       <header>
//         {/* <p>Choose how you want to use Grape:</p> */}
//         <div className={styles.icons}>
//           <button
//             className={clsx(
//               "link",
//               styles.icon,
//               option === "consumer" && styles.selected,
//             )}
//             onClick={() => setOption("consumer")}
//           >
//             <Img icon="pacman" size={128} />
//           </button>
//           <button
//             className={clsx(
//               "link",
//               styles.icon,
//               option === "advertiser" && styles.selected,
//             )}
//             onClick={() => setOption("advertiser")}
//           >
//             <Img icon="spaceInvader" size={128} />
//           </button>
//         </div>
//       </header>

//       <article>
//         {option === "consumer" && (
//           <div
//             className={clsx(styles.option, styles.consumer)}
//             // onClick={() => handleRoleSelect("consumer")}
//           >
//             <h3 className={styles.title}>I want to earn 💰</h3>
//             <p>View relevant ads and earn credits for your attention</p>
//           </div>
//         )}

//         {option === "advertiser" && (
//           <div
//             className={clsx(styles.option, styles.advertiser)}
//             // onClick={() => setOption("advertiser")}
//           >
//             <h3 className={styles.title}>I want to advertise 📢</h3>
//             <p>Create campaigns and reach engaged audiences</p>
//           </div>
//         )}
//         <div className={styles.actions}>
//           {user && user.adConsent ? (
//             <button>Continue</button>
//           ) : (
//             <div className={styles.adConsent}>
//               <p>Some info and privacy link</p>
//               <button>Accept</button>
//             </div>
//           )}
//           {guest ? (
//             <>
//               <button>Create Account</button>
//               <button>Sign In</button>
//             </>
//           ) : null}
//         </div>
//       </article>
//     </section>
//   )

//   const renderConsumerHome = () => (
//     <section>
//       <header>
//         <h2>Available Ads</h2>
//         <p>View ads and earn credits</p>
//       </header>

//       <article>
//         <div>
//           <h3>Your Balance</h3>
//           <p>
//             <strong>$0.00</strong>
//           </p>
//           <small>0 views today</small>
//         </div>

//         <div>
//           <h3>Ready to View</h3>
//           <p>No ads available right now</p>
//           <small>Check back soon or browse content to find relevant ads</small>
//         </div>
//       </article>
//     </section>
//   )

//   const renderConsumerStats = () => (
//     <section>
//       <header>
//         <h2>Your Stats</h2>
//         <p>View history and performance</p>
//       </header>

//       <article>
//         <dl>
//           <dt>Total Views</dt>
//           <dd>0</dd>

//           <dt>Total Earned</dt>
//           <dd>$0.00</dd>

//           <dt>Average per View</dt>
//           <dd>$0.00</dd>

//           <dt>This Month</dt>
//           <dd>$0.00</dd>
//         </dl>

//         <div>
//           <h3>Recent Activity</h3>
//           <p>No activity yet</p>
//         </div>
//       </article>
//     </section>
//   )

//   const renderConsumerEarnings = () => (
//     <section>
//       <header>
//         <h2>Earnings</h2>
//         <p>Manage your earnings and payouts</p>
//       </header>

//       <article>
//         <div>
//           <h3>Available Balance</h3>
//           <p>
//             <strong>$0.00</strong>
//           </p>
//         </div>

//         <div>
//           <h3>Pending</h3>
//           <p>$0.00</p>
//         </div>

//         <div>
//           <h3>Total Paid Out</h3>
//           <p>$0.00</p>
//         </div>

//         <button disabled>
//           <span>💸</span>
//           Request Payout
//         </button>
//         <small>Minimum payout: $10.00</small>
//       </article>
//     </section>
//   )

//   const renderAdvertiserHome = () => (
//     <section>
//       <header>
//         <h2>Campaign Overview</h2>
//         <p>Your advertising dashboard</p>
//       </header>

//       <article>
//         <div>
//           <h3>Active Campaigns</h3>
//           <p>
//             <strong>0</strong>
//           </p>
//         </div>

//         <div>
//           <h3>Total Spent</h3>
//           <p>$0.00</p>
//         </div>

//         <div>
//           <h3>Total Views</h3>
//           <p>0</p>
//         </div>

//         <div>
//           <h3>Total Clicks</h3>
//           <p>0</p>
//         </div>

//         <button onClick={() => setCurrentView("advertiser-campaigns")}>
//           <span>➕</span>
//           Create Campaign
//         </button>
//       </article>
//     </section>
//   )

//   const renderAdvertiserCampaigns = () => (
//     <section>
//       <header>
//         <h2>Campaigns</h2>
//         <p>Manage your ad campaigns</p>
//       </header>

//       <article>
//         <button>
//           <span>➕</span>
//           Create New Campaign
//         </button>

//         <div>
//           <h3>Your Campaigns</h3>
//           <p>No campaigns yet</p>
//           <small>Create your first campaign to get started</small>
//         </div>
//       </article>
//     </section>
//   )

//   const renderAdvertiserAnalytics = () => (
//     <section>
//       <header>
//         <h2>Analytics</h2>
//         <p>Campaign performance insights</p>
//       </header>

//       <article>
//         <div>
//           <h3>Performance Overview</h3>
//           <dl>
//             <dt>Impressions</dt>
//             <dd>0</dd>

//             <dt>Clicks</dt>
//             <dd>0</dd>

//             <dt>CTR</dt>
//             <dd>0%</dd>

//             <dt>Conversions</dt>
//             <dd>0</dd>

//             <dt>Cost per View</dt>
//             <dd>$0.00</dd>

//             <dt>Cost per Click</dt>
//             <dd>$0.00</dd>
//           </dl>
//         </div>

//         <div>
//           <h3>Top Performing Campaigns</h3>
//           <p>No data available</p>
//         </div>
//       </article>
//     </section>
//   )

//   const renderSettings = () => (
//     <section>
//       <header>
//         <h2>Settings</h2>
//         <p>Manage your Grape preferences</p>
//       </header>

//       <article>
//         <div>
//           <h3>Account</h3>
//           <dl>
//             <dt>Role</dt>
//             <dd>{userRole}</dd>

//             <dt>Ad Consent</dt>
//             <dd>
//               {(user as any)?.adConsent || (guest as any)?.adConsent
//                 ? "Granted"
//                 : "Not granted"}
//             </dd>
//           </dl>
//         </div>

//         <div>
//           <h3>Change Role</h3>
//           <button onClick={() => handleRoleSelect("consumer")}>
//             👤 Consumer
//           </button>
//           <button onClick={() => handleRoleSelect("advertiser")}>
//             📢 Advertiser
//           </button>
//           <button onClick={() => handleRoleSelect("both")}>🔄 Both</button>
//         </div>

//         <div>
//           <h3>Privacy</h3>
//           <label>
//             <input type="checkbox" />
//             Enable ad consent
//           </label>
//           <small>Allow Grape to analyze content and show relevant ads</small>
//         </div>

//         <button
//           onClick={() => {
//             setUserRole("both")
//             setCurrentView("onboarding")
//           }}
//         >
//           Reset Grape
//         </button>
//       </article>
//     </section>
//   )

//   const renderContent = () => {
//     switch (currentView) {
//       case "onboarding":
//         return renderOnboarding()
//       case "consumer-home":
//         return renderConsumerHome()
//       case "consumer-stats":
//         return renderConsumerStats()
//       case "consumer-earnings":
//         return renderConsumerEarnings()
//       case "advertiser-home":
//         return renderAdvertiserHome()
//       case "advertiser-campaigns":
//         return renderAdvertiserCampaigns()
//       case "advertiser-analytics":
//         return renderAdvertiserAnalytics()
//       case "settings":
//         return renderSettings()
//       default:
//         return renderOnboarding()
//     }
//   }

//   const renderFooter = () => {
//     if (currentView === "onboarding") return null

//     if (userRole === "consumer") {
//       return (
//         <footer>
//           <nav>
//             <button onClick={() => setCurrentView("consumer-home")}>
//               <span>🏠</span>
//               <small>Home</small>
//             </button>
//             <button onClick={() => setCurrentView("consumer-stats")}>
//               <span>📊</span>
//               <small>Stats</small>
//             </button>
//             <button onClick={() => setCurrentView("consumer-earnings")}>
//               <span>💰</span>
//               <small>Earnings</small>
//             </button>
//             <button onClick={() => setCurrentView("settings")}>
//               <span>⚙️</span>
//               <small>Settings</small>
//             </button>
//           </nav>
//         </footer>
//       )
//     }

//     if (userRole === "advertiser") {
//       return (
//         <footer>
//           <nav>
//             <button onClick={() => setCurrentView("advertiser-home")}>
//               <span>🏠</span>
//               <small>Home</small>
//             </button>
//             <button onClick={() => setCurrentView("advertiser-campaigns")}>
//               <span>📢</span>
//               <small>Campaigns</small>
//             </button>
//             <button onClick={() => setCurrentView("advertiser-analytics")}>
//               <span>📊</span>
//               <small>Analytics</small>
//             </button>
//             <button onClick={() => setCurrentView("settings")}>
//               <span>⚙️</span>
//               <small>Settings</small>
//             </button>
//           </nav>
//         </footer>
//       )
//     }

//     if (userRole === "both") {
//       return (
//         <footer>
//           <nav>
//             <button onClick={() => setCurrentView("consumer-home")}>
//               <span>🏠</span>
//               <small>Home</small>
//             </button>
//             <button onClick={() => setCurrentView("consumer-earnings")}>
//               <span>💰</span>
//               <small>Earn</small>
//             </button>
//             <button onClick={() => setCurrentView("advertiser-campaigns")}>
//               <span>📢</span>
//               <small>Advertise</small>
//             </button>
//             <button onClick={() => setCurrentView("advertiser-analytics")}>
//               <span>📊</span>
//               <small>Stats</small>
//             </button>
//             <button onClick={() => setCurrentView("settings")}>
//               <span>⚙️</span>
//               <small>Settings</small>
//             </button>
//           </nav>
//         </footer>
//       )
//     }

//     return null
//   }

//   return (
//     <>
//       <div className={clsx(styles.grape)} style={style}>
//         <Button
//           onClick={() => setIsModalOpen(true)}
//           className="link"
//           style={{
//             fontSize: "1.4rem",
//           }}
//         >
//           🍇
//           <Coins size={18} color={COLORS.blue} />
//         </Button>
//         <Modal
//           hasCloseButton
//           hideOnClickOutside={false}
//           icon={<Span style={{ fontSize: "1.5rem" }}>🍇</Span>}
//           isModalOpen={isModalOpen}
//           onToggle={(open) => setIsModalOpen(open)}
//           title="Grape"
//         >
//           <main>{renderContent()}</main>
//           {renderFooter()}
//         </Modal>
//       </div>
//     </>
//   )
// }
