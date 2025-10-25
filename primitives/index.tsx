/**
 * HTML-like Primitives for Tamagui
 *
 * These components match HTML semantics but work cross-platform
 * Use them as drop-in replacements for HTML elements
 *
 * Example:
 *   <div className={styles.container}> → <Div {...styles.container}>
 *   <span>Text</span> → <Span>Text</Span>
 *   <h1>Title</h1> → <H1>Title</H1>
 */

import { styled, Stack, Text, GetProps } from "tamagui"
import { Platform } from "react-native"

// ============================================
// LAYOUT PRIMITIVES
// ============================================

/**
 * <Div> - Block-level container (like <div>)
 * Default: display: flex, flex-direction: column
 */
export const Div = styled(Stack, {
  name: "Div",
  flexDirection: "column",
  display: "flex",
})

/**
 * <Span> - Inline container (like <span>)
 * Default: display: inline-flex, flex-direction: row
 */
export const Span = styled(Stack, {
  name: "Span",
  flexDirection: "row",
  display: "inline-flex",
})

/**
 * <Section> - Semantic section (like <section>)
 */
export const Section = styled(Stack, {
  name: "Section",
  flexDirection: "column",
  tag: "section",
})

/**
 * <Article> - Semantic article (like <article>)
 */
export const Article = styled(Stack, {
  name: "Article",
  flexDirection: "column",
  tag: "article",
})

/**
 * <Header> - Semantic header (like <header>)
 */
export const Header = styled(Stack, {
  name: "Header",
  flexDirection: "column",
  tag: "header",
})

/**
 * <Footer> - Semantic footer (like <footer>)
 */
export const Footer = styled(Stack, {
  name: "Footer",
  flexDirection: "column",
  tag: "footer",
})

/**
 * <Nav> - Navigation container (like <nav>)
 */
export const Nav = styled(Stack, {
  name: "Nav",
  flexDirection: "row",
  tag: "nav",
})

/**
 * <Main> - Main content (like <main>)
 */
export const Main = styled(Stack, {
  name: "Main",
  flexDirection: "column",
  flex: 1,
  tag: "main",
})

/**
 * <Aside> - Sidebar content (like <aside>)
 */
export const Aside = styled(Stack, {
  name: "Aside",
  flexDirection: "column",
  tag: "aside",
})

// ============================================
// TEXT PRIMITIVES
// ============================================

/**
 * <H1> - Heading level 1
 */
export const H1 = styled(Text, {
  name: "H1",
  tag: "h1",
  fontSize: "$9",
  fontWeight: "bold",
  lineHeight: "$9",
  color: "$color",
})

/**
 * <H2> - Heading level 2
 */
export const H2 = styled(Text, {
  name: "H2",
  tag: "h2",
  fontSize: "$8",
  fontWeight: "bold",
  lineHeight: "$8",
  color: "$color",
})

/**
 * <H3> - Heading level 3
 */
export const H3 = styled(Text, {
  name: "H3",
  tag: "h3",
  fontSize: "$7",
  fontWeight: "600",
  lineHeight: "$7",
  color: "$color",
})

/**
 * <H4> - Heading level 4
 */
export const H4 = styled(Text, {
  name: "H4",
  tag: "h4",
  fontSize: "$6",
  fontWeight: "600",
  lineHeight: "$6",
  color: "$color",
})

/**
 * <H5> - Heading level 5
 */
export const H5 = styled(Text, {
  name: "H5",
  tag: "h5",
  fontSize: "$5",
  fontWeight: "600",
  lineHeight: "$5",
  color: "$color",
})

/**
 * <H6> - Heading level 6
 */
export const H6 = styled(Text, {
  name: "H6",
  tag: "h6",
  fontSize: "$4",
  fontWeight: "600",
  lineHeight: "$4",
  color: "$color",
})

/**
 * <P> - Paragraph
 */
export const P = styled(Text, {
  name: "P",
  tag: "p",
  fontSize: "$4",
  lineHeight: "$6",
  color: "$color",
  marginBottom: "$3",
})

/**
 * <Strong> - Bold text
 */
export const Strong = styled(Text, {
  name: "Strong",
  tag: "strong",
  fontWeight: "bold",
})

/**
 * <Em> - Italic text
 */
export const Em = styled(Text, {
  name: "Em",
  tag: "em",
  fontStyle: "italic",
})

/**
 * <Small> - Small text
 */
export const Small = styled(Text, {
  name: "Small",
  tag: "small",
  fontSize: "$2",
  color: "$placeholderColor",
})

/**
 * <Code> - Inline code
 */
export const Code = styled(Text, {
  name: "Code",
  tag: "code",
  fontFamily: Platform.OS === "web" ? "monospace" : "Courier",
  fontSize: "$3",
  backgroundColor: "$backgroundHover",
  paddingHorizontal: "$2",
  paddingVertical: "$1",
  borderRadius: "$2",
})

/**
 * <Pre> - Preformatted text block
 */
export const Pre = styled(Stack, {
  name: "Pre",
  tag: "pre",
  //   fontFamily: Platform.OS === 'web' ? 'monospace' : 'Courier',
  //   fontSize: "$3",
  backgroundColor: "$backgroundHover",
  padding: "$3",
  borderRadius: "$3",
  overflow: "scroll",
})

/**
 * <Label> - Form label
 */
export const Label = styled(Text, {
  name: "Label",
  tag: "label",
  fontSize: "$3",
  fontWeight: "500",
  color: "$color",
  marginBottom: "$2",
})

// ============================================
// LIST PRIMITIVES
// ============================================

/**
 * <Ul> - Unordered list
 */
export const Ul = styled(Stack, {
  name: "Ul",
  tag: "ul",
  flexDirection: "column",
  gap: "$2",
})

/**
 * <Ol> - Ordered list
 */
export const Ol = styled(Stack, {
  name: "Ol",
  tag: "ol",
  flexDirection: "column",
  gap: "$2",
})

/**
 * <Li> - List item
 */
export const Li = styled(Stack, {
  name: "Li",
  tag: "li",
  flexDirection: "row",
  alignItems: "flex-start",
})

// ============================================
// INTERACTIVE PRIMITIVES
// ============================================

/**
 * <A> - Link/Anchor
 */
export const A = styled(Text, {
  name: "A",
  tag: "a",
  color: "$blue",
  textDecorationLine: "underline",
  cursor: "pointer",

  hoverStyle: {
    color: "$purple",
  },

  pressStyle: {
    opacity: 0.7,
  },
})

/**
 * <Button> - Button element
 */
export const Button = styled(Stack, {
  name: "Button",
  tag: "button",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingHorizontal: "$4",
  paddingVertical: "$3",
  backgroundColor: "$blue",
  borderRadius: "$3",
  cursor: "pointer",

  hoverStyle: {
    backgroundColor: "$purple",
  },

  pressStyle: {
    scale: 0.98,
    opacity: 0.9,
  },
})

// ============================================
// UTILITY PRIMITIVES
// ============================================

/**
 * <Hr> - Horizontal rule
 */
export const Hr = styled(Stack, {
  name: "Hr",
  tag: "hr",
  height: 1,
  width: "100%",
  backgroundColor: "$borderColor",
  marginVertical: "$4",
})

/**
 * <Br> - Line break (spacer)
 */
export const Br = styled(Stack, {
  name: "Br",
  height: "$4",
  width: "100%",
})

// ============================================
// TYPE EXPORTS
// ============================================

export type DivProps = GetProps<typeof Div>
export type SpanProps = GetProps<typeof Span>
export type H1Props = GetProps<typeof H1>
export type H2Props = GetProps<typeof H2>
export type H3Props = GetProps<typeof H3>
export type H4Props = GetProps<typeof H4>
export type H5Props = GetProps<typeof H5>
export type H6Props = GetProps<typeof H6>
export type PProps = GetProps<typeof P>
export type StrongProps = GetProps<typeof Strong>
export type EmProps = GetProps<typeof Em>
export type SmallProps = GetProps<typeof Small>
export type CodeProps = GetProps<typeof Code>
export type PreProps = GetProps<typeof Pre>
export type LabelProps = GetProps<typeof Label>
export type UlProps = GetProps<typeof Ul>
export type OlProps = GetProps<typeof Ol>
export type LiProps = GetProps<typeof Li>
export type AProps = GetProps<typeof A>
export type ButtonProps = GetProps<typeof Button>
export type HrProps = GetProps<typeof Hr>
export type BrProps = GetProps<typeof Br>
