"use client"
/**
 * FalkorDB Local Setup Modal
 *
 * Opened by the terminal icon in Chat.tsx.
 * Multi-step wizard:
 *   Step 1 (intro)    — explain what will be installed, choose AI sync (Claude / Ollama / none)
 *   Step 2 (auth)     — enforce login (skip if already logged in)
 *   Step 3 (progress) — seed stores → seed apps → seed user data
 *   Step 4 (done)     — success with node count
 */

import { useState } from "react"
import { Button, Div, H2, P, Span } from "./platform"

// ─── Types ─────────────────────────────────────────────────────────────────

type AiSync = "claude" | "ollama" | "none"
type Step = "intro" | "auth" | "progress" | "done" | "error"

interface SeedProgress {
  stores: "idle" | "running" | "done" | "error"
  apps: "idle" | "running" | "done" | "error"
  userData: "idle" | "running" | "done" | "error"
}

interface Props {
  isOpen: boolean
  onClose: () => void
  /** Logged-in user — null means guest */
  user: { id: string; name?: string | null } | null
  /** Called to redirect to login */
  onLogin: () => void
  /** API base URL */
  apiUrl: string
}

// ─── Seed helpers ──────────────────────────────────────────────────────────

async function runSeedStep(
  apiUrl: string,
  scope: "public" | "user",
  userId?: string,
): Promise<number> {
  const res = await fetch(`${apiUrl}/api/falkor/seed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ scope, userId }),
  })
  if (!res.ok) throw new Error(`Seed failed: ${res.status}`)
  const json = await res.json()
  return json.nodeCount ?? 0
}

// ─── Component ─────────────────────────────────────────────────────────────

export function FalkorDBSetupModal({
  isOpen,
  onClose,
  user,
  onLogin,
  apiUrl,
}: Props) {
  const [step, setStep] = useState<Step>("intro")
  const [aiSync, setAiSync] = useState<AiSync>("none")
  const [progress, setProgress] = useState<SeedProgress>({
    stores: "idle",
    apps: "idle",
    userData: "idle",
  })
  const [nodeCount, setNodeCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  if (!isOpen) return null

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleNext() {
    if (step === "intro") {
      if (!user) {
        setStep("auth")
      } else {
        setStep("progress")
        void runAllSeeds()
      }
    }
  }

  async function runAllSeeds() {
    setStep("progress")
    let total = 0

    try {
      // Stores
      setProgress((p) => ({ ...p, stores: "running" }))
      total += await runSeedStep(apiUrl, "public")
      setProgress((p) => ({ ...p, stores: "done", apps: "running" }))

      // Apps (also public)
      total += await runSeedStep(apiUrl, "public")
      setProgress((p) => ({ ...p, apps: "done" }))

      // User data
      if (user) {
        setProgress((p) => ({ ...p, userData: "running" }))
        total += await runSeedStep(apiUrl, "user", user.id)
        setProgress((p) => ({ ...p, userData: "done" }))
      } else {
        setProgress((p) => ({ ...p, userData: "done" }))
      }

      setNodeCount(total)
      setStep("done")
    } catch (e) {
      setErrorMsg(String(e))
      setStep("error")
    }
  }

  function reset() {
    setStep("intro")
    setProgress({ stores: "idle", apps: "idle", userData: "idle" })
    setErrorMsg(null)
    setNodeCount(0)
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  const s = styles

  return (
    // Backdrop
    <Div
      style={s.backdrop}
      onClick={(e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Modal card */}
      <Div style={s.card}>
        {/* Header */}
        <Div style={s.header}>
          <Span style={s.termIcon}>⬡</Span>
          <H2 style={s.title}>Local AI Workspace</H2>
          <Button style={s.closeBtn} onClick={onClose}>
            ✕
          </Button>
        </Div>

        {/* ── Step: INTRO ─────────────────────────────────────────────── */}
        {step === "intro" && (
          <Div style={s.body}>
            <P style={s.desc}>
              This will install <strong>FalkorDB</strong> locally and sync your
              apps, stores, and conversation history as an offline-ready graph
              database.
            </P>

            {/* Requires Docker note */}
            <Div style={s.infoBox}>
              <Span style={s.infoIcon}>🐳</Span>
              <P style={s.infoText}>
                Requires Docker. Run once:{" "}
                <code style={s.code}>
                  docker run -p 6379:6379 falkordb/falkordb
                </code>
              </P>
            </Div>

            {/* AI Sync choice */}
            <P style={s.sectionLabel}>AI Sync (optional)</P>
            <Div style={s.syncRow}>
              {(["claude", "ollama", "none"] as AiSync[]).map((opt) => (
                <Button
                  key={opt}
                  style={{
                    ...s.syncBtn,
                    ...(aiSync === opt ? s.syncBtnActive : {}),
                  }}
                  onClick={() => setAiSync(opt)}
                >
                  {opt === "claude" && "🧠 Claude"}
                  {opt === "ollama" && "🦙 Ollama"}
                  {opt === "none" && "⊘ Skip"}
                </Button>
              ))}
            </Div>

            {aiSync === "claude" && (
              <P style={s.syncNote}>
                Your threads will be summarised by Claude for smarter context
                retrieval.
              </P>
            )}
            {aiSync === "ollama" && (
              <P style={s.syncNote}>
                Uses your local Ollama instance — fully offline.
              </P>
            )}

            <Button style={s.primaryBtn} onClick={handleNext}>
              {user ? "Install & Sync →" : "Login to continue →"}
            </Button>
          </Div>
        )}

        {/* ── Step: AUTH ──────────────────────────────────────────────── */}
        {step === "auth" && (
          <Div style={s.body}>
            <Span style={{ fontSize: 48 }}>🔐</Span>
            <H2 style={s.stepTitle}>Login required</H2>
            <P style={s.desc}>
              We need your account to sync your personal data (threads,
              memories, character profiles).
            </P>
            <Button style={s.primaryBtn} onClick={onLogin}>
              Login →
            </Button>
            <Button
              style={s.ghostBtn}
              onClick={() => {
                void runAllSeeds() // seed public only
              }}
            >
              Continue without login (public data only)
            </Button>
          </Div>
        )}

        {/* ── Step: PROGRESS ──────────────────────────────────────────── */}
        {step === "progress" && (
          <Div style={s.body}>
            <H2 style={s.stepTitle}>Setting up…</H2>
            <Div style={s.progressList}>
              <ProgressRow
                label="Seed stores"
                emoji="📦"
                status={progress.stores}
              />
              <ProgressRow
                label="Seed apps"
                emoji="🤖"
                status={progress.apps}
              />
              <ProgressRow
                label="Sync your data"
                emoji="🧠"
                status={progress.userData}
              />
            </Div>
          </Div>
        )}

        {/* ── Step: DONE ──────────────────────────────────────────────── */}
        {step === "done" && (
          <Div style={s.body}>
            <Span style={{ fontSize: 56 }}>✅</Span>
            <H2 style={s.stepTitle}>Local workspace ready!</H2>
            <P style={s.desc}>
              FalkorDB seeded with{" "}
              <strong>{nodeCount.toLocaleString()} nodes</strong>. Your apps and
              conversations are available offline.
            </P>
            <Button style={s.primaryBtn} onClick={onClose}>
              Start chatting
            </Button>
          </Div>
        )}

        {/* ── Step: ERROR ─────────────────────────────────────────────── */}
        {step === "error" && (
          <Div style={s.body}>
            <Span style={{ fontSize: 48 }}>⚠️</Span>
            <H2 style={s.stepTitle}>Setup failed</H2>
            <P style={s.desc}>{errorMsg}</P>
            <Div style={{ display: "flex", gap: 12 }}>
              <Button style={s.ghostBtn} onClick={reset}>
                Try again
              </Button>
              <Button style={s.primaryBtn} onClick={onClose}>
                Close
              </Button>
            </Div>
          </Div>
        )}
      </Div>
    </Div>
  )
}

// ─── Progress row ──────────────────────────────────────────────────────────

function ProgressRow({
  label,
  emoji,
  status,
}: {
  label: string
  emoji: string
  status: "idle" | "running" | "done" | "error"
}) {
  const indicator =
    status === "done"
      ? "✅"
      : status === "error"
        ? "❌"
        : status === "running"
          ? "⟳"
          : "○"

  return (
    <Div style={progressRow}>
      <Span style={{ fontSize: 20 }}>{emoji}</Span>
      <Span style={progressLabel}>{label}</Span>
      <Span
        style={{
          ...progressIndicator,
          ...(status === "running" ? progressRunning : {}),
        }}
      >
        {indicator}
      </Span>
    </Div>
  )
}

const progressRow: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "14px 0",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
}
const progressLabel: React.CSSProperties = {
  flex: 1,
  color: "rgba(255,255,255,0.8)",
  fontSize: 15,
}
const progressIndicator: React.CSSProperties = {
  fontSize: 18,
  color: "rgba(255,255,255,0.4)",
}
const progressRunning: React.CSSProperties = {
  color: "#7c3aed",
  animation: "spin 0.8s linear infinite",
  display: "inline-block",
}

// ─── Styles ────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  backdrop: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.6)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000,
  },
  card: {
    background: "rgba(14,14,20,0.97)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 20,
    width: "min(480px, 95vw)",
    boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "20px 24px",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  },
  termIcon: {
    fontSize: 22,
    color: "#7c3aed",
  },
  title: {
    flex: 1,
    fontSize: 17,
    fontWeight: 600,
    color: "#fff",
    margin: 0,
  },
  closeBtn: {
    background: "none",
    border: "none",
    color: "rgba(255,255,255,0.4)",
    fontSize: 18,
    cursor: "pointer",
    padding: "4px 8px",
    borderRadius: 6,
  },
  body: {
    padding: "28px 24px 32px",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 16,
  },
  desc: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
    lineHeight: 1.7,
    margin: 0,
  },
  infoBox: {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "12px 16px",
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    width: "100%",
  },
  infoIcon: { fontSize: 20, flexShrink: 0 },
  infoText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 13,
    margin: 0,
    lineHeight: 1.6,
  },
  code: {
    background: "rgba(255,255,255,0.08)",
    borderRadius: 4,
    padding: "1px 6px",
    fontFamily: "monospace",
    fontSize: 12,
    color: "#a8ff78",
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 600,
    color: "rgba(255,255,255,0.4)",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    margin: 0,
  },
  syncRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  syncBtn: {
    padding: "8px 16px",
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    color: "rgba(255,255,255,0.6)",
    cursor: "pointer",
    fontSize: 14,
    transition: "all 0.15s",
  },
  syncBtnActive: {
    borderColor: "#7c3aed",
    background: "rgba(124,58,237,0.15)",
    color: "#c4b5fd",
  },
  syncNote: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 13,
    margin: 0,
    lineHeight: 1.6,
  },
  primaryBtn: {
    padding: "12px 24px",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
    color: "#fff",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
    transition: "opacity 0.15s",
  },
  ghostBtn: {
    padding: "10px 24px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "none",
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    cursor: "pointer",
    width: "100%",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: "#fff",
    margin: 0,
  },
  progressList: {
    width: "100%",
  },
}
