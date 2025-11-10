"use client"

import React, { useEffect } from "react"
import { useAppContext } from "./context/AppContext"
import Skeleton from "./Skeleton"
import { CircleArrowLeft } from "./icons"
import styles from "./About.module.scss"
import Img from "./Img"
import { FRONTEND_URL } from "./utils"
import { useAuth, useNavigationContext } from "./context/providers"
import { useTheme } from "./platform"

export default function Privacy() {
  const { t } = useAppContext()
  const { track } = useAuth()

  const { router } = useNavigationContext()
  const { isDrawerOpen } = useTheme()

  useEffect(() => {
    track({
      name: "privacy",
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
          {t("Privacy Policy")}
        </h1>

        <section>
          <h2>{t("privacy.collection.title")}</h2>
          <p>{t("privacy.collection.content")}</p>
        </section>

        <section>
          <h2>{t("privacy.analytics.title")}</h2>
          <p>{t("privacy.analytics.content2")}</p>
          <ul>
            <li>{t("privacy.analytics.items.pageviews")}</li>
            <li>{t("privacy.analytics.items.features")}</li>
            <li>{t("privacy.analytics.items.performance")}</li>
            <li>{t("privacy.analytics.items.conversion")}</li>
          </ul>
          <p>{t("privacy.analytics.anonymized")}</p>
        </section>

        <section>
          <h2>{t("privacy.chat.title")}</h2>
          <p>{t("privacy.chat.content")}</p>
          <p>{t("privacy.chat.memory_note")}</p>
        </section>

        <section>
          <h2>{t("privacy.character.title")}</h2>
          <p>{t("privacy.character.content")}</p>
          <ul>
            <li>{t("privacy.character.items.analysis")}</li>
            <li>{t("privacy.character.items.storage")}</li>
            <li>{t("privacy.character.items.sharing")}</li>
            <li>{t("privacy.character.items.control")}</li>
          </ul>
        </section>

        <section>
          <h2>{t("privacy.memory.title")}</h2>
          <p>{t("privacy.memory.content")}</p>
          <ul>
            <li>{t("privacy.memory.items.extraction")}</li>
            <li>{t("privacy.memory.items.storage")}</li>
            <li>{t("privacy.memory.items.usage")}</li>
            <li>{t("privacy.memory.items.control")}</li>
          </ul>
        </section>

        <section>
          <h2>{t("privacy.cookies.title")}</h2>
          <p>{t("privacy.cookies.content")}</p>
        </section>

        <section>
          <h2>{t("privacy.security.title")}</h2>
          <p>{t("privacy.security.content")}</p>
        </section>

        <section>
          <h2>{t("privacy.changes.title")}</h2>
          <p>{t("privacy.changes.content")}</p>
        </section>

        <div className={styles.lastUpdated}>
          <Img src={`${FRONTEND_URL}/frog.png`} width={24} height={24} />
          {t("privacy.last_updated", { date: "August 4, 2025" })}
        </div>
      </div>
    </Skeleton>
  )
}
