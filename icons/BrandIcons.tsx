/**
 * Brand Icons Wrapper
 * Wraps react-icons to avoid React type conflicts
 * Uses type assertions to work around React 18/19 type mismatch
 */

import React from "react"
import {
  FaGoogle,
  FaApple,
  FaChrome,
  FaFirefox,
  FaAndroid,
} from "react-icons/fa"
import { RiNextjsFill } from "react-icons/ri"
import { BiLogoPostgresql } from "react-icons/bi"
import { SiCssmodules, SiJest, SiDrizzle, SiTypescript } from "react-icons/si"
import { MdAddToHomeScreen } from "react-icons/md"

// Type assertion helper to work around React version conflicts
const Icon = (Component: any) =>
  Component as React.FC<{
    className?: string
    style?: React.CSSProperties
    size?: number
  }>

// Export wrapped icons
export const GoogleIcon = Icon(FaGoogle)
export const AppleIcon = Icon(FaApple)
export const ChromeIcon = Icon(FaChrome)
export const FirefoxIcon = Icon(FaFirefox)
export const AndroidIcon = Icon(FaAndroid)
export const NextJsIcon = Icon(RiNextjsFill)
export const PostgresIcon = Icon(BiLogoPostgresql)
export const CssModulesIcon = Icon(SiCssmodules)
export const JestIcon = Icon(SiJest)
export const DrizzleIcon = Icon(SiDrizzle)
export const TypeScriptIcon = Icon(SiTypescript)
export const AddToHomeScreenIcon = Icon(MdAddToHomeScreen)
