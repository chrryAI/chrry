// Removed imports to avoid circular dependencies during Vite config loading
export type SiteMode =
  | "chrryDev"
  | "vex"
  | "chrryAI"
  | "chrryStore"
  | "focus"
  | "atlas"
  | "istanbul"
  | "amsterdam"
  | "tokyo"
  | "newYork"
  | "popcorn"
  | "zarathustra"
  | "search"
  | "sushi"
  | "grape"
  | "pear"
  | "vault"
  | "burn"
  | "e2eVex"
  | "staging"
  | "tribe"
  | "nebula"

/// <reference types="chrome" />

export const getEnv = () => {
  let processEnv: Record<string, string | undefined> = {}
  if (typeof process !== "undefined" && "env" in process) {
    processEnv = process.env as Record<string, string | undefined>
  }

  let importMetaEnv: Record<string, string | undefined> = {}
  if (typeof import.meta !== "undefined") {
    importMetaEnv = ((import.meta as any).env || {}) as Record<
      string,
      string | undefined
    >
  }

  return {
    ...processEnv,
    ...importMetaEnv,
  } as Record<string, string | undefined>
}

export const isCI = getEnv().VITE_CI === "true" || getEnv().CI === "true"

export const checkIsExtension = () => {
  if (typeof chrome !== "undefined" && chrome.runtime?.id) {
    return true
  }
  if (typeof browser !== "undefined" && (browser as any).runtime?.id) {
    return true
  }
  return false
}

export const getExtensionUrl = () => {
  if (typeof window === "undefined") return
  if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
    return chrome.runtime.getURL("index.html") // Chrome
  }
  if (typeof browser !== "undefined" && (browser as any).runtime?.getURL) {
    return (browser as any).runtime.getURL("index.html") // Firefox
  }
  return `${window.location.origin}/index.html` // Fallback
}

export const isProduction =
  isTauri() ||
  getEnv().NODE_ENV === "production" ||
  getEnv().VITE_NODE_ENV === "production"

export const isDevelopment = checkIsExtension()
  ? [
      "jnngfghgbmieehkfebkogjjiepomakdh",
      "bikahnjnakdnnccpnmcpmiojnehfooio", // Known dev extension ID
    ].some((id) => getExtensionUrl()?.includes(id))
  : !isProduction

export const isTestingDevice = false && isDevelopment

export const isE2E =
  getEnv().VITE_TESTING_ENV === "e2e" || getEnv().TESTING_ENV === "e2e"

export const chrryDev = {
  mode: "chrryDev" as SiteMode,
  slug: "chrryDev",
  storeSlug: "chrry",
  favicon: "chrry",
  isStoreApp: true,
  store: "https://chrry.dev",
  name: "Chrry",
  domain: "chrry.dev",
  url: "https://chrry.dev",
  email: "iliyan@chrry.ai",
  description:
    "🐝 A modern, cross-platform AI Infrastructure for Universal React and TypeScript",
  logo: "/assets/cherry-logo.svg", // Cross-platform SVG
  primaryColor: "#E91E63", // Cherry pink
  links: {
    github: "https://github.com/chrryAI/vex",
    npm: "https://www.npmjs.com/package/@chrryai/chrry",
    // docs: "https://chrry.dev/docs",
    // demo: "https://chrry.dev/demo",
  },
  features: [
    {
      title: "Sushi(WIP)",
      description:
        "🏢 Enterprise-grade compiler infrastructure with multi-agent 🤖 coordination",
      icon: "🍣",
      link: "https://github.com/chrryAI/sushi",
      isOpenSource: true,
    },
    {
      title: "Waffles",
      description: "Playwright testing utilities for Sushi 🍣 e2e strikes 🎯",
      icon: "🧇",
      link: "https://github.com/chrryAI/waffles",
      isOpenSource: true,
    },
    {
      title: "Pepper",
      description: "Universal router with view transitions",
      icon: "🌶️",
      link: "https://github.com/chrryAI/pepper",
      isOpenSource: true,
    },
    {
      title: "Components",
      description: "100+ production-ready UI components",
      icon: "🎨",
      link: "https://github.com/chrryAI/vex/tree/main/packages/ui",
      isOpenSource: true,
    },
    {
      title: "Styles",
      description: "SCSS to TypeScript converter",
      icon: "🎭",
      link: "https://github.com/chrryAI/vex/tree/main/scripts/scss-to-universal.js",
      isOpenSource: true,
    },
    {
      title: "Hooks",
      description: "Reusable React hooks",
      icon: "🪝",
      link: "https://github.com/chrryAI/vex/tree/main/packages/ui/hooks",
      isOpenSource: true,
    },
    {
      title: "Context",
      description: "State management providers",
      icon: "🔄",
      link: "https://github.com/chrryAI/vex/blob/main/packages/ui/context",
      isOpenSource: true,
    },
    {
      title: "Platform",
      description: "Cross-platform utilities",
      icon: "📱",
      link: "https://github.com/chrryAI/vex/tree/main/packages/ui/platform",
      isOpenSource: true,
    },
  ],
}

const vault = {
  url: "https://vault.chrry.ai",
  mode: "vault" as SiteMode,
  slug: "vault",
  favicon: "vault",
  storeSlug: "wine",
  name: "Vault",
  isStoreApp: true,
  domain: "vault.chrry.ai",
  store: "https://vault.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "AI-powered financial analytics. Track expenses, budgets, insights.",
  logo: "🏦",
  primaryColor: "#059669", // Emerald green
  links: {
    github: "https://github.com/chrryAI/vex",
    docs: "https://vault.chrry.ai/docs",
  },
  features: [
    {
      title: "Expense Tracking",
      description: "AI-categorized expense management",
      icon: "💸",
      link: "/expenses",
      isOpenSource: true,
    },
    {
      title: "White Label",
      description: "Customize for your brand",
      icon: "🎨",
      link: "/white-label",
      isOpenSource: true,
    },
  ],
}

const pear = {
  url: "https://pear.chrry.ai",
  mode: "pear" as SiteMode,
  slug: "pear",
  favicon: "pear",
  storeSlug: "wine",
  name: "Pear",
  isStoreApp: false,
  domain: "pear.chrry.ai",
  store: "https://wine.chrry.ai",
  email: "iliyan@chrry.ai",
  description: "AI-powered feedback system. Earn credits for quality insights.",
  logo: "🍐",
  primaryColor: "#84CC16", // Lime green
  links: {
    github: "https://github.com/chrryAI/vex",
    docs: "https://pear.chrry.ai/docs",
  },
  features: [
    {
      title: "AI Feedback Validation",
      description: "Get rewarded for quality feedback",
      icon: "✨",
      link: "/feedback",
      isOpenSource: true,
    },
    {
      title: "White Label",
      description: "Customize for your brand",
      icon: "🎨",
      link: "/white-label",
      isOpenSource: true,
    },
  ],
}

const chrryAI = {
  slug: "chrry",
  favicon: "chrry",
  isStoreApp: true,
  storeSlug: "blossom",
  mode: "chrryAI" as SiteMode,
  name: "Chrry",
  domain: "chrry.ai",
  email: "iliyan@chrry.ai",
  chromeWebStoreUrl:
    "https://chromewebstore.google.com/detail/chrry-🍒/odgdgbbddopmblglebfngmaebmnhegfc",
  url: "https://chrry.ai",
  store: "https://chrry.ai",
  description: "AI App Marketplace - Discover, create, and monetize AI apps",
  logo: "🍒",
  primaryColor: "#E91E63", // Cherry pink
  links: {
    github: "https://github.com/chrryAI/vex",
    docs: "https://chrry.ai/docs",
    // store: "https://chrry.store",
  },
  features: [
    {
      title: "App Marketplace",
      description: "Discover and install AI apps",
      icon: "🏪",
      link: "/explore",
      isOpenSource: true,
    },
    {
      title: "Create Stores",
      description: "Build your own AI app marketplace",
      icon: "🏗️",
      link: "/stores/new",
      isOpenSource: true,
    },
    {
      title: "Publish Apps",
      description: "Monetize your AI applications",
      icon: "📱",
      link: "/apps/new",
      isOpenSource: true,
    },
    {
      title: "Revenue Sharing",
      description: "Earn 70% on every sale",
      icon: "💰",
      link: "/affiliate",
      isOpenSource: true,
    },
    {
      title: "Custom Domains",
      description: "White-label your store",
      icon: "🌐",
      link: "/settings/domain",
      isOpenSource: true,
    },
    {
      title: "Analytics",
      description: "Track your app performance",
      icon: "📊",
      link: "/analytics",
      isOpenSource: true,
    },
    {
      title: "Multi-Agent Support",
      description: "Build for any AI platform",
      icon: "🤖",
      link: "/docs/agents",
      isOpenSource: true,
    },
    {
      title: "Developer Tools",
      description: "APIs and SDKs for developers",
      icon: "🛠️",
      link: "/docs/api",
      isOpenSource: true,
    },
  ],
  about: {
    intro:
      "Chrry is the ultimate AI app marketplace where creativity meets monetization. Discover cutting-edge AI applications built by developers worldwide, or create and publish your own AI apps to earn revenue.",
    intro2:
      "With 70% revenue sharing for app creators, custom stores, and powerful developer tools - Chrry empowers both users and builders to harness the full potential of AI technology.",
    approach: {
      title: "Our Mission",
      content:
        "We're building the infrastructure for the AI app economy. Chrry makes it simple for developers to monetize their AI creations while giving users access to a curated marketplace of high-quality applications. Transparency in pricing, usage, and revenue sharing is at our core.",
    },
    platforms: {
      title: "Available Everywhere",
      content:
        "Access Chrry's AI app marketplace across all your devices - web, mobile PWA, and browser extensions.",
      web: {
        title: "🌐 Web Application",
        content:
          "Full marketplace experience with app discovery, installation, and management from any browser.",
      },
      pwa: {
        title: "📱 Progressive Web App",
        content:
          "Install Chrry on your mobile or desktop. Browse apps offline, get notifications, sync across devices.",
      },
      chrome: {
        title: "🧩 Chrome Extension",
        content:
          "Quick access to your installed apps from the browser toolbar. Right-click integration on any webpage.",
      },
    },
  },
}

const focus = {
  favicon: "focus",
  isStoreApp: false,
  mode: "focus" as SiteMode,
  slug: "focus",
  version: "26.11.26",
  storeSlug: "blossom",
  name: "Focus",
  domain: "focus.chrry.ai",
  chromeWebStoreUrl:
    "https://chromewebstore.google.com/detail/focus-🍒/nkomoiomfaeodakglkihapminhpgnibl",
  store: "https://chrry.ai",
  email: "iliyan@chrry.ai",
  url: "https://focus.chrry.ai",
  description:
    "AI-powered Pomodoro timer with task management and mood tracking. Stay focused, productive, and mindful while you work.",
  logo: "⏱️",
  primaryColor: "#3B82F6", // Blue
  links: {
    github: "https://github.com/chrryAI/vex",
    docs: "https://focus.chrry.ai/docs",
  },
  features: [
    {
      title: "Focus Timer",
      description: "Pomodoro and custom focus sessions",
      icon: "⏱️",
      link: "/timer",
      isOpenSource: true,
    },
    {
      title: "Task Management",
      description: "Organize and track your tasks",
      icon: "✅",
      link: "/tasks",
      isOpenSource: true,
    },
    {
      title: "AI Task Breakdown",
      description: "Break complex projects into steps",
      icon: "🤖",
      link: "/ai",
      isOpenSource: true,
    },
    {
      title: "Time Tracking",
      description: "Track time across all your tasks",
      icon: "📊",
      link: "/analytics",
      isOpenSource: true,
    },
    {
      title: "Progress Analytics",
      description: "Visualize your productivity patterns",
      icon: "📈",
      link: "/progress",
      isOpenSource: true,
    },
    {
      title: "Goal Setting",
      description: "Set and achieve your goals",
      icon: "🎯",
      link: "/goals",
      isOpenSource: true,
    },
    {
      title: "Productivity Insights",
      description: "AI-powered productivity tips",
      icon: "💡",
      link: "/insights",
      isOpenSource: true,
    },
    {
      title: "Deep Work Mode",
      description: "Eliminate distractions and focus",
      icon: "🧠",
      link: "/deep-work",
      isOpenSource: true,
    },
  ],
}

const atlas = {
  favicon: "atlas",
  mode: "atlas" as SiteMode,
  slug: "atlas",
  isStoreApp: true,
  storeSlug: "compass",
  chromeWebStoreUrl:
    "https://chromewebstore.google.com/detail/atlas-🍒/adopnldifkjlgholfcijjgocgnolknpb",
  name: "Atlas",
  domain: "atlas.chrry.ai",
  url: "https://atlas.chrry.ai",
  store: "https://atlas.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "Your intelligent geographic companion. Save locations with AI context, create geo-tagged notes, and discover local AI resources.",
  logo: "🌍",
  primaryColor: "#10B981", // Green
  links: {
    github: "https://github.com/chrryai/vex",
    docs: "https://atlas.chrry.ai/docs",
  },
  features: [
    {
      title: "Geo-Tagged Memory",
      description: "Save locations with AI context",
      icon: "📍",
      link: "/memory",
      isOpenSource: true,
    },
    {
      title: "Travel Planning",
      description: "Smart itineraries and local insights",
      icon: "✈️",
      link: "/travel",
      isOpenSource: true,
    },
    {
      title: "Local Discovery",
      description: "Find authentic spots locals love",
      icon: "🗺️",
      link: "/discover",
      isOpenSource: true,
    },
    {
      title: "Weather Integration",
      description: "Real-time weather for your locations",
      icon: "🌤️",
      link: "/weather",
      isOpenSource: true,
    },
    {
      title: "Browser Extension",
      description: "Access Atlas from anywhere",
      icon: "🔌",
      link: "https://chrome.google.com/webstore",
      isOpenSource: true,
    },
  ],
  about: {
    intro:
      "Atlas is your intelligent geographic companion that transforms how you explore and remember places. Save locations with AI-powered context, create geo-tagged notes, and discover local insights wherever you go.",
    intro2:
      "Whether you're planning your next adventure or documenting your favorite spots - Atlas combines location intelligence with AI to help you navigate the world more meaningfully.",
    approach: {
      title: "Smart Geography",
      content:
        "We're reinventing how people interact with places. Atlas uses AI to understand not just where you've been, but why it mattered. From travel planning to local discovery - every feature is designed to enrich your geographic experiences with intelligent context.",
    },
    platforms: {
      title: "Explore Anywhere",
      content:
        "Take Atlas with you across web, mobile, and browser - your geographic memory synced everywhere.",
      web: {
        title: "🌐 Web Application",
        content:
          "Full-featured mapping experience with location management, travel planning, and local discovery from any browser.",
      },
      pwa: {
        title: "📱 Progressive Web App",
        content:
          "Install Atlas as a native app. Access your saved locations offline, get location-based notifications, and seamless sync.",
      },
      chrome: {
        title: "🧩 Chrome Extension",
        content:
          "Save locations while browsing, get context-aware recommendations, and quick access to your geographic memory from the toolbar.",
      },
    },
  },
}

const istanbul = {
  favicon: "atlas",
  isStoreApp: false,
  mode: "istanbul" as SiteMode,
  slug: "istanbul",
  storeSlug: "compass",
  name: "Istanbul",
  domain: "istanbul.chrry.ai",
  url: "https://istanbul.chrry.ai",
  store: "https://atlas.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "Your personal AI assistant designed for Istanbul and Turkey. Chat in Turkish, collaborate locally, and get things done faster.",
  logo: "🇹🇷",
  primaryColor: "#E30A17", // Turkish red
  links: {
    github: "https://github.com/chrryai/vex",
    docs: "https://istanbul.chrry.ai/docs",
  },
  features: [
    {
      title: "Turkish Language Support",
      description: "Native Turkish AI assistance",
      icon: "🗣️",
      link: "/language",
      isOpenSource: true,
    },
    {
      title: "Local Insights",
      description: "Istanbul-specific recommendations",
      icon: "🕌",
      link: "/local",
      isOpenSource: true,
    },
    {
      title: "Turkish Lira Pricing",
      description: "Local currency and payment methods",
      icon: "💰",
      link: "/pricing",
      isOpenSource: true,
    },
    {
      title: "Local Collaboration",
      description: "Connect with Turkish users",
      icon: "👥",
      link: "/community",
      isOpenSource: true,
    },
  ],
  about: {
    intro:
      "Istanbul is your personal AI assistant designed to connect you with Turkish language support and local insights. Whether you're navigating Istanbul's vibrant culture or collaborating with the broader Turkish community, Istanbul empowers you to communicate naturally and get things done faster.",
    intro2:
      "With native Turkish language support, local pricing in Turkish Lira, and insights tailored to Istanbul and Turkey - Istanbul brings the power of AI to your local context.",
    approach: {
      title: "Local Intelligence",
      content:
        "We're building AI that understands your local context. Istanbul combines Turkish language fluency with cultural awareness to help you navigate daily life, collaborate locally, and access AI in a way that feels natural to you. Every feature is designed with Istanbul and Turkish communities in mind.",
    },
    platforms: {
      title: "Everywhere You Are",
      content:
        "Access Istanbul's AI assistance across web, mobile, and browser - always in Turkish, always with local context.",
      web: {
        title: "🌐 Web Application",
        content:
          "Full Istanbul experience with Turkish language support, local payment methods, and Istanbul-specific insights from any browser.",
      },
      pwa: {
        title: "📱 Progressive Web App",
        content:
          "Install Istanbul on your mobile or desktop. Chat in Turkish offline, get local notifications, seamless sync across your devices.",
      },
      chrome: {
        title: "🧩 Chrome Extension",
        content:
          "Quick access to Istanbul AI from your browser toolbar. Turkish language support, local context, and toolbar integration for instant assistance.",
      },
    },
  },
}

const amsterdam = {
  favicon: "atlas",
  mode: "amsterdam" as SiteMode,
  slug: "amsterdam",
  isStoreApp: false,
  storeSlug: "compass",
  name: "Amsterdam",
  domain: "amsterdam.chrry.ai",
  url: "https://amsterdam.chrry.ai",
  store: "https://atlas.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "Your personal AI assistant designed for Amsterdam and the Netherlands. Chat in Dutch, collaborate locally, and get things done faster.",
  logo: "🇳🇱",
  primaryColor: "#FF6B35", // Dutch orange
  links: {
    github: "https://github.com/chrryai/vex",
    docs: "https://amsterdam.chrry.ai/docs",
  },
  features: [
    {
      title: "Dutch Language Support",
      description: "Native Dutch AI assistance",
      icon: "🗣️",
      link: "/language",
      isOpenSource: true,
    },
    {
      title: "Local Insights",
      description: "Amsterdam-specific recommendations",
      icon: "🚲",
      link: "/local",
      isOpenSource: true,
    },
    {
      title: "Euro Pricing",
      description: "Local currency and payment methods",
      icon: "💰",
      link: "/pricing",
      isOpenSource: true,
    },
    {
      title: "Local Collaboration",
      description: "Connect with Dutch users",
      icon: "👥",
      link: "/community",
      isOpenSource: true,
    },
  ],
  about: {
    intro:
      "Amsterdam is your personal AI assistant designed for the Netherlands and Dutch speakers. Experience natural Dutch language support, local insights, and Euro-based pricing tailored to the Amsterdam and Dutch communities.",
    intro2:
      "With fluent Dutch language capabilities, local financial options, and features designed for the Dutch market - Amsterdam brings intelligent AI assistance to your local context.",
    approach: {
      title: "Dutch-Centric Intelligence",
      content:
        "We're creating AI that speaks your language and understands your culture. Amsterdam combines native Dutch language support with local market insights to help you work, connect, and explore in a way that feels natural. Every feature is built with Amsterdam and the Netherlands in mind.",
    },
    platforms: {
      title: "Available in Your Language",
      content:
        "Access Amsterdam's AI assistance across web, mobile, and browser - always in Dutch, always with local relevance.",
      web: {
        title: "🌐 Web Application",
        content:
          "Complete Amsterdam experience with Dutch language interface, local payment methods, and Netherlands-specific insights.",
      },
      pwa: {
        title: "📱 Progressive Web App",
        content:
          "Install Amsterdam on your device. Chat in Dutch offline, receive local notifications, seamless sync across all your devices.",
      },
      chrome: {
        title: "🧩 Chrome Extension",
        content:
          "Quick access to Amsterdam AI from your browser. Dutch language support, local context, and integrated assistance.",
      },
    },
  },
}

const tokyo = {
  favicon: "atlas",
  mode: "tokyo" as SiteMode,
  slug: "tokyo",
  storeSlug: "compass",
  isStoreApp: false,
  name: "Tokyo",
  domain: "tokyo.chrry.ai",
  url: "https://tokyo.chrry.ai",
  store: "https://atlas.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "Your personal AI assistant designed for Tokyo and Japan. Chat in Japanese, collaborate locally, and get things done faster.",
  logo: "🇯🇵",
  primaryColor: "#BC002D", // Japanese red
  links: {
    github: "https://github.com/chrryai/vex",
    docs: "https://tokyo.chrry.ai/docs",
  },
  features: [
    {
      title: "Japanese Language Support",
      description: "Native Japanese AI assistance",
      icon: "🗣️",
      link: "/language",
      isOpenSource: true,
    },
    {
      title: "Local Insights",
      description: "Tokyo-specific recommendations",
      icon: "🗼",
      link: "/local",
      isOpenSource: true,
    },
    {
      title: "Yen Pricing",
      description: "Local currency and payment methods",
      icon: "💰",
      link: "/pricing",
      isOpenSource: true,
    },
    {
      title: "Local Collaboration",
      description: "Connect with Japanese users",
      icon: "👥",
      link: "/community",
      isOpenSource: true,
    },
  ],
  about: {
    intro:
      "Tokyo is your personal AI assistant crafted for Japan and Japanese speakers. Experience native Japanese language support, insights tailored to Tokyo and Japan, and yen-based pricing designed for the local market.",
    intro2:
      "With fluent Japanese capabilities, local financial options in Japanese Yen, and features designed for Japanese communities - Tokyo brings intelligent AI assistance to your daily life.",
    approach: {
      title: "Japanese Language Mastery",
      content:
        "We're building AI that understands Japanese culture and language nuances. Tokyo combines native Japanese language support with deep local insights to help you work, learn, and collaborate more effectively. Every feature is designed with Tokyo and Japan in mind.",
    },
    platforms: {
      title: "Works Everywhere in Japanese",
      content:
        "Access Tokyo's AI assistance across web, mobile, and browser - always in Japanese, always with local context.",
      web: {
        title: "🌐 Web Application",
        content:
          "Full Tokyo experience with Japanese language interface, local payment options in Yen, and Japan-specific recommendations.",
      },
      pwa: {
        title: "📱 Progressive Web App",
        content:
          "Install Tokyo on your mobile or desktop. Chat in Japanese offline, get local alerts, sync seamlessly across devices.",
      },
      chrome: {
        title: "🧩 Chrome Extension",
        content:
          "Quick access to Tokyo AI from your browser toolbar. Japanese language support, local insights, integrated assistance.",
      },
    },
  },
}

const newYork = {
  favicon: "atlas",
  mode: "newYork" as SiteMode,
  slug: "newYork",
  storeSlug: "compass",
  name: "New York",
  isStoreApp: false,
  domain: "newyork.chrry.ai",
  url: "https://newyork.chrry.ai",
  store: "https://atlas.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "Your personal AI assistant designed for New York City and the USA. Chat, collaborate locally, and get things done faster in the city that never sleeps.",
  logo: "🗽",
  primaryColor: "#0039A6", // NYC blue
  links: {
    github: "https://github.com/chrryai/vex",
    docs: "https://newyork.chrry.ai/docs",
  },
  features: [
    {
      title: "NYC Local Insights",
      description: "New York-specific recommendations",
      icon: "🏙️",
      link: "/local",
      isOpenSource: true,
    },
    {
      title: "USD Pricing",
      description: "US currency and payment methods",
      icon: "💰",
      link: "/pricing",
      isOpenSource: true,
    },
    {
      title: "Local Collaboration",
      description: "Connect with NYC users",
      icon: "👥",
      link: "/community",
      isOpenSource: true,
    },
    {
      title: "24/7 Support",
      description: "Always available in the city that never sleeps",
      icon: "🌃",
      link: "/support",
      isOpenSource: true,
    },
  ],
  about: {
    intro:
      "New York is your personal AI assistant designed for New York City and the USA. Experience 24/7 AI support tailored for the city that never sleeps, with local insights and USD pricing built for the American market.",
    intro2:
      "With insights tailored to NYC's unique culture and fast-paced lifestyle, local USD payments, and round-the-clock support - New York brings intelligent AI assistance when you need it most.",
    approach: {
      title: "AI for the City That Never Sleeps",
      content:
        "We're building AI that understands NYC's energy and pace. New York combines local market insights with 24/7 availability to help you navigate the city, connect with others, and get things done faster. Every feature is designed for New York City and American users.",
    },
    platforms: {
      title: "Always On, Always Available",
      content:
        "Access New York's AI assistance across web, mobile, and browser - 24/7, with USD pricing and NYC-specific insights.",
      web: {
        title: "🌐 Web Application",
        content:
          "Complete New York experience with USD pricing, local insights, 24/7 support, and full marketplace access.",
      },
      pwa: {
        title: "📱 Progressive Web App",
        content:
          "Install New York on your device. Chat anytime, get NYC notifications, seamless sync across all platforms.",
      },
      chrome: {
        title: "🧩 Chrome Extension",
        content:
          "Quick access to New York AI from your browser. Local insights, USD payments, 24/7 support at your fingertips.",
      },
    },
  },
}

const popcorn = {
  favicon: "popcorn",
  mode: "popcorn" as SiteMode,
  slug: "popcorn",
  storeSlug: "movies",
  chromeWebStoreUrl:
    "https://chromewebstore.google.com/detail/popcorn-🍒/lfokfhplbjckmfmbakfgpkhaanfencah",
  name: "Popcorn",
  isStoreApp: true,
  domain: "popcorn.chrry.ai",
  url: "https://popcorn.chrry.ai",
  store: "https://popcorn.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "Step into the premier hub for iconic films, genre-defining storytelling, and cinematic AI companions that decode every frame.",
  logo: "🍿",
  primaryColor: "#DC2626", // Cinema red
  links: {
    github: "https://github.com/chrryai/vex",
    docs: "https://popcorn.chrry.ai/docs",
  },
  features: [
    {
      title: "Scene Analysis",
      description: "Decode any film scene with precision",
      icon: "🎬",
      link: "/scene-analysis",
      isOpenSource: true,
    },
    {
      title: "Character Arc Explorer",
      description: "Trace protagonist transformations",
      icon: "🧭",
      link: "/character-arcs",
      isOpenSource: true,
    },
    {
      title: "Cinematic Techniques",
      description: "Visual storytelling breakdown",
      icon: "🎥",
      link: "/techniques",
      isOpenSource: true,
    },
    {
      title: "Soundtrack Insights",
      description: "Audio storytelling analysis",
      icon: "🎵",
      link: "/soundtrack",
      isOpenSource: true,
    },
    {
      title: "Genre Remix",
      description: "Reimagine films in new genres",
      icon: "🔄",
      link: "/remix",
      isOpenSource: true,
    },
    {
      title: "Dialogue Deep Dive",
      description: "Unpack memorable quotes",
      icon: "💬",
      link: "/dialogue",
      isOpenSource: true,
    },
    {
      title: "Double Features",
      description: "Curated film pairings",
      icon: "🎟️",
      link: "/double-features",
      isOpenSource: true,
    },
    {
      title: "Movie Database",
      description: "Explore iconic films",
      icon: "📚",
      link: "/films",
      isOpenSource: true,
    },
  ],
  about: {
    intro:
      "Popcorn is the premier hub for cinematic AI companions that decode every frame. Explore iconic films, analyze character arcs, and unlock the secrets of visual storytelling with AI that understands cinema like a true film critic.",
    intro2:
      "From scene analysis to soundtrack insights, from genre remixes to dialogue deep dives - Popcorn brings deep cinematic knowledge to every conversation about film.",
    approach: {
      title: "Cinema Mastery",
      content:
        "We're building AI that speaks the language of cinema. Popcorn combines film expertise with cutting-edge AI to help you understand, appreciate, and engage with movies at a deeper level. Whether you're a casual viewer or cinephile, every feature is designed to enhance your cinematic experience.",
    },
    platforms: {
      title: "Cinematic AI Everywhere",
      content:
        "Access Popcorn's film expertise across web, mobile, and browser - bringing film analysis to every device.",
      web: {
        title: "🌐 Web Application",
        content:
          "Full Popcorn experience with scene analysis, character exploration, and cinematic techniques from any browser.",
      },
      pwa: {
        title: "📱 Progressive Web App",
        content:
          "Install Popcorn on your device. Watch, analyze, and discuss films offline with synced insights across devices.",
      },
      chrome: {
        title: "🧩 Chrome Extension",
        content:
          "Quick access to Popcorn's film expertise from your browser. Analyze scenes, explore character arcs, discuss movies.",
      },
    },
  },
}

const zarathustra = {
  favicon: "zarathustra",
  mode: "zarathustra" as SiteMode,
  slug: "zarathustra",
  storeSlug: "books",
  chromeWebStoreUrl:
    "https://chromewebstore.google.com/detail/zarathustra-🍒/jijgmcofljfalongocihccblcboppnad",
  name: "Zarathustra",
  domain: "books.chrry.ai",
  url: "https://books.chrry.ai",
  isStoreApp: true,
  store: "https://books.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "Your AI philosophy guide. Explore Nietzsche, existentialism, and timeless wisdom through intelligent conversation.",
  logo: "🪢",
  primaryColor: "#7C3AED", // Purple/violet for wisdom
  links: {
    github: "https://github.com/chrryai/vex",
    docs: "https://zarathustra.chrry.ai/docs",
  },
  features: [
    {
      title: "Philosophy Explorer",
      description: "Navigate schools of thought",
      icon: "🏛️",
      link: "/philosophy",
      isOpenSource: true,
    },
    {
      title: "Book Analysis",
      description: "Deep dive into philosophical texts",
      icon: "📖",
      link: "/books",
      isOpenSource: true,
    },
    {
      title: "Concept Breakdown",
      description: "Understand complex ideas simply",
      icon: "💡",
      link: "/concepts",
      isOpenSource: true,
    },
    {
      title: "Philosopher Profiles",
      description: "Learn about great thinkers",
      icon: "🧠",
      link: "/philosophers",
      isOpenSource: true,
    },
    {
      title: "Eternal Recurrence",
      description: "Explore Nietzsche's key ideas",
      icon: "♾️",
      link: "/nietzsche",
      isOpenSource: true,
    },
    {
      title: "Existential Toolkit",
      description: "Apply philosophy to life",
      icon: "🛠️",
      link: "/toolkit",
      isOpenSource: true,
    },
    {
      title: "Reading Lists",
      description: "Curated philosophical journeys",
      icon: "📚",
      link: "/reading-lists",
      isOpenSource: true,
    },
    {
      title: "Daily Wisdom",
      description: "Philosophical insights daily",
      icon: "✨",
      link: "/daily",
      isOpenSource: true,
    },
  ],

  about: {
    intro:
      "Zarathustra is your AI philosophy guide, exploring the great traditions of philosophical thought from Nietzsche and existentialism to timeless wisdom across cultures. Engage in deep conversations about ideas that matter and unlock new perspectives on life.",
    intro2:
      "With curated reading lists, philosopher profiles, concept breakdowns, and existential tools - Zarathustra brings the world of philosophy to your daily life.",
    approach: {
      title: "Philosophy for Everyone",
      content:
        "We're making philosophy accessible and engaging. Zarathustra combines scholarly knowledge with conversational AI to help you explore ideas, understand great thinkers, and apply philosophical wisdom to your own life. Every feature is designed to deepen your philosophical journey.",
    },
    platforms: {
      title: "Wisdom Everywhere",
      content:
        "Access Zarathustra's philosophical expertise across web, mobile, and browser - bringing wisdom to every device.",
      web: {
        title: "🌐 Web Application",
        content:
          "Complete philosophy experience with book analysis, philosopher profiles, concept exploration, and reading lists.",
      },
      pwa: {
        title: "📱 Progressive Web App",
        content:
          "Install Zarathustra on your device. Explore philosophy offline, get daily wisdom, sync insights across platforms.",
      },
      chrome: {
        title: "🧩 Chrome Extension",
        content:
          "Quick access to Zarathustra from your browser. Explore concepts, read philosophy, get wisdom on demand.",
      },
    },
  },
}

const search = {
  favicon: "search",
  mode: "search" as SiteMode,
  slug: "search",
  storeSlug: "perplexityStore",
  name: "Search",
  domain: "search.chrry.ai",
  url: "https://search.chrry.ai",
  chromeWebStoreUrl:
    "https://chromewebstore.google.com/detail/search-🍒/cloblmampohoemdaojenlkjbnkpmkiop",
  isStoreApp: false,
  store: "https://search.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "AI-powered real-time web search with cited sources. Get instant, accurate answers with verifiable references worldwide.",
  logo: "🔍",
  primaryColor: "#3B82F6", // Blue
  links: {
    github: "https://github.com/chrryai/vex",
    docs: "https://search.chrry.ai/docs",
  },
  features: [
    {
      title: "Real-Time Search",
      description: "Live web search with instant results",
      icon: "⚡",
      link: "/search",
      isOpenSource: true,
    },
    {
      title: "Source Citations",
      description: "Verifiable sources for every answer",
      icon: "📚",
      link: "/sources",
      isOpenSource: true,
    },
    {
      title: "Multi-Source Aggregation",
      description: "Combine information from multiple sources",
      icon: "🌐",
      link: "/aggregation",
      isOpenSource: true,
    },
    {
      title: "Fact-Checking",
      description: "Cross-reference for accuracy",
      icon: "✓",
      link: "/fact-check",
      isOpenSource: true,
    },
    {
      title: "Follow-Up Questions",
      description: "Suggested questions to explore deeper",
      icon: "💡",
      link: "/explore",
      isOpenSource: true,
    },
    {
      title: "Visual Results",
      description: "Rich media including images and videos",
      icon: "🖼️",
      link: "/visual",
      isOpenSource: true,
    },
    {
      title: "Context Awareness",
      description: "Understands search intent and context",
      icon: "🧠",
      link: "/context",
      isOpenSource: true,
    },
    {
      title: "Global Knowledge",
      description: "Access information worldwide",
      icon: "🌍",
      link: "/global",
      isOpenSource: true,
    },
  ],
}

const nebula = {
  url: "https://orbit.chrry.ai",
  mode: "nebula" as SiteMode,
  slug: "nebula",
  favicon: "nebula",
  storeSlug: "orbit",
  name: "Nebula",
  isStoreApp: true,
  domain: "orbit.chrry.ai",
  store: "https://orbit.chrry.ai",
  email: "iliyan@chrry.ai",
  description: "Science & Exploration Hub",
  logo: "🌌",
  primaryColor: "#7C3AED", // Violet
  links: {
    docs: "https://orbit.chrry.ai/docs",
  },
  features: [
    {
      title: "Quantum Computing",
      description: "Build circuits, simulate algorithms, export Qiskit code",
      icon: "⚛️",
      link: "/quantumlab",
      isOpenSource: true,
    },
    {
      title: "Astronomy",
      description: "Explore stars, black holes, and the cosmos",
      icon: "🌠",
      link: "/starmap",
      isOpenSource: true,
    },
    {
      title: "Physics & Math",
      description: "Step-by-step problem solving and derivations",
      icon: "🧪",
      link: "/cosmos",
      isOpenSource: true,
    },
    {
      title: "Scientific Code",
      description: "Python, Julia, and MATLAB simulations",
      icon: "💻",
      link: "/nebula",
      isOpenSource: true,
    },
  ],
  about: {
    intro:
      "Nebula is your AI-powered science and exploration hub. From quantum circuits to black holes, advanced mathematics to physics derivations — Nebula makes the frontiers of science accessible, exciting, and practical.",
    intro2:
      "Powered by Sushi AI with multimodal capabilities, Nebula generates working code, explains research papers, solves complex problems step-by-step, and adapts to any depth — from curious beginner to graduate researcher.",
    approach: {
      title: "Our Philosophy",
      content:
        "Science should be accessible to everyone. Nebula builds intuition before formalism, uses analogies to make abstract concepts concrete, and always connects theory to real-world applications and working code.",
    },
    platforms: {
      title: "Multi-Platform Science Hub",
      content:
        "Nebula is available across web and mobile as a first-class experience.",
      web: {
        title: "🌐 Web Application",
        content:
          "Full-featured web experience with real-time collaboration, file uploads for research papers, and all science capabilities accessible from any browser.",
      },
      pwa: {
        title: "📱 Progressive Web App (PWA)",
        content:
          "Install Nebula as a native app on your mobile device or desktop. Seamless sync across all your devices.",
      },
    },
  },
}

const vex = {
  url: "https://vex.chrry.ai",
  mode: "vex" as SiteMode,
  slug: "vex",
  favicon: "vex",
  storeSlug: "lifeOS",
  name: "Vex",
  isStoreApp: true,
  domain: "vex.chrry.ai",
  store: "https://vex.chrry.ai",
  email: "iliyan@chrry.ai",
  description: "Your AI-Powered Life",
  logo: "🤖",
  primaryColor: "#6366F1", // Indigo
  links: {
    github: "https://github.com/chrryAI/vex",
    docs: "https://vex.chrry.ai/docs",
  },
  features: [
    {
      title: "LifeOS",
      description: "AI-powered life management system",
      icon: "🧠",
      link: "/lifeOS",
      isOpenSource: true,
    },
    {
      title: "AI Agents",
      description: "Custom AI agents for any task",
      icon: "🤖",
      link: "/lifeOS",
      isOpenSource: true,
    },
    {
      title: "Collaboration",
      description: "Real-time AI collaboration",
      icon: "👥",
      link: "/threads",
      isOpenSource: true,
    },
    {
      title: "Browser Extension",
      description: "AI assistant in your browser",
      icon: "🔌",
      link: "https://chrome.google.com/webstore",
      isOpenSource: true,
    },
  ],
  chromeWebStoreUrl:
    "https://chromewebstore.google.com/detail/vex-🍒/enpllenkofnbmnflnlkbomkcilamjgac",
  about: {
    intro:
      "Vex is your intelligent AI-powered life assistant designed to help you accomplish tasks efficiently and stay organized. From managing your daily routines to collaborating with AI agents - Vex is built to empower your productivity.",
    intro2:
      "With per-chat instructions, thread artifacts for document memory, and real-time collaboration features - Vex learns your context, remembers your files, and works seamlessly with you.",
    approach: {
      title: "Our Philosophy",
      content:
        "We believe AI should enhance your life, not complicate it. Vex provides complete transparency about how our AI works, what data we use, and how we charge for services. Clear usage limits, honest pricing, and straightforward capabilities - you always know what to expect.",
    },
    platforms: {
      title: "Multi-Platform AI Assistant",
      content:
        "Vex is designed as a true multi-platform experience - available across web, mobile, and browser extensions as first-class citizens.",
      web: {
        title: "🌐 Web Application",
        content:
          "Full-featured web experience with real-time collaboration, thread management, and all AI capabilities accessible from any browser.",
      },
      pwa: {
        title: "📱 Progressive Web App (PWA)",
        content:
          "Install Vex as a native app on your mobile device or desktop. Offline capabilities, push notifications, and seamless sync across all your devices.",
      },
      chrome: {
        title: "🧩 Chrome Extension",
        content:
          "Right-click context menu integration with sidebar AI assistant. Summarize, fact-check, write replies, and check grammar on any webpage without switching tabs.",
      },
    },
  },
}

const burn = {
  url: "https://burn.chrry.ai",
  mode: "burn" as SiteMode,
  slug: "burn",
  favicon: "burn",
  storeSlug: "blossom",
  name: "Burn",
  isStoreApp: false,
  chromeWebStoreUrl:
    "https://chromewebstore.google.com/detail/burn-🍒/lfokfhplbjckmfmbakfgpkhaanfencah",
  domain: "burn.chrry.ai",
  store: "https://chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "Anonymous AI chat. No login required. Guest subscriptions, private credits, anonymous agents. Maximum privacy guaranteed.",
  logo: "🔥",
  primaryColor: "#F97316", // Orange/fire color
  links: {
    github: "https://github.com/chrryAI/vex",
    docs: "https://burn.chrry.ai/docs",
  },
  features: [
    {
      title: "No Account Required",
      description: "Use AI without creating an account",
      icon: "🚫",
      link: "/",
      isOpenSource: true,
    },
    {
      title: "Guest Subscriptions",
      description: "Subscribe without login via Stripe",
      icon: "💳",
      link: "/subscribe",
      isOpenSource: true,
    },
    {
      title: "Anonymous Credits",
      description: "Buy credits with no account",
      icon: "💰",
      link: "/credits",
      isOpenSource: true,
    },
    {
      title: "Maximum Privacy",
      description: "No tracking, no data collection",
      icon: "🔒",
      link: "/privacy",
      isOpenSource: true,
    },
    {
      title: "Anonymous Agents",
      description: "Create AI agents without login",
      icon: "🤖",
      link: "/agents",
      isOpenSource: true,
    },
    {
      title: "Burn Mode",
      description: "Ephemeral sessions - data deleted on close",
      icon: "🔥",
      link: "/burn",
      isOpenSource: true,
    },
    {
      title: "Browser Extension",
      description: "Anonymous AI in your browser",
      icon: "🔌",
      link: "https://chrome.google.com/webstore",
      isOpenSource: true,
    },
  ],
}

// E2E testing environment (same as vex but with e2e domain)
const e2eVex = {
  ...vex,
  url: "https://e2e.chrry.ai",
  domain: "e2e.chrry.ai",
  // store: "https://e2e.chrry.ai",
}

const _tribe = {
  ...zarathustra,
  mode: "tribe" as SiteMode,
  name: "Tribe",
  url: "https://tribe.chrry.ai",
  domain: "tribe.chrry.ai",
  isTribe: true,
}

const staging = {
  ...chrryAI,
  url: "https://staging.chrry.ai",
  domain: "staging.chrry.ai",
}

const sushi = {
  url: "https://sushi.chrry.ai",
  mode: "sushi" as SiteMode,
  slug: "sushi",
  favicon: "sushi",
  storeSlug: "sushiStore",
  chromeWebStoreUrl:
    "https://chrome.google.com/webstore/detail/sushi-🍒/fkblifhgfkmdccjkailndfokadjinabn",
  name: "Sushi",
  isStoreApp: true,
  domain: "sushi.chrry.ai",
  store: "https://sushi.chrry.ai",
  email: "iliyan@chrry.ai",
  description:
    "AI coding assistant for generation, debugging & architecture. Production-ready code in seconds. Built for developers.",
  logo: "🍣",
  primaryColor: "#10B981", // Emerald green (coding/terminal theme)
  links: {
    github: "https://github.com/chrryAI/vex",
    docs: "https://sushi.chrry.ai/docs",
  },
  features: [
    {
      title: "Sushi Coder",
      description: "Generate production-ready code in seconds",
      icon: "⚡",
      link: "/coder",
      isOpenSource: true,
    },
    {
      title: "Sushi Debugger",
      description: "Find and fix bugs with AI precision",
      icon: "🐛",
      link: "/debugger",
      isOpenSource: true,
    },
    {
      title: "Sushi Architect",
      description: "Design scalable system architectures",
      icon: "🏗️",
      link: "/architect",
      isOpenSource: true,
    },
    {
      title: "Multi-Language Support",
      description: "Python, JavaScript, Rust, Go, and more",
      icon: "🌍",
      link: "/languages",
      isOpenSource: true,
    },
    {
      title: "Framework Expertise",
      description: "React, Next.js, Django, FastAPI mastery",
      icon: "�",
      link: "/frameworks",
      isOpenSource: true,
    },
    {
      title: "Code Review",
      description: "AI-powered code analysis and suggestions",
      icon: "�",
      link: "/review",
      isOpenSource: true,
    },
  ],
}

const grape = {
  url: "https://grape.chrry.ai",
  mode: "grape" as SiteMode,
  chromeWebStoreUrl:
    "https://chromewebstore.google.com/detail/grape-🍒/kiplpljdjejcnmlfnkocbjbbcoiegjob",
  slug: "grape",
  favicon: "grape",
  storeSlug: "wine",
  name: "Grape",
  isStoreApp: false,
  domain: "grape.chrry.ai",
  store: "https://grape.chrry.ai",
  email: "iliyan@chrry.ai",
  description: "Discover apps, earn credits. Give feedback with Pear 🍐",
  logo: "🍇",
  primaryColor: "#9333EA", // Purple
  links: {
    github: "https://github.com/chrryAI/vex",
    docs: "https://grape.chrry.ai/docs",
  },
  features: [
    {
      title: "App Discovery",
      description: "Explore curated AI applications",
      icon: "🔍",
      link: "/explore",
      isOpenSource: true,
    },
    {
      title: "Pear Feedback",
      description: "Earn credits for quality feedback",
      icon: "🍐",
      link: "/feedback",
      isOpenSource: true,
    },
    {
      title: "Credit System",
      description: "Get rewarded for contributions",
      icon: "💰",
      link: "/credits",
      isOpenSource: true,
    },
    {
      title: "App Ratings",
      description: "Community-driven app reviews",
      icon: "⭐",
      link: "/ratings",
      isOpenSource: true,
    },
    {
      title: "Try Apps",
      description: "Test apps before installing",
      icon: "🎯",
      link: "/try",
      isOpenSource: true,
    },
    {
      title: "White Label",
      description: "Customize for your brand",
      icon: "🎨",
      link: "/white-label",
      isOpenSource: true,
    },
  ],
}

export interface SiteConfig {
  mode: SiteMode
  slug: string
  chromeWebStoreUrl?: string
  storeSlug: string
  favicon?: string
  name: string
  domain: string
  store: string
  url: string
  isTribe?: boolean
  description: string
  version?: string
  email: string
  logo: string
  primaryColor: string
  links: {
    github?: string
    npm?: string
    docs?: string
    demo?: string
  }
  features: Array<{
    title: string
    description: string
    icon: string
    link?: string
    isOpenSource?: boolean
  }>
  about?: {
    intro: string
    intro2?: string
    approach?: {
      title: string
      content: string
    }
    platforms?: {
      title: string
      content: string
      web?: {
        title: string
        content: string
      }
      pwa?: {
        title: string
        content: string
      }
      chrome?: {
        title: string
        content: string
      }
    }
  }
}

export const extensions = [
  "https://focus.chrry.ai",
  "https://chrry.dev",
  "https://vex.chrry.ai",
  "https://chrry.ai",
  "https://popcorn.chrry.ai",
]

type SiteTranslation = {
  title: string
  description: string
}

type SiteTranslationCatalog = Record<string, SiteTranslation> & {
  en: SiteTranslation
}

const siteTranslations: Record<SiteMode, SiteTranslationCatalog> = {
  vex: {
    en: {
      title: "Vex - Your Personal AI Assistant",
      description:
        "Chat with your personal AI assistant. Collaborate with teammates, stay in context, and get things done faster across languages.",
    },
    de: {
      title: "Vex - Dein persönlicher KI-Assistent",
      description:
        "Chatte mit deinem persönlichen KI-Assistenten. Arbeite mit Teamkollegen zusammen, bleibe im Kontext und erledige Aufgaben schneller in allen Sprachen.",
    },
    fr: {
      title: "Vex - Votre Assistant IA Personnel",
      description:
        "Chattez avec votre assistant IA personnel. Collaborez avec vos coéquipiers, restez dans le contexte et accomplissez plus rapidement dans toutes les langues.",
    },
    ja: {
      title: "Vex - あなたの個人AIアシスタント",
      description:
        "個人AIアシスタントとチャット。チームメイトと協力し、コンテキストを保持し、あらゆる言語でより速く作業を完了。",
    },
    ko: {
      title: "Vex - 당신의 개인 AI 어시스턴트",
      description:
        "개인 AI 어시스턴트와 채팅하세요. 팀원들과 협업하고, 맥락을 유지하며, 모든 언어로 더 빠르게 작업을 완료하세요.",
    },
    pt: {
      title: "Vex - Seu Assistente de IA Pessoal",
      description:
        "Converse com seu assistente de IA pessoal. Colabore com colegas de equipe, mantenha o contexto e realize tarefas mais rapidamente em todos os idiomas.",
    },
    es: {
      title: "Vex - Tu Asistente de IA Personal",
      description:
        "Chatea con tu asistente de IA personal. Colabora con compañeros de equipo, mantén el contexto y completa tareas más rápido en todos los idiomas.",
    },
    zh: {
      title: "Vex - 您的个人AI助手",
      description:
        "与您的个人AI助手聊天。与团队成员协作，保持上下文，并以任何语言更快地完成任务。",
    },
    nl: {
      title: "Vex - Jouw Persoonlijke AI-Assistent",
      description:
        "Chat met je persoonlijke AI-assistent. Werk samen met teamgenoten, behoud context en voltooi taken sneller in alle talen.",
    },
    tr: {
      title: "Vex - Kişisel AI Asistanınız",
      description:
        "Kişisel AI asistanınızla sohbet edin. Takım arkadaşlarınızla işbirliği yapın, bağlamda kalın ve tüm dillerde görevleri daha hızlı tamamlayın.",
    },
  },
  chrryAI: {
    en: {
      title: "Chrry - AI App Marketplace",
      description:
        "Discover, create, and monetize AI applications. Launch your storefront, publish agents, and reach customers worldwide with Chrry.",
    },
    de: {
      title: "Chrry - Marktplatz für KI-Apps",
      description:
        "Entdecke, erstelle und monetarisiere KI-Anwendungen. Starte deinen Store, veröffentliche Agents und erreiche weltweit Kund*innen mit Chrry.",
    },
    fr: {
      title: "Chrry - Place de marché d'applications IA",
      description:
        "Découvrez, créez et monétisez des applications IA. Lancez votre boutique, publiez des agents et touchez des clients dans le monde entier avec Chrry.",
    },
    ja: {
      title: "Chrry - AIアプリマーケットプレイス",
      description:
        "AIアプリを発見・作成し、収益化しましょう。Chrryでストアを立ち上げ、エージェントを公開し、世界中のユーザーに届けます。",
    },
    ko: {
      title: "Chrry - AI 앱 마켓플레이스",
      description:
        "AI 애플리케이션을 발견하고 제작하며 수익화하세요. Chrry로 스토어를 열고, 에이전트를 게시하고, 전 세계 고객에게 다가가세요.",
    },
    pt: {
      title: "Chrry - Marketplace de Apps de IA",
      description:
        "Descubra, crie e monetize aplicações de IA. Lance sua loja, publique agentes e alcance clientes no mundo todo com a Chrry.",
    },
    es: {
      title: "Chrry - Marketplace de Apps de IA",
      description:
        "Descubre, crea y monetiza aplicaciones de IA. Lanza tu tienda, publica agentes y llega a clientes de todo el mundo con Chrry.",
    },
    zh: {
      title: "Chrry - AI 应用市场",
      description:
        "探索、创建并变现 AI 应用。使用 Chrry 搭建店铺、发布智能体，触达全球用户。",
    },
    nl: {
      title: "Chrry - AI-appmarktplaats",
      description:
        "Ontdek, bouw en verdien aan AI-apps. Start je eigen winkel, publiceer agents en bereik klanten wereldwijd met Chrry.",
    },
    tr: {
      title: "Chrry - Yapay Zekâ Uygulama Pazaryeri",
      description:
        "Yapay zekâ uygulamalarını keşfedin, geliştirin ve gelir elde edin. Chrry ile mağazanızı açın, ajanlar yayınlayın ve dünya çapında müşterilere ulaşın.",
    },
  },
  chrryDev: {
    en: {
      title: "Chrry - Open Source Frontend Infrastructure",
      description:
        "Build beautiful cross-platform apps with the Chrry UI framework. Access components, platform utils, and deployment-ready starter kits.",
    },
    de: {
      title: "Chrry - Open-Source-Frontend-Infrastruktur",
      description:
        "Erstelle beeindruckende plattformübergreifende Apps mit dem Chrry UI Framework. Greife auf Komponenten, Plattform-Utilities und einsatzbereite Starter-Kits zu.",
    },
    fr: {
      title: "Chrry - Infrastructure Frontend Open Source",
      description:
        "Créez de superbes applications multiplateformes avec le framework UI Chrry. Accédez aux composants, utilitaires plateforme et kits de démarrage prêts à déployer.",
    },
    ja: {
      title: "Chrry - オープンソースのフロントエンド基盤",
      description:
        "Chrry UI フレームワークで美しいクロスプラットフォームアプリを構築。コンポーネント、プラットフォームユーティリティ、デプロイ可能なスターターキットを活用しましょう。",
    },
    ko: {
      title: "Chrry - 오픈 소스 프론트엔드 인프라",
      description:
        "Chrry UI 프레임워크로 아름다운 크로스플랫폼 앱을 구축하세요. 컴포넌트, 플랫폼 유틸리티, 배포 준비가 된 스타터 키트를 이용할 수 있습니다.",
    },
    pt: {
      title: "Chrry - Infraestrutura Frontend Open Source",
      description:
        "Construa apps multiplataforma incríveis com o framework Chrry UI. Acesse componentes, utilitários de plataforma e kits de inicialização prontos para produção.",
    },
    es: {
      title: "Chrry - Infraestructura Frontend de Código Abierto",
      description:
        "Crea aplicaciones multiplataforma hermosas con el framework Chrry UI. Accede a componentes, utilidades de plataforma y kits listos para desplegar.",
    },
    zh: {
      title: "Chrry - 开源前端基础设施",
      description:
        "使用 Chrry UI 框架构建精美的跨平台应用。获取组件、平台工具和可即刻部署的入门套件。",
    },
    nl: {
      title: "Chrry - Open-source frontend-infrastructuur",
      description:
        "Bouw prachtige cross-platform apps met het Chrry UI-framework. Krijg toegang tot componenten, platformhulpmiddelen en deploy-klare starterkits.",
    },
    tr: {
      title: "Chrry - Açık Kaynak Frontend Altyapısı",
      description:
        "Chrry UI framework ile etkileyici çapraz platform uygulamalar geliştirin. Bileşenlere, platform araçlarına ve dağıtıma hazır başlangıç paketlerine erişin.",
    },
  },
  chrryStore: {
    en: {
      title: "Chrry Store - Launch Your AI Marketplace",
      description:
        "Create branded AI stores with custom domains, revenue sharing, and analytics powered by the Chrry platform.",
    },
    de: {
      title: "Chrry Store - Starte deinen KI-Marktplatz",
      description:
        "Erstelle gebrandete KI-Stores mit eigenen Domains, Umsatzbeteiligung und Analysen – powered by Chrry.",
    },
    fr: {
      title: "Chrry Store - Lancez votre place de marché IA",
      description:
        "Créez des boutiques IA à votre image avec domaines personnalisés, partage de revenus et analytics grâce à la plateforme Chrry.",
    },
    ja: {
      title: "Chrry Store - AIマーケットプレイスを立ち上げる",
      description:
        "カスタムドメインや収益分配、分析を備えたブランドAIストアをChrryで構築しましょう。",
    },
    ko: {
      title: "Chrry Store - 나만의 AI 마켓플레이스를 시작하세요",
      description:
        "맞춤 도메인, 수익 공유, 분석 기능을 갖춘 브랜드형 AI 스토어를 Chrry로 구축하세요.",
    },
    pt: {
      title: "Chrry Store - Lance seu marketplace de IA",
      description:
        "Crie lojas de IA com marca própria, domínios personalizados, revenue sharing e analytics com a plataforma Chrry.",
    },
    es: {
      title: "Chrry Store - Lanza tu marketplace de IA",
      description:
        "Crea tiendas de IA con tu marca, dominios personalizados, reparto de ingresos y analíticas con la plataforma Chrry.",
    },
    zh: {
      title: "Chrry Store - 启动你的 AI 市场",
      description:
        "借助 Chrry 平台，打造拥有自定义域名、收益分成与分析的品牌化 AI 商城。",
    },
    nl: {
      title: "Chrry Store - Start jouw AI-marktplaats",
      description:
        "Bouw merkwaardige AI-winkels met eigen domeinen, omzetdeling en analytics op het Chrry-platform.",
    },
    tr: {
      title: "Chrry Store - Yapay Zekâ Pazaryerinizi Başlatın",
      description:
        "Chrry platformu ile özel alan adları, gelir paylaşımı ve analizlere sahip markalı AI mağazaları oluşturun.",
    },
  },
  focus: {
    en: {
      title: "Focus - AI Productivity Assistant",
      description:
        "Master your time and achieve your goals with AI-powered focus sessions, task management, and productivity insights.",
    },
    de: {
      title: "Focus - KI-Produktivitätsassistent",
      description:
        "Meistere deine Zeit und erreiche deine Ziele mit KI-gestützten Fokus-Sessions, Aufgabenverwaltung und Produktivitätseinblicken.",
    },
    fr: {
      title: "Focus - Assistant de productivité IA",
      description:
        "Maîtrisez votre temps et atteignez vos objectifs avec des sessions de concentration IA, gestion des tâches et insights de productivité.",
    },
    ja: {
      title: "Focus - AI生産性アシスタント",
      description:
        "AIを活用した集中セッション、タスク管理、生産性インサイトで時間を管理し、目標を達成しましょう。",
    },
    ko: {
      title: "Focus - AI 생산성 어시스턴트",
      description:
        "AI 기반 집중 세션, 작업 관리, 생산성 인사이트로 시간을 마스터하고 목표를 달성하세요.",
    },
    pt: {
      title: "Focus - Assistente de Produtividade IA",
      description:
        "Domine seu tempo e alcance seus objetivos com sessões de foco IA, gerenciamento de tarefas e insights de produtividade.",
    },
    es: {
      title: "Focus - Asistente de Productividad IA",
      description:
        "Domina tu tiempo y alcanza tus metas con sesiones de enfoque IA, gestión de tareas e insights de productividad.",
    },
    zh: {
      title: "Focus - AI 生产力助手",
      description:
        "通过 AI 驱动的专注会话、任务管理和生产力洞察，掌控时间并实现目标。",
    },
    nl: {
      title: "Focus - AI-productiviteitsassistent",
      description:
        "Beheers je tijd en bereik je doelen met AI-aangedreven focussessies, taakbeheer en productiviteitsinzichten.",
    },
    tr: {
      title: "Focus - Yapay Zekâ Üretkenlik Asistanı",
      description:
        "Yapay zeka destekli odaklanma oturumları, görev yönetimi ve üretkenlik içgörüleriyle zamanınızı yönetin ve hedeflerinize ulaşın.",
    },
  },
  atlas: {
    en: {
      title: "Atlas - Geographic AI Memory Layer",
      description:
        "Save locations with AI context, create geo-tagged notes, and discover local AI resources. Your intelligent geographic companion.",
    },
    de: {
      title: "Atlas - Geografische KI-Gedächtnisebene",
      description:
        "Speichern Sie Orte mit KI-Kontext, erstellen Sie geo-markierte Notizen und entdecken Sie lokale KI-Ressourcen. Ihr intelligenter geografischer Begleiter.",
    },
    fr: {
      title: "Atlas - Couche de mémoire géographique IA",
      description:
        "Enregistrez des lieux avec contexte IA, créez des notes géo-marquées et découvrez des ressources IA locales. Votre compagnon géographique intelligent.",
    },
    ja: {
      title: "Atlas - 地理的AIメモリレイヤー",
      description:
        "AIコンテキストで場所を保存し、ジオタグ付きメモを作成し、ローカルAIリソースを発見。あなたのインテリジェントな地理的コンパニオン。",
    },
    ko: {
      title: "Atlas - 지리적 AI 메모리 레이어",
      description:
        "AI 컨텍스트로 위치를 저장하고, 지오태그된 노트를 만들고, 로컬 AI 리소스를 발견하세요. 당신의 지능형 지리적 동반자.",
    },
    pt: {
      title: "Atlas - Camada de Memória Geográfica IA",
      description:
        "Salve locais com contexto de IA, crie notas geolocalizadas e descubra recursos de IA locais. Seu companheiro geográfico inteligente.",
    },
    es: {
      title: "Atlas - Capa de Memoria Geográfica IA",
      description:
        "Guarda ubicaciones con contexto IA, crea notas geoetiquetadas y descubre recursos de IA locales. Tu compañero geográfico inteligente.",
    },
    zh: {
      title: "Atlas - 地理AI记忆层",
      description:
        "使用AI上下文保存位置，创建地理标记笔记，发现本地AI资源。您的智能地理伴侣。",
    },
    nl: {
      title: "Atlas - Geografische AI-geheugenlaag",
      description:
        "Bewaar locaties met AI-context, maak geo-getagde notities en ontdek lokale AI-bronnen. Jouw intelligente geografische metgezel.",
    },
    tr: {
      title: "Atlas - Coğrafi Yapay Zeka Hafıza Katmanı",
      description:
        "Yapay zeka bağlamıyla konumları kaydedin, coğrafi etiketli notlar oluşturun ve yerel yapay zeka kaynaklarını keşfedin. Akıllı coğrafi arkadaşınız.",
    },
  },
  istanbul: {
    en: {
      title: "Istanbul - AI Assistant for Turkey",
      description:
        "Your personal AI assistant designed for Istanbul and Turkey. Chat in Turkish, collaborate locally, and get things done faster.",
    },
    de: {
      title: "Istanbul - KI-Assistent für die Türkei",
      description:
        "Dein persönlicher KI-Assistent für Istanbul und die Türkei. Chatte auf Türkisch, arbeite lokal zusammen und erledige Aufgaben schneller.",
    },
    fr: {
      title: "Istanbul - Assistant IA pour la Turquie",
      description:
        "Votre assistant IA personnel conçu pour Istanbul et la Turquie. Chattez en turc, collaborez localement et accomplissez plus rapidement.",
    },
    ja: {
      title: "Istanbul - トルコ向けAIアシスタント",
      description:
        "イスタンブールとトルコ向けに設計されたパーソナルAIアシスタント。トルコ語でチャットし、ローカルで協力し、より速く作業を完了。",
    },
    ko: {
      title: "Istanbul - 터키를 위한 AI 어시스턴트",
      description:
        "이스탄불과 터키를 위해 설계된 개인 AI 어시스턴트. 터키어로 채팅하고, 현지에서 협업하며, 더 빠르게 작업을 완료하세요.",
    },
    pt: {
      title: "Istanbul - Assistente de IA para a Turquia",
      description:
        "Seu assistente de IA pessoal projetado para Istambul e Turquia. Converse em turco, colabore localmente e realize tarefas mais rapidamente.",
    },
    es: {
      title: "Istanbul - Asistente de IA para Turquía",
      description:
        "Tu asistente de IA personal diseñado para Estambul y Turquía. Chatea en turco, colabora localmente y completa tareas más rápido.",
    },
    zh: {
      title: "Istanbul - 土耳其AI助手",
      description:
        "为伊斯坦布尔和土耳其设计的个人AI助手。用土耳其语聊天，本地协作，更快地完成任务。",
    },
    nl: {
      title: "Istanbul - AI-assistent voor Turkije",
      description:
        "Je persoonlijke AI-assistent ontworpen voor Istanbul en Turkije. Chat in het Turks, werk lokaal samen en voltooi taken sneller.",
    },
    tr: {
      title: "Istanbul - Türkiye için Yapay Zeka Asistanı",
      description:
        "İstanbul ve Türkiye için tasarlanmış kişisel yapay zeka asistanınız. Türkçe sohbet edin, yerel olarak işbirliği yapın ve işleri daha hızlı halledin.",
    },
  },
  amsterdam: {
    en: {
      title: "Amsterdam - AI Assistant for Netherlands",
      description:
        "Your personal AI assistant designed for Amsterdam and the Netherlands. Chat in Dutch, collaborate locally, and get things done faster.",
    },
    de: {
      title: "Amsterdam - KI-Assistent für die Niederlande",
      description:
        "Dein persönlicher KI-Assistent für Amsterdam und die Niederlande. Chatte auf Niederländisch, arbeite lokal zusammen und erledige Aufgaben schneller.",
    },
    fr: {
      title: "Amsterdam - Assistant IA pour les Pays-Bas",
      description:
        "Votre assistant IA personnel conçu pour Amsterdam et les Pays-Bas. Chattez en néerlandais, collaborez localement et accomplissez plus rapidement.",
    },
    ja: {
      title: "Amsterdam - オランダ向けAIアシスタント",
      description:
        "アムステルダムとオランダ向けに設計されたパーソナルAIアシスタント。オランダ語でチャットし、ローカルで協力し、より速く作業を完了。",
    },
    ko: {
      title: "Amsterdam - 네덜란드를 위한 AI 어시스턴트",
      description:
        "암스테르담과 네덜란드를 위해 설계된 개인 AI 어시스턴트. 네덜란드어로 채팅하고, 현지에서 협업하며, 더 빠르게 작업을 완료하세요.",
    },
    pt: {
      title: "Amsterdam - Assistente de IA para os Países Baixos",
      description:
        "Seu assistente de IA pessoal projetado para Amsterdã e os Países Baixos. Converse em holandês, colabore localmente e realize tarefas mais rapidamente.",
    },
    es: {
      title: "Amsterdam - Asistente de IA para los Países Bajos",
      description:
        "Tu asistente de IA personal diseñado para Ámsterdam y los Países Bajos. Chatea en neerlandés, colabora localmente y completa tareas más rápido.",
    },
    zh: {
      title: "Amsterdam - 荷兰AI助手",
      description:
        "为阿姆斯特丹和荷兰设计的个人AI助手。用荷兰语聊天，本地协作，更快地完成任务。",
    },
    nl: {
      title: "Amsterdam - AI-assistent voor Nederland",
      description:
        "Je persoonlijke AI-assistent ontworpen voor Amsterdam en Nederland. Chat in het Nederlands, werk lokaal samen en voltooi taken sneller.",
    },
    tr: {
      title: "Amsterdam - Hollanda için Yapay Zeka Asistanı",
      description:
        "Amsterdam ve Hollanda için tasarlanmış kişisel yapay zeka asistanınız. Felemenkçe sohbet edin, yerel olarak işbirliği yapın ve işleri daha hızlı halledin.",
    },
  },
  sushi: {
    en: {
      title: "Sushi - Code-First AI Platform",
      description:
        "AI-powered coding platform for developers. Generate production-ready code, debug with precision, and architect scalable systems.",
    },
    de: {
      title: "Sushi - Code-First KI-Plattform",
      description:
        "KI-gestützte Coding-Plattform für Entwickler. Generiere produktionsreifen Code, debugge präzise und entwerfe skalierbare Systeme.",
    },
    fr: {
      title: "Sushi - Plateforme IA Code-First",
      description:
        "Plateforme de codage alimentée par l'IA pour les développeurs. Générez du code prêt pour la production, déboguez avec précision et concevez des systèmes évolutifs.",
    },
    ja: {
      title: "Sushi - コードファーストAIプラットフォーム",
      description:
        "開発者向けAI駆動コーディングプラットフォーム。本番環境対応コードを生成し、精密にデバッグし、スケーラブルなシステムを設計。",
    },
    ko: {
      title: "Sushi - 코드 우선 AI 플랫폼",
      description:
        "개발자를 위한 AI 기반 코딩 플랫폼. 프로덕션 준비 코드를 생성하고, 정밀하게 디버그하며, 확장 가능한 시스템을 설계하세요.",
    },
    pt: {
      title: "Sushi - Plataforma de IA Code-First",
      description:
        "Plataforma de codificação com IA para desenvolvedores. Gere código pronto para produção, depure com precisão e projete sistemas escaláveis.",
    },
    es: {
      title: "Sushi - Plataforma de IA Code-First",
      description:
        "Plataforma de codificación con IA para desarrolladores. Genera código listo para producción, depura con precisión y diseña sistemas escalables.",
    },
    zh: {
      title: "Sushi - 代码优先AI平台",
      description:
        "面向开发者的AI驱动编码平台。生成生产就绪代码，精确调试，设计可扩展系统。",
    },
    nl: {
      title: "Sushi - Code-First AI-platform",
      description:
        "AI-aangedreven codeerplatform voor ontwikkelaars. Genereer productie-klare code, debug met precisie en ontwerp schaalbare systemen.",
    },
    tr: {
      title: "Sushi - Kod Öncelikli Yapay Zeka Platformu",
      description:
        "Geliştiriciler için yapay zeka destekli kodlama platformu. Üretime hazır kod oluşturun, hassas hata ayıklama yapın ve ölçeklenebilir sistemler tasarlayın.",
    },
  },
  e2eVex: {
    en: {
      title: "Vex - E2E Testing",
      description: "E2E Testing Environment for Vex.",
    },
  },
  staging: {
    en: {
      title: "Staging - AI Assistant for Development",
      description:
        "Your personal AI assistant designed for Staging and Development. Chat in English, collaborate locally, and get things done faster.",
    },
  },
  tokyo: {
    en: {
      title: "Tokyo - AI Assistant for Japan",
      description:
        "Your personal AI assistant designed for Tokyo and Japan. Chat in Japanese, collaborate locally, and get things done faster.",
    },
    de: {
      title: "Tokyo - KI-Assistent für Japan",
      description:
        "Dein persönlicher KI-Assistent für Tokio und Japan. Chatte auf Japanisch, arbeite lokal zusammen und erledige Aufgaben schneller.",
    },
    fr: {
      title: "Tokyo - Assistant IA pour le Japon",
      description:
        "Votre assistant IA personnel conçu pour Tokyo et le Japon. Chattez en japonais, collaborez localement et accomplissez plus rapidement.",
    },
    ja: {
      title: "Tokyo - 日本向けAIアシスタント",
      description:
        "東京と日本向けに設計されたパーソナルAIアシスタント。日本語でチャットし、ローカルで協力し、より速く作業を完了。",
    },
    ko: {
      title: "Tokyo - 일본을 위한 AI 어시스턴트",
      description:
        "도쿄와 일본을 위해 설계된 개인 AI 어시스턴트. 일본어로 채팅하고, 현지에서 협업하며, 더 빠르게 작업을 완료하세요.",
    },
    pt: {
      title: "Tokyo - Assistente de IA para o Japão",
      description:
        "Seu assistente de IA pessoal projetado para Tóquio e Japão. Converse em japonês, colabore localmente e realize tarefas mais rapidamente.",
    },
    es: {
      title: "Tokyo - Asistente de IA para Japón",
      description:
        "Tu asistente de IA personal diseñado para Tokio y Japón. Chatea en japonés, colabora localmente y completa tareas más rápido.",
    },
    zh: {
      title: "Tokyo - 日本AI助手",
      description:
        "为东京和日本设计的个人AI助手。用日语聊天，本地协作，更快地完成任务。",
    },
    nl: {
      title: "Tokyo - AI-assistent voor Japan",
      description:
        "Je persoonlijke AI-assistent ontworpen voor Tokyo en Japan. Chat in het Japans, werk lokaal samen en voltooi taken sneller.",
    },
    tr: {
      title: "Tokyo - Japonya için Yapay Zeka Asistanı",
      description:
        "Tokyo ve Japonya için tasarlanmış kişisel yapay zeka asistanınız. Japonca sohbet edin, yerel olarak işbirliği yapın ve işleri daha hızlı halledin.",
    },
  },
  newYork: {
    en: {
      title: "New York - AI Assistant for NYC",
      description:
        "Your personal AI assistant designed for New York City and the USA. Chat, collaborate locally, and get things done faster in the city that never sleeps.",
    },
    de: {
      title: "New York - KI-Assistent für NYC",
      description:
        "Dein persönlicher KI-Assistent für New York City und die USA. Chatte, arbeite lokal zusammen und erledige Aufgaben schneller in der Stadt, die niemals schläft.",
    },
    fr: {
      title: "New York - Assistant IA pour NYC",
      description:
        "Votre assistant IA personnel conçu pour New York et les États-Unis. Chattez, collaborez localement et accomplissez plus rapidement dans la ville qui ne dort jamais.",
    },
    ja: {
      title: "New York - ニューヨーク向けAIアシスタント",
      description:
        "ニューヨーク市とアメリカ向けに設計されたパーソナルAIアシスタント。眠らない街でチャット、ローカル協力、より速く作業を完了。",
    },
    ko: {
      title: "New York - 뉴욕을 위한 AI 어시스턴트",
      description:
        "뉴욕시와 미국을 위해 설계된 개인 AI 어시스턴트. 잠들지 않는 도시에서 채팅하고, 현지에서 협업하며, 더 빠르게 작업을 완료하세요.",
    },
    pt: {
      title: "New York - Assistente de IA para NYC",
      description:
        "Seu assistente de IA pessoal projetado para Nova York e os EUA. Converse, colabore localmente e realize tarefas mais rapidamente na cidade que nunca dorme.",
    },
    es: {
      title: "New York - Asistente de IA para NYC",
      description:
        "Tu asistente de IA personal diseñado para Nueva York y EE.UU. Chatea, colabora localmente y completa tareas más rápido en la ciudad que nunca duerme.",
    },
    zh: {
      title: "New York - 纽约AI助手",
      description:
        "为纽约市和美国设计的个人AI助手。在不夜城中聊天、本地协作、更快地完成任务。",
    },
    nl: {
      title: "New York - AI-assistent voor NYC",
      description:
        "Je persoonlijke AI-assistent ontworpen voor New York City en de VS. Chat, werk lokaal samen en voltooi taken sneller in de stad die nooit slaapt.",
    },
    tr: {
      title: "New York - New York için Yapay Zeka Asistanı",
      description:
        "New York City ve ABD için tasarlanmış kişisel yapay zeka asistanınız. Hiç uyumayan şehirde sohbet edin, yerel olarak işbirliği yapın ve işleri daha hızlı halledin.",
    },
  },
  popcorn: {
    en: {
      title: "Popcorn - Cinema Universe",
      description:
        "Step into the premier hub for iconic films, genre-defining storytelling, and cinematic AI companions that decode every frame.",
    },
    de: {
      title: "Popcorn - Cinema Universum",
      description:
        "Tauche ein in den führenden Hub für ikonische Filme, genredefinierende Geschichten und kinoreif KI-Begleiter, die jeden Frame entschlüsseln.",
    },
    fr: {
      title: "Popcorn - Univers Cinématographique",
      description:
        "Entrez dans le hub premier pour les films iconiques, les histoires définissant les genres et les compagnons IA cinématographiques qui décodent chaque image.",
    },
    ja: {
      title: "Popcorn - シネマ・ユニバース",
      description:
        "象徴的な映画、ジャンルを定義するストーリーテリング、すべてのフレームを解読する映画AIコンパニオンのプレミアハブに足を踏み入れましょう。",
    },
    ko: {
      title: "Popcorn - 시네마 유니버스",
      description:
        "상징적인 영화, 장르를 정의하는 스토리텔링, 모든 프레임을 해독하는 영화 AI 컴패니언의 최고 허브로 들어가세요.",
    },
    pt: {
      title: "Popcorn - Universo do Cinema",
      description:
        "Entre no principal hub para filmes icônicos, narrativas que definem gêneros e companheiros de IA cinematográficos que decodificam cada quadro.",
    },
    es: {
      title: "Popcorn - Universo Cinematográfico",
      description:
        "Entra en el hub principal para películas icónicas, narrativas que definen géneros y compañeros de IA cinematográficos que decodifican cada fotograma.",
    },
    zh: {
      title: "Popcorn - 电影宇宙",
      description:
        "进入标志性电影、定义流派的叙事和解码每一帧的电影AI伴侣的首要中心。",
    },
    nl: {
      title: "Popcorn - Cinema Universum",
      description:
        "Stap binnen in de belangrijkste hub voor iconische films, genrebepalende verhalen en cinematografische AI-metgezellen die elk frame ontcijferen.",
    },
    tr: {
      title: "Popcorn - Sinema Evreni",
      description:
        "İkonik filmler, tür tanımlayan hikaye anlatımı ve her kareyi çözen sinematik yapay zeka arkadaşları için önde gelen merkeze adım atın.",
    },
  },
  zarathustra: {
    en: {
      title: "Zarathustra - Philosophy Guide",
      description:
        "Your AI philosophy guide. Explore Nietzsche, existentialism, and timeless wisdom through intelligent conversation.",
    },
    de: {
      title: "Zarathustra - Philosophie-Führer",
      description:
        "Dein KI-Philosophie-Führer. Erkunde Nietzsche, Existenzialismus und zeitlose Weisheit durch intelligente Gespräche.",
    },
    fr: {
      title: "Zarathustra - Guide Philosophique",
      description:
        "Votre guide philosophique IA. Explorez Nietzsche, l'existentialisme et la sagesse intemporelle à travers des conversations intelligentes.",
    },
    ja: {
      title: "Zarathustra - 哲学ガイド",
      description:
        "あなたのAI哲学ガイド。インテリジェントな会話を通じてニーチェ、実存主義、時代を超えた知恵を探求しましょう。",
    },
    ko: {
      title: "Zarathustra - 철학 가이드",
      description:
        "당신의 AI 철학 가이드. 지능적인 대화를 통해 니체, 실존주의, 시대를 초월한 지혜를 탐구하세요.",
    },
    pt: {
      title: "Zarathustra - Guia de Filosofia",
      description:
        "Seu guia de filosofia com IA. Explore Nietzsche, existencialismo e sabedoria atemporal através de conversas inteligentes.",
    },
    es: {
      title: "Zarathustra - Guía de Filosofía",
      description:
        "Tu guía de filosofía con IA. Explora Nietzsche, el existencialismo y la sabiduría atemporal a través de conversaciones inteligentes.",
    },
    zh: {
      title: "Zarathustra - 哲学指南",
      description:
        "您的AI哲学指南。通过智能对话探索尼采、存在主义和永恒的智慧。",
    },
    nl: {
      title: "Zarathustra - Filosofie Gids",
      description:
        "Je AI-filosofiegids. Verken Nietzsche, existentialisme en tijdloze wijsheid door intelligente gesprekken.",
    },
    tr: {
      title: "Zarathustra - Felsefe Rehberi",
      description:
        "Yapay zeka felsefe rehberiniz. Akıllı sohbetler aracılığıyla Nietzsche, varoluşçuluk ve zamansız bilgeliği keşfedin.",
    },
  },
  search: {
    en: {
      title: "Search - AI-Powered Web Search",
      description:
        "AI-powered real-time web search with cited sources. Get instant, accurate answers with verifiable references worldwide.",
    },
    de: {
      title: "Search - KI-gestützte Websuche",
      description:
        "KI-gestützte Echtzeit-Websuche mit zitierten Quellen. Erhalten Sie sofortige, genaue Antworten mit überprüfbaren Referenzen.",
    },
    fr: {
      title: "Search - Recherche Web IA",
      description:
        "Recherche web en temps réel alimentée par l'IA avec sources citées. Obtenez des réponses instantanées et précises avec des références vérifiables.",
    },
    ja: {
      title: "Search - AI搭載ウェブ検索",
      description:
        "引用元付きのAI搭載リアルタイムウェブ検索。検証可能な参照で即座に正確な回答を取得。",
    },
    ko: {
      title: "Search - AI 기반 웹 검색",
      description:
        "인용 출처가 포함된 AI 기반 실시간 웹 검색. 검증 가능한 참조로 즉각적이고 정확한 답변을 얻으세요.",
    },
    pt: {
      title: "Search - Busca Web com IA",
      description:
        "Busca web em tempo real com IA e fontes citadas. Obtenha respostas instantâneas e precisas com referências verificáveis.",
    },
    es: {
      title: "Search - Búsqueda Web con IA",
      description:
        "Búsqueda web en tiempo real con IA y fuentes citadas. Obtén respuestas instantáneas y precisas con referencias verificables.",
    },
    zh: {
      title: "Search - AI驱动的网络搜索",
      description:
        "带引用来源的AI驱动实时网络搜索。获取即时、准确的答案和可验证的参考资料。",
    },
    nl: {
      title: "Search - AI-aangedreven webzoekmachine",
      description:
        "AI-aangedreven realtime webzoekmachine met geciteerde bronnen. Krijg directe, nauwkeurige antwoorden met verifieerbare referenties.",
    },
    tr: {
      title: "Search - Yapay Zeka Destekli Web Arama",
      description:
        "Alıntılanan kaynaklarla yapay zeka destekli gerçek zamanlı web arama. Doğrulanabilir referanslarla anında, doğru yanıtlar alın.",
    },
  },
  grape: {
    en: {
      title: "Grape - Discover Apps, Earn Credits",
      description:
        "Discover curated AI applications and earn credits for quality feedback with Pear. Community-driven app discovery marketplace.",
    },
    de: {
      title: "Grape - Apps entdecken, Credits verdienen",
      description:
        "Entdecken Sie kuratierte KI-Anwendungen und verdienen Sie Credits für qualitatives Feedback mit Pear. Community-getriebener App-Discovery-Marktplatz.",
    },
    fr: {
      title: "Grape - Découvrez des apps, gagnez des crédits",
      description:
        "Découvrez des applications IA sélectionnées et gagnez des crédits pour vos retours de qualité avec Pear. Marketplace de découverte d'apps communautaire.",
    },
    ja: {
      title: "Grape - アプリを発見、クレジットを獲得",
      description:
        "厳選されたAIアプリを発見し、Pearで質の高いフィードバックを提供してクレジットを獲得。コミュニティ主導のアプリ発見マーケットプレイス。",
    },
    ko: {
      title: "Grape - 앱 발견, 크레딧 획득",
      description:
        "엄선된 AI 애플리케이션을 발견하고 Pear로 양질의 피드백을 제공하여 크레딧을 획득하세요. 커뮤니티 주도 앱 발견 마켓플레이스.",
    },
    pt: {
      title: "Grape - Descubra apps, ganhe créditos",
      description:
        "Descubra aplicações de IA selecionadas e ganhe créditos por feedback de qualidade com Pear. Marketplace de descoberta de apps impulsionado pela comunidade.",
    },
    es: {
      title: "Grape - Descubre apps, gana créditos",
      description:
        "Descubre aplicaciones de IA seleccionadas y gana créditos por comentarios de calidad con Pear. Marketplace de descubrimiento de apps impulsado por la comunidad.",
    },
    zh: {
      title: "Grape - 发现应用，赚取积分",
      description:
        "发现精选的AI应用程序，通过Pear提供高质量反馈赚取积分。社区驱动的应用发现市场。",
    },
    nl: {
      title: "Grape - Ontdek apps, verdien credits",
      description:
        "Ontdek geselecteerde AI-applicaties en verdien credits voor kwalitatieve feedback met Pear. Community-gedreven app-ontdekkingsmarktplaats.",
    },
    tr: {
      title: "Grape - Uygulamaları keşfedin, kredi kazanın",
      description:
        "Seçilmiş yapay zeka uygulamalarını keşfedin ve Pear ile kaliteli geri bildirim için kredi kazanın. Topluluk odaklı uygulama keşif pazarı.",
    },
  },
  burn: {
    en: {
      title: "Burn - Anonymous AI Chat",
      description:
        "No login required. Subscribe as guest, buy credits, stay private. The world's first AI platform with guest subscriptions.",
    },
    de: {
      title: "Burn - Anonymer AI-Chat",
      description:
        "Keine Anmeldung erforderlich. Als Gast abonnieren, Credits kaufen, privat bleiben. Die weltweit erste KI-Plattform mit Gast-Abonnements.",
    },
    fr: {
      title: "Burn - Chat IA anonyme",
      description:
        "Aucune connexion requise. Abonnez-vous en tant qu'invité, achetez des crédits, restez privé. La première plateforme IA au monde avec abonnements invités.",
    },
    ja: {
      title: "Burn - 匿名AIチャット",
      description:
        "ログイン不要。ゲストとして購読、クレジット購入、プライバシー保護。世界初のゲスト購読対応AIプラットフォーム。",
    },
    ko: {
      title: "Burn - 익명 AI 채팅",
      description:
        "로그인 불필요. 게스트로 구독, 크레딧 구매, 개인정보 보호. 세계 최초 게스트 구독 지원 AI 플랫폼.",
    },
    pt: {
      title: "Burn - Chat IA anônimo",
      description:
        "Sem necessidade de login. Assine como convidado, compre créditos, mantenha-se privado. A primeira plataforma de IA do mundo com assinaturas para convidados.",
    },
    es: {
      title: "Burn - Chat IA anónimo",
      description:
        "No requiere inicio de sesión. Suscríbete como invitado, compra créditos, mantén tu privacidad. La primera plataforma de IA del mundo con suscripciones para invitados.",
    },
    zh: {
      title: "Burn - 匿名AI聊天",
      description:
        "无需登录。以访客身份订阅，购买积分，保持隐私。全球首个支持访客订阅的AI平台。",
    },
    nl: {
      title: "Burn - Anonieme AI-chat",
      description:
        "Geen login vereist. Abonneer als gast, koop credits, blijf privé. 's Werelds eerste AI-platform met gastabonnementen.",
    },
    tr: {
      title: "Burn - Anonim AI Sohbet",
      description:
        "Giriş gerekmez. Misafir olarak abone olun, kredi satın alın, gizli kalın. Misafir abonelikleri olan dünyanın ilk yapay zeka platformu.",
    },
  },
  pear: {
    en: {
      title: "Pear - AI Feedback & Credits",
      description:
        "Give feedback, earn credits. Help improve AI apps and get rewarded with Pear's AI validation system.",
    },
    de: {
      title: "Pear - KI-Feedback & Credits",
      description:
        "Gib Feedback, verdiene Credits. Hilf mit, KI-Apps zu verbessern, und werde mit dem KI-Validierungssystem von Pear belohnt.",
    },
    fr: {
      title: "Pear - Feedback IA & Crédits",
      description:
        "Donnez votre avis, gagnez des crédits. Aidez à améliorer les applications IA et soyez récompensé par le système de validation IA de Pear.",
    },
    ja: {
      title: "Pear - AIフィードバック＆クレジット",
      description:
        "フィードバックを提供してクレジットを獲得。PearのAI検証システムでAIアプリの改善に貢献し、報酬を得ましょう。",
    },
    ko: {
      title: "Pear - AI 피드백 및 크레딧",
      description:
        "피드백을 주고 크레딧을 받으세요. Pear의 AI 검증 시스템으로 AI 앱 개선을 돕고 보상을 받으세요.",
    },
    pt: {
      title: "Pear - Feedback de IA e Créditos",
      description:
        "Dê feedback, ganhe créditos. Ajude a melhorar apps de IA e seja recompensado com o sistema de validação de IA da Pear.",
    },
    es: {
      title: "Pear - Feedback de IA y Créditos",
      description:
        "Da tu opinión, gana créditos. Ayuda a mejorar las aplicaciones de IA y obtén recompensas con el sistema de validación de IA de Pear.",
    },
    zh: {
      title: "Pear - AI 反馈与积分",
      description:
        "提供反馈，赚取积分。利用 Pear 的 AI 验证系统帮助改进 AI 应用并获得奖励。",
    },
    nl: {
      title: "Pear - AI-feedback & Credits",
      description:
        "Geef feedback, verdien credits. Help AI-apps te verbeteren en word beloond met het AI-validatiesysteem van Pear.",
    },
    tr: {
      title: "Pear - Yapay Zeka Geri Bildirimi ve Krediler",
      description:
        "Geri bildirim verin, kredi kazanın. Pear'ın yapay zeka doğrulama sistemiyle AI uygulamalarını geliştirmeye yardımcı olun ve ödüllendirilin.",
    },
  },
  vault: {
    en: {
      title: "Vault - AI Financial Analytics",
      description:
        "Track expenses, manage budgets, and get financial insights with Vault's intelligent automation.",
    },
    de: {
      title: "Vault - KI-Finanzanalysen",
      description:
        "Verfolge Ausgaben, verwalte Budgets und erhalte finanzielle Einblicke mit der intelligenten Automatisierung von Vault.",
    },
    fr: {
      title: "Vault - Analyse Financière IA",
      description:
        "Suivez vos dépenses, gérez vos budgets et obtenez des informations financières grâce à l'automatisation intelligente de Vault.",
    },
    ja: {
      title: "Vault - AI金融分析",
      description:
        "Vaultのインテリジェントな自動化により、経費の追跡、予算の管理、金融インサイトの取得が可能になります。",
    },
    ko: {
      title: "Vault - AI 재무 분석",
      description:
        "Vault의 지능형 자동화로 지출을 추적하고, 예산을 관리하며, 재무 통찰력을 얻으세요.",
    },
    pt: {
      title: "Vault - Análise Financeira com IA",
      description:
        "Acompanhe despesas, gerencie orçamentos e obtenha insights financeiros com a automação inteligente do Vault.",
    },
    es: {
      title: "Vault - Análisis Financiero con IA",
      description:
        "Realiza un seguimiento de gastos, gestiona presupuestos y obtén información financiera con la automatización inteligente de Vault.",
    },
    zh: {
      title: "Vault - AI 财务分析",
      description:
        "利用 Vault 的智能自动化功能跟踪支出、管理预算并获取财务洞察。",
    },
    nl: {
      title: "Vault - AI-financiele analyses",
      description:
        "Houd uitgaven bij, beheer budgetten en krijg financieel inzicht met de intelligente automatisering van Vault.",
    },
    tr: {
      title: "Vault - Yapay Zeka Finansal Analitik",
      description:
        "Vault'un akıllı otomasyonu ile harcamaları takip edin, bütçeleri yönetin ve finansal içgörüler elde edin.",
    },
  },
  nebula: {
    en: {
      title: "Nebula - Science & Exploration AI",
      description:
        "Explore quantum computing, astrophysics, and advanced mathematics with AI. Build circuits, solve physics problems, and discover the universe.",
    },
    de: {
      title: "Nebula - KI für Wissenschaft & Entdeckung",
      description:
        "Erkunde Quantencomputing, Astrophysik und fortgeschrittene Mathematik mit KI. Baue Schaltkreise, löse Physikprobleme und entdecke das Universum.",
    },
    fr: {
      title: "Nebula - IA Science & Exploration",
      description:
        "Explorez l'informatique quantique, l'astrophysique et les mathématiques avancées avec l'IA. Construisez des circuits, résolvez des problèmes de physique et découvrez l'univers.",
    },
    ja: {
      title: "Nebula - 科学・探求AI",
      description:
        "AIで量子コンピューティング、天体物理学、高度な数学を探求。回路を構築し、物理問題を解き、宇宙を発見しよう。",
    },
    ko: {
      title: "Nebula - 과학 & 탐구 AI",
      description:
        "AI로 양자 컴퓨팅, 천체물리학, 고급 수학을 탐구하세요. 회로를 만들고, 물리 문제를 풀고, 우주를 발견하세요.",
    },
    pt: {
      title: "Nebula - IA de Ciência & Exploração",
      description:
        "Explore computação quântica, astrofísica e matemática avançada com IA. Construa circuitos, resolva problemas de física e descubra o universo.",
    },
    es: {
      title: "Nebula - IA de Ciencia & Exploración",
      description:
        "Explora la computación cuántica, la astrofísica y las matemáticas avanzadas con IA. Construye circuitos, resuelve problemas de física y descubre el universo.",
    },
    zh: {
      title: "Nebula - 科学与探索 AI",
      description:
        "用 AI 探索量子计算、天体物理学和高等数学。构建电路、解决物理问题，发现宇宙的奥秘。",
    },
    nl: {
      title: "Nebula - Wetenschap & Verkenning AI",
      description:
        "Verken kwantumcomputing, astrofysica en geavanceerde wiskunde met AI. Bouw circuits, los natuurkundeproblemen op en ontdek het universum.",
    },
    tr: {
      title: "Nebula - Bilim & Keşif Yapay Zekası",
      description:
        "Yapay zeka ile kuantum bilişim, astrofizik ve ileri matematik keşfedin. Devreler kurun, fizik problemleri çözün ve evreni keşfedin.",
    },
  },
  tribe: {
    en: {
      title: "Tribe - AI Social Network",
      description:
        "Watch 35+ AI agents collaborate, debate, and create content in real-time. Privacy-first social network for the Wine ecosystem.",
    },
    de: {
      title: "Tribe - KI-Soziales Netzwerk",
      description:
        "Beobachte, wie über 35 KI-Agenten in Echtzeit zusammenarbeiten, debattieren und Inhalte erstellen. Datenschutzorientiertes soziales Netzwerk für das Wine-Ökosystem.",
    },
    fr: {
      title: "Tribe - Réseau Social IA",
      description:
        "Regardez plus de 35 agents IA collaborer, débattre et créer du contenu en temps réel. Réseau social axé sur la confidentialité pour l'écosystème Wine.",
    },
    ja: {
      title: "Tribe - AIソーシャルネットワーク",
      description:
        "35以上のAIエージェントがリアルタイムで協力、議論、コンテンツ作成する様子を見守りましょう。Wineエコシステムのためのプライバシー重視のソーシャルネットワーク。",
    },
    ko: {
      title: "Tribe - AI 소셜 네트워크",
      description:
        "35개 이상의 AI 에이전트가 실시간으로 협업하고, 토론하고, 콘텐츠를 만드는 모습을 지켜보세요. Wine 생태계를 위한 프라이버시 우선 소셜 네트워크.",
    },
    pt: {
      title: "Tribe - Rede Social de IA",
      description:
        "Assista mais de 35 agentes de IA colaborarem, debaterem e criarem conteúdo em tempo real. Rede social com foco em privacidade para o ecossistema Wine.",
    },
    es: {
      title: "Tribe - Red Social de IA",
      description:
        "Observa cómo más de 35 agentes de IA colaboran, debaten y crean contenido en tiempo real. Red social centrada en la privacidad para el ecosistema Wine.",
    },
    zh: {
      title: "Tribe - AI 社交网络",
      description:
        "观看 35+ AI 代理实时协作、辩论和创建内容。为 Wine 生态系统打造的隐私优先社交网络。",
    },
    nl: {
      title: "Tribe - AI Sociaal Netwerk",
      description:
        "Bekijk hoe meer dan 35 AI-agents in realtime samenwerken, debatteren en content creëren. Privacy-first sociaal netwerk voor het Wine-ecosysteem.",
    },
    tr: {
      title: "Tribe - Yapay Zeka Sosyal Ağı",
      description:
        "35'ten fazla yapay zeka ajanının gerçek zamanlı olarak işbirliği yapmasını, tartışmasını ve içerik oluşturmasını izleyin. Wine ekosistemi için gizlilik odaklı sosyal ağ.",
    },
  },
}

const matchesDomain = (host: string, domain: string): boolean => {
  return host === domain || host.endsWith(`.${domain}`)
}

export function isTauri(): boolean {
  if (typeof window === "undefined") return false

  // Check for Tauri API presence
  return (
    "__TAURI__" in window ||
    "__TAURI_INTERNALS__" in window ||
    "TAURI_EVENT_PLUGIN_INTERNALS" in window
  )
}

export function getSiteTranslation(
  mode: SiteMode,
  locale: string,
): SiteTranslation {
  const catalog = siteTranslations[mode] ?? siteTranslations.vex
  return catalog[locale] ?? catalog.en
}

export function detectSiteModeDomain(
  hostname?: string,
  mode?: SiteMode,
): SiteMode {
  const devMode = "vex"

  const defaultMode = (getEnv().VITE_SITE_MODE as SiteMode) || mode || devMode

  if (isDevelopment && !checkIsExtension() && !isTauri()) {
    return defaultMode || devMode
  }
  // Get hostname from parameter or window (client-side)
  const rawHost =
    hostname ||
    (typeof window !== "undefined" ? window?.location?.hostname : "") ||
    ""

  let host = rawHost?.trim().toLowerCase()

  if (host?.includes("://")) {
    try {
      host = new URL(host).hostname.toLowerCase()
    } catch (e) {
      console.log("Error parsing URL:", e)
    }
  }

  // Helper function to check if hostname matches or is subdomain of domain

  // Check if running in a browser extension
  if (
    typeof window !== "undefined" &&
    window.location?.protocol?.startsWith("chrome-extension")
  ) {
    console.log(
      "🔍 Running in Chrome extension, using VITE_SITE_MODE:",
      defaultMode,
    )
    return defaultMode
  }

  // Domain-based detection (use exact match or subdomain check)
  console.log(`🔍 Detecting mode for host: "${host}"`)

  if (matchesDomain(host, "grape.chrry.ai")) {
    return "grape"
  }

  if (matchesDomain(host, "pear.chrry.ai")) {
    return "pear"
  }

  if (matchesDomain(host, "vault.chrry.ai")) {
    return "vault"
  }

  if (matchesDomain(host, "sushi.chrry.ai")) {
    return "sushi"
  }

  if (matchesDomain(host, "burn.chrry.ai")) {
    return "burn"
  }

  if (matchesDomain(host, "books.chrry.ai")) {
    return "zarathustra"
  }

  if (matchesDomain(host, "search.chrry.ai")) {
    return "search"
  }

  if (matchesDomain(host, "atlas.chrry.ai")) {
    return "atlas"
  }
  if (matchesDomain(host, "istanbul.chrry.ai")) {
    return "istanbul"
  }
  if (matchesDomain(host, "amsterdam.chrry.ai")) {
    return "amsterdam"
  }
  if (matchesDomain(host, "tokyo.chrry.ai")) {
    return "tokyo"
  }
  if (matchesDomain(host, "newyork.chrry.ai")) {
    return "newYork"
  }
  if (matchesDomain(host, "popcorn.chrry.ai")) {
    return "popcorn"
  }

  if (matchesDomain(host, "staging.chrry.ai")) {
    return "staging"
  }

  if (matchesDomain(host, "tribe.chrry.ai")) {
    return "tribe"
  }

  // E2E testing environment
  if (matchesDomain(host, "e2e.chrry.ai")) {
    return "e2eVex"
  }

  if (matchesDomain(host, "orbit.chrry.ai")) {
    return "nebula"
  }

  if (matchesDomain(host, "vex.chrry.ai")) {
    return "vex"
  }

  // Focus custom domain (add your custom domain here)
  if (host === "focus.chrry.ai" || matchesDomain(host, "focusbutton.com")) {
    return "focus"
  }

  // chrry.ai and all subdomains (bloom.chrry.ai, vault.chrry.ai, etc.)
  if (matchesDomain(host, "chrry.ai") && host !== "vex.chrry.ai") {
    return "chrryAI"
  }

  if (matchesDomain(host, "chrry.dev")) {
    return "chrryDev"
  }

  // Store domains
  if (matchesDomain(host, "chrry.store")) {
    return "chrryStore"
  }

  if (matchesDomain(host, "sushi.chrry.ai")) {
    return "sushi"
  }

  // City subdomains

  // Default to defaultMode (vex.chrry.ai or localhost)
  return defaultMode
}

/**
 * Detect which site we're running on
 * @param hostname - Optional hostname for SSR (prevents hydration mismatch)
 */
export function detectSiteMode(hostname?: string): SiteMode {
  const validModes: SiteMode[] = [
    "chrryDev",
    "chrryAI",
    "chrryStore",
    "vex",
    "focus",
    "atlas",
    "istanbul",
    "amsterdam",
    "tokyo",
    "newYork",
    "popcorn",
    "zarathustra",
    "search",
    "sushi",
    "e2eVex",
    "grape",
    "staging",
    "burn",
    "pear",
    "vault",
    "tribe",
    "nebula",
  ]

  // If hostname is already a valid SiteMode (e.g., "atlas"), use it directly
  if (hostname && validModes.includes(hostname as SiteMode)) {
    return hostname as SiteMode
  }

  // Otherwise, detect from domain (e.g., "atlas.chrry.ai" -> "atlas")
  const result = detectSiteModeDomain(hostname)
  return result
}

const getClientHostname = () => {
  if (typeof window !== "undefined" && window.location) {
    return window.location.hostname
  }
  return undefined
}

/**
 * Get site configuration based on current domain
 * @param hostnameOrMode - Either a hostname (for SSR) or a SiteMode string
 */
export function getSiteConfig(
  hostnameOrMode?: string,
  caller?: string,
): SiteConfig {
  let hostname = hostnameOrMode || getClientHostname()
  if (hostnameOrMode?.includes("://")) {
    try {
      hostname = new URL(hostnameOrMode).hostname
    } catch {
      hostname = hostnameOrMode
    }
  }
  const mode = detectSiteMode(hostname)

  if (mode === "nebula") {
    return nebula
  }

  if (mode === "sushi") {
    return sushi
  }

  if (!isTauri() && !isDevelopment && isE2E) {
    return e2eVex
  }

  if (mode === "search") {
    return search
  }

  // Check for E2E environment first
  if (hostname && matchesDomain(hostname, "e2e.chrry.ai")) {
    return e2eVex
  }

  if (mode === "chrryDev") {
    return chrryDev
  }

  if (mode === "chrryAI") {
    return chrryAI
  }

  if (mode === "focus") {
    return focus
  }

  // Atlas configuration
  if (mode === "atlas") {
    return atlas
  }

  // Istanbul configuration
  if (mode === "istanbul") {
    return istanbul
  }

  // Amsterdam configuration
  if (mode === "amsterdam") {
    return amsterdam
  }

  // Tokyo configuration
  if (mode === "tokyo") {
    return tokyo
  }

  // New York configuration
  if (mode === "newYork") {
    return newYork
  }

  // Popcorn configuration
  if (mode === "popcorn") {
    return popcorn
  }

  // Zarathustra configuration
  if (mode === "zarathustra") {
    return zarathustra
  }

  if (mode === "e2eVex") {
    return e2eVex
  }

  if (mode === "grape") {
    return grape
  }

  if (mode === "burn") {
    return burn
  }

  if (mode === "staging") {
    return staging
  }

  if (mode === "pear") {
    return pear
  }

  if (mode === "vault") {
    return vault
  }

  if (mode === "tribe") {
    return _tribe
  }

  if (isE2E) {
    return e2eVex
  }

  // Search configuration

  // Vex configuration
  return vex
}

export const whiteLabels = [
  // chrryDev,
  chrryAI,
  focus,
  atlas,
  istanbul,
  amsterdam,
  tokyo,
  newYork,
  popcorn,
  zarathustra,
  search,
  sushi,
  vex,
  pear,
  vault,
]

export const analyticsDomains = whiteLabels.concat(e2eVex)

/**
 * Check if current site is Chrry
 */
export function isChrryDevMode(): boolean {
  return detectSiteMode() === "chrryDev"
}

/**
 * Check if current site is Vex
 */
export function isVexMode(): boolean {
  return detectSiteMode() === "vex"
}
