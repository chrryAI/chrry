"use client"
import type React from "react"
import { memo, useEffect, useState } from "react"
import toast from "react-hot-toast"
import { Clipboard, StyleSheet } from "react-native"
import Markdown from "react-native-markdown-display"
import { useAppContext } from "./context/AppContext"
import { Check, Copy } from "./icons"
import {
  type codeBlock,
  type MarkdownContentProps,
  processTextWithCitations,
} from "./MarkdownContent.shared"
import { useMarkdownContentStyles } from "./MarkdownContent.styles"
import { Button, Div, ScrollView, Text, useTheme } from "./platform"

export { processTextWithCitations }
export type { MarkdownContentProps }

const _CodeBlock: React.FC<codeBlock> = ({ language, children, className }) => {
  const [copied, setCopied] = useState(false)
  const { t } = useAppContext()
  const styles = useMarkdownContentStyles()

  const copyToClipboard = async () => {
    try {
      Clipboard.setString(children)
      setCopied(true)
      toast.success(t("Copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch (_err) {
      toast.error("Failed to copy code")
    }
  }

  return (
    <Div style={styles.codeBlockContainer.style}>
      <Div style={styles.codeBlockHeader.style}>
        <Text style={styles.language.style}>{language}</Text>
        <Button onClick={copyToClipboard} style={styles.copyButton.style}>
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </Button>
      </Div>
      <ScrollView horizontal style={styles.codeBlock.style}>
        <Text style={{ fontFamily: "monospace", fontSize: 14 }}>
          {children}
        </Text>
      </ScrollView>
    </Div>
  )
}

// ⚡ Bolt: Memoize MarkdownContent to prevent expensive re-rendering/parsing
// when parent re-renders but content is stable.
const MarkdownContent = memo(
  ({
    content,
    className,
    "data-testid": dataTestId,
    style,
    webSearchResults,
  }: MarkdownContentProps) => {
    const [isMounted, setIsMounted] = useState(false)
    const { colors } = useTheme()
    const _styles = useMarkdownContentStyles()

    useEffect(() => {
      setIsMounted(true)
    }, [])

    if (!isMounted) return null

    // Process content with citations if webSearchResults are available
    const processedContent = processTextWithCitations({
      content,
      webSearchResults,
    })

    // Native markdown styles
    const markdownStyles = StyleSheet.create({
      body: {
        color: colors.foreground,
        fontSize: 16,
        lineHeight: 24,
      },
      heading1: {
        fontSize: 28,
        fontWeight: "bold",
        marginVertical: 16,
        color: colors.foreground,
      },
      heading2: {
        fontSize: 24,
        fontWeight: "bold",
        marginVertical: 14,
        color: colors.foreground,
      },
      heading3: {
        fontSize: 20,
        fontWeight: "bold",
        marginVertical: 12,
        color: colors.foreground,
      },
      heading4: {
        fontSize: 18,
        fontWeight: "bold",
        marginVertical: 10,
        color: colors.foreground,
      },
      paragraph: {
        marginVertical: 8,
        color: colors.foreground,
      },
      link: {
        color: colors.accent6,
        textDecorationLine: "underline",
      },
      code_inline: {
        backgroundColor: colors.shade2,
        color: colors.accent6,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
        fontFamily: "monospace",
      },
      code_block: {
        backgroundColor: colors.shade1,
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        fontFamily: "monospace",
      },
      fence: {
        backgroundColor: colors.shade1,
        padding: 12,
        borderRadius: 8,
        marginVertical: 8,
        fontFamily: "monospace",
      },
      blockquote: {
        backgroundColor: colors.shade1,
        borderLeftWidth: 4,
        borderLeftColor: colors.accent6,
        paddingLeft: 12,
        paddingVertical: 8,
        marginVertical: 8,
      },
      list_item: {
        marginVertical: 4,
        color: colors.foreground,
      },
      bullet_list: {
        marginVertical: 8,
      },
      ordered_list: {
        marginVertical: 8,
      },
      table: {
        borderWidth: 1,
        borderColor: colors.shade3,
        marginVertical: 8,
      },
      thead: {
        backgroundColor: colors.shade2,
      },
      tbody: {},
      th: {
        padding: 8,
        fontWeight: "bold",
        borderWidth: 1,
        borderColor: colors.shade3,
      },
      td: {
        padding: 8,
        borderWidth: 1,
        borderColor: colors.shade3,
      },
      tr: {},
      image: {
        maxWidth: "100%",
        height: "auto",
        marginVertical: 8,
        borderRadius: 8,
      },
    })

    return (
      <Div style={style} data-testid={dataTestId}>
        <Markdown style={markdownStyles}>{processedContent}</Markdown>
      </Div>
    )
  },
)

export default MarkdownContent
