// import React, { useEffect, useState, useMemo } from "react"
// import { useTheme } from "./context/ThemeContext"
// import { useAppContext } from "./context/AppContext"
// import SkiaLineChart from "./SkiaLineChart"
// import SkiaBarChart from "./SkiaBarChart"
// import { useTranslation } from "react-i18next"
// import { ArrowLeft, ArrowRight, CircleX, Presentation } from "lucide-react"
// // import { message, mood, taskLog } from "@repo/db"
// import timeAgo from "./utils/timeAgo"
// import TextWithLinks from "./TextWithLinks"
// import { Div, Text, ScrollView, Image, Button } from "./platform"
// import { useMoodReportsStyles } from "./MoodReports.styles"
// import Modal from "./Modal"
// import Loading from "./Loading"
// import { emojiMap, moodValues, Mood, DataPoint } from "./utils/chartTypes"
// import {
//   getMoodEmoji,
//   weekDays,
//   getStartOfWeek,
//   getEndOfWeek,
//   isLatestWeek,
//   isLatestMonth,
//   getMostFrequentMood,
//   getMoodValue,
// } from "./utils/chartUtils"

// const MAX_MOBILE_WIDTH = 500

// type MoodWithRelations = mood & {
//   message?: message
//   taskLog?: taskLog
// }

// export default function MoodReports() {
//   const { colors } = useTheme()
//   const styles = useMoodReportsStyles()
//   const { t, i18n } = useTranslation()
//   const { moods, fetchMoods, isLoadingMoods, isDemo, setIsDemo, language } =
//     useAppContext()
//   const [currentWeek, setCurrentWeek] = useState(new Date())
//   const [currentMonth, setCurrentMonth] = useState(new Date())
//   const [selectedMood, setSelectedMood] = useState<
//     MoodWithRelations | undefined
//   >()

//   useEffect(() => {
//     fetchMoods()
//   }, [])

//   // Week navigation
//   const goToPreviousWeek = () => {
//     const newWeek = new Date(currentWeek)
//     newWeek.setDate(newWeek.getDate() - 7)
//     setCurrentWeek(newWeek)
//   }
//   const goToNextWeek = () => {
//     const newWeek = new Date(currentWeek)
//     newWeek.setDate(newWeek.getDate() + 7)
//     setCurrentWeek(newWeek)
//   }

//   // Month navigation
//   const goToPreviousMonth = () => {
//     const newMonth = new Date(currentMonth)
//     newMonth.setMonth(newMonth.getMonth() - 1)
//     setCurrentMonth(newMonth)
//   }
//   const goToNextMonth = () => {
//     const newMonth = new Date(currentMonth)
//     newMonth.setMonth(newMonth.getMonth() + 1)
//     setCurrentMonth(newMonth)
//   }

//   // Get moods for current week
//   const weekMoods = useMemo(() => {
//     const start = getStartOfWeek(currentWeek)
//     const end = getEndOfWeek(currentWeek)
//     return (
//       moods.moods?.filter((m) => {
//         const d = new Date(m.createdOn)
//         return d >= start && d <= end
//       }) || []
//     )
//   }, [moods.moods, currentWeek])

//   // Emoji per day for current week
//   const dailyMoods = weekDays.map((day, idx) => {
//     const jsDay = idx === 6 ? 0 : idx + 1 // Map Sun=0, Mon=1, ...
//     const mood = weekMoods.find((m) => new Date(m.createdOn).getDay() === jsDay)
//     return {
//       day,
//       emoji: getMoodEmoji(mood?.type ?? ""),
//       type: mood?.type,
//       message: mood?.message,
//       createdOn: mood?.createdOn,
//       updatedOn: mood?.updatedOn,
//       guestId: mood?.guestId,
//       taskLog: mood?.taskLog,
//       id: mood?.id,
//       userId: mood?.userId,
//       taskLogId: mood?.taskLogId,
//     }
//   })

//   // Weekly chart data
//   const weekChartData: DataPoint[] = weekMoods.map((m) => ({
//     value: getMoodValue(m.type),
//     label: new Date(m.createdOn).toLocaleDateString(language, {
//       month: "short",
//       day: "numeric",
//     }),
//     date:
//       typeof m.createdOn === "string"
//         ? m.createdOn
//         : new Date(m.createdOn).toISOString(),
//   }))

//   // Monthly chart data
//   const monthStart = new Date(
//     currentMonth.getFullYear(),
//     currentMonth.getMonth(),
//     1,
//   )
//   const monthEnd = new Date(
//     currentMonth.getFullYear(),
//     currentMonth.getMonth() + 1,
//     0,
//     23,
//     59,
//     59,
//     999,
//   )
//   const monthlyMoods =
//     moods.moods?.filter((m) => {
//       const d = new Date(m.createdOn)
//       return d >= monthStart && d <= monthEnd
//     }) || []

//   // Group by week number
//   const weeklySums: Record<number, { sum: number; count: number }> = {}
//   monthlyMoods.forEach((m) => {
//     const d = new Date(m.createdOn)
//     const weekNum = Math.ceil(d.getDate() / 7)
//     const val = getMoodValue(m.type)
//     if (!weeklySums[weekNum]) weeklySums[weekNum] = { sum: 0, count: 0 }
//     weeklySums[weekNum].sum += val
//     weeklySums[weekNum].count++
//   })

//   // Find most frequent mood per week for emoji
//   const moodsByWeek: Record<number, string[]> = {}
//   monthlyMoods.forEach((m) => {
//     const d = new Date(m.createdOn)
//     const weekNum = Math.ceil(d.getDate() / 7)
//     if (!moodsByWeek[weekNum]) moodsByWeek[weekNum] = []
//     moodsByWeek[weekNum].push(m.type)
//   })

//   const monthlyChartData = Object.entries(weeklySums).map(([week, data]) => {
//     const moodsArr = moodsByWeek[Number(week)] || []
//     const mood = getMostFrequentMood(moodsArr)
//     return {
//       label: t("week_number", { number: week }),
//       value: Math.round(data.sum / data.count),
//       date: String(week),
//       mood,
//     }
//   })

//   if (isLoadingMoods) {
//     return (
//       <Div style={styles.loadingContainer.style}>
//         <Loading size={24} />
//       </Div>
//     )
//   }

//   return (
//     <ScrollView
//       style={{
//         marginTop: "5px",
//         backgroundColor: colors.background,
//         paddingLeft: "10px",
//         paddingRight: "10px",
//         paddingBottom: "180px",
//         marginLeft: "auto",
//         marginRight: "auto",
//         maxWidth: `${MAX_MOBILE_WIDTH}px`,
//         width: "100%",
//       }}
//     >
//       {/* Modal for mood details */}
//       {selectedMood && (
//         <Modal
//           isModalOpen={!!selectedMood}
//           onToggle={() => setSelectedMood(undefined)}
//           title={timeAgo(selectedMood.createdOn, language)}
//         >
//           <Div>
//             {!selectedMood.message ? (
//               <Text
//                 style={{
//                   color: colors.shade6,
//                   textAlign: "center",
//                   marginTop: "24px",
//                   marginBottom: "24px",
//                 }}
//               >
//                 {t("No messages for this day")}
//               </Text>
//             ) : (
//               <Div
//                 style={{
//                   display: "flex",
//                   flexDirection: "row",
//                   alignItems: "flex-start",
//                   gap: "5px",
//                   marginBottom: "12px",
//                   lineHeight: "20px",
//                 }}
//               >
//                 <TextWithLinks
//                   text={`${emojiMap[selectedMood.type as Mood]} ${selectedMood.message.content}`}
//                   style={{
//                     fontSize: "15px",
//                     color: colors.foreground,
//                     marginBottom: "2px",
//                   }}
//                 />
//               </Div>
//             )}
//           </Div>
//         </Modal>
//       )}

//       {/* Daily Section */}
//       <Div>
//         <Div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "8px",
//           }}
//         >
//           <Text
//             style={{
//               fontSize: "18px",
//               fontWeight: "600",
//               color: colors.shade8,
//               marginBottom: "5px",
//             }}
//           >
//             🫥 {t("Daily")}
//           </Text>

//           <Button
//             onClick={() => setIsDemo(!isDemo)}
//             style={{
//               display: "flex",
//               flexDirection: "row",
//               alignItems: "center",
//               gap: "3px",
//             }}
//           >
//             <Presentation color={colors.accent6} size={16} />
//             <Text style={{ fontSize: "14px" }}>
//               {isDemo ? t("Hide demo") : t("Show demo")}
//             </Text>
//           </Button>
//         </Div>

//         <Div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "8px",
//             borderColor: colors.accent1,
//             borderWidth: "2px",
//             borderStyle: "solid",
//             borderRadius: "20px",
//             padding: "10px",
//             paddingTop: "20px",
//             paddingBottom: "20px",
//           }}
//         >
//           {dailyMoods.map((m, i) => (
//             <Div
//               key={i}
//               style={{
//                 flex: 1,
//                 display: "flex",
//                 justifyContent: "center",
//                 flexDirection: "column",
//                 alignItems: "center",
//               }}
//             >
//               <Button
//                 onClick={() => {
//                   if (m.id) {
//                     setSelectedMood({
//                       ...m,
//                       id: m.id,
//                       userId: m.userId!,
//                       guestId: m.guestId!,
//                       taskLogId: m.taskLogId!,
//                       taskLog: m.taskLog!,
//                       message: m.message!,
//                       createdOn: m.createdOn!,
//                       updatedOn: m.updatedOn!,
//                       type: m.type!,
//                     })
//                   }
//                 }}
//                 style={{
//                   display: "flex",
//                   flexDirection: "column",
//                   alignItems: "center",
//                   gap: "5px",
//                 }}
//               >
//                 <Text style={{ fontSize: "28px" }}>{m.emoji}</Text>
//                 <Text
//                   style={{
//                     fontSize: "13px",
//                     color: m.message ? colors.accent6 : colors.foreground,
//                     textAlign: "center",
//                   }}
//                 >
//                   {t(m.day)}
//                 </Text>
//               </Button>
//             </Div>
//           ))}
//         </Div>

//         <Div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Button onClick={goToPreviousWeek} style={{ padding: "8px" }}>
//             <ArrowLeft color={colors.accent6} size={16} />
//           </Button>

//           <Text
//             style={{
//               fontSize: "13px",
//               color: colors.shade8,
//             }}
//           >
//             {t("week_of", {
//               date: currentWeek.toLocaleDateString(language, {
//                 month: "short",
//                 day: "numeric",
//               }),
//             })}
//           </Text>

//           <Button
//             onClick={goToNextWeek}
//             style={{ padding: "8px" }}
//             disabled={isLatestWeek(currentWeek)}
//           >
//             <ArrowRight
//               color={isLatestWeek(currentWeek) ? colors.shade6 : colors.accent6}
//               size={16}
//             />
//           </Button>
//         </Div>
//       </Div>

//       {/* Weekly line chart */}
//       <Div style={{ marginBottom: "10px" }}>
//         <Div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "8px",
//           }}
//         >
//           <Text
//             style={{
//               fontSize: "18px",
//               fontWeight: "600",
//               color: colors.shade8,
//               marginBottom: "5px",
//             }}
//           >
//             📈 {t("Weekly")}
//           </Text>
//         </Div>
//         <Div
//           style={{
//             borderRadius: "20px",
//             borderColor: colors.accent1,
//             borderWidth: "2px",
//             borderStyle: "solid",
//             padding: "0",
//           }}
//         >
//           <SkiaLineChart
//             datasets={
//               weekChartData.length
//                 ? [
//                     {
//                       label: t("Mood"),
//                       color: colors.accent6,
//                       data: weekChartData,
//                     },
//                   ]
//                 : []
//             }
//             height={220}
//             width={
//               typeof window !== "undefined"
//                 ? Math.min(window.innerWidth - 32, MAX_MOBILE_WIDTH - 32)
//                 : MAX_MOBILE_WIDTH - 32
//             }
//           />
//         </Div>
//       </Div>

//       {/* Monthly bar chart */}
//       <Div style={{ marginTop: "10px", marginBottom: "10px" }}>
//         <Div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             justifyContent: "space-between",
//             alignItems: "center",
//             marginBottom: "8px",
//           }}
//         >
//           <Text
//             style={{
//               fontSize: "18px",
//               fontWeight: "600",
//               color: colors.shade8,
//               marginBottom: "5px",
//             }}
//           >
//             📊 {t("Monthly")}
//           </Text>
//         </Div>
//         <Div
//           style={{
//             borderRadius: "20px",
//             borderColor: colors.accent1,
//             borderWidth: "2px",
//             borderStyle: "solid",
//             padding: "0",
//             paddingBottom: "10px",
//             marginBottom: "7.5px",
//           }}
//         >
//           <SkiaBarChart
//             data={monthlyChartData}
//             height={220}
//             width={
//               typeof window !== "undefined"
//                 ? Math.min(window.innerWidth - 32, MAX_MOBILE_WIDTH - 32)
//                 : MAX_MOBILE_WIDTH - 32
//             }
//             barColor={colors.accent4}
//           />
//         </Div>

//         <Div
//           style={{
//             display: "flex",
//             flexDirection: "row",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <Button onClick={goToPreviousMonth} style={{ padding: "8px" }}>
//             <ArrowLeft color={colors.accent6} size={16} />
//           </Button>

//           <Text
//             style={{
//               fontSize: "13px",
//               color: colors.shade8,
//             }}
//           >
//             {t("month_of", {
//               date: currentMonth.toLocaleDateString(language, {
//                 month: "short",
//                 day: "numeric",
//               }),
//             })}
//           </Text>

//           <Button
//             onClick={goToNextMonth}
//             style={{ padding: "8px" }}
//             disabled={isLatestMonth(currentMonth)}
//           >
//             <ArrowRight
//               color={
//                 isLatestMonth(currentMonth) ? colors.shade6 : colors.accent6
//               }
//               size={16}
//             />
//           </Button>
//         </Div>
//       </Div>
//     </ScrollView>
//   )
// }
