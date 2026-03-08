# 🍒 Chrry

**Production-ready React component library for building AI applications**

[![npm](https://img.shields.io/npm/v/@chrryai/chrry)](https://www.npmjs.com/package/@chrryai/chrry)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

> Extracted from [Vex](https://vex.chrry.ai) - A production AI platform with 6,813+ commits in 2025

License: AGPL-3.0. Use it, learn from it, but if you distribute it, share your changes.

---

## ✨ What is Chrry?

Chrry is a comprehensive React component library built for AI applications. It includes everything you need to build ChatGPT-like interfaces, multi-tenant app stores, and real-time collaboration features.

**Key Features:**

- 🎨 **50+ Components** - Chat, modals, forms, layouts, and more
- 🤖 **AI-First** - Built specifically for AI chat interfaces
- 📱 **Cross-Platform** - Web, iOS, Android, Browser Extensions
- 🎯 **TypeScript** - Full type safety throughout
- 🌙 **Dark Mode** - Built-in theme support
- 🌍 **i18n** - 10+ languages included
- ⚡ **Performance** - Optimized for production
- 🎭 **Customizable** - SCSS modules for easy theming

## 🌶️ Pepper Router

Chrry pairs perfectly with **[Pepper Router](https://github.comchrryAIpepper)** - our universal router with view transitions:

```bash
npm install @chrryai/pepper
```

**Features:**

- ⚡ Zero-latency navigation
- 🎨 Built-in View Transitions API
- 📱 Works in web, React Native, and browser extensions
- 🚀 SSR-friendly

[Learn more →](https://npmjs.com/package/@chrryai/pepper)

## 📦 Installation

```bash
npm install @chrryai/chrry
# or
pnpm add @chrryai/chrry
# or
yarn add @chrryai/chrry
```

**Note:** Chrry is published as TypeScript source. Your bundler (Next.js, Vite, etc.) will compile it.

---

## 🚀 Quick Start

### Basic Usage

```tsx
import { Chat, Button, Modal } from "@chrryai/chrry"
import { Star } from "@chrryai/chrry/icons"

function App() {
  return (
    <>
      <Chat />
      <Button>Click me</Button>
      <Star size={24} />
    </>
  )
}
```

### With ChrryAI Layout (Full Next.js Integration)

```tsx
import ChrryAI from "@chrryai/chrry/ChrryAI"
import { cookies, headers } from "next/headers"

export default async function RootLayout({ children }): Promise<JSX.Element> {
  const headersList = await headers()
  const cookieStore = await cookies()

  return (
    <ChrryAI
      apiKey={process.env.API_KEY}
      locale="en"
      headersList={headersList}
      cookieStore={cookieStore}
    >
      {children}
    </ChrryAI>
  )
}
```

### With Standalone Chrry Provider

For non-Next.js apps or custom setups:

```tsx
import Chrry from "@chrryai/chrry/Chrry"

export default function App({ children, session }) {
  return (
    <Chrry apiKey={process.env.API_KEY} locale="en">
      {children}
    </Chrry>
  )
}
```

## 📚 Documentation

Visit [chrry.dev](https://chrry.dev) for full documentation, examples, and guides.

## 🛠️ Components

### AI & Chat

- **Chat** - Full-featured AI chat interface
- **Message** - Individual message component with streaming
- **Messages** - Message list with virtualization
- **Thread** - Complete thread view
- **Threads** - Thread list with search/filter
- **Agent** - AI agent selector
- **TypingIndicator** - Animated typing indicator

### Layout

- **ChrryAI** - Complete app layout with session management
- **Sidebar** - Collapsible navigation sidebar
- **Menu** - Dropdown menu component
- **Modal** - Accessible modal dialogs
- **Skeleton** - Loading skeletons

### Forms & Input

- **Button** - Customizable button component
- **Input** - Text input with validation
- **Select** - Dropdown select
- **Checkbox** - Checkbox with label
- **Search** - Search input with autocomplete
- **FileUpload** - Drag & drop file upload

### Data Display

- **Calendar** - Full calendar with events
- **Weather** - Weather widget
- **CharacterProfiles** - AI personality profiles
- **Store** - App store interface
- **App** - Individual app card

### Feedback

- **Loading** - Loading spinners
- **Toast** - Toast notifications
- **EmptyStateTips** - Empty state with tips
- **ConfirmButton** - Confirmation dialogs

### Utilities

- **Image** - Optimized image component
- **MarkdownContent** - Markdown renderer
- **ColorScheme** - Theme switcher
- **LanguageSwitcher** - i18n language selector

**And 20+ more components!**

## 🎨 Theming

Chrry supports custom themes and dark mode out of the box:

```tsx
import { ThemeProvider } from "@chrryai/chrry/context/providers"

function App() {
  return <ThemeProvider theme="dark">{/* Your app */}</ThemeProvider>
}
```

## 🌍 Internationalization

Built-in support for multiple languages:

```tsx
import { locale } from "@chrryai/chrry/locales"

// Supports: en, es, fr, de, ja, ko, nl, pt, tr, zh
```

## 🏗️ Architecture

Chrry is built with:

- **Next.js 15** - App Router with RSC
- **TypeScript 5** - Full type safety
- **SCSS Modules** - Scoped styling
- **Drizzle ORM** - Type-safe database queries
- **WebSockets** - Real-time features
- **next-intl** - Internationalization

## 🌍 Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Japanese (ja)
- Korean (ko)
- Dutch (nl)
- Portuguese (pt)
- Turkish (tr)
- Chinese (zh)

## 🤝 Contributing

We welcome contributions! Chrry is extracted from [Vex](https://vex.chrry.ai), a production AI platform.

### Development

```bash
# Clone the monorepo
git clone https://github.com/chrryai/chrry.git
cd chrry

# Install dependencies
pnpm install

# Start development
pnpm dev
```

## 📄 License

See [LICENSE](LICENSE) for details.

## 🔗 Links

- **Website:** [chrry.dev](https://chrry.dev)
- **Documentation:** [chrry.dev/docs](https://chrry.dev/docs)
- **Component Documentation**:
  - [Chat](./Chat.README.md)
  - [Message](./Message.README.md)
  - [Agent](./Agent.README.md)
  - [Instructions](./Instructions.README.md)
  - [MemoryConsent](./MemoryConsent.README.md)
  - [CharacterProfiles](./CharacterProfiles.README.md)
  - [EmptyStateTips](./EmptyStateTips.README.md)
  - [Modal](./Modal.README.md)
  - [Sidebar](./Sidebar.README.md)
- **GitHub:** [@chrryai/chrry](https://github.com/chrryai/chrry)
- **npm:** [@chrryai/chrry](https://www.npmjs.com/package/@chrryai/chrry)
- **Chrry:** [chrry.ai](https://chrry.ai)
- **Vex:** [vex.chrry.ai](https://vex.chrry.ai)

---

## 💎 Why Chrry?

**Most AI component libraries are basic.** Chrry is different:

✅ **Production-Ready** - Extracted from a real AI platform
✅ **Complete** - 50+ components, not just a chat box
✅ **Multi-Tenant** - Build app stores, not just apps
✅ **Real-Time** - WebSocket collaboration built-in
✅ **i18n** - 10 languages out of the box
✅ **TypeScript** - Full type safety throughout


---

**Built with by [@ibsukru](https://github.com/ibsukru)**

iliyan@chrry.ai
