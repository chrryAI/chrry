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

export { Audio, type AudioProps } from "./Audio"
export * from "./clsx"
export * from "./cookies"

// Draggable List Component (auto-resolves to .web.tsx or .native.tsx)
export {
  type DraggableListProps,
  default as DraggableList,
  type RenderItemParams,
} from "./DraggableList"
// FilePicker Component (auto-resolves to .web.tsx or .native.tsx)
export { default as FilePicker, type FilePickerProps } from "./FilePicker"
// High-Performance List Component
export { FlashList, type FlashListProps } from "./FlashList"
export { MotiView, type MotiViewProps } from "./MotiView" // Auto-resolves to .web.tsx or .native.tsx
export * from "./navigation"
export * from "./PlatformPrimitives"
// Platform-Aware Components
export {
  A,
  Article,
  Aside,
  Box,
  // Types
  type BoxProps,
  Button,
  type ButtonProps,
  Code,
  // Semantic aliases
  Div,
  Em,
  Footer,
  Form,
  type FormProps,
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Header,
  Image,
  type ImageProps,
  Input,
  type InputProps,
  Label,
  Link,
  type LinkProps,
  Main,
  Nav,
  P,
  ScrollView,
  type ScrollViewProps,
  Section,
  Select,
  type SelectProps,
  Small,
  Span,
  Strong,
  Text,
  TextArea,
  type TextAreaProps,
  type TextProps,
} from "./PlatformPrimitives"
export * from "./PlatformProvider"
// Provider & Hooks
export {
  AndroidOnly,
  detectPlatform,
  IOSOnly,
  isAndroid,
  isIOS,
  isNative,
  isWeb,
  NativeOnly,
  PlatformProvider,
  PlatformSwitch,
  type PlatformType,
  usePlatform,
  WebOnly,
  withPlatform,
} from "./PlatformProvider"
export * from "./storage"
export * from "./styleMapper"
// Animation utilities
export * from "./useInView" // Auto-resolves to .web.ts or .native.ts
export { useOnlineStatus } from "./useOnlineStatus" // Auto-resolves to .web.ts or .native.ts
// Styling Hooks
export {
  conditionalStyle,
  createPlatformStyles,
  mergeStyles,
  type PlatformStyle,
  type PlatformStyles,
  useAdaptiveStyles,
  usePlatformStyles,
  useResponsiveStyles,
} from "./usePlatformStyles"
export * from "./useStorage"
// Video Component (auto-resolves to .web.tsx or .native.tsx)
export { default as Video, type VideoProps } from "./Video"
export const toRem = (value: number): string => `${value / 16}rem`

// Re-export theme context for convenience
export {
  ThemeProvider,
  useResolveColor,
  useTheme,
  useThemeColor,
} from "../context/ThemeContext"
export { default as useCookieOrLocalStorage } from "../hooks/useCookieOrLocalStorage"
// Client-side router
export {
  ClientRouter,
  type ClientRouterProps,
  Route,
  type Route as RouteType,
  useCurrentRoute,
  useIsRouteActive,
  useRouteParams,
} from "./ClientRouter"
// Keep Awake Hook
export { useKeepAwake } from "./KeepAwake"
export { Toast, VexToast } from "./ToastComponent"
export { default as toast } from "./toast"
