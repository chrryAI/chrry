"use client"

import React, { useEffect } from "react"
import Skeleton from "./Skeleton"
import { COLORS, useAppContext } from "./context/AppContext"
import { BrowserInstance, checkIsExtension } from "./utils"
import {
  BadgeCheck,
  CircleArrowLeft,
  Coins,
  Shell,
  UserRoundPlus,
} from "./icons"
import styles from "./About.module.scss"
import { RiNextjsFill } from "react-icons/ri"
import { BiLogoPostgresql } from "react-icons/bi"

import { SiCssmodules, SiJest, SiDrizzle, SiTypescript } from "react-icons/si"
import { FaChrome, FaFirefox } from "react-icons/fa"
import clsx from "clsx"
import Logo from "./Logo"
import Img from "./Image"
import { getFeatures } from "./utils/subscription"
import {
  useAuth,
  useData,
  useError,
  useNavigationContext,
} from "./context/providers"
import { useNavigation, usePlatform, useTheme } from "./platform"
import { getSiteConfig } from "./utils/siteConfig"
import { Claude, DeepSeek } from "@lobehub/icons"
import A from "./A"
export default function About() {
  const {
    // track,
    // isStandalone,
    // addHapticFeedback,
    chrry,
    // captureException,
    user,
    track,
    baseApp,
    setApp,
  } = useAuth()

  const config = getSiteConfig()

  const isChrryAI = config.mode === "chrryAI"

  const apps = isChrryAI ? chrry?.store?.apps : baseApp?.store?.apps

  const { t } = useAppContext()

  const {
    // isDrawerOpen,
    // router,
    // t,
    // track,
    isStandalone,
    // addHapticFeedback,

    // captureException,
    // user,
  } = usePlatform()

  const { router } = useNavigationContext()
  const { isDrawerOpen, addHapticFeedback } = useTheme()

  const { captureException } = useError()

  // useData()

  useEffect(() => {
    track({
      name: "about",
    })
  }, [])

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

  return (
    <Skeleton>
      <div
        className={clsx(styles.about)}
        style={{
          maxWidth: 800,
          margin: isDrawerOpen ? undefined : "0 auto",
          padding: "0 0px 20px 0px",
        }}
      >
        <h1 style={{ marginTop: 0 }}>
          <button className="link" onClick={() => router.push("/")}>
            <CircleArrowLeft color="var(--accent-1)" size={24} />
          </button>{" "}
          <span
            onClick={() => {
              if (user?.role === "admin") {
                captureException(new Error("About Vex"))
              }
            }}
          >
            {t("About Vex")}
          </span>
        </h1>
        <section style={{ marginBottom: 15 }}>
          <p>
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
            {config.mode === "vex" && (
              <>
                {", "}
                <a
                  onClick={(e) => {
                    addHapticFeedback()
                    if (e.metaKey || e.ctrlKey) {
                      return
                    }
                    e.preventDefault()

                    if (checkIsExtension()) {
                      BrowserInstance?.runtime?.sendMessage({
                        action: "openInSameTab",
                        url: `${FRONTEND_URL}/blog`,
                      })

                      return
                    }

                    router.push("/blog")
                  }}
                  href={isStandalone ? undefined : `${FRONTEND_URL}/blog`}
                >
                  {t("Blog")}
                </a>
              </>
            )}
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
            <a href="https://x.com/askvexai">@askvexAI</a>
            {", "}
            <a href="mailto:iliyan@chrry.ai">iliyan@chrry.ai</a>
          </p>
        </section>

        <section>
          <p>🥰 {t("about.intro")}</p>
          <p style={{ marginTop: "1rem" }}>{t("about.intro2")}</p>
        </section>

        {/* Dynamic Apps Section */}
        {apps && apps.length > 0 && (
          <section>
            <h2>
              {config.logo} {t("Available Apps")}
            </h2>
            <p>{t("Discover AI-powered apps from our store")}</p>
            <div className={styles.apps}>
              {apps.map((app) => (
                <div
                  key={app.id}
                  className={styles.app}
                  onClick={() => setApp(app)}
                >
                  <h4>
                    <span style={{ fontSize: 30 }}>
                      {<Img app={app} size={30} />}
                    </span>
                    {app.title || app.name}
                  </h4>
                  <p className={styles.appDescription}>
                    {app.description || t("No description available")}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2>{t("about.approach.title")}</h2>
          <p>{t("about.approach.content")}</p>
        </section>

        <section>
          <h2>{t("about.transparency.title")}</h2>
          <p>{t("about.transparency.intro")}</p>
          <ul>
            <li>{t("about.transparency.items.pricing")}</li>
            <li>{t("about.transparency.items.usage")}</li>
            <li>{t("about.transparency.items.communication")}</li>
            <li>{t("about.transparency.items.data")}</li>
          </ul>
        </section>

        <h2 style={{ fontSize: 28 }}>{t("All Plans")}</h2>
        <section>
          <h2>
            <Logo size={24} /> {config.name} {t("Free")}
            {!user && (
              <button
                className="inverted"
                style={{ marginLeft: "auto", fontSize: 14 }}
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
              </button>
            )}
          </h2>
          {memberFeatures.map((feature) => (
            <span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </span>
          ))}
        </section>

        <section>
          <h2>
            <Img size={24} icon="chrry" /> {config.name} {t("Credits")}
            <button
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
              style={{ marginLeft: "auto", fontSize: 14 }}
            >
              {t("credits_pricing", {
                credits: ADDITIONAL_CREDITS,
                price: `${CREDITS_PRICE}.00`,
              })}
            </button>
          </h2>
          {creditsFeatures.map((feature) => (
            <span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </span>
          ))}
        </section>

        <section>
          <h2>
            <Img size={24} icon="strawberry" /> {config.name} {t("Plus")}
            <span
              title={t("Most popular")}
              style={{
                color: "var(--accent-1)",
                marginTop: "4px",
                marginLeft: "4px",
                verticalAlign: "middle",
              }}
            >
              <BadgeCheck size={20} />
            </span>
            <button
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
              style={{ marginLeft: "auto", fontSize: 14 }}
            >
              €
              {t("{{price}}/month", {
                price: PLUS_PRICE,
              })}
            </button>
          </h2>
          {plusFeatures.map((feature) => (
            <span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </span>
          ))}
        </section>

        <section>
          <h2>
            <Img size={24} icon="raspberry" /> {config.name} {t("Pro")}
            <button
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
              style={{ marginLeft: "auto", fontSize: 14 }}
            >
              €
              {t("{{price}}/month", {
                price: PRO_PRICE,
              })}
            </button>
          </h2>
          {proFeatures.map((feature) => (
            <span key={feature.text}>
              {" "}
              {feature.emoji} {feature.text}
            </span>
          ))}
        </section>

        <section>
          <h2>{t("about.platforms.title")}</h2>
          <p>{t("about.platforms.content")}</p>

          <div>
            <div>
              <h3>{t("about.platforms.web.title")}</h3>
              <p>{t("about.platforms.web.content")}</p>
              <video
                className={styles.video}
                controls
                src={`https://7079yofdv0.ufs.sh/f/5ALK9G4mxClOL8j2AfbZ5dgLDCVo4JzBsXqI3MrF8KatARwv`}
              />
            </div>

            <div>
              <h3>{t("about.platforms.pwa.title")}</h3>
              <p>{t("about.platforms.pwa.content")}</p>

              <video
                className={styles.video}
                controls
                src={`https://7079yofdv0.ufs.sh/f/5ALK9G4mxClOTAEfNuXpQy4HJYn8fWo1mFVRaG7eqCiD3A5l`}
              />
            </div>

            <div>
              <h3 style={{ display: "flex" }}>
                {t("about.platforms.chrome.title")}{" "}
                <a
                  target="_blank"
                  style={{ marginLeft: "auto" }}
                  href="https://chromewebstore.google.com/detail/vex/odgdgbbddopmblglebfngmaebmnhegfc"
                  className={clsx("button small", styles.installButton)}
                >
                  <FaChrome size={18} />
                  {t("Install")}
                </a>
              </h3>
              <p>{t("about.platforms.chrome.content")} </p>
              <video
                className={styles.video}
                controls
                src={`https://7079yofdv0.ufs.sh/f/5ALK9G4mxClOWTxc2Y6sD5zVU8hPgdAmWQy4qXa0KuL2HE7e`}
              />
            </div>

            <div>
              <h3 style={{ display: "flex" }}>
                {t("about.platforms.firefox.title")}
                <a
                  style={{ marginLeft: "auto" }}
                  target="_blank"
                  href="https://addons.mozilla.org/en-US/firefox/addon/vex"
                  className={clsx("button small", styles.installButton)}
                >
                  <FaFirefox size={18} />
                  {t("Install")}
                </a>
              </h3>
              <p>{t("about.platforms.firefox.content")}</p>
              <video
                className={styles.video}
                controls
                src={`https://7079yofdv0.ufs.sh/f/5ALK9G4mxClOPpTJtj5mvZ0Y8iWC57kp1lcG4ExKLJo3NHbf`}
              />
            </div>
          </div>
        </section>

        {/* <section>
          <h2>{t("about.team.title")}</h2>
          <p>{t("about.team.content")}</p>
        </section> */}

        <div className={styles.ossWrapper}>
          <h2 className={styles.ossTitle}>{t("Open Source")}</h2>
          <div
            style={{ marginBottom: "1.5rem" }}
            className={styles.ossContainer}
          >
            <div className={styles.oss}>
              <SiTypescript style={{ width: 40, height: 40 }} />
              <a
                href="https://www.typescriptlang.org"
                target="_blank"
                rel="nofollow"
                className={styles.ossLink}
              >
                TypeScript
              </a>
            </div>
            <div className={styles.oss}>
              <RiNextjsFill style={{ width: 40, height: 40 }} />
              <a
                href="https://nextjs.org"
                target="_blank"
                rel="nofollow"
                className={styles.ossLink}
              >
                Next.js
              </a>
            </div>
            <div className={styles.oss}>
              <BiLogoPostgresql style={{ width: 40, height: 40 }} />
              <a
                href="https://www.postgresql.org"
                target="_blank"
                rel="nofollow"
                className={styles.ossLink}
              >
                PostgreSQL
              </a>
            </div>
            <div className={styles.oss}>
              <DeepSeek color={COLORS.purple} size={40} />
              <a
                href="https://www.deepseek.com"
                target="_blank"
                rel="nofollow"
                className={styles.ossLink}
              >
                DeepSeek
              </a>
            </div>
          </div>

          <div className={styles.ossContainer}>
            <div className={styles.oss}>
              <SiJest style={{ width: 40, height: 40 }} />
              <a
                href="https://jestjs.io"
                target="_blank"
                rel="nofollow"
                className={styles.ossLink}
              >
                Jest
              </a>
            </div>
            <div className={styles.oss}>
              <SiCssmodules style={{ width: 40, height: 40 }} />
              <a
                href="https://github.com/css-modules/css-modules"
                target="_blank"
                rel="nofollow"
                className={styles.ossLink}
              >
                CSS Modules
              </a>
            </div>
            <div className={styles.oss}>
              <Shell style={{ width: 40, height: 40 }} />
              <a
                href="https://lucide.dev"
                target="_blank"
                rel="nofollow"
                className={styles.ossLink}
              >
                Lucide
              </a>
            </div>
          </div>
        </div>
        <div className={styles.ossWrapper}>
          <h2 className={styles.ossTitle}>{t("Team")}</h2>
          <div
            style={{ marginBottom: "1.5rem" }}
            className={styles.ossContainer}
          >
            <div className={styles.oss}>
              <Img icon="spaceInvader" size={40} />
              <A
                href="https://i.chrry.dev"
                openInNewTab
                className={styles.ossLink}
              >
                iliyan@chrry.ai
              </A>
            </div>
            <div className={styles.oss}>
              <Claude color={COLORS.orange} size={40} />
              <A
                href="https://claude.ai"
                target="_blank"
                rel="nofollow"
                className={styles.ossLink}
              >
                Claude
              </A>
            </div>
          </div>
        </div>

        <div className={styles.lastUpdated}>
          <Img src={`${FRONTEND_URL}/hamster.png`} width={24} height={24} />
          {t("about.last_updated", { date: "September 29, 2025" })}
        </div>
      </div>
    </Skeleton>
  )
}
