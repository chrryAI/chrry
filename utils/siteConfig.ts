export type SiteMode = "chrryDev" | "vex" | "chrryAI" | "chrryStore" | "focus"

export interface SiteConfig {
  mode: SiteMode
  slug: string
  storeSlug: string
  name: string
  domain: string
  store: string
  url: string
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
}

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
}

export function getSiteTranslation(
  mode: SiteMode,
  locale: string,
): SiteTranslation {
  const catalog = siteTranslations[mode] ?? siteTranslations.vex
  return catalog[locale] ?? catalog.en
}

export function detectSiteModeDomain(hostname?: string): SiteMode {
  const defaultMode = "vex"
  // Get hostname from parameter or window (client-side)
  const rawHost =
    hostname || (typeof window !== "undefined" ? window.location.hostname : "")

  let host = rawHost?.trim().toLowerCase()

  if (host?.includes("://")) {
    try {
      host = new URL(host).hostname.toLowerCase()
    } catch (e) {
      console.log("Error parsing URL:", e)
    }
  }

  if (!host) {
    return defaultMode
  }

  // Helper function to check if hostname matches or is subdomain of domain
  const matchesDomain = (host: string, domain: string): boolean => {
    return host === domain || host.endsWith(`.${domain}`)
  }

  // Domain-based detection (use exact match or subdomain check)

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

  // Default to defaultMode (vex.chrry.ai or localhost)
  return defaultMode
}

/**
 * Detect which site we're running on
 * @param hostname - Optional hostname for SSR (prevents hydration mismatch)
 */
export function detectSiteMode(hostname?: string): SiteMode {
  const mode = detectSiteModeDomain(hostname)
  return mode
}

/**
 * Get site configuration based on current domain
 * @param hostnameOrMode - Either a hostname (for SSR) or a SiteMode string
 */
export function getSiteConfig(hostnameOrMode?: string): SiteConfig {
  // If it's a valid SiteMode, use it directly
  const validModes: SiteMode[] = [
    "chrryDev",
    "chrryAI",
    "chrryStore",
    "vex",
    "focus",
  ]

  // Extract hostname from URL if needed
  let hostname = hostnameOrMode
  if (hostnameOrMode && hostnameOrMode.includes("://")) {
    try {
      hostname = new URL(hostnameOrMode).hostname
    } catch {
      hostname = hostnameOrMode
    }
  }

  const mode = validModes.includes(hostname as SiteMode)
    ? (hostname as SiteMode)
    : detectSiteMode(hostname)

  if (mode === "chrryDev") {
    return {
      mode: "chrryDev",
      slug: "chrryDev",
      storeSlug: "chrry",
      store: "https://chrry.dev",
      name: "Chrry",
      domain: "chrry.dev",
      url: "https://chrry.dev",
      email: "iliyan@chrry.ai",
      description:
        "A modern, cross-platform UI library for React, React Native, and Next.js",
      logo: "/assets/cherry-logo.svg", // Cross-platform SVG
      primaryColor: "#E91E63", // Cherry pink
      links: {
        github: "https://github.com/chrryAI/vex",
        npm: "https://www.npmjs.com/package/@chrryai/chrry",
        docs: "https://chrry.dev/docs",
        demo: "https://chrry.dev/demo",
      },
      features: [
        {
          title: "Pepper",
          description: "Universal router with view transitions",
          icon: "🌶️",
          link: "https://npmjs.com/package/@chrryai/pepper",
          isOpenSource: true,
        },
        {
          title: "Components",
          description: "50+ production-ready UI components",
          icon: "🎨",
          link: "https://github.com/chrryAI/chrry",
          isOpenSource: true,
        },

        {
          title: "Icons",
          description: "Cross-platform icon system with Lucide",
          icon: "✨",
          link: "https://github.com/chrryAI/chrry/tree/main/icons",
          isOpenSource: true,
        },
        {
          title: "Styles",
          description: "SCSS to TypeScript converter",
          icon: "🎭",
          link: "https://github.com/chrryAI/chrry/tree/main/styles",
          isOpenSource: true,
        },
        {
          title: "Hooks",
          description: "Reusable React hooks",
          icon: "🪝",
          link: "https://github.com/chrryAI/chrry/tree/main/hooks",
          isOpenSource: true,
        },
        {
          title: "Context",
          description: "State management providers",
          icon: "🔄",
          link: "https://github.com/chrryAI/chrry/tree/main/context",
          isOpenSource: true,
        },
        {
          title: "Platform",
          description: "Cross-platform utilities",
          icon: "📱",
          link: "https://github.com/chrryAI/chrry/tree/main/platform",
          isOpenSource: true,
        },
        {
          title: "Waffles",
          description: "Playwright testing utilities",
          icon: "🧇",
          link: "https://npmjs.com/package/@chrryai/waffles",
          isOpenSource: true,
        },
      ],
    }
  }

  if (mode === "chrryAI") {
    return {
      slug: "chrry",
      storeSlug: "blossom",
      mode: "chrryAI",
      name: "Chrry",
      domain: "chrry.ai",
      email: "iliyan@chrry.ai",
      url: "https://chrry.ai",
      store: "https://chrry.ai",
      description:
        "AI App Marketplace - Discover, create, and monetize AI apps",
      logo: "🍒",
      primaryColor: "#E91E63", // Cherry pink
      links: {
        github: "https://github.com/chrryAI/chrry",
        docs: "https://chrry.ai/docs",
        // store: "https://chrry.store",
      },
      features: [
        {
          title: "App Marketplace",
          description: "Discover and install AI apps",
          icon: "🏪",
          link: "/explore",
          isOpenSource: false,
        },
        {
          title: "Create Stores",
          description: "Build your own AI app marketplace",
          icon: "🏗️",
          link: "/stores/new",
          isOpenSource: false,
        },
        {
          title: "Publish Apps",
          description: "Monetize your AI applications",
          icon: "📱",
          link: "/apps/new",
          isOpenSource: false,
        },
        {
          title: "Revenue Sharing",
          description: "Earn 70% on every sale",
          icon: "💰",
          link: "/affiliate",
          isOpenSource: false,
        },
        {
          title: "Custom Domains",
          description: "White-label your store",
          icon: "🌐",
          link: "/settings/domain",
          isOpenSource: false,
        },
        {
          title: "Analytics",
          description: "Track your app performance",
          icon: "📊",
          link: "/analytics",
          isOpenSource: false,
        },
        {
          title: "Multi-Agent Support",
          description: "Build for any AI platform",
          icon: "🤖",
          link: "/docs/agents",
          isOpenSource: false,
        },
        {
          title: "Developer Tools",
          description: "APIs and SDKs for developers",
          icon: "🛠️",
          link: "/docs/api",
          isOpenSource: false,
        },
      ],
    }
  }

  if (mode === "focus") {
    return {
      mode: "focus",
      slug: "focus",
      version: "26.10.19",
      storeSlug: "blossom",
      name: "Focus",
      domain: "focus.chrry.ai",
      store: "https://chrry.ai",
      email: "iliyan@chrry.ai",
      url: "https://focus.chrry.ai",
      description:
        "AI-powered Pomodoro timer with task management and mood tracking. Stay focused, productive, and mindful while you work.",
      logo: "⏱️",
      primaryColor: "#3B82F6", // Blue
      links: {
        github: "https://github.com/chrryAI/chrry",
        docs: "https://focus.chrry.ai/docs",
      },
      features: [
        {
          title: "Focus Timer",
          description: "Pomodoro and custom focus sessions",
          icon: "⏱️",
          link: "/timer",
          isOpenSource: false,
        },
        {
          title: "Task Management",
          description: "Organize and track your tasks",
          icon: "✅",
          link: "/tasks",
          isOpenSource: false,
        },
        {
          title: "AI Task Breakdown",
          description: "Break complex projects into steps",
          icon: "🤖",
          link: "/ai",
          isOpenSource: false,
        },
        {
          title: "Time Tracking",
          description: "Track time across all your tasks",
          icon: "📊",
          link: "/analytics",
          isOpenSource: false,
        },
        {
          title: "Progress Analytics",
          description: "Visualize your productivity patterns",
          icon: "📈",
          link: "/progress",
          isOpenSource: false,
        },
        {
          title: "Goal Setting",
          description: "Set and achieve your goals",
          icon: "🎯",
          link: "/goals",
          isOpenSource: false,
        },
        {
          title: "Productivity Insights",
          description: "AI-powered productivity tips",
          icon: "💡",
          link: "/insights",
          isOpenSource: false,
        },
        {
          title: "Deep Work Mode",
          description: "Eliminate distractions and focus",
          icon: "🧠",
          link: "/deep-work",
          isOpenSource: false,
        },
      ],
    }
  }

  // Vex configuration
  return {
    url: "https://vex.chrry.ai",
    mode: "vex",
    slug: "vex",
    storeSlug: "lifeOS",
    name: "Vex",
    domain: "vex.chrry.ai",
    store: "https://vex.chrry.ai",
    email: "iliyan@chrry.ai",
    description: "Your AI-Powered Life",
    logo: "🤖",
    primaryColor: "#6366F1", // Indigo
    links: {
      github: "https://github.com/chrryai/chrry",
      docs: "https://vex.chrry.ai/docs",
    },
    features: [
      {
        title: "LifeOS",
        description: "AI-powered life management system",
        icon: "🧠",
        link: "/lifeOS",
        isOpenSource: false,
      },
      {
        title: "AI Agents",
        description: "Custom AI agents for any task",
        icon: "🤖",
        link: "/lifeOS",
        isOpenSource: false,
      },
      {
        title: "Collaboration",
        description: "Real-time AI collaboration",
        icon: "👥",
        link: "/threads",
        isOpenSource: false,
      },
      {
        title: "Browser Extension",
        description: "AI assistant in your browser",
        icon: "🔌",
        link: "https://chrome.google.com/webstore",
        isOpenSource: false,
      },
    ],
  }
}

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
