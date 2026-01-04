/**
 * Platform Primitives - Native Implementation
 *
 * Renders as React Native components with className support via styleMapper
 */

import React, { forwardRef } from "react"
import {
  View,
  Text as RNText,
  TouchableOpacity,
  TextInput,
  ScrollView as RNScrollView,
  Image as RNImage,
  ViewStyle,
  TextStyle,
  ImageStyle,
  Pressable,
} from "react-native"
import { usePlatform } from "./PlatformProvider"
import { mergeStyles } from "./styleMapper"

// ============================================
// TYPE DEFINITIONS (Copied from web version for consistency)
// ============================================

interface BaseProps {
  className?: string
  style?: any
  children?: React.ReactNode
}

export interface BoxProps extends BaseProps {
  as?: any
  id?: string
  onClick?: () => void
  handlers?: any
  state?: any
  [key: string]: any
}

export interface TextProps extends BaseProps {
  as?: any
  onClick?: () => void
  title?: string
  handlers?: any
  state?: any
  [key: string]: any
}

export interface ButtonProps extends BaseProps {
  type?: "button" | "submit" | "reset"
  onClick?: () => void
  disabled?: boolean
  title?: string
  id?: string
  "aria-label"?: string
  "aria-disabled"?: boolean
  onPointerDown?: (e: any) => void
  onPointerUp?: (e: any) => void
  onPointerLeave?: (e: any) => void
  [key: string]: any
}

export interface LinkProps extends BaseProps {
  href?: string
  target?: string
  rel?: string
  onClick?: () => void
  title?: string
  [key: string]: any
}

export interface InputProps extends BaseProps {
  type?: string
  placeholder?: string
  value?: string
  checked?: boolean
  onChange?: (e: any) => void
  onChangeText?: (text: string) => void
  name?: string
  id?: string
  title?: string
  required?: boolean
  disabled?: boolean
  min?: string | number
  max?: string | number
  step?: string | number
  maxLength?: number
  autoComplete?: string
  autoFocus?: boolean
  [key: string]: any
}

export interface TextAreaProps extends BaseProps {
  placeholder?: string
  value?: string
  onChange?: (e: any) => void
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
  onSubmitEditing?: (e: any) => void
  onKeyPress?: (e: any) => void
  onPaste?: (e: any) => void
  blurOnSubmit?: boolean
  multiline?: boolean
  returnKeyType?: any
  [key: string]: any
}

export interface SelectProps extends BaseProps {
  value?: string
  defaultValue?: string
  onChange?: (e: any) => void
  onValueChange?: (value: string) => void
  name?: string
  id?: string
  disabled?: boolean
  required?: boolean
  options?: { value: string; label: string }[]
  children?: React.ReactNode
  [key: string]: any
}

export interface FormProps extends BaseProps {
  onSubmit?: (e: any) => void
  id?: string
  "data-testid"?: string
  [key: string]: any
}

export interface ScrollViewProps extends BaseProps {
  horizontal?: boolean
  showsHorizontalScrollIndicator?: boolean
  showsVerticalScrollIndicator?: boolean
  [key: string]: any
}

export interface ImageProps extends BaseProps {
  src?: string
  source?: { uri: string } | number
  alt?: string
  width?: number | string
  height?: number | string
  [key: string]: any
}

// ============================================
// NATIVE COMPONENTS
// ============================================

export const Box = forwardRef<View, BoxProps>(
  ({ className, style, onClick, children, ...props }, ref) => {
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(className, style, styleRegistry) as ViewStyle

    // Auto-wrap text children in <Text> for React Native
    const wrappedChildren = React.Children.map(children, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        return <RNText>{child}</RNText>
      }
      return child
    })

    if (onClick) {
      return (
        <TouchableOpacity
          ref={ref as any}
          style={finalStyle}
          onPress={onClick}
          activeOpacity={0.8}
          {...props}
        >
          {wrappedChildren}
        </TouchableOpacity>
      )
    }

    return (
      <View ref={ref} style={finalStyle} {...props}>
        {wrappedChildren}
      </View>
    )
  },
)
Box.displayName = "Box"

export const Text = forwardRef<RNText, TextProps>(
  ({ className, style, onClick, children, ...props }, ref) => {
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(className, style, styleRegistry) as TextStyle

    return (
      <RNText ref={ref} style={finalStyle} onPress={onClick} {...props}>
        {children}
      </RNText>
    )
  },
)
Text.displayName = "Text"

export const Button = forwardRef<View, ButtonProps>(
  ({ className, style, onClick, disabled, children, ...props }, ref) => {
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(className, style, styleRegistry) as ViewStyle

    // Auto-wrap text children in <Text> for React Native
    const wrappedChildren = React.Children.map(children, (child) => {
      if (typeof child === "string" || typeof child === "number") {
        return <RNText>{child}</RNText>
      }
      return child
    })

    return (
      <Pressable
        ref={ref}
        style={[finalStyle, disabled && { opacity: 0.5 }]}
        onPress={onClick}
        disabled={disabled}
        {...props}
      >
        {wrappedChildren}
      </Pressable>
    )
  },
)
Button.displayName = "Button"

export const Link = forwardRef<RNText, LinkProps>(
  ({ href, className, style, onClick, children, ...props }, ref) => {
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(className, style, styleRegistry) as TextStyle

    // TODO: Handle href navigation
    return (
      <RNText
        ref={ref}
        style={[finalStyle, { color: "blue", textDecorationLine: "underline" }]}
        onPress={onClick}
        {...props}
      >
        {children}
      </RNText>
    )
  },
)
Link.displayName = "Link"

export const Input = forwardRef<TextInput, InputProps>(
  (
    { className, style, placeholder, value, onChange, onChangeText, ...props },
    ref,
  ) => {
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(className, style, styleRegistry) as TextStyle

    const handleChangeText = (text: string) => {
      onChangeText?.(text)
      onChange?.({ target: { value: text } })
    }

    return (
      <TextInput
        ref={ref}
        style={finalStyle}
        placeholder={placeholder}
        value={value}
        onChangeText={handleChangeText}
        placeholderTextColor="#999"
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export const TextArea = forwardRef<TextInput, TextAreaProps>(
  (
    {
      className,
      style,
      placeholder,
      value,
      onChange,
      onChangeText,
      rows = 4,
      ...props
    },
    ref,
  ) => {
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(className, style, styleRegistry) as TextStyle

    const handleChangeText = (text: string) => {
      onChangeText?.(text)
      onChange?.({ target: { value: text } })
    }

    return (
      <TextInput
        ref={ref}
        style={[finalStyle, { textAlignVertical: "top", height: rows * 20 }]}
        placeholder={placeholder}
        value={value}
        onChangeText={handleChangeText}
        multiline={true}
        numberOfLines={rows}
        placeholderTextColor="#999"
        {...props}
      />
    )
  },
)
TextArea.displayName = "TextArea"

export const Select = forwardRef<View, SelectProps>(
  ({ className, style, options, onValueChange, ...props }, ref) => {
    // Native select implementation is complex (Picker or Modal).
    // For now, render a placeholder or simplified version.
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(className, style, styleRegistry) as ViewStyle

    return (
      <View ref={ref} style={finalStyle} {...props}>
        <RNText>Select not implemented on native yet</RNText>
      </View>
    )
  },
)
Select.displayName = "Select"

export const Form = forwardRef<View, FormProps>(
  ({ className, style, children, ...props }, ref) => {
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(className, style, styleRegistry) as ViewStyle
    return (
      <View ref={ref} style={finalStyle} {...props}>
        {children}
      </View>
    )
  },
)
Form.displayName = "Form"

export const ScrollView = forwardRef<RNScrollView, ScrollViewProps>(
  ({ className, style, children, horizontal, ...props }, ref) => {
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(className, style, styleRegistry) as ViewStyle
    return (
      <RNScrollView
        ref={ref}
        style={finalStyle}
        horizontal={horizontal}
        {...props}
      >
        {children}
      </RNScrollView>
    )
  },
)
ScrollView.displayName = "ScrollView"

export const Image = forwardRef<RNImage, ImageProps>(
  ({ src, source, className, style, width, height, ...props }, ref) => {
    const { styleRegistry } = usePlatform()
    const finalStyle = mergeStyles(
      className,
      style,
      styleRegistry,
    ) as ImageStyle

    const imageSource = source || (src ? { uri: src } : undefined)

    return (
      <RNImage
        ref={ref}
        source={imageSource as any}
        style={[
          finalStyle,
          { width: width as number, height: height as number },
        ]}
        {...props}
      />
    )
  },
)
Image.displayName = "Image"

// ============================================
// SEMANTIC ALIASES
// ============================================

export const Div = Box
export const Section = Box
export const Article = Box
export const Header = Box
export const Footer = Box
export const Nav = Box
export const Main = Box
export const Aside = Box

export const Span = Text
export const P = Text
export const H1 = Text
export const H2 = Text
export const H3 = Text
export const H4 = Text
export const H5 = Text
export const H6 = Text
export const Strong = Text
export const Em = Text
export const Small = Text
export const Code = Text
export const Label = Text
export const A = Link
