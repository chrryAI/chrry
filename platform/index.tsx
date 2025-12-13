"use client"

/**
 * Platform Abstraction Layer
 *
 * Runtime platform detection and adaptation
 * ONE codebase, ALL platforms!
 *
 * @example
 * import { PlatformProvider, usePlatform, Box, Text } from 'chrry/platform'
 *
 * function App() {
 *   return (
 *     <PlatformProvider>
 *       <MyComponent />
 *     </PlatformProvider>
 *   )
 * }
 *
 * function MyComponent() {
 *   const { isWeb, isNative } = usePlatform()
 *
 *   return (
 *     <Box>
 *       <Text>{isWeb ? 'Running on Web' : 'Running on Native'}</Text>
 *     </Box>
 *   )
 * }
 */

// Provider & Hooks
export {
  PlatformProvider,
  usePlatform,
  withPlatform,
  PlatformSwitch,
  WebOnly,
  NativeOnly,
  IOSOnly,
  AndroidOnly,
  detectPlatform,
  isWeb,
  isNative,
  isIOS,
  isAndroid,
  type PlatformType,
} from "./PlatformProvider"

// Styling Hooks
export {
  usePlatformStyles,
  useAdaptiveStyles,
  useResponsiveStyles,
  mergeStyles,
  conditionalStyle,
  createPlatformStyles,
  type PlatformStyle,
  type PlatformStyles,
} from "./usePlatformStyles"

// Platform-Aware Components
export {
  Box,
  Text,
  Button,
  Link,
  Input,
  TextArea,
  Select,
  Form,
  ScrollView,
  Image,
  // Semantic aliases
  Div,
  Section,
  Article,
  Header,
  Footer,
  Nav,
  Main,
  Aside,
  Span,
  P,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Strong,
  Em,
  Small,
  Code,
  Label,
  A,
  // Types
  type BoxProps,
  type TextProps,
  type ButtonProps,
  type LinkProps,
  type InputProps,
  type TextAreaProps,
  type SelectProps,
  type FormProps,
  type ScrollViewProps,
  type ImageProps,
} from "./PlatformPrimitives"

// Draggable List Component (auto-resolves to .web.tsx or .native.tsx)
export {
  default as DraggableList,
  type DraggableListProps,
  type RenderItemParams,
} from "./DraggableList"

// Video Component (auto-resolves to .web.tsx or .native.tsx)
export { default as Video, type VideoProps } from "./Video"
export { Audio, type AudioProps } from "./Audio"

// FilePicker Component (auto-resolves to .web.tsx or .native.tsx)
export { default as FilePicker, type FilePickerProps } from "./FilePicker"

// High-Performance List Component
export { FlashList, type FlashListProps } from "./FlashList"

// Animation utilities
export * from "./useInView" // Auto-resolves to .web.ts or .native.ts
export { useOnlineStatus } from "./useOnlineStatus" // Auto-resolves to .web.ts or .native.ts
export { MotiView, type MotiViewProps } from "./MotiView" // Auto-resolves to .web.tsx or .native.tsx

export * from "./PlatformProvider"
export * from "./PlatformPrimitives"
export * from "./clsx"
export * from "./styleMapper"
export * from "./storage"
export * from "./useStorage"
export * from "./navigation"
export * from "./cookies"
export const toRem = (value: number): string => `${value / 16}rem`
export { Toast, VexToast } from "./ToastComponent"
export { default as toast } from "./toast"
export { default as useCookieOrLocalStorage } from "../hooks/useCookieOrLocalStorage"

// Client-side router
export {
  ClientRouter,
  Route,
  useRouteParams,
  useIsRouteActive,
  useCurrentRoute,
  type Route as RouteType,
  type ClientRouterProps,
} from "./ClientRouter"

// Re-export theme context for convenience
export {
  ThemeProvider,
  useTheme,
  useThemeColor,
  useResolveColor,
} from "../context/ThemeContext"

// Keep Awake Hook
export { useKeepAwake } from "./KeepAwake"
