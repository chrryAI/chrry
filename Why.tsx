"use client"

import React, { useEffect } from "react"
import Skeleton from "./Skeleton"
import { useAppContext } from "./context/AppContext"
import { CircleArrowLeft } from "./icons"
import { useAuth, useNavigationContext } from "./context/providers"
import {
  Button,
  Div,
  H1,
  H2,
  H3,
  H4,
  P,
  Section,
  Strong,
  useTheme,
} from "./platform"
import { getSiteConfig } from "./utils/siteConfig"
import { useWhyStyles } from "./Why.styles"
import { useStyles } from "./context/StylesContext"

export default function About() {
  const { router } = useNavigationContext()
  const { isDrawerOpen } = useTheme()

  const siteConfig = getSiteConfig()
  const { t } = useAppContext()

  const styles = useWhyStyles()
  const { utilities } = useStyles()

  const { track } = useAuth()
  useEffect(() => {
    track({
      name: "about",
    })
  }, [])

  return (
    <Skeleton>
      <Div
        style={{
          ...styles.why.style,
          maxWidth: 800,
          margin: isDrawerOpen ? undefined : "0 auto",
          padding: "0 0px 20px 0px",
        }}
      >
        <H1 style={{ marginTop: 0 }}>
          <Button
            style={utilities.link.style}
            onClick={() => router.push("/about")}
          >
            <CircleArrowLeft color="var(--accent-1)" size={24} />
          </Button>{" "}
          {t("why_vex")}
        </H1>

        {/* Hero Section */}
        <Section>
          <H2>🥰 {t("hero_title")}</H2>
          <P>{t("hero_description")}</P>
        </Section>

        {/* LifeOS Vision */}
        {siteConfig.mode === "vex" && (
          <Section>
            <H2>🌟 {t("lifeos.revolution.title")}</H2>
            <P>{t("lifeos.revolution.intro1")}</P>
            <P>{t("lifeos.revolution.intro2")}</P>
            <Div>
              <H4>🎯 {t("lifeos.unique.title")}</H4>
              <Div>
                <P>
                  <Strong>{t("lifeos.unique.cross_app")}</Strong>
                </P>
                <P>
                  <Strong>{t("lifeos.unique.guest_first")}</Strong>
                </P>
                <P>
                  <Strong>{t("lifeos.unique.privacy")}</Strong>
                </P>
                <P>
                  <Strong>{t("lifeos.unique.ecosystem")}</Strong>
                </P>
              </Div>
            </Div>
          </Section>
        )}

        {/* Unique Advantages */}
        <Section>
          <H2>🏆 {t("unique_advantages_title")}</H2>

          <Div>
            <Div>
              <H3>✨ {t("character_profiling_title")}</H3>
              <P>{t("character_profiling_description")}</P>
            </Div>
            <Div>
              <H3>{t("custom_instructions_title")}</H3>
              <P>{t("custom_instructions_description")}</P>
            </Div>
            <Div>
              <H3>🧠 {t("rag_artifacts_title")}</H3>
              <P>{t("rag_artifacts_description")}</P>
            </Div>
            <Div>
              <H3>🎨 {t("personalized_suggestions_title")}</H3>
              <P>{t("personalized_suggestions_description")}</P>
            </Div>
            <Div>
              <H3>{t("thread_collaboration_title")}</H3>
              <P>{t("thread_collaboration_description")}</P>
            </Div>
            <Div>
              <H3>🔍 {t("user_discovery_title")}</H3>
              <P>{t("user_discovery_description")}</P>
            </Div>
            <Div>
              <H3>🧩 {t("browser_extension_title")}</H3>
              <P>{t("browser_extension_description")}</P>
            </Div>
            <Div>
              <H3>{t("ai_debate_title")}</H3>
              <P>{t("ai_debate_description")}</P>
            </Div>
            {siteConfig.mode === "vex" && (
              <Div>
                <H3>🌟 {t("LifeOS App Ecosystem")}</H3>
                <P>
                  {t(
                    "Beyond chat, we're building specialized AI apps: Peach (social networking), Atlas (travel), Bloom (health & sustainability), and Vault (finance). Each app leverages your existing AI conversations to provide personalized experiences no competitor can offer.",
                  )}
                </P>
              </Div>
            )}
            <Div>
              <H3>🎁 {t("guest_subscriptions_title")}</H3>
              <P>{t("guest_subscriptions_description")}</P>
            </Div>
            <Div>
              <H3>🔄 {t("frictionless_migration_title")}</H3>
              <P>{t("frictionless_migration_description")}</P>
            </Div>
            <Div>
              <H3>💝 {t("gift_subscriptions_title")}</H3>
              <P>{t("gift_subscriptions_description")}</P>
            </Div>
            <Div>
              <H3>{t("cost_transparency_title")}</H3>
              <P>{t("cost_transparency_description")}</P>
            </Div>
            <Div>
              <H3>{t("privacy_focused_title")}</H3>
              <P>{t("privacy_focused_desc")}</P>
            </Div>
          </Div>
        </Section>

        {/* Technical Excellence */}
        <Section>
          <H2>{t("technical_excellence_title")}</H2>

          <Div>
            <Div>
              <H3>{t("cost_effective_title")}</H3>
              <P>{t("cost_effective_description")}</P>
            </Div>

            <Div>
              <H3>{t("modern_architecture_title")}</H3>
              <P>{t("modern_architecture_description")}</P>
            </Div>

            <Div>
              <H3>{t("multi_language_title")}</H3>
              <P>{t("multi_language_description")}</P>
            </Div>
          </Div>
        </Section>
      </Div>
    </Skeleton>
  )
}
