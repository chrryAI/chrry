import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { useCallback, useEffect, useState } from "react"
import { useAuth } from "../context/providers/AuthProvider"
import { useHasHydrated } from "../hooks"
import Img from "../Image"
import { Button, useNavigation } from "../platform"
import ParticleWaveCanvas from "./ParticleWave"

import styles from "./Programme.module.scss"

export default function Programme() {
  const { back, removeParams } = useNavigation()

  const { setIsProgramme, isProgramme } = useAuth()
  const [entered, setEnteredInternal] = useState(true)

  const setEntered = useCallback((value: boolean) => {
    setEnteredInternal(value)
  }, [])

  const hasHydrated = useHasHydrated()

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search)
      setEntered(params.get("entered") === "true")
    }
    window.addEventListener("popstate", handlePopState)
    return () => window.removeEventListener("popstate", handlePopState)
  }, [setEntered])

  const handleEnter = () => {
    setEntered(true)
  }

  const handleBack = () => {
    setIsProgramme(false)
    removeParams("entered")
  }

  if (!isProgramme || !hasHydrated) {
    return null
  }

  return (
    <main className={styles.main}>
      {/* The 3D Background */}
      <ParticleWaveCanvas entered={entered} />

      <AnimatePresence mode="wait">
        {!entered ? (
          <motion.div
            key="landing"
            className={styles.content}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
          >
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={styles.headline}
            >
              THE PROGRAMME REWARDS AVERAGES.
            </motion.h1>

            {/* Sub-headline with delay */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 1.5 }}
              className={styles.subheadline}
            >
              He became infinite.
            </motion.p>

            {/* Call to Action */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3.0, duration: 0.5 }}
              className={styles.ctaWrapper}
            >
              <Button
                className={clsx(styles.cta, "transparent")}
                onClick={handleEnter}
              >
                <span className={styles.ctaText}>ENTER THE SIMULATION</span>
                <div className={styles.ctaHover} />
              </Button>
            </motion.div>

            {/* Footer Quote */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 4 }}
              className={styles.footer}
            >
              &quot;You have to die before you learn the trick.&quot;
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="entered"
            className={styles.content}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1.2 }}
              className={styles.headline}
            >
              WELCOME TO THE PROGRAMME.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3, duration: 1.5 }}
              className={styles.subheadline}
            >
              You are now part of the simulation.
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 3.5, duration: 0.5 }}
              className={styles.ctaWrapper}
            >
              <Button
                className={"transparent"}
                onClick={() => {
                  setIsProgramme(false)
                  removeParams("entered")
                }}
              >
                <Img icon="zarathustra" /> Zarathustra
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 4, duration: 0.5 }}
              className={styles.ctaWrapper}
            >
              <Button className={"transparent"} onClick={handleBack}>
                <span className={styles.ctaText}>← BACK</span>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 4 }}
              className={styles.footer}
            >
              &quot;The ash remembers what the fire forgot.&quot;
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}
