/**
 * Platform Primitives - Simple cross-platform components
 *
 * On web: render as HTML elements with className support
 * On native: render as React Native components with className auto-converted to styles
 */

import React, { forwardRef, CSSProperties, ChangeEvent } from "react"
import { usePlatform } from "./PlatformProvider"
import { mergeStyles } from "./styleMapper"
import { parseClassName } from "../utils/parseClassName"
import { extractUtilityClassNames } from "../utils/extractUtilityClassNames"
import { sanitizeStyleForDOM } from "../utils/sanitizeStyleForDOM"

// ============================================
// TYPE DEFINITIONS
// ============================================

interface BaseProps {
  className?: string
  style?: CSSProperties | Record<string, unknown>
  children?: React.ReactNode
}

export interface BoxProps extends BaseProps {
  as?:
    | "div"
    | "section"
    | "article"
    | "header"
    | "footer"
    | "nav"
    | "main"
    | "aside"
  id?: string
  onClick?: () => void
  handlers?: any
  state?: any
}

export interface TextProps extends BaseProps {
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  onClick?: () => void
  title?: string
  handlers?: any
  state?: any
}

export interface ButtonProps extends BaseProps {
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  disabled?: boolean
  title?: string
  "aria-label"?: string
  "aria-disabled"?: boolean
}

export interface LinkProps extends BaseProps {
  href?: string
  target?: "_blank" | "_self" | "_parent" | "_top"
  rel?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  title?: string
}

export interface InputProps extends BaseProps {
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search"
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onChangeText?: (text: string) => void
  name?: string
  id?: string
  title?: string
  required?: boolean
  disabled?: boolean
}

export interface ScrollViewProps extends BaseProps {
  horizontal?: boolean
  showsHorizontalScrollIndicator?: boolean
  showsVerticalScrollIndicator?: boolean
}

export interface ImageProps extends BaseProps {
  src?: string
  source?: { uri: string } | number
  alt?: string
  width?: number | string
  height?: number | string
}

// ============================================
// WEB COMPONENTS
// ============================================

export const Box = forwardRef<HTMLDivElement, BoxProps>(
  (
    {
      as: Component = "div",
      className,
      style,
      onClick,
      children,
      handlers,
      state,
      ...props
    },
    ref,
  ) => {
    const { styleRegistry } = usePlatform()

    // Always convert className to styles if registry has mappings (Expo Web style)
    const hasStyleMappings = styleRegistry && styleRegistry.size > 0

    if (className && hasStyleMappings) {
      console.log(
        `[Box] Converting className: "${className}", registry size: ${styleRegistry.size}`,
      )
    }

    const finalStyle = hasStyleMappings
      ? (mergeStyles(className, style as any, styleRegistry) as CSSProperties)
      : (style as CSSProperties)

    // Sanitize style to remove non-DOM properties (like className)
    const sanitizedStyle = sanitizeStyleForDOM(finalStyle)

    return (
      <Component
        // @ts-ignore - ref type varies based on 'as' prop
        ref={ref}
        className={hasStyleMappings ? undefined : className}
        style={sanitizedStyle}
        onClick={onClick}
        {...props}
      >
        {children}
      </Component>
    )
  },
)
Box.displayName = "Box"

export const Text = forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = "span",
      className,
      style,
      onClick,
      children,
      handlers,
      state,
      ...props
    },
    ref,
  ) => {
    const { styleRegistry } = usePlatform()

    // Extract utility classNames from style objects
    const utilityClassNames = extractUtilityClassNames(style)

    // Combine explicit className with auto-detected utility classNames
    const finalClassName = [className, utilityClassNames]
      .filter(Boolean)
      .join(" ")

    // Always convert className to styles if registry has mappings (Expo Web style)
    const hasStyleMappings = styleRegistry && styleRegistry.size > 0
    const finalStyle = hasStyleMappings
      ? (mergeStyles(
          finalClassName,
          style as any,
          styleRegistry,
        ) as CSSProperties)
      : (style as CSSProperties)

    // Sanitize style to remove non-DOM properties (like className)
    const sanitizedStyle = sanitizeStyleForDOM(finalStyle)

    return (
      <Component
        // @ts-ignore - ref type varies based on 'as' prop
        ref={ref}
        className={hasStyleMappings ? undefined : finalClassName}
        style={sanitizedStyle}
        onClick={onClick}
        {...props}
      >
        {children}
      </Component>
    )
  },
)
Text.displayName = "Text"

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      style,
      type = "button",
      onClick,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    // Parse className string to get inline styles for utility classes
    const parsedStyles = parseClassName(className)

    // Extract utility classNames from style objects (e.g., utilities.button has className property)
    const utilityClassNames = extractUtilityClassNames(style)

    // Combine explicit className with auto-detected utility classNames
    const finalClassName = [className, utilityClassNames]
      .filter(Boolean)
      .join(" ")

    // Merge parsed styles with explicit style prop
    const mergedStyles = { ...parsedStyles, ...style }

    // Sanitize style to remove non-DOM properties (like className)
    const sanitizedStyle = sanitizeStyleForDOM(mergedStyles)

    return (
      <button
        ref={ref}
        type={type}
        className={finalClassName}
        style={sanitizedStyle}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    )
  },
)
Button.displayName = "Button"

export const Link = forwardRef<HTMLAnchorElement, LinkProps>(
  (
    { href, target, rel, className, style, onClick, children, ...props },
    ref,
  ) => {
    // Parse className string to get inline styles for utility classes
    const parsedStyles = parseClassName(className)

    // Extract utility classNames from style objects (e.g., utilities.link has className property)
    const utilityClassNames = extractUtilityClassNames(style)

    // Combine explicit className with auto-detected utility classNames
    const finalClassName = [className, utilityClassNames]
      .filter(Boolean)
      .join(" ")

    // Merge parsed styles with explicit style prop
    const mergedStyles = { ...parsedStyles, ...style }

    // Sanitize style to remove non-DOM properties (like className)
    const sanitizedStyle = sanitizeStyleForDOM(mergedStyles)

    return (
      <a
        ref={ref}
        href={href}
        target={target}
        rel={rel}
        className={finalClassName}
        style={sanitizedStyle}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    )
  },
)
Link.displayName = "Link"

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      className,
      style,
      placeholder,
      value,
      onChange,
      onChangeText,
      name,
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onChangeText?.(e.target.value)
    }

    return (
      <input
        ref={ref}
        type={type}
        className={className}
        style={style}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        name={name}
        required={required}
        disabled={disabled}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export const ScrollView = forwardRef<HTMLDivElement, ScrollViewProps>(
  (
    {
      className,
      style,
      children,
      horizontal,
      showsHorizontalScrollIndicator,
      showsVerticalScrollIndicator,
      ...props
    },
    ref,
  ) => {
    const scrollStyle: CSSProperties = {
      overflow: "auto",
      ...(horizontal && {
        overflowX: "auto",
        overflowY: "hidden",
        display: "flex",
        flexDirection: "row",
      }),
      ...(showsHorizontalScrollIndicator === false && {
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }),
      ...(showsVerticalScrollIndicator === false && {
        scrollbarWidth: "none",
        msOverflowStyle: "none",
      }),
      ...(style as CSSProperties),
    }

    // Add webkit scrollbar hiding via className
    const hideScrollbarClass =
      showsHorizontalScrollIndicator === false ||
      showsVerticalScrollIndicator === false
        ? "hide-scrollbar"
        : ""

    return (
      <>
        {(showsHorizontalScrollIndicator === false ||
          showsVerticalScrollIndicator === false) && (
          <style>
            {`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}
          </style>
        )}
        <div
          ref={ref}
          className={`${className || ""} ${hideScrollbarClass}`.trim()}
          style={scrollStyle}
          {...props}
        >
          {children}
        </div>
      </>
    )
  },
)
ScrollView.displayName = "ScrollView"

export const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ src, source, alt, className, style, width, height, ...props }, ref) => {
    const imageSrc =
      src ||
      (source && typeof source === "object" && "uri" in source
        ? source.uri
        : undefined)

    return (
      <img
        ref={ref}
        src={imageSrc}
        alt={alt}
        className={className}
        style={style}
        width={width}
        height={height}
        {...props}
      />
    )
  },
)
Image.displayName = "Image"

// ============================================
// SEMANTIC ALIASES
// ============================================

export const Div = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box ref={ref} as="div" {...props} />
))
Div.displayName = "Div"

export const Section = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box ref={ref} as="section" {...props} />
))
Section.displayName = "Section"

export const Article = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box ref={ref} as="article" {...props} />
))
Article.displayName = "Article"

export const Header = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box ref={ref} as="header" {...props} />
))
Header.displayName = "Header"

export const Footer = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box ref={ref} as="footer" {...props} />
))
Footer.displayName = "Footer"

export const Nav = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box ref={ref} as="nav" {...props} />
))
Nav.displayName = "Nav"

export const Main = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box ref={ref} as="main" {...props} />
))
Main.displayName = "Main"

export const Aside = forwardRef<HTMLDivElement, BoxProps>((props, ref) => (
  <Box ref={ref} as="aside" {...props} />
))
Aside.displayName = "Aside"

export const Span = forwardRef<HTMLElement, TextProps>((props, ref) => (
  <Text ref={ref} as="span" {...props} />
))
Span.displayName = "Span"

export const P = forwardRef<HTMLParagraphElement, TextProps>((props, ref) => (
  <Text ref={ref} as="p" {...props} />
))
P.displayName = "P"

export const H1 = forwardRef<HTMLHeadingElement, TextProps>((props, ref) => (
  <Text ref={ref} as="h1" {...props} />
))
H1.displayName = "H1"

export const H2 = forwardRef<HTMLHeadingElement, TextProps>((props, ref) => (
  <Text ref={ref} as="h2" {...props} />
))
H2.displayName = "H2"

export const H3 = forwardRef<HTMLHeadingElement, TextProps>((props, ref) => (
  <Text ref={ref} as="h3" {...props} />
))
H3.displayName = "H3"

export const H4 = forwardRef<HTMLHeadingElement, TextProps>((props, ref) => (
  <Text ref={ref} as="h4" {...props} />
))
H4.displayName = "H4"

export const H5 = forwardRef<HTMLHeadingElement, TextProps>((props, ref) => (
  <Text ref={ref} as="h5" {...props} />
))
H5.displayName = "H5"

export const H6 = forwardRef<HTMLHeadingElement, TextProps>((props, ref) => (
  <Text ref={ref} as="h6" {...props} />
))
H6.displayName = "H6"

export const Strong = forwardRef<HTMLElement, TextProps>((props, ref) => (
  <Text
    ref={ref}
    as="span"
    style={{ fontWeight: "bold", ...props.style }}
    {...props}
  />
))
Strong.displayName = "Strong"

export const Em = forwardRef<HTMLElement, TextProps>((props, ref) => (
  <Text
    ref={ref}
    as="span"
    style={{ fontStyle: "italic", ...props.style }}
    {...props}
  />
))
Em.displayName = "Em"

export const Small = forwardRef<HTMLElement, TextProps>((props, ref) => (
  <Text
    ref={ref}
    as="span"
    style={{ fontSize: "0.875em", ...props.style }}
    {...props}
  />
))
Small.displayName = "Small"

export const Code = forwardRef<HTMLElement, TextProps>((props, ref) => (
  <Text
    ref={ref}
    as="span"
    style={{ fontFamily: "monospace", ...props.style }}
    {...props}
  />
))
Code.displayName = "Code"

export const Label = forwardRef<
  HTMLLabelElement,
  TextProps & { htmlFor?: string }
>(({ htmlFor, ...props }, ref) => (
  <label
    ref={ref}
    htmlFor={htmlFor}
    className={props.className}
    style={props.style as CSSProperties}
  >
    {props.children}
  </label>
))
Label.displayName = "Label"

export const A = Link
A.displayName = "A"
