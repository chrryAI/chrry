"use client"

import { lazy, Suspense } from "react"
import Loading from "./Loading"

// Lazy load the actual Calendar component to avoid SSR issues
const CalendarComponent = lazy(() => import("./Calendar.web"))

export default function CalendarWrapper(props: any) {
  return (
    <Suspense fallback={<Loading />}>
      <CalendarComponent {...props} />
    </Suspense>
  )
}
