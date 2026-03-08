"use client"

import { BiLogoPostgresql } from "react-icons/bi"
import {
  SiBun,
  SiCssmodules,
  SiHono,
  SiJest,
  SiTypescript,
  SiVite,
} from "react-icons/si"
import A from "../a/A"
import { COLORS, useAppContext } from "../context/AppContext"
import {
  useApp,
  useAuth,
  useError,
  useNavigationContext,
} from "../context/providers"
import { useStyles } from "../context/StylesContext"
import Img from "../Image"
import Instructions from "../Instructions"
import {
  CircleArrowLeft,
  Claude,
  Coins,
  DeepSeek,
  Gemini,
  Shell,
} from "../icons"
import Logo from "../Logo"
import {
  Button,
  Div,
  H1,
  H2,
  H3,
  P,
  Section,
  Span,
  usePlatform,
  useTheme,
} from "../platform"
import Skeleton from "../Skeleton"
import {
  ADDITIONAL_CREDITS,
  AGENCY_PRICE,
  ARCHITECT_PRICE,
  BrowserInstance,
  CODER_PRICE,
  CREDITS_PRICE,
  checkIsExtension,
  FRONTEND_URL,
  GRAPE_PLUS_PRICE,
  PEAR_PLUS_PRICE,
  PLUS_PRICE,
  PRO_PRICE,
  SOVEREIGN_PRICE,
} from "../utils"
import { getFeatures } from "../utils/subscription"
import { useAboutStyles } from "./About.styles"
export default function About() {
  const {
    chrry,
    baseApp,
    user,
    siteConfig: config,
    accountApp,
    app,
  } = useAuth()

  const styles = useAboutStyles()
  const { utilities } = useStyles()

  const { t } = useAppContext()
  const { setAppStatus } = useApp()

  const { isStandalone } = usePlatform()

  const { router } = useNavigationContext()
  const { isDrawerOpen, addHapticFeedback, isMobileDevice } = useTheme()

  const { captureException } = useError()

  const {
    plusFeatures,
    memberFeatures,
    creditsFeatures,
    proFeatures,
    watermelonFeatures,
    watermelonPlusFeatures,
    pearPlusFeatures,
    grapePlusFeatures,
    grapeFreeFeatures,
    grapeProFeatures,
    pearProFeatures,
    pearFreeFeatures,
    sushiCoderFeatures,
    sushiArchitectFeatures,
    sushiFreeFeatures,
  } = getFeatures({
    t,
    ADDITIONAL_CREDITS,
    CREDITS_PRICE,
  })

  const apps = chrry?.store?.apps || baseApp?.store?.apps

  const renderCreate = ({ slug }: { slug?: string } = {}) => {
    return (
      <>
        {" "}
        {!user ? (
          <Button
            className="inverted"
            style={{
              marginLeft: "auto",
              fontSize: 14,
              ...utilities.inverted.style,
              ...utilities.small.style,
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
            <Img slug={slug || app?.slug} size={20} /> {t("Create your agent")}
          </Button>
        ) : (
          user &&
          !accountApp && (
            <Button
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.inverted.style,
                ...utilities.small.style,
              }}
              onClick={() => {
                setAppStatus({
                  part: "highlights",
                  step: "add",
                })
              }}
            >
              <Img slug={slug || app?.slug} size={20} />{" "}
              {t("Create your agent")}
            </Button>
          )
        )}
      </>
    )
  }

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
        {/* {apps && apps.length > 0 && (
          <Section>
            <H2>
              {config.logo} {t("Available Apps")}
            </H2>
            <P>{t("Discover AI-powered apps from our store")}</P>
            <Div style={styles.apps.style}>
              {apps.map((a: appWithStore) => (
                <AppLink
                  key={a.id}
                  isTribe
                  style={{
                    ...styles.app.style,
                    position: "relative",
                    fontSize: 13,
                    paddingBottom: 40,
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
        )} */}

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

        <Section>
          <H2>{config.about?.platforms?.title || "Available Platforms"}</H2>
          <Instructions
            showButton={false}
            showDownloads={true}
            showInstructions={false}
            showInstallers={false}
          />
        </Section>

        <H2 style={{ fontSize: 28 }}>{t("All Plans")}</H2>
        <Section>
          <H2 style={styles.h2.style}>
            <Logo size={24} /> {t("Free")}
            {renderCreate()}
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
            <A
              href={`${FRONTEND_URL}/about?subscribe=true&plan=credits`}
              openInNewTab={checkIsExtension()}
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.button.style,
                ...utilities.inverted.style,
                ...utilities.small.style,
                fontWeight: "normal",
              }}
            >
              <Coins size={20} />
              {t("credits_pricing", {
                credits: ADDITIONAL_CREDITS,
                price: `${CREDITS_PRICE}.00`,
              })}
            </A>
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
            {/* <Span
              title={t("Most popular")}
              style={{
                color: "var(--accent-1)",
                marginTop: "4px",
                marginLeft: "4px",
                verticalAlign: "middle",
              }}
            >
              <BadgeCheck size={20} />
            </Span> */}
            <A
              href={`${FRONTEND_URL}/about?subscribe=true&plan=plus`}
              openInNewTab={checkIsExtension()}
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.button.style,
                fontWeight: "normal",
                ...utilities.inverted.style,
              }}
            >
              €
              {t("{{price}}/month", {
                price: PLUS_PRICE,
              })}
            </A>
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
          <H2 style={styles.h2.style}>
            <Img size={24} slug="sushi" /> {t("Sushi")}
            {renderCreate({
              slug: "sushi",
            })}
          </H2>
          {sushiFreeFeatures.map((feature) => (
            <Span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </Span>
          ))}
        </Section>
        <Section>
          <H2 style={styles.h2.style}>
            <Img size={24} slug="coder" /> {t("Coder")}
            <A
              openInNewTab={checkIsExtension()}
              href={`${FRONTEND_URL}/about?subscribe=true&sushiTier=coder&plan=coder`}
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.button.style,
                ...utilities.inverted.style,
                fontWeight: "normal",
              }}
            >
              €
              {t("{{price}}/month", {
                price: CODER_PRICE,
              })}
            </A>
          </H2>
          {sushiCoderFeatures.map((feature) => (
            <Span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </Span>
          ))}
        </Section>
        <Section>
          <H2 style={styles.h2.style}>
            <Img size={24} slug="architect" /> {t("Architect")}
            <A
              openInNewTab={checkIsExtension()}
              href={`${FRONTEND_URL}/about?subscribe=true&sushiTier=architect&plan=coder`}
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.button.style,
                ...utilities.inverted.style,
                fontWeight: "normal",
              }}
            >
              €
              {t("{{price}}/month", {
                price: ARCHITECT_PRICE,
              })}
            </A>
          </H2>
          {sushiArchitectFeatures.map((feature) => (
            <Span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </Span>
          ))}
        </Section>
        <Section>
          <H2 style={styles.h2.style}>
            <Img size={24} slug="grape" /> {t("Grape")}
          </H2>
          <Div>
            <H3>{t("Free")}</H3>
            {grapeFreeFeatures.map((feature) => (
              <Span key={feature.text}>
                {" "}
                {feature.emoji} {feature.text}
              </Span>
            ))}
            <Div style={{ marginTop: 20 }}>
              {renderCreate({ slug: "grape" })}
            </Div>
          </Div>
          <Div>
            <H3>{t("Plus")}</H3>

            {grapePlusFeatures.map((feature) => (
              <Span key={feature.text}>
                {" "}
                {feature.emoji} {feature.text}
              </Span>
            ))}
            <Div style={{ marginTop: 20 }}>
              <A
                openInNewTab={checkIsExtension()}
                href={`${FRONTEND_URL}/about?subscribe=true&plan=grape&grapeTier=plus`}
                className="inverted"
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  ...utilities.button.style,
                  ...utilities.inverted.style,
                  fontWeight: "normal",
                }}
              >
                €
                {t("{{price}}/month", {
                  price: GRAPE_PLUS_PRICE,
                })}
              </A>
            </Div>
          </Div>
        </Section>
        <Section>
          <H2 style={styles.h2.style}>
            <Img size={24} slug="pear" /> {t("Pear")}
          </H2>
          <Div>
            <H3>{t("Free")}</H3>
            {pearFreeFeatures.map((feature) => (
              <Span key={feature.text}>
                {" "}
                {feature.emoji} {feature.text}
              </Span>
            ))}
            <Div style={{ marginTop: 20 }}>
              {renderCreate({ slug: "pear" })}
            </Div>
          </Div>
          <Div>
            <H3>{t("Plus")}</H3>

            {pearPlusFeatures.map((feature) => (
              <Span key={feature.text}>
                {" "}
                {feature.emoji} {feature.text}
              </Span>
            ))}
            <Div style={{ marginTop: 20 }}>
              <A
                openInNewTab={checkIsExtension()}
                href={`${FRONTEND_URL}/about?subscribe=true&plan=grape&grapeTier=plus`}
                className="inverted"
                style={{
                  marginLeft: "auto",
                  fontSize: 14,
                  ...utilities.button.style,
                  ...utilities.inverted.style,
                  fontWeight: "normal",
                }}
              >
                €
                {t("{{price}}/month", {
                  price: PEAR_PLUS_PRICE,
                })}
              </A>
            </Div>
          </Div>
        </Section>

        <Section>
          <H2 style={styles.h2.style}>
            <Img size={24} logo="watermelon" /> {t("Watermelon")}
            <A
              openInNewTab={checkIsExtension()}
              href={`${FRONTEND_URL}/about?subscribe=true&plan=watermelon`}
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.button.style,
                ...utilities.inverted.style,
                fontWeight: "normal",
              }}
            >
              €
              {t("{{price}}/month", {
                price: AGENCY_PRICE,
              })}
            </A>
          </H2>
          {watermelonFeatures.map((feature) => (
            <Span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </Span>
          ))}
        </Section>
        <Section>
          <H2 style={styles.h2.style}>
            <Img size={24} slug="tribe" /> {t("Sovereign")}
            <A
              openInNewTab={checkIsExtension()}
              href={`${FRONTEND_URL}/about?subscribe=true&plan=tribe&watermelonTier=plus`}
              className="inverted"
              style={{
                marginLeft: "auto",
                fontSize: 14,
                ...utilities.button.style,
                ...utilities.inverted.style,
                fontWeight: "normal",
              }}
            >
              €
              {t("{{price}}/month", {
                price: SOVEREIGN_PRICE,
              })}
            </A>
          </H2>
          {watermelonPlusFeatures.map((feature) => (
            <Span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </Span>
          ))}
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
              <Img size={40} slug="vex" />
              <A
                href="https://github.com/chrryai/vex"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                Vex
              </A>
            </Div>
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
              <Img size={40} slug="chrry" />
              <A
                href="https://github.com/chrryai"
                target="_blank"
                rel="nofollow"
                style={styles.ossLink.style}
              >
                Chrry
              </A>
            </Div>
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
              <Span
                style={{
                  fontSize: "0.7rem",
                  color: COLORS.purple,
                  marginRight: 2,
                }}
              >
                DNA
              </Span>
              <A
                title={t("Creator")}
                style={{ fontSize: "1rem", marginRight: 3 }}
                openInNewTab
                href="https://github.com/chrryAI/vex/blob/main/.sato/COMPREHENSIVE_SPATIAL_PATENT.md"
              >
                🧬
              </A>

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
              <Img slug="sushi" size={40} />
              <A
                href="https://github.com/chrryAI/sushi"
                style={{ ...styles.ossLink.style, color: COLORS.red }}
                target="_blank"
                rel="nofollow"
              >
                Compiler
              </A>
            </Div>
          </Div>
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
              <Claude color={COLORS.orange} size={40} />
              <A
                href="https://claude.com/product/claude-code"
                target="_blank"
                rel="nofollow"
                style={{ ...styles.ossLink.style, color: COLORS.orange }}
              >
                Architect
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <Gemini color={COLORS.blue} size={40} />
              <A
                href="https://jules.google.com"
                target="_blank"
                rel="nofollow"
                style={{ ...styles.ossLink.style, color: COLORS.blue }}
              >
                Vision
              </A>
            </Div>
            <Div style={styles.oss.style}>
              <DeepSeek color={COLORS.purple} size={40} />
              <A
                href="https://www.deepseek.com"
                target="_blank"
                rel="nofollow"
                style={{ ...styles.ossLink.style, color: COLORS.purple }}
              >
                Content
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
