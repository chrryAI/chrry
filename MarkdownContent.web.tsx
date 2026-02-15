"use client"
import React, { useEffect, useState, memo } from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import styles from "./MarkdownContent.module.scss"
import toast from "react-hot-toast"
import clx from "clsx"
import { Check, Copy } from "./icons"
import { useAppContext } from "./context/AppContext"
import Img from "./Img"
import { BrowserInstance, checkIsExtension } from "./utils"
import TextWithLinks from "./TextWithLinks"
import Store from "./Store"
import Markdown from "markdown-to-jsx"
import { Div, useTheme } from "./platform"
import { usePlatformStyles } from "./platform/usePlatformStyles"
import {
  MarkdownContentProps,
  CodeBlockProps,
  processTextWithCitations,
} from "./MarkdownContent.shared"

export { processTextWithCitations }
export type { MarkdownContentProps }

const CodeBlock: React.FC<CodeBlockProps> = ({
  language,
  children,
  className,
}) => {
  const [copied, setCopied] = useState(false)
  const { t } = useAppContext()

  // Debug: Check if vscDarkPlus is loaded
  console.log("🎨 Prism theme loaded:", !!vscDarkPlus, "Language:", language)

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
    const { addHapticFeedback } = useTheme()

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

    useEffect(() => {
      setIsMounted(true)
    }, [])

    if (!isMounted) return null

    // Process content with citations if webSearchResults are available
    const processedContent =
      webSearchResults && webSearchResults.length > 0 ? content : content

    return (
      <Div
        style={style}
        data-testid={dataTestId}
        className={`${styles.markdownContent} ${className || ""}`}
      >
        <Markdown
          options={{
            overrides: {
              code({ node, inline, className, children, ...props }: any) {
                console.log("🔍 Code detected:", { inline, className })
                // Match both 'language-*' and 'lang-*' formats
                const match = /(?:language|lang)-(\w+)/.exec(className || "")
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
                <blockquote className={styles.blockquote}>
                  {children}
                </blockquote>
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
  },
)

export default MarkdownContent
