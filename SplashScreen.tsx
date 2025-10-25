"use client"

import React from "react"
import { getSiteConfig } from "./utils/siteConfig"
import { ExternalLink, Github, Package } from "./icons"
import styles from "./SplashScreen.module.scss"

export default function SplashScreen() {
  const config = getSiteConfig()
  const isChrry = config.mode === "chrryDev"

  return (
    <div className={styles.container} data-mode={config.mode}>
      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>{config.logo}</span>
          <h1 className={styles.logoText}>{config.name}</h1>
        </div>

        {/* Description */}
        <p className={styles.description}>{config.description}</p>

        {/* Links (for Chrry only) */}
        {isChrry && config.links && (
          <div className={styles.links}>
            {config.links.github && (
              <a
                href={config.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <Github size={20} />
                <span>GitHub</span>
                <ExternalLink size={16} />
              </a>
            )}
            {config.links.npm && (
              <a
                href={config.links.npm}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
              >
                <Package size={20} />
                <span>npm</span>
                <ExternalLink size={16} />
              </a>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className={styles.features}>
          {config.features.map((feature, index) => (
            <a
              key={index}
              href={feature.link}
              target={feature.isOpenSource ? "_blank" : undefined}
              rel={feature.isOpenSource ? "noopener noreferrer" : undefined}
              className={styles.feature}
              data-opensource={feature.isOpenSource}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <div className={styles.featureContent}>
                <h3 className={styles.featureTitle}>
                  {feature.title}
                  {feature.isOpenSource && (
                    <span className={styles.openSourceBadge}>Open Source</span>
                  )}
                </h3>
                <p className={styles.featureDescription}>
                  {feature.description}
                </p>
              </div>
              {feature.isOpenSource && (
                <ExternalLink size={16} className={styles.featureArrow} />
              )}
            </a>
          ))}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {isChrry ? (
            <>
              <p>
                Built by the team behind{" "}
                <a
                  href="https://askvex.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Vex
                </a>
              </p>
              <p className={styles.install}>
                <code>npm install @chrryai/chrry</code>
              </p>
            </>
          ) : (
            <p>
              Powered by{" "}
              <a
                href="https://chrry.dev"
                target="_blank"
                rel="noopener noreferrer"
              >
                Chrry UI 🍒
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
