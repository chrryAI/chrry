"use client"
import clx from "clsx"
import Markdown from "markdown-to-jsx"
import type React from "react"
import { memo, useMemo, useState } from "react"
import toast from "react-hot-toast"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { useAppContext } from "./context/AppContext"
import { Check, Copy } from "./icons"
import styles from "./MarkdownContent.module.scss"
import {
  type codeBlock,
  type MarkdownContentProps,
  processTextWithCitations,
} from "./MarkdownContent.shared"
import { createOverrides } from "./MarkdownOverrides"
import { Button, Div, useTheme } from "./platform"
import { usePlatformStyles } from "./platform/usePlatformStyles"

export { processTextWithCitations, createOverrides }
export type { MarkdownContentProps }

const CodeBlock: React.FC<codeBlock> = ({ language, children, className }) => {
  const [copied, setCopied] = useState(false)
  const { t } = useAppContext()

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      toast.success(t("Copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch (_err) {
      toast.error("Failed to copy code")
    }
  }

  return (
    <div className={styles.codeBlockContainer}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.language}>{language}</span>
        <Button
          onClick={copyToClipboard}
          className={clx("link", styles.copyButton, copied && styles.copied)}
          title="Copy code"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </Button>
      </div>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language || "text"}
        PreTag="div"
        className={`${styles.codeBlock} ${className || ""}`}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  )
}

const MarkdownContentComponent = ({
  content,
  className,
  "data-testid": dataTestId,
  style,
  webSearchResults,
}: MarkdownContentProps) => {
  /* isMounted removed for SSR */
  const { addHapticFeedback } = useTheme()
  const { t } = useAppContext()

  const galleryContainerConfig = useMemo(
    () => ({
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 16,
      marginVertical: 20,
    }),
    [],
  )

  const imageConfig = useMemo(
    () => ({
      height: 400,
      width: "auto",
      borderRadius: 12,
    }),
    [],
  )

  const galleryContainerStyles = usePlatformStyles(galleryContainerConfig)
  const imageStyles = usePlatformStyles(imageConfig)

  /*
   * removed isMounted hydration guard to allow SSR of markdown content.
   * browser-only components injected via overrides handle their own mounting.
   */

  const markdownOptions = useMemo(() => {
    return {
      overrides: createOverrides({
        addHapticFeedback,
        galleryContainerStyles,
        imageStyles,
        t,
        CodeBlockComponent: CodeBlock,
      }),
    }
  }, [addHapticFeedback, galleryContainerStyles, imageStyles, t])

  return (
    <Div
      style={style}
      data-testid={dataTestId}
      className={clx(styles.markdownContent, className)}
    >
      <Markdown options={markdownOptions}>
        {processTextWithCitations({
          content,
          webSearchResults,
        })}
      </Markdown>
    </Div>
  )
}

// ⚡ Bolt: Memoize MarkdownContent to prevent expensive re-rendering/parsing
// when parent re-renders but content is stable.
const MarkdownContent = memo(MarkdownContentComponent)

export default MarkdownContent
