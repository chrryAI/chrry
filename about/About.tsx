"use client"

import React from "react"
import Skeleton from "../Skeleton"
import { COLORS, useAppContext } from "../context/AppContext"
import { BrowserInstance, checkIsExtension } from "../utils"
import { BadgeCheck, CircleArrowLeft, Shell, UserRoundPlus } from "../icons"
import { BiLogoPostgresql } from "react-icons/bi"

import {
  SiCssmodules,
  SiJest,
  SiTypescript,
  SiBun,
  SiHono,
  SiVite,
} from "react-icons/si"
import { FaChrome } from "react-icons/fa"
import Logo from "../Logo"
import Img from "../Image"
import { getFeatures } from "../utils/subscription"
import {
  useAuth,
  useData,
  useError,
  useNavigationContext,
} from "../context/providers"
import {
  Button,
  Div,
  H1,
  H2,
  H3,
  H4,
  P,
  Section,
  Span,
  usePlatform,
  useTheme,
  Video,
} from "../platform"
import { Claude, DeepSeek } from "../icons"
import A from "../a/A"
import AppLink from "../AppLink"
import { useAboutStyles } from "./About.styles"
import { useStyles } from "../context/StylesContext"
import type { appWithStore } from "../types"
export default function About() {
  const {
    chrry,
    plausible,
    baseApp,
    user,
    siteConfig: config,
    ...auth
  } = useAuth()

  const styles = useAboutStyles()
  const { utilities } = useStyles()

  const isChrryAI = config.mode === "chrryAI"

  const { t } = useAppContext()

  const { isStandalone } = usePlatform()

  const { router } = useNavigationContext()
  const { isDrawerOpen, addHapticFeedback, isMobileDevice } = useTheme()

  const { captureException } = useError()

  const {
    ADDITIONAL_CREDITS,
    CREDITS_PRICE,
    FRONTEND_URL,
    PLUS_PRICE,
    PRO_PRICE,
  } = useData()

  const { plusFeatures, memberFeatures, proFeatures, creditsFeatures } =
    getFeatures({
      t,
      ADDITIONAL_CREDITS,
      CREDITS_PRICE,
    })

  const [selectedApp, setSelectedApp] = React.useState<
    appWithStore | undefined
  >(auth.app)

  const apps = selectedApp?.store?.apps || baseApp?.store?.apps

  return (
    <Skeleton>
      <Div
        style={{
          maxWidth: 800,
          margin: isDrawerOpen ? undefined : "0 auto",
          padding: "0 0px 20px 0px",
        }}
      >
        <H1 style={{ display: "flex", gap: 5, marginTop: 0 }}>
          <Button
            className="link"
            style={{ ...utilities.link.style }}
            onClick={() => router.push("/")}
          >
            <CircleArrowLeft color="var(--accent-1)" size={24} />
          </Button>
          <Span
            onClick={() => {
              if (user?.role === "admin") {
                captureException(new Error("About Vex"))
              }
            }}
          >
            {t("About")} {config.name}
          </Span>
        </H1>
        <Section style={{ marginBottom: 15 }}>
          <P>
            <a
              onClick={(e) => {
                addHapticFeedback()
                if (e.metaKey || e.ctrlKey) {
                  return
                }
                e.preventDefault()
                router.push("/why")
              }}
              href={isStandalone ? undefined : `${FRONTEND_URL}/why`}
            >
              {t("why_vex")}
            </a>
            {", "}
            <A
              openInNewTab
              href={`${FRONTEND_URL}/blog`}
              onClick={(e) => {
                addHapticFeedback()
                if (e.metaKey || e.ctrlKey) {
                  return
                }
                e.preventDefault()

                window.location.href = `${FRONTEND_URL}/blog`
              }}
            >
              {t("Blog")}
            </A>
            {", "}
            <a
              onClick={(e) => {
                addHapticFeedback()
                if (e.metaKey || e.ctrlKey) {
                  return
                }
                e.preventDefault()
                router.push("/terms")
              }}
              href={isStandalone ? undefined : `${FRONTEND_URL}/terms`}
            >
              {t("Terms of Use")}
            </a>
            {", "}
            <a
              onClick={(e) => {
                addHapticFeedback()
                if (e.metaKey || e.ctrlKey) {
                  return
                }
                e.preventDefault()
                router.push("/privacy")
              }}
              href={isStandalone ? undefined : `${FRONTEND_URL}/privacy`}
            >
              {t("Privacy Policy")}
            </a>
            {", "}
            <a href="https://x.com/chrryAI">@chrryAI</a>
            {", "}
            <a href="mailto:iliyan@chrry.ai">iliyan@chrry.ai</a>
          </P>
        </Section>

        <Section>
          <P>
            {config.logo || "🍒"}{" "}
            {config.about?.intro ||
              "Vex is an intelligent AI assistant designed to help you accomplish tasks efficiently and effectively. Our mission is to create a transparent, user-friendly AI experience that empowers you while respecting your privacy."}
          </P>
          <P style={{ marginTop: "1rem" }}>
            {config.about?.intro2 ||
              "With per-chat instructions, thread artifacts for document memory, and real-time collaboration features. Vex learns your context, remembers your files, and works with your team."}
          </P>
        </Section>

        {/* Dynamic Apps Section */}
        {apps && apps.length > 0 && (
          <Section>
            <H2>
              {config.logo} {t("Available Apps")}
            </H2>
            <P>{t("Discover AI-powered apps from our store")}</P>
            <Div key={selectedApp?.id} style={styles.apps.style}>
              {apps.map((a: appWithStore) => (
                <AppLink
                  key={a.id}
                  style={{
                    ...styles.app.style,
                    position: "relative",
                    fontSize: 13,
                    paddingBottom: 40,
                  }}
                  setIsNewAppChat={(app) => {
                    app && setSelectedApp(app)
                  }}
                  app={a}
                >
                  <H4
                    style={{
                      display: "flex",
                      gap: 5,
                      alignItems: "center",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    <Span style={{ fontSize: 30 }}>
                      {<Img app={a} size={30} />}
                    </Span>
                    {a.name}
                  </H4>
                  <P style={styles.appDescription.style}>
                    {t(a.description || "") || t("No description available")}
                  </P>
                  <Div
                    style={{
                      cursor: "pointer",
                      color: "var(--accent-5)",
                      marginTop: "auto",
                      position: "absolute",
                      bottom: 10,
                      right: 10,
                    }}
                  >
                    🌀 Try Spatial
                    {a.store?.slug === "sushiStore" && ` - 🍣 ${t("Try Dojo")}`}
                  </Div>
                </AppLink>
              ))}
            </Div>
          </Section>
        )}

        <Section>
          <H2>{config.about?.approach?.title || "Our Approach"}</H2>
          <P>
            {config.about?.approach?.content ||
              "We believe in complete transparency about how our AI works, what data we use, and how we charge for our services. Vex provides clear information about usage limits, pricing, and capabilities so you always know what to expect."}
          </P>
        </Section>

        <Section>
          <H2>{t("about.transparency.title")}</H2>
          <P>{t("about.transparency.intro")}</P>
          <Div>
            <P>{t("about.transparency.items.pricing")}</P>
            <P>{t("about.transparency.items.usage")}</P>
            <P>{t("about.transparency.items.communication")}</P>
            <P>{t("about.transparency.items.data")}</P>
          </Div>
        </Section>

        <H2 style={{ fontSize: 28 }}>{t("All Plans")}</H2>
        <Section>
          <H2 style={styles.h2.style}>
            <Logo size={24} /> {t("Free")}
            {!user && (
              <Button
                className="inverted"
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  ...utilities.inverted.style,
                }}
                onClick={() => {
                  if (checkIsExtension()) {
                    BrowserInstance?.runtime?.sendMessage({
                      action: "openInSameTab",
                      url: `${FRONTEND_URL}/about?signIn=register`,
                    })

                    return
                  }
                  router.push("/about?signIn=register")
                }}
              >
                <UserRoundPlus size={16} /> {t("Register")}
              </Button>
            )}
          </H2>
          {memberFeatures.map((feature) => (
            <Span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </Span>
          ))}
        </Section>

        <Section>
          <H2 style={styles.h2.style}>
            <Img size={24} icon="chrry" /> {t("Credits")}
            <Button
              onClick={() => {
                if (checkIsExtension()) {
                  BrowserInstance?.runtime?.sendMessage({
                    action: "openInSameTab",
                    url: `${FRONTEND_URL}/about?subscribe=true&plan=credits`,
                  })

                  return
                }
                router.push("/about?subscribe=true&plan=credits")
              }}
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.inverted.style,
              }}
            >
              {t("credits_pricing", {
                credits: ADDITIONAL_CREDITS,
                price: `${CREDITS_PRICE}.00`,
              })}
            </Button>
          </H2>
          {creditsFeatures.map((feature) => (
            <Span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </Span>
          ))}
        </Section>

        <Section>
          <H2 style={styles.h2.style}>
            <Img size={24} icon="strawberry" /> {t("Plus")}
            <Span
              title={t("Most popular")}
              style={{
                color: "var(--accent-1)",
                marginTop: "4px",
                marginLeft: "4px",
                verticalAlign: "middle",
              }}
            >
              <BadgeCheck size={20} />
            </Span>
            <Button
              onClick={() => {
                if (checkIsExtension()) {
                  BrowserInstance?.runtime?.sendMessage({
                    action: "openInSameTab",
                    url: `${FRONTEND_URL}/about?subscribe=true&plan=plus`,
                  })

                  return
                }
                router.push("/about?subscribe=true&plan=plus")
              }}
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.inverted.style,
              }}
            >
              €
              {t("{{price}}/month", {
                price: PLUS_PRICE,
              })}
            </Button>
          </H2>
          {plusFeatures.map((feature) => (
            <Span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </Span>
          ))}
        </Section>

        <Section>
          <H2 style={styles.h2.style}>
            <Img size={24} icon="raspberry" /> {t("Pro")}
            <Button
              onClick={() => {
                if (checkIsExtension()) {
                  BrowserInstance?.runtime?.sendMessage({
                    action: "openInSameTab",
                    url: `${FRONTEND_URL}/about?subscribe=true&plan=pro`,
                  })

                  return
                }
                router.push("/about?subscribe=true&plan=pro")
              }}
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.inverted.style,
              }}
            >
              €
              {t("{{price}}/month", {
                price: PRO_PRICE,
              })}
            </Button>
          </H2>
          {proFeatures.map((feature) => (
            <Span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </Span>
          ))}
        </Section>

        <Section>
          <H2>{config.about?.platforms?.title || "Available Platforms"}</H2>
          <P>
            {config.about?.platforms?.content ||
              "Vex is designed as a multi-platform AI assistant, available across web, mobile, and browser extensions as first-class citizens."}
          </P>

          <Div>
            <Div>
              <H3>
                {config.about?.platforms?.web?.title || "🌐 Web Application"}
              </H3>
              <P>
                {config.about?.platforms?.web?.content ||
                  "Full-featured web experience with real-time collaboration, thread management, and all AI capabilities accessible from any browser."}
              </P>
              <Video
                style={styles.video.style}
                controls
                src={`https://7079yofdv0.ufs.sh/f/5ALK9G4mxClOqa4rl8Lok8fCavjF0phyGSZ4TwWJ3rlbcQ6X`}
              />
            </Div>

            <Div>
              <H3>
                {config.about?.platforms?.pwa?.title ||
                  "📱 Progressive Web App (PWA)"}
              </H3>
              <P>
                {config.about?.platforms?.pwa?.content ||
                  "Install Vex as a native app on your mobile device or desktop. Offline capabilities, push notifications, and seamless sync across all your devices."}
              </P>

              <Video
                style={styles.video.style}
                controls
                src={`https://7079yofdv0.ufs.sh/f/5ALK9G4mxClOTAEfNuXpQy4HJYn8fWo1mFVRaG7eqCiD3A5l`}
              />
            </Div>

            <Div>
              <H3 style={{ display: "flex" }}>
                {config.about?.platforms?.chrome?.title ||
                  "🧩 Chrome Extension"}{" "}
                <A
                  target="_blank"
                  style={{
                    marginLeft: "auto",
                    ...utilities.button.style,
                    ...utilities.small.style,
                  }}
                  href="https://chromewebstore.google.com/detail/vex/odgdgbbddopmblglebfngmaebmnhegfc"
                >
                  <FaChrome size={18} />
                  {t("Install")}
                </A>
              </H3>
              <P>
                {config.about?.platforms?.chrome?.content ||
                  "Right-click context menu integration with sidebar AI assistant. Summarize, fact-check, write replies, and check grammar on any webpage without switching tabs."}
              </P>
              <Video
                style={styles.video.style}
                controls
                src={`https://7079yofdv0.ufs.sh/f/5ALK9G4mxClOWTxc2Y6sD5zVU8hPgdAmWQy4qXa0KuL2HE7e`}
              />
            </Div>
          </Div>
        </Section>

        {/* <section>
          <h2>{t("about.team.title")}</h2>
          <p>{t("about.team.content")}</p>
        </section> */}

        <Div
          style={{
            ...styles.ossWrapper.style,
          }}
        >
          <H2>
            <Span style={{ fontSize: "2.5rem" }}>🍉</Span> {t("Open Source")}
          </H2>
          <Div
            style={{
              ...styles.ossContainer.style,
              marginBottom: "2rem",
              ...(isMobileDevice
                ? undefined
                : styles.ossContainerDesktop.style),
            }}
          >
            <Div style={styles.oss.style}>
              <SiTypescript
                color="var(--foreground)"
                style={{ width: 40, height: 40 }}
              />
              <A
                href="https://www.typescriptlang.org"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                TypeScript
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <A
                href="https://bun.sh"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                <SiBun color="var(--foreground)" size={40} />
                Bun
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <A
                href="https://hono.dev"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                <SiHono color="var(--foreground)" size={40} />
                Hono
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <A
                href="https://vitejs.dev"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                <SiVite color="var(--foreground)" size={40} />
                Vite
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <BiLogoPostgresql style={{ width: 40, height: 40 }} />
              <A
                href="https://www.postgresql.org"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                PostgreSQL
              </A>
            </Div>
          </Div>

          <Div
            style={{
              ...styles.ossContainer.style,
              ...(isMobileDevice
                ? undefined
                : styles.ossContainerDesktop.style),
            }}
          >
            <Div style={styles.oss.style}>
              <DeepSeek color={COLORS.purple} size={40} />
              <A
                href="https://www.deepseek.com"
                target="_blank"
                rel="nofollow"
                style={{ ...styles.ossLink.style, color: COLORS.purple }}
              >
                DeepSeek
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <SiJest style={{ width: 40, height: 40 }} />
              <A
                href="https://jestjs.io"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                Jest
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <SiCssmodules style={{ width: 40, height: 40 }} />
              <A
                href="https://github.com/css-modules/css-modules"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                CSS Modules
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <Shell style={{ width: 40, height: 40 }} />
              <A
                href="https://lucide.dev"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                Lucide
              </A>
            </Div>
          </Div>
        </Div>
        <Div style={styles.ossWrapper.style}>
          <H2>{t("Team")}</H2>
          <Div
            style={{
              ...styles.ossContainer.style,
              marginBottom: "2rem",
              ...(isMobileDevice
                ? undefined
                : styles.ossContainerDesktop.style),
            }}
          >
            <Div style={styles.oss.style}>
              <Img icon="spaceInvader" size={40} />
              <A
                href="https://i.chrry.dev"
                openInNewTab
                style={styles.ossLink.style}
              >
                iliyan@chrry.ai
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <Claude color={COLORS.orange} size={40} />
              <A
                href="https://claude.com/product/claude-code"
                target="_blank"
                rel="nofollow"
                style={{ ...styles.ossLink.style, color: COLORS.orange }}
              >
                Claude Code
              </A>
            </Div>
          </Div>
        </Div>

        <Div style={styles.lastUpdated.style}>
          <Img src={`${FRONTEND_URL}/hamster.png`} width={24} height={24} />
          {t("about.last_updated", { date: "September 29, 2025" })}
        </Div>
      </Div>
    </Skeleton>
  )
}
