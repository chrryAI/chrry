import type React from "react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism"
import Img from "./Img"
import styles from "./MarkdownContent.module.scss"
import type { codeBlock } from "./MarkdownContent.shared"
import { Div } from "./platform"
import Store from "./Store"
import TextWithLinks from "./TextWithLinks"
import { BrowserInstance, checkIsExtension } from "./utils"

// We need to define CodeBlock here or import it if it's exported
// Re-implementing simplified version for the overrides function context
// Ideally this should be a shared component
const CodeBlock: React.FC<codeBlock> = ({ language, children, className }) => {
  // Logic inside overrides renders components, so they can use hooks if they are rendered
  // But overrides definition itself is just a function returning object
  // CodeBlock needs to be a valid React component
  return (
    <div className={styles.codeBlockContainer}>
      <div className={styles.codeBlockHeader}>
        <span className={styles.language}>{language}</span>
        {/* We can't use hooks here easily if we want this pure, but the component is rendered by Markdown */}
        {/* For now, let's keep the structure but simplify the props passed */}
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

export interface MarkdownOverridesProps {
  addHapticFeedback: () => void
  galleryContainerStyles: any
  imageStyles: any
  t?: (key: string) => string
  CodeBlockComponent?: React.FC<any>
}

export const createOverrides = ({
  addHapticFeedback,
  galleryContainerStyles,
  imageStyles,
  t, // Passed from hook
  CodeBlockComponent, // Allow injection
}: MarkdownOverridesProps) => {
  const FinalCodeBlock = CodeBlockComponent || CodeBlock

  const renderParagraph = (children: React.ReactNode) => (
    <Div
      data-testid="markdown-paragraph"
      className={`${styles.paragraph} ${styles.paragraphDiv}`}
    >
      {children}
    </Div>
  )

  return {
    code({ node, inline, className, children, ...props }: any) {
      // Match both 'language-*' and 'lang-*' formats
      const match = /(?:language|lang)-(\w+)/.exec(className || "")
      let lang = match ? match[1] : ""

      // Handle 'json' as a special case
      if (lang === "json" || (!lang && /^[\s]*[{[]/.test(String(children)))) {
        try {
          // Check if it's valid JSON
          JSON.parse(String(children))
          lang = "json"
        } catch (_e) {
          // Not valid JSON, use detected language or default
        }
      }

      return !inline && (match || lang === "json") ? (
        <FinalCodeBlock language={lang || "text"} className={className}>
          {String(children).replace(/\n$/, "")}
        </FinalCodeBlock>
      ) : (
        <code className={`${styles.inlineCode} ${className || ""}`} {...props}>
          {children}
        </code>
      )
    },
    // Customize other markdown elements as needed
    p: ({ _node, children }: any) => renderParagraph(children),
    div: ({ _node, children }: any) => renderParagraph(children),

    a: ({ href, children }: any) =>
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
    img: ({ src, alt, width, height }: any) =>
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
        <img src={src} alt={alt} width={width || "100%"} height={height} />
      ),
    ul: ({ children }: any) => <ul className={styles.list}>{children}</ul>,
    ol: ({ children }: any) => (
      <ol className={styles.orderedList}>{children}</ol>
    ),
    li: ({ children }: any) => {
      return <li className={styles.listItem}>{children}</li>
    },
    h1: ({ children }: any) => <h1 className={styles.heading1}>{children}</h1>,
    h2: ({ children }: any) => <h2 className={styles.heading2}>{children}</h2>,
    h3: ({ children }: any) => <h3 className={styles.heading3}>{children}</h3>,
    h4: ({ children }: any) => <h4 className={styles.heading4}>{children}</h4>,
    blockquote: ({ children }: any) => (
      <blockquote className={styles.blockquote}>{children}</blockquote>
    ),
    table: ({ children }: any) => (
      <table className={styles.table}>{children}</table>
    ),
    thead: ({ children }: any) => (
      <thead className={styles.tableHead}>{children}</thead>
    ),
    tbody: ({ children }: any) => (
      <tbody className={styles.tableBody}>{children}</tbody>
    ),
    tr: ({ children }: any) => <tr className={styles.tableRow}>{children}</tr>,
    th: ({ children }: any) => (
      <th className={styles.tableHeader}>{children}</th>
    ),
    td: ({ children }: any) => <td className={styles.tableCell}>{children}</td>,
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
            {images.map((image) => (
              <Img
                key={image.src}
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
  }
}
