"use client"

import React, { useEffect } from "react"
import Skeleton from "./Skeleton"
import { useAppContext } from "./context/AppContext"
import { CircleArrowLeft } from "./icons"
import styles from "./About.module.scss"
import Img from "./Img"
import { FRONTEND_URL } from "./utils"
import { useAuth, useNavigationContext } from "./context/providers"
import { useTheme } from "./platform"

export default function Terms() {
  const { router } = useNavigationContext()
  const { isDrawerOpen } = useTheme()
  const { t } = useAppContext()

  const { track } = useAuth()

  useEffect(() => {
    track({
      name: "terms",
    })
  }, [])

  return (
    <Skeleton>
      <div
        className={styles.about}
        style={{
          maxWidth: 800,
          margin: isDrawerOpen ? undefined : "0 auto",
          padding: "0 0px 20px 0px",
        }}
      >
        <h1 style={{ marginTop: 0 }}>
          <button className="link" onClick={() => router.push("/about")}>
            <CircleArrowLeft color="var(--accent-1)" size={24} />
          </button>{" "}
          {t("Terms of Use")}
        </h1>

        <section>
          <h2>{t("terms.acceptance.title")}</h2>
          <p>{t("terms.acceptance.content")}</p>
        </section>

        <section>
          <h2>{t("terms.tracking.title")}</h2>
          <p>{t("terms.tracking.content2")}</p>
        </section>

        <section>
          <h2>{t("terms.agentic.title")}</h2>
          <p>{t("terms.agentic.content")}</p>
        </section>

        <section>
          <h2>{t("terms.pricing.title")}</h2>
          <p>{t("terms.pricing.content")}</p>
        </section>

        <section>
          <h2>{t("terms.liability.title")}</h2>
          <p>{t("terms.liability.content")}</p>
        </section>

        <section>
          <h2>{t("terms.changes.title")}</h2>
          <p>{t("terms.changes.content")}</p>
        </section>
        <div className={styles.lastUpdated}>
          <Img src={`${FRONTEND_URL}/frog.png`} width={24} height={24} />
          {t("terms.last_updated", { date: "August 4, 2025" })}
        </div>
      </div>
    </Skeleton>
  )
}
