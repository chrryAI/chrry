/**
 * Native Icon Exports
 * Uses lucide-react-native for iOS/Android environments
 * Automatically resolves CSS variable colors like var(--accent-1)
 */

import * as LucideIcons from "lucide-react-native"
import React from "react"
import { useTheme } from "../context/ThemeContext"
import { resolveThemeValue } from "../styles/resolveThemeValue"

// AI Brand Icons (simple emoji-based for React Native)
export * from "./BrandIcons.native"

// lucide-react-native doesn't export IconProps, so we define it
export type IconProps = {
  size?: number
  color?: string
  strokeWidth?: number
  fill?: string
  [key: string]: any
}

// Helper to resolve CSS variable colors
function useResolveIconColor(color: string | undefined): string | undefined {
  const themeContext = useTheme()

  if (!color) return color

  // If it's a CSS variable, resolve it
  if (color.startsWith("var(--")) {
    return resolveThemeValue(color, themeContext.theme) as string
  }

  // Otherwise return as-is
  return color
}

// Helper to wrap icon with color resolution
function createWrappedIcon(OriginalIcon: any, displayName: string) {
  // Lucide icons are functional components
  if (
    !OriginalIcon ||
    (typeof OriginalIcon !== "function" && typeof OriginalIcon !== "object")
  ) {
    return OriginalIcon
  }

  const WrappedIcon = React.forwardRef((props: IconProps, ref) => {
    const resolvedColor = useResolveIconColor(props.color)
    const resolvedStroke = useResolveIconColor(props.stroke as string)
    const resolvedFill = useResolveIconColor(props.fill)

    return (
      <OriginalIcon
        {...props}
        ref={ref}
        color={resolvedColor}
        stroke={resolvedStroke}
        fill={resolvedFill}
      />
    )
  })
  WrappedIcon.displayName = `Wrapped${displayName}`
  return WrappedIcon
}

// Create wrapped versions of all Lucide icons that auto-resolve colors
const wrappedIcons: Record<string, React.ComponentType<any>> = {}

Object.keys(LucideIcons).forEach((iconName) => {
  const OriginalIcon = (LucideIcons as any)[iconName]
  wrappedIcons[iconName] = createWrappedIcon(OriginalIcon, iconName)
})

// Export all wrapped icons
export const {
  Activity,
  Airplay,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Anchor,
  Aperture,
  Archive,
  ArrowDown,
  ArrowDownCircle,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowLeftCircle,
  ArrowRight,
  ArrowRightCircle,
  ArrowUp,
  ArrowUpCircle,
  ArrowUpLeft,
  ArrowUpRight,
  Award,
  BarChart,
  BarChart2,
  Battery,
  BatteryCharging,
  Bell,
  BellOff,
  Bluetooth,
  Bold,
  Book,
  BookOpen,
  Bookmark,
  Box,
  Briefcase,
  Calendar,
  Camera,
  CameraOff,
  Cast,
  Check,
  CheckCircle,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsDown,
  ChevronsLeft,
  ChevronsRight,
  ChevronsUp,
  Chrome,
  CircleEllipsis,
  Clipboard,
  Clock,
  Cloud,
  CloudDrizzle,
  CloudLightning,
  CloudOff,
  CloudRain,
  CloudSnow,
  Code,
  Codepen,
  Codesandbox,
  Coffee,
  Columns,
  Command,
  Compass,
  Copy,
  CornerDownLeft,
  CornerDownRight,
  CornerLeftDown,
  CornerLeftUp,
  CornerRightDown,
  CornerRightUp,
  CornerUpLeft,
  CornerUpRight,
  Cpu,
  CreditCard,
  Crop,
  Crosshair,
  Database,
  Delete,
  Disc,
  DollarSign,
  Download,
  DownloadCloud,
  Droplet,
  Edit,
  Edit2,
  Edit3,
  ExternalLink,
  Eye,
  EyeOff,
  Facebook,
  FastForward,
  Feather,
  Figma,
  File,
  FileText,
  Film,
  Filter,
  Flag,
  Folder,
  FolderMinus,
  FolderPlus,
  Framer,
  Frown,
  Gift,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Github,
  Gitlab,
  Glasses,
  Grid,
  HardDrive,
  Hash,
  Headphones,
  Heart,
  HelpCircle,
  Hexagon,
  Home,
  Image,
  Inbox,
  Info,
  Instagram,
  Italic,
  Key,
  Layers,
  Layout,
  LifeBuoy,
  Linkedin,
  List,
  Loader,
  Lock,
  LogIn,
  LogOut,
  Mail,
  Map,
  MapPin,
  Maximize,
  Maximize2,
  Meh,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  MicOff,
  Minimize,
  Minimize2,
  Minus,
  MinusCircle,
  MinusSquare,
  Monitor,
  MoreHorizontal,
  MoreVertical,
  MousePointer,
  Move,
  Music,
  Navigation,
  Navigation2,
  Octagon,
  Package,
  Pause,
  PauseCircle,
  PenTool,
  Percent,
  Phone,
  PhoneCall,
  PhoneForwarded,
  PhoneIncoming,
  PhoneMissed,
  PhoneOff,
  PhoneOutgoing,
  PieChart,
  Play,
  PlayCircle,
  Plus,
  PlusCircle,
  PlusSquare,
  Pocket,
  Power,
  Printer,
  Radio,
  RefreshCcw,
  RefreshCw,
  Repeat,
  Rewind,
  RotateCcw,
  RotateCw,
  Rss,
  Save,
  Scissors,
  Send,
  Server,
  Settings,
  Share,
  Share2,
  Shield,
  ShieldOff,
  ShoppingBag,
  ShoppingCart,
  Shuffle,
  Sidebar,
  SkipBack,
  SkipForward,
  Slack,
  Slash,
  Sliders,
  Smartphone,
  Smile,
  Speaker,
  Square,
  Star,
  StopCircle,
  Sunrise,
  Sunset,
  Tablet,
  Tag,
  Target,
  Terminal,
  Thermometer,
  ThumbsDown,
  ThumbsUp,
  ToggleLeft,
  ToggleRight,
  Tool,
  Trash,
  Trello,
  TrendingDown,
  TrendingUp,
  Triangle,
  Truck,
  Tv,
  Twitch,
  Twitter,
  Type,
  Umbrella,
  Underline,
  Unlock,
  Upload,
  UploadCloud,
  User,
  UserCheck,
  UserMinus,
  UserPlus,
  UserX,
  Users,
  Video,
  VideoOff,
  Voicemail,

  Watch,
  Wifi,
  WifiOff,
  Wind,
  X,
  XOctagon,
  XSquare,
  Youtube,
  Zap,
  ZapOff,
  ZoomIn,
  ZoomOut,
} = wrappedIcons

// Custom icons that don't exist in lucide-react-native
// Use Glasses as fallback for HatGlasses (incognito mode)
export const HatGlasses =
  wrappedIcons.Glasses || createWrappedIcon(LucideIcons.Glasses, "Glasses")
export const BellDot =
  wrappedIcons.Bell || createWrappedIcon(LucideIcons.Bell, "Bell")
export const LoaderCircle =
  wrappedIcons.Loader || createWrappedIcon(LucideIcons.Loader, "Loader")
export const MessageCirclePlus =
  wrappedIcons.MessageCircle ||
  createWrappedIcon(LucideIcons.MessageCircle, "MessageCircle")
export const Tornado =
  wrappedIcons.Wind || createWrappedIcon(LucideIcons.Wind, "Wind")
export const UserLock =
  wrappedIcons.UserCheck ||
  createWrappedIcon(LucideIcons.UserCheck, "UserCheck")
export const UserRoundCog =
  wrappedIcons.User || createWrappedIcon(LucideIcons.User, "User")
export const UserRoundPlus =
  wrappedIcons.UserPlus || createWrappedIcon(LucideIcons.UserPlus, "UserPlus")
export const UsersRound =
  wrappedIcons.Users || createWrappedIcon(LucideIcons.Users, "Users")
export const PanelRight =
  wrappedIcons.Sidebar || createWrappedIcon(LucideIcons.Sidebar, "Sidebar")
export const Search =
  wrappedIcons.Search || createWrappedIcon(LucideIcons.Search, "Search")
export const Sparkles =
  wrappedIcons.Sparkles || createWrappedIcon(LucideIcons.Sparkles, "Sparkles")
export const CircleX =
  wrappedIcons.XCircle || createWrappedIcon(LucideIcons.XCircle, "XCircle")
export const Link =
  wrappedIcons.Link || createWrappedIcon(LucideIcons.Link, "Link")
export const Trash2 =
  wrappedIcons.Trash2 || createWrappedIcon(LucideIcons.Trash2, "Trash2")
export const Circle =
  wrappedIcons.Circle || createWrappedIcon(LucideIcons.Circle, "Circle")
export const XCircle =
  wrappedIcons.XCircle || createWrappedIcon(LucideIcons.XCircle, "XCircle")
export const Link2 =
  wrappedIcons.Link2 || createWrappedIcon(LucideIcons.Link2, "Link2")
export const Languages =
  wrappedIcons.Languages ||
  createWrappedIcon(LucideIcons.Languages, "Languages")
export const Paperclip =
  wrappedIcons.Paperclip ||
  createWrappedIcon(LucideIcons.Paperclip, "Paperclip")
export const Coins =
  wrappedIcons.Coins || createWrappedIcon(LucideIcons.Coins, "Coins")
export const AtSign =
  wrappedIcons.AtSign || createWrappedIcon(LucideIcons.AtSign, "AtSign")
export const CheckIcon =
  wrappedIcons.CheckIcon ||
  createWrappedIcon(LucideIcons.CheckIcon, "CheckIcon")
export const Sun = wrappedIcons.Sun || createWrappedIcon(LucideIcons.Sun, "Sun")
export const Moon =
  wrappedIcons.Moon || createWrappedIcon(LucideIcons.Moon, "Moon")
export const Grip =
  wrappedIcons.Grip || createWrappedIcon(LucideIcons.Grip, "Grip")

export const Volume =
  wrappedIcons.Volume || createWrappedIcon(LucideIcons.Volume, "Volume")
export const Volume1 =
  wrappedIcons.Volume1 || createWrappedIcon(LucideIcons.Volume1, "Volume1")
export const Volume2 =
  wrappedIcons.Volume2 || createWrappedIcon(LucideIcons.Volume2, "Volume2")
export const VolumeX =
  wrappedIcons.VolumeX || createWrappedIcon(LucideIcons.VolumeX, "VolumeX")
export const GlobeLock =
  wrappedIcons.GlobeLock ||
  createWrappedIcon(LucideIcons.GlobeLock, "GlobeLock")
export const Globe =
  wrappedIcons.Globe || createWrappedIcon(LucideIcons.Globe, "Globe")
export const MousePointerClick =
  wrappedIcons.MousePointerClick ||
  createWrappedIcon(LucideIcons.MousePointerClick, "MousePointerClick")

// Custom icons
export { WannathisIcon } from "./WannathisIcon"
