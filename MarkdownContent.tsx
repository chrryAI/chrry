"use client"
import React, { useEffect, useState } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import styles from "./MarkdownContent.module.scss"
import toast from "react-hot-toast"
import clx from "clsx"
import { Check, Copy, ExternalLink } from "./icons"
import { useAppContext } from "./context/AppContext"
import Img from "./Img"
import { BrowserInstance, checkIsExtension } from "./utils"
import TextWithLinks from "./TextWithLinks"
import CitationText from "./CitationText"
import Store from "./Store"
import Markdown from "markdown-to-jsx"
import { Div, ScrollView, useTheme } from "./platform"
import { usePlatformStyles } from "./platform/usePlatformStyles"

interface MarkdownContentProps {
  content: string
  className?: string
  "data-testid"?: string
  webSearchResults?: Array<{
    title: string
    url: string
    snippet: string
  }>
}

interface CodeBlockProps {
  language: string
  children: string
  className?: string
}

export const processTextWithCitations = ({
  content,
  webSearchResults,
}: {
  content: string
  webSearchResults?: Array<{
    title: string
    url: string
    snippet: string
  }>
}): string => {
  if (!webSearchResults || webSearchResults.length === 0) return content

  const citationPattern = /\[(\d+)\]/g
  let processedContent = content

  // Replace citation numbers with markdown links
  processedContent = processedContent.replace(
    citationPattern,
    (match, citationNumber) => {
      const sourceIndex = parseInt(citationNumber) - 1 // Convert to 0-based index
      const source = webSearchResults[sourceIndex]

      if (source && source.url && source.url !== "#") {
        // Create markdown link with title attribute
        return `[${match}](${source.url} "${source.title} - ${source.snippet}")`
      } else {
        // Keep as plain text if no URL available
        return match
      }
    },
  )

  return processedContent
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  children,
  className,
}) => {
  const [copied, setCopied] = useState(false)
  const { t } = useAppContext()
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(children)
      setCopied(true)
      toast.success(t("Copied"))
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy code")
    }
  }

  return (
    <div className={styles.codeBlockContainer}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.language}>{language}</span>
        <button
          onClick={copyToClipboard}
          className={clx("link", styles.copyButton, copied && styles.copied)}
          title="Copy code"
        >
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
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

const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  className,
  "data-testid": dataTestId,
  webSearchResults,
}) => {
  const [isMounted, setIsMounted] = useState(false)
  const { addHapticFeedback } = useTheme()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  // Process content with citations if webSearchResults are available
  const processedContent =
    webSearchResults && webSearchResults.length > 0 ? content : content

  return (
    <Div
      data-testid={dataTestId}
      className={`${styles.markdownContent} ${className || ""}`}
    >
      <Markdown
        options={{
          overrides: {
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || "")
              let lang = match ? match[1] : ""

              // Handle 'json' as a special case
              if (
                lang === "json" ||
                (!lang && /^[\s]*[{\[]/.test(String(children)))
              ) {
                try {
                  // Check if it's valid JSON
                  JSON.parse(String(children))
                  lang = "json"
                } catch (e) {
                  // Not valid JSON, use detected language or default
                }
              }

              return !inline && (match || lang === "json") ? (
                <CodeBlock language={lang || "text"} className={className}>
                  {String(children).replace(/\n$/, "")}
                </CodeBlock>
              ) : (
                <code
                  className={`${styles.inlineCode} ${className || ""}`}
                  {...props}
                >
                  {children}
                </code>
              )
            },
            // Customize other markdown elements as needed
            p: ({ node, children }) => {
              return (
                <Div
                  data-testid="markdown-paragraph"
                  className={`${styles.paragraph} ${styles.paragraphDiv}`}
                >
                  {children}
                </Div>
              )
            },

            div: ({ node, children }) => {
              return (
                <Div
                  data-testid="markdown-paragraph"
                  className={`${styles.paragraph} ${styles.paragraphDiv}`}
                >
                  {children}
                </Div>
              )
            },

            a: ({ href, children }) =>
              href ? (
                <TextWithLinks
                  onClick={(e) => {
                    addHapticFeedback()
                    if (checkIsExtension()) {
                      e.preventDefault()
                      BrowserInstance?.runtime?.sendMessage({
                        action: "openInSameTab",
                        url: href,
                      })
                    }
                  }}
                  text={String(children)}
                  className={styles.link}
                  href={href}
                />
              ) : (
                <a href={href}>{children}</a>
              ),
            img: ({ src, alt, width, height }) =>
              typeof src === "string" ? (
                <Img
                  showLoading={false}
                  src={src}
                  alt={alt}
                  className={styles.image}
                  width={width || "100%"}
                  height={height}
                />
              ) : (
                <img
                  src={src}
                  alt={alt}
                  width={width || "100%"}
                  height={height}
                />
              ),
            ul: ({ children }) => <ul className={styles.list}>{children}</ul>,
            ol: ({ children }) => (
              <ol className={styles.orderedList}>{children}</ol>
            ),
            li: ({ children }) => {
              return <li className={styles.listItem}>{children}</li>
            },
            h1: ({ children }) => (
              <h1 className={styles.heading1}>{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className={styles.heading2}>{children}</h2>
            ),
            h3: ({ children }) => (
              <h3 className={styles.heading3}>{children}</h3>
            ),
            h4: ({ children }) => (
              <h4 className={styles.heading4}>{children}</h4>
            ),
            blockquote: ({ children }) => (
              <blockquote className={styles.blockquote}>{children}</blockquote>
            ),
            table: ({ children }) => (
              <table className={styles.table}>{children}</table>
            ),
            thead: ({ children }) => (
              <thead className={styles.tableHead}>{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className={styles.tableBody}>{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className={styles.tableRow}>{children}</tr>
            ),
            th: ({ children }) => (
              <th className={styles.tableHeader}>{children}</th>
            ),
            td: ({ children }) => (
              <td className={styles.tableCell}>{children}</td>
            ),
            // Custom React components
            StoreCompact: {
              component: () => <Store compact slug="lifeOS" />,
            },
            PWAGallery: {
              component: () => {
                const images = [
                  { src: "/images/pwa/homePWA.png", alt: "Home screen" },
                  { src: "/images/pwa/atlasPWA.png", alt: "Atlas PWA" },
                  { src: "/images/pwa/bloomPWA.png", alt: "Bloom PWA" },
                  { src: "/images/pwa/peachPWA.png", alt: "Peach PWA" },
                  { src: "/images/pwa/vaultPWA.png", alt: "Vault PWA" },
                ]

                const galleryContainerStyles = usePlatformStyles({
                  display: "flex",
                  flexDirection: "row",
                  flexWrap: "wrap",
                  gap: 16,
                  marginVertical: 20,
                })

                const imageStyles = usePlatformStyles({
                  height: 400,
                  width: "auto",
                  borderRadius: 12,
                })

                return (
                  <Div style={galleryContainerStyles}>
                    {images.map((image, index) => (
                      <Img
                        key={index}
                        showLoading={false}
                        src={image.src}
                        alt={image.alt}
                        width={150}
                        style={imageStyles}
                      />
                    ))}
                  </Div>
                )
              },
            },
          },
        }}
      >
        {processTextWithCitations({
          content,
          webSearchResults,
        })}
      </Markdown>
    </Div>
  )
}

export default MarkdownContent
