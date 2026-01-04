/**
 * Sushi IDE - Simple Placeholder
 *
 * Basic IDE UI that will be enhanced with Monaco Editor and filesystem later
 */

import React, { useEffect, useState } from "react"
import { Div, H1, Button, P, usePlatform } from "./platform"
import { useAuth } from "./context/providers/AuthProvider"
import { CodeXml, FolderOpen, File } from "./icons"
import Home from "./Home"
import { useTheme } from "./context/ThemeContext"

export interface IDEProps {
  rootPath?: string
  initialFile?: string
}

export function IDE({ rootPath = ".", initialFile }: IDEProps) {
  const [code, setCode] = useState(
    "// Welcome to Sushi IDE!\n// Click Code button to toggle back to chat\n\nconsole.log('Hello, World!');",
  )
  const { user, toggleIDE } = useAuth()
  const { isSmallDevice } = useTheme()

  const { isCapacitor } = usePlatform()

  const [isChatOpen, setIsChatOpen] = useState(true)

  useEffect(() => {
    // Don't disable scroll on mobile/Capacitor
    if (!isCapacitor) {
      document.body.style.overflow = "hidden"
      document.body.style.paddingBottom = "50px"
    }
    return () => {
      if (!isCapacitor) {
        document.body.style.overflow = "auto"
        document.body.style.paddingBottom = "0px"
      }
    }
  }, [isCapacitor])

  return (
    <Div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
      }}
    >
      {/* Header */}
      <Div
        style={{
          padding: "10px 10px",
          borderBottom: "1px solid #333",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginTop: 20,
          }}
        >
          <CodeXml size={20} color="#fff" />
          <H1
            style={{
              margin: 0,
              fontSize: "16px",
              color: "#fff",
              fontWeight: 600,
            }}
          >
            🍣 Sushi
          </H1>
        </Div>
        <Div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <P style={{ fontSize: "13px", color: "#888", margin: 0 }}>
            {user?.email || "Guest"}
          </P>
          <Button
            className="transparent"
            onClick={() => setIsChatOpen(!isChatOpen)}
            style={{}}
          >
            Chat
          </Button>
        </Div>
      </Div>
      <Div style={{ display: "flex" }}>
        {/* Main IDE */}
        <Div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* File Explorer Sidebar */}
          <Div
            style={{
              width: "250px",
              borderRight: "1px solid #333",
              overflow: "auto",
            }}
          >
            <Div
              style={{
                padding: "10px",
                borderBottom: "1px solid #333",
                color: "#fff",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              Explorer
            </Div>
            <Div style={{ padding: "10px" }}>
              <Div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "6px",
                  color: "#ccc",
                  fontSize: "13px",
                }}
              >
                <FolderOpen size={16} />
                <span>project</span>
              </Div>
              <Div style={{ paddingLeft: "24px" }}>
                <Div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px",
                    color: "#fff",
                    fontSize: "13px",
                    borderRadius: "4px",
                  }}
                >
                  <File size={16} />
                  <span>index.ts</span>
                </Div>
              </Div>
            </Div>
          </Div>

          {/* Code Editor */}
          <Div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <Div
              style={{
                padding: "8px 16px",
                borderBottom: "1px solid #333",
                color: "#ccc",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <File size={14} />
              <span>index.ts</span>
            </Div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              style={{
                flex: 1,
                color: "#d4d4d4",
                border: "none",
                padding: "16px",
                fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
                fontSize: "14px",
                lineHeight: "1.6",
                resize: "none",
                outline: "none",
              }}
              spellCheck={false}
            />
          </Div>
        </Div>
        {isChatOpen && (
          <Div style={{ padding: "0 0" }}>
            <Home
              style={{
                width: 400,
                padding: "10px",
                borderLeft: "1px solid #333",
                // height: "100vh",
              }}
            />
          </Div>
        )}
      </Div>
    </Div>
  )
}

export default IDE
