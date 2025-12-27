"use client"

import React, { useEffect } from "react"
import { useAppContext } from "./context/AppContext"
import Skeleton from "./Skeleton"
import { CircleArrowLeft } from "./icons"
import Img from "./Img"
import { FRONTEND_URL } from "./utils"
import { useAuth, useNavigationContext } from "./context/providers"
import { Button, Div, H1, H2, P, Section, useTheme } from "./platform"
import { useAboutStyles } from "./about/About.styles"

export default function Privacy() {
  const { t } = useAppContext()
  const { track } = useAuth()

  const styles = useAboutStyles()

  const { router } = useNavigationContext()
  const { isDrawerOpen } = useTheme()

  useEffect(() => {
    track({
      name: "privacy",
    })
  }, [])

  return (
    <Skeleton>
      <Div
        style={{
          maxWidth: 800,
          margin: isDrawerOpen ? undefined : "0 auto",
          padding: "0 0px 20px 0px",
        }}
      >
        <H1 style={{ marginTop: 0 }}>
          <Button className="link" onClick={() => router.push("/about")}>
            <CircleArrowLeft color="var(--accent-1)" size={24} />
          </Button>{" "}
          {t("Privacy Policy")}
        </H1>

        <Section>
          <H2>{t("privacy.collection.title")}</H2>
          <P>{t("privacy.collection.content")}</P>
        </Section>

        <Section>
          <H2>{t("privacy.analytics.title")}</H2>
          <P>{t("privacy.analytics.content2")}</P>
          <Div>
            <P>{t("privacy.analytics.items.pageviews")}</P>
            <P>{t("privacy.analytics.items.features")}</P>
            <P>{t("privacy.analytics.items.performance")}</P>
            <P>{t("privacy.analytics.items.conversion")}</P>
          </Div>
          <P>{t("privacy.analytics.anonymized")}</P>
        </Section>

        <Section>
          <H2>{t("privacy.chat.title")}</H2>
          <P>{t("privacy.chat.content")}</P>
          <P>{t("privacy.chat.memory_note")}</P>
        </Section>

        <Section>
          <H2>🔥 {t("privacy.burn.title")}</H2>
          <P>{t("privacy.burn.content")}</P>
          <Div>
            <P>{t("privacy.burn.items.ephemeral")}</P>
            <P>{t("privacy.burn.items.no_storage")}</P>
            <P>{t("privacy.burn.items.no_memory")}</P>
            <P>{t("privacy.burn.items.sovereignty")}</P>
          </Div>
          <P>{t("privacy.burn.activation")}</P>
        </Section>

        <Section>
          <H2>{t("privacy.character.title")}</H2>
          <P>{t("privacy.character.content")}</P>
          <Div>
            <P>{t("privacy.character.items.analysis")}</P>
            <P>{t("privacy.character.items.storage")}</P>
            <P>{t("privacy.character.items.sharing")}</P>
            <P>{t("privacy.character.items.control")}</P>
          </Div>
        </Section>

        <Section>
          <H2>{t("privacy.memory.title")}</H2>
          <P>{t("privacy.memory.content")}</P>
          <Div>
            <P>{t("privacy.memory.items.extraction")}</P>
            <P>{t("privacy.memory.items.storage")}</P>
            <P>{t("privacy.memory.items.usage")}</P>
            <P>{t("privacy.memory.items.control")}</P>
          </Div>
        </Section>

        <Section>
          <H2>{t("privacy.cookies.title")}</H2>
          <P>{t("privacy.cookies.content")}</P>
        </Section>

        <Section>
          <H2>{t("privacy.security.title")}</H2>
          <P>{t("privacy.security.content")}</P>
        </Section>

        <Section>
          <H2>{t("privacy.changes.title")}</H2>
          <P>{t("privacy.changes.content")}</P>
        </Section>

        <Div style={styles.lastUpdated.style}>
          <Img src={`${FRONTEND_URL}/frog.png`} width={24} height={24} />
          {t("privacy.last_updated", { date: "August 4, 2025" })}
        </Div>
      </Div>
    </Skeleton>
  )
}
