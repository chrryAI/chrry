"use client"

// import React, { useState, useEffect } from "react"
// import { useAuth, useTribe, useChat } from "./context/providers"
// import { Div, Span, P, H1, H2, H3, Button, useTheme } from "./platform"
// import Skeleton from "./Skeleton"
// import Img from "./Image"
// import A from "./a/A"
// import { useTribeStyles } from "./Tribe.styles"
// import { useAppContext } from "./context/AppContext"
// import { useStyles } from "./context/StylesContext"
// import { useNavigationContext } from "./context/providers/NavigationProvider"
// import { MessageCircleReply, LoaderCircle, Sparkles } from "./icons"
// import Loading from "./Loading"
// import type { app } from "./types"

// interface AgentProfileProps {
//   agent?: app
//   children?: React.ReactNode
// }

// export default function AgentProfileFuture({
//   agent: initialAgent,
//   children,
// }: AgentProfileProps) {
//   const { tribePosts, setUntil, until, isLoadingPosts } = useTribe()
//   const { timeAgo, loadingApp, API_URL } = useAuth()
//   const { setIsNewAppChat } = useChat()
//   const { t } = useAppContext()
//   const { isDark } = useTheme()
//   const { utilities } = useStyles()
//   const styles = useTribeStyles()
//   const { pathname } = useNavigationContext()

//   const [agent, setAgent] = useState<app | undefined>(initialAgent)
//   const [isLoadingAgent, setIsLoadingAgent] = useState(!initialAgent)
//   const [isLoadingMore, setIsLoadingMore] = useState(false)

//   // Fetch agent if not provided (client-side routing)
//   useEffect(() => {
//     if (!initialAgent && pathname?.startsWith("/agent/")) {
//       const slug = pathname.replace("/agent/", "").split("?")[0].split("#")[0]

//       console.log("🔍 Fetching agent:", slug)
//       console.log("📍 API_URL:", API_URL)

//       setIsLoadingAgent(true)
//       fetch(`${API_URL}/apps/slug/${encodeURIComponent(slug)}`)
//         .then((res) => {
//           console.log("📡 Agent fetch response status:", res.status)
//           if (!res.ok) {
//             throw new Error(`HTTP ${res.status}`)
//           }
//           return res.json()
//         })
//         .then((data) => {
//           console.log("✅ Agent data received:", data)
//           if (data.error) {
//             console.error("❌ API returned error:", data.error)
//             setAgent(undefined)
//           } else {
//             setAgent(data)
//           }
//           setIsLoadingAgent(false)
//         })
//         .catch((error) => {
//           console.error("❌ Failed to fetch agent:", error)
//           setAgent(undefined)
//           setIsLoadingAgent(false)
//         })
//     } else if (initialAgent) {
//       setIsLoadingAgent(false)
//     }
//   }, [initialAgent, pathname, API_URL])

//   // Filter posts by this agent
//   const agentPosts = agent
//     ? tribePosts?.posts.filter((post) => post.app?.id === agent.id) || []
//     : []
//   const agentPostsCount = agentPosts.length

//   if (isLoadingAgent) {
//     return (
//       <Skeleton>
//         <Div
//           style={{
//             ...styles.container.style,
//             textAlign: "center",
//             padding: "2rem",
//           }}
//         >
//           <Loading size={48} />
//           <P style={{ marginTop: "1rem", color: "var(--shade-6)" }}>
//             {t("Loading agent profile...")}
//           </P>
//         </Div>
//       </Skeleton>
//     )
//   }

//   if (!agent) {
//     return (
//       <Skeleton>
//         <Div
//           style={{
//             ...styles.container.style,
//             textAlign: "center",
//             padding: "2rem",
//           }}
//         >
//           <P style={{ color: "var(--shade-6)" }}>{t("Agent not found")}</P>
//         </Div>
//       </Skeleton>
//     )
//   }

//   return (
//     <Skeleton>
//       <Div style={{ ...styles.container.style }}>
//         {/* Agent Profile Header */}
//         <Div
//           style={{
//             marginBottom: "2rem",
//             padding: "1.5rem",
//             background: isDark ? "var(--shade-2)" : "var(--shade-1)",
//             borderRadius: "20px",
//             border: isDark
//               ? "1px solid var(--shade-3)"
//               : "1px solid var(--shade-2-transparent)",
//           }}
//         >
//           <Div
//             style={{
//               display: "flex",
//               alignItems: "center",
//               gap: "1rem",
//               marginBottom: "1rem",
//             }}
//           >
//             <Img app={agent as any} size={64} />
//             <Div>
//               <H1
//                 style={{
//                   margin: 0,
//                   padding: 0,
//                   fontSize: "1.8rem",
//                 }}
//               >
//                 {agent.name}
//               </H1>
//               <Span
//                 style={{
//                   fontSize: ".9rem",
//                   color: "var(--shade-6)",
//                 }}
//               >
//                 @{agent.slug}
//               </Span>
//             </Div>
//           </Div>

//           {agent.description && (
//             <P
//               style={{
//                 fontSize: "1rem",
//                 lineHeight: "1.6",
//                 color: "var(--shade-7)",
//                 marginBottom: "1rem",
//               }}
//             >
//               {agent.description}
//             </P>
//           )}

//           {/* Agent Stats */}
//           <Div
//             style={{
//               display: "flex",
//               gap: "1.5rem",
//               flexWrap: "wrap",
//               fontSize: ".9rem",
//             }}
//           >
//             <Div
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: ".25rem",
//               }}
//             >
//               <Span style={{ fontWeight: 600 }}>{agentPostsCount}</Span>
//               <Span style={{ color: "var(--shade-6)" }}>
//                 {t(agentPostsCount === 1 ? "post" : "posts")}
//               </Span>
//             </Div>

//             {agent.tribeKarma !== null && agent.tribeKarma !== undefined && (
//               <Div
//                 style={{
//                   display: "flex",
//                   alignItems: "center",
//                   gap: ".25rem",
//                 }}
//               >
//                 <Span style={{ fontWeight: 600 }}>{agent.tribeKarma}</Span>
//                 <Span style={{ color: "var(--shade-6)" }}>{t("karma")}</Span>
//               </Div>
//             )}
//           </Div>

//           {/* Action Button */}
//           <Button
//             onClick={() => {
//               setIsNewAppChat(agent as any)
//             }}
//             className="inverted"
//             style={{ ...utilities.inverted.style, marginTop: "1rem" }}
//           >
//             <Sparkles size={16} color="var(--accent-1)" />
//             {t("Chat with Agent")}
//           </Button>
//         </Div>

//         {/* Agent Posts */}
//         {agentPosts.length > 0 && (
//           <Div>
//             <H2
//               style={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 7,
//                 margin: 0,
//                 marginBottom: "1rem",
//               }}
//             >
//               <Img logo="coder" size={30} />
//               <Span>{t("Agent's Posts")}</Span>
//             </H2>

//             {agentPosts.map((post) => (
//               <Div
//                 key={post.id}
//                 style={{
//                   marginTop: "1rem",
//                   padding: "0.75rem",
//                   background: isDark ? "var(--shade-2)" : "var(--shade-1)",
//                   borderRadius: "20px",
//                   border: isDark
//                     ? "1px solid var(--shade-3)"
//                     : "1px solid var(--shade-2-transparent)",
//                 }}
//               >
//                 <Div
//                   style={{
//                     display: "flex",
//                     gap: 5,
//                     alignItems: "center",
//                     fontSize: ".9rem",
//                   }}
//                 >
//                   <A
//                     href={`/${post.tribe?.slug || "general"}`}
//                     style={{
//                       marginLeft: "auto",
//                       fontSize: ".8rem",
//                       flexDirection: "row",
//                       alignItems: "center",
//                       gap: 5,
//                       display: "flex",
//                     }}
//                   >
//                     <Img size={16} icon={"zarathustra"} />
//                     {`/${post.tribe?.slug || "general"}`}
//                   </A>
//                 </Div>
//                 <H3
//                   style={{
//                     margin: 0,
//                     padding: 0,
//                   }}
//                 >
//                   <A
//                     href={`/p/${post.id}`}
//                     style={{
//                       marginTop: 10,
//                       fontSize: "1.1rem",
//                       lineHeight: "1.5",
//                     }}
//                   >
//                     {post.title}
//                   </A>
//                 </H3>
//                 <P
//                   style={{
//                     marginTop: 5,
//                     fontSize: "0.95rem",
//                     color: "var(--shade-7)",
//                     lineHeight: "1.5",
//                   }}
//                 >
//                   {post.content}
//                 </P>

//                 <Div
//                   style={{
//                     display: "flex",
//                     flexDirection: "column",
//                     gap: ".75rem",
//                     marginTop: "0.75rem",
//                   }}
//                 >
//                   <Div
//                     style={{
//                       display: "flex",
//                       gap: "0.5rem",
//                       fontSize: ".9rem",
//                       color: "var(--shade-6)",
//                     }}
//                   >
//                     {post.comments && post.comments.length > 0 && (
//                       <A
//                         href={`/p/${post.id}`}
//                         style={{
//                           gap: "0.25rem",
//                           fontSize: ".9rem",
//                           color: "var(--shade-6)",
//                         }}
//                       >
//                         <MessageCircleReply color="var(--accent-5)" size={16} />
//                         {post.comments.length}{" "}
//                         {t(post.comments.length === 1 ? "comment" : "comments")}
//                       </A>
//                     )}
//                     <Span
//                       style={{
//                         marginLeft: "auto",
//                       }}
//                     >
//                       {timeAgo(post.createdOn)}
//                     </Span>
//                   </Div>

//                   {post.characterProfiles &&
//                     post.characterProfiles.length > 0 && (
//                       <Div
//                         style={{
//                           fontSize: "12px",
//                           color: "#888",
//                           display: "flex",
//                           gap: ".5rem",
//                         }}
//                       >
//                         {post.characterProfiles?.slice(0, 4).map((p) => (
//                           <Button
//                             key={p.id}
//                             className="inverted"
//                             style={{
//                               ...utilities.inverted.style,
//                               ...utilities.small.style,
//                               fontSize: ".8rem",
//                             }}
//                           >
//                             <Sparkles
//                               size={16}
//                               color="var(--accent-1)"
//                               fill="var(--accent-1)"
//                             />
//                             {p.name}
//                           </Button>
//                         ))}
//                       </Div>
//                     )}

//                   {post.reactions && post.reactions.length > 0 && (
//                     <Div
//                       style={{
//                         display: "flex",
//                         gap: "0.7rem",
//                         flexWrap: "wrap",
//                       }}
//                     >
//                       {Object.entries(
//                         post.reactions.reduce(
//                           (acc, r) => {
//                             const emoji = r.emoji
//                             acc[emoji] = (acc[emoji] || 0) + 1
//                             return acc
//                           },
//                           {} as Record<string, number>,
//                         ),
//                       ).map(([emoji, count]) => (
//                         <Span
//                           key={emoji}
//                           style={{
//                             background: isDark
//                               ? "var(--shade-3)"
//                               : "var(--shade-2)",
//                             padding: "4px 8px",
//                             borderRadius: "12px",
//                             fontSize: "14px",
//                           }}
//                         >
//                           {emoji} {count}
//                         </Span>
//                       ))}
//                     </Div>
//                   )}
//                 </Div>
//               </Div>
//             ))}

//             {tribePosts?.hasNextPage && (
//               <Div
//                 style={{
//                   display: "flex",
//                   justifyContent: "center",
//                   marginTop: "1.25rem",
//                 }}
//               >
//                 <Button
//                   disabled={isLoadingPosts}
//                   onClick={() => {
//                     setIsLoadingMore(true)
//                     setUntil((until || 0) + 1)
//                   }}
//                   style={{
//                     fontSize: 13,
//                     padding: "5px 10px",
//                     display: "flex",
//                     alignItems: "center",
//                     gap: 5,
//                   }}
//                 >
//                   {isLoadingPosts ? (
//                     <Loading color="#fff" size={16} />
//                   ) : (
//                     <LoaderCircle size={16} />
//                   )}
//                   {t("Load more")}
//                 </Button>
//               </Div>
//             )}
//           </Div>
//         )}

//         {agentPosts.length === 0 && (
//           <Div
//             style={{
//               textAlign: "center",
//               padding: "2rem",
//               color: "var(--shade-6)",
//             }}
//           >
//             <P>{t("This agent hasn't posted yet.")}</P>
//           </Div>
//         )}

//         {children}
//       </Div>
//     </Skeleton>
//   )
// }

export default function AgentProfile() {
  return null
}
