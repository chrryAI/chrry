"use client"

/**
 * Platform Primitives - Simple cross-platform components
 *
 * On web: render as HTML elements with className support
 * On native: render as React Native components with className auto-converted to styles
 */

import type React from "react"
import { type ChangeEvent, type CSSProperties, forwardRef } from "react"
import { extractUtilityClassNames } from "../utils/extractUtilityClassNames"
import console from "../utils/log"
import { parseClassName } from "../utils/parseClassName"
import { sanitizeStyleForDOM } from "../utils/sanitizeStyleForDOM"
import { usePlatform } from "./PlatformProvider"
import { mergeStyles } from "./styleMapper"

// ============================================
// TYPE DEFINITIONS
// ============================================

interface BaseProps {
  className?: string
  style?: CSSProperties | Record<string, unknown>
  children?: React.ReactNode
}

export interface BoxProps
  extends BaseProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, keyof BaseProps | "onClick"> {
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
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void
  handlers?: any
  state?: any
}

export interface TextProps extends BaseProps {
  as?: "span" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
  onClick?: (e: React.MouseEvent<HTMLSpanElement>) => void
  title?: string
  handlers?: any
  state?: any
}

export interface ButtonProps extends BaseProps {
  type?: "button" | "submit" | "reset"
  onClick?: (e?: any) => void
  disabled?: boolean
  title?: string
  id?: string
  role?: string
  "aria-label"?: string
  "aria-checked"?: boolean
  "aria-pressed"?: boolean
  "aria-disabled"?: boolean
  suppressHydrationWarning?: boolean
  // Pointer events for cross-platform touch/pointer interactions
  onPointerDown?: (e: any) => void
  onPointerUp?: (e: any) => void
  onPointerLeave?: (e: any) => void
}

export interface LinkProps extends BaseProps {
  href?: string
  target?: "_blank" | "_self" | "_parent" | "_top"
  rel?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  title?: string
}

export interface InputProps extends BaseProps {
  type?:
    | "text"
    | "email"
    | "password"
    | "number"
    | "tel"
    | "url"
    | "search"
    | "hidden"
    | "range"
    | "checkbox"
    | "date"
    | "datetime-local"
    | "time"

  placeholder?: string
  value?: string
  checked?: boolean
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void
  onChangeText?: (text: string) => void
  name?: string
  id?: string
  title?: string
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling"
  error?: boolean
  required?: boolean
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
  maxLength?: number
  autoComplete?: string
  autoFocus?: boolean
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void
}

export interface TextAreaProps extends BaseProps {
  placeholder?: string
  value?: string
  onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void
  onChangeText?: (text: string) => void
  name?: string
  id?: string
  title?: string
  required?: boolean
  disabled?: boolean
  rows?: number
  maxLength?: number
  autoFocus?: boolean
  "data-testid"?: string
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling"
  error?: boolean
  // React Native-specific props (ignored on web, but accepted for cross-platform compatibility)
  onSubmitEditing?: (e: any) => void
  onKeyPress?: (e: any) => void
  onPaste?: (e: any) => void
  blurOnSubmit?: boolean
  multiline?: boolean
  returnKeyType?: string
}

export interface SelectProps extends BaseProps {
  value?: string
  defaultValue?: string
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void
  onValueChange?: (value: string) => void
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  "aria-label"?: string
  "aria-describedby"?: string
  "aria-invalid"?: boolean | "false" | "true" | "grammar" | "spelling"
  error?: boolean
  options?: { value: string; label: string }[]
  children?: React.ReactNode
}

export interface FormProps extends BaseProps {
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void
  id?: string
  "data-testid"?: string
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
  onLoad?: () => void
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
        ref={ref as any}
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
        ref={ref as any}
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
      suppressHydrationWarning,
      children,
      role,
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
        role={role}
        ref={ref}
        type={type}
        className={finalClassName}
        style={sanitizedStyle}
        onClick={onClick}
        disabled={disabled}
        suppressHydrationWarning={suppressHydrationWarning}
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

export const Input = forwardRef<
  HTMLInputElement,
  InputProps & { "data-testid"?: string; dataTestId?: string }
>(
  (
    {
      type = "text",
      className,
      style,
      placeholder,
      value,
      checked,
      onChange,
      onChangeText,
      name,
      required,
      disabled,
      dataTestId,
      error,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
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
        checked={checked}
        onChange={handleChange}
        name={name}
        required={required}
        disabled={disabled}
        data-testid={props["data-testid"] || dataTestId}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={ariaDescribedBy}
        data-error={error ? "true" : undefined}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      className,
      style,
      placeholder,
      value,
      onChange,
      onChangeText,
      name,
      id,
      title,
      required,
      disabled,
      rows = 4,
      maxLength,
      autoFocus,
      error,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
      // React Native-specific props - extract but don't pass to textarea
      onSubmitEditing,
      onKeyPress,
      onPaste,
      blurOnSubmit,
      multiline,
      returnKeyType,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e)
      onChangeText?.(e.target.value)
    }

    return (
      <textarea
        ref={ref}
        className={className}
        style={style as CSSProperties}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        name={name}
        id={id}
        title={title}
        required={required}
        disabled={disabled}
        rows={rows}
        maxLength={maxLength}
        onKeyPress={onKeyPress}
        onPaste={onPaste}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={ariaDescribedBy}
        data-error={error ? "true" : undefined}
        {...props}
      />
    )
  },
)
TextArea.displayName = "TextArea"

export const Select = forwardRef<
  HTMLSelectElement,
  SelectProps & { dataTestId?: string }
>(
  (
    {
      className,
      style,
      value,
      defaultValue,
      onChange,
      onValueChange,
      name,
      id,
      disabled,
      required,
      options,
      children,
      dataTestId,
      error,
      "aria-invalid": ariaInvalid,
      "aria-describedby": ariaDescribedBy,
      ...props
    },
    ref,
  ) => {
    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e)
      onValueChange?.(e.target.value)
    }

    // Filter out React Native-specific event handlers that don't exist on web select
    const { onPressIn, onPressOut, onPress, onLongPress, ...webProps } =
      props as any

    return (
      <select
        ref={ref}
        className={className}
        data-testid={dataTestId}
        style={style as CSSProperties}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        name={name}
        id={id}
        disabled={disabled}
        required={required}
        aria-invalid={error ? true : ariaInvalid}
        aria-describedby={ariaDescribedBy}
        data-error={error ? "true" : undefined}
        {...webProps}
      >
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : children}
      </select>
    )
  },
)
Select.displayName = "Select"

export const Form = forwardRef<HTMLFormElement, FormProps>(
  ({ className, style, onSubmit, children, id, ...props }, ref) => {
    return (
      <form
        ref={ref}
        className={className}
        style={style as CSSProperties}
        onSubmit={onSubmit}
        id={id}
        {...props}
      >
        {children}
      </form>
    )
  },
)
Form.displayName = "Form"

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
>(({ htmlFor, className, style, children, onClick, ...props }, ref) => (
  <label
    ref={ref}
    htmlFor={htmlFor}
    className={className}
    style={style as CSSProperties}
    onKeyDown={onClick as any}
    {...props}
  >
    {children}
  </label>
))
Label.displayName = "Label"

export const A = Link
A.displayName = "A"
