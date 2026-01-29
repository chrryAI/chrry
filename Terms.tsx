"use client"

import React from "react"
import Skeleton from "./Skeleton"
import { useAppContext } from "./context/AppContext"
import { CircleArrowLeft } from "./icons"
import Img from "./Img"
import { FRONTEND_URL } from "./utils"
import { useAuth, useNavigationContext } from "./context/providers"
import { Button, Div, H1, H2, P, Section, useTheme } from "./platform"
import { useAboutStyles } from "./about/About.styles"
import { useStyles } from "./context/StylesContext"

export default function Terms() {
  const { router } = useNavigationContext()
  const { isDrawerOpen } = useTheme()
  const { t } = useAppContext()

  const styles = useAboutStyles()
  const { utilities } = useStyles()

  const { plausible } = useAuth()

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
          <Button
            className="link"
            style={utilities.link.style}
            onClick={() => router.push("/about")}
          >
            <CircleArrowLeft color="var(--accent-1)" size={24} />
          </Button>{" "}
          {t("Terms of Use")}
        </H1>

        <Section>
          <H2>{t("terms.acceptance.title")}</H2>
          <P>{t("terms.acceptance.content")}</P>
        </Section>

        <Section>
          <H2>{t("terms.tracking.title")}</H2>
          <P>{t("terms.tracking.content2")}</P>
        </Section>

        <Section>
          <H2>{t("terms.agentic.title")}</H2>
          <P>{t("terms.agentic.content")}</P>
        </Section>

        <Section>
          <H2>{t("terms.pricing.title")}</H2>
          <P>{t("terms.pricing.content")}</P>
        </Section>

        <Section>
          <H2>{t("terms.liability.title")}</H2>
          <P>{t("terms.liability.content")}</P>
        </Section>

        <Section>
          <H2>{t("terms.changes.title")}</H2>
          <P>{t("terms.changes.content")}</P>
        </Section>
        <Div style={styles.lastUpdated.style}>
          <Img src={`${FRONTEND_URL}/frog.png`} width={24} height={24} />
          {t("terms.last_updated", { date: "August 4, 2025" })}
        </Div>
      </Div>
    </Skeleton>
  )
}
