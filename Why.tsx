"use client"

import React, { useEffect } from "react"
import Skeleton from "./Skeleton"
import { useAppContext } from "./context/AppContext"
import { FRONTEND_URL } from "./utils"
import { CircleArrowLeft } from "./icons"
import styles from "./Why.module.scss"
import { useAuth, useNavigationContext } from "./context/providers"

export default function About() {
  const { isDrawerOpen, router } = useNavigationContext()

  const { t } = useAppContext()

  const { track } = useAuth()
  useEffect(() => {
    track({
      name: "about",
    })
  }, [])

  return (
    <Skeleton>
      <div
        className={styles.why}
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
          {t("why_vex")}
        </h1>

        {/* Hero Section */}
        <section>
          <h2>🥰 {t("hero_title")}</h2>
          <p>{t("hero_description")}</p>
        </section>

        {/* LifeOS Vision */}
        <section>
          <h2>🌟 {t("lifeos.revolution.title")}</h2>
          <p>{t("lifeos.revolution.intro1")}</p>
          <p>{t("lifeos.revolution.intro2")}</p>
          <div>
            <h4>🎯 {t("lifeos.unique.title")}</h4>
            <ul>
              <li>
                <strong>{t("lifeos.unique.cross_app")}</strong>
              </li>
              <li>
                <strong>{t("lifeos.unique.guest_first")}</strong>
              </li>
              <li>
                <strong>{t("lifeos.unique.privacy")}</strong>
              </li>
              <li>
                <strong>{t("lifeos.unique.ecosystem")}</strong>
              </li>
            </ul>
          </div>
        </section>

        {/* Unique Advantages */}
        <section>
          <h2>🏆 {t("unique_advantages_title")}</h2>

          <div>
            <div>
              <h3>✨ {t("character_profiling_title")}</h3>
              <p>{t("character_profiling_description")}</p>
            </div>
            <div>
              <h3>{t("custom_instructions_title")}</h3>
              <p>{t("custom_instructions_description")}</p>
            </div>
            <div>
              <h3>🧠 {t("rag_artifacts_title")}</h3>
              <p>{t("rag_artifacts_description")}</p>
            </div>
            <div>
              <h3>🎨 {t("personalized_suggestions_title")}</h3>
              <p>{t("personalized_suggestions_description")}</p>
            </div>
            <div>
              <h3>{t("thread_collaboration_title")}</h3>
              <p>{t("thread_collaboration_description")}</p>
            </div>
            <div>
              <h3>🔍 {t("user_discovery_title")}</h3>
              <p>{t("user_discovery_description")}</p>
            </div>
            <div>
              <h3>🧩 {t("browser_extension_title")}</h3>
              <p>{t("browser_extension_description")}</p>
            </div>
            <div>
              <h3>{t("ai_debate_title")}</h3>
              <p>{t("ai_debate_description")}</p>
            </div>
            <div>
              <h3>🌟 {t("LifeOS App Ecosystem")}</h3>
              <p>
                {t(
                  "Beyond chat, we're building specialized AI apps: Peach (social networking), Atlas (travel), Bloom (health & sustainability), and Vault (finance). Each app leverages your existing AI conversations to provide personalized experiences no competitor can offer.",
                )}
              </p>
            </div>
            <div>
              <h3>🎁 {t("guest_subscriptions_title")}</h3>
              <p>{t("guest_subscriptions_description")}</p>
            </div>
            <div>
              <h3>🔄 {t("frictionless_migration_title")}</h3>
              <p>{t("frictionless_migration_description")}</p>
            </div>
            <div>
              <h3>💝 {t("gift_subscriptions_title")}</h3>
              <p>{t("gift_subscriptions_description")}</p>
            </div>
            <div>
              <h3>{t("cost_transparency_title")}</h3>
              <p>{t("cost_transparency_description")}</p>
            </div>
            <div>
              <h3>{t("privacy_focused_title")}</h3>
              <p>{t("privacy_focused_desc")}</p>
            </div>
          </div>
        </section>

        {/* Technical Excellence */}
        <section>
          <h2>{t("technical_excellence_title")}</h2>

          <div>
            <div>
              <h3>{t("cost_effective_title")}</h3>
              <p>{t("cost_effective_description")}</p>
            </div>

            <div>
              <h3>{t("modern_architecture_title")}</h3>
              <p>{t("modern_architecture_description")}</p>
            </div>

            <div>
              <h3>{t("multi_language_title")}</h3>
              <p>{t("multi_language_description")}</p>
            </div>
          </div>
        </section>
      </div>
    </Skeleton>
  )
}
