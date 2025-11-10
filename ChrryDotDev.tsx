"use client"

import React from "react"
import { getSiteConfig } from "./utils/siteConfig"
import { ExternalLink, Github, Package } from "./icons"
import styles from "./Chrry.module.scss"
import { useData } from "./context/providers"
import A from "./A"

export default function Chrry() {
  const config = getSiteConfig("chrryDev")
  const isChrry = config.mode === "chrryDev"

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.vex}>
          <span>Built by </span>

          <a href={"https://vex.chrry.ai"}>
            <img
              alt="Vex"
              src="https://vex.chrry.ai/icons/icon-128-v.png"
              width={24}
              height={24}
            />
            Vex
          </a>

          <p>
            <code>npm install @chrryai/chrry</code>
          </p>
        </div>
        <div className={styles.logo}>
          <img
            alt="Chrry"
            src="https://vex.chrry.ai/logo/cherry-500.png"
            width={250}
            height={250}
          />
          <h1>Chrry</h1>
        </div>
        <p className={styles.description}>{config.description}</p>

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
      </div>

      <div className={styles.features}>
        {config.features.map((feature, index) => (
          <div key={index} className={styles.feature}>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>
                <span>{feature.icon}</span>
                <span>{feature.title}</span>
              </h3>
              <a
                key={index}
                href={feature.link}
                target={feature.isOpenSource ? "_blank" : undefined}
                rel={feature.isOpenSource ? "noopener noreferrer" : undefined}
                className={styles.feature}
                data-opensource={feature.isOpenSource}
              >
                <p className="chrry-feature-description">
                  {feature.description}
                </p>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
