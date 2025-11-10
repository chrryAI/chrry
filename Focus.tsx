"use client"

import React, { Suspense, useState } from "react"
import Skeleton from "./Skeleton"
import styles from "./Focus.module.scss"
import { useAuth } from "./context/providers"
import Loading from "./Loading"
import { useNavigation } from "./platform"
import clsx from "clsx"
import MoodReports from "./MoodReports"
import FocusButton from "./FocusButton"

export default function Focus({ children }: { children?: React.ReactNode }) {
  const { searchParams } = useNavigation()

  const [showMoodReports, setShowMoodReports] = useState(() => {
    return (
      (typeof window !== "undefined" &&
        searchParams.get("moodReport") === "true") ||
      false
    )
  })

  const { isLoading } = useAuth()
  return (
    <Skeleton className={styles.page}>
      {isLoading ? (
        <div className={styles.loadingContainer}>
          <Loading color="var(--shade-7)" />
        </div>
      ) : (
        <>
          <main className={styles.main}>
            <div className={styles.content}>
              {showMoodReports ? (
                <Suspense
                  fallback={
                    <div className={styles.loadingContainer}>
                      <Loading color="var(--shade-7)" />
                    </div>
                  }
                >
                  <MoodReports
                    className={styles.moodReports}
                    onClose={() => setShowMoodReports(false)}
                  />
                </Suspense>
              ) : (
                <div className={clsx(styles.focusButton)}>
                  <FocusButton />
                </div>
              )}
              {children}
              {/* <Moodify onOpenReports={() => setShowMoodReports(true)} /> */}
            </div>
          </main>
        </>
      )}
    </Skeleton>
  )
}
