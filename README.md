# 🍒 Chrry

**A modern, cross-platform UI library for React, React Native, and Next.js**

Built by the team behind [Vex](https://askvex.com) - the AI assistant that helps you get things done.

## ✨ Features

- 🎨 **Beautiful Components** - Modern, accessible UI components
- 📱 **Cross-Platform** - Works on Web, iOS, Android, and Browser Extensions
- 🎯 **TypeScript First** - Full type safety out of the box
- 🌙 **Dark Mode** - Built-in theme support
- 🌍 **i18n Ready** - Multi-language support included
- ⚡ **Performance** - Optimized for speed and bundle size
- 🎭 **Customizable** - Easy to theme and extend

## 🌶️ Pepper Router

Chrry pairs perfectly with **[Pepper Router](https://github.com/askvex/pepper)** - our universal router with view transitions:

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
```

**Note:** Chrry is published as TypeScript source. Your bundler (Next.js, Vite, etc.) will compile it.

## 🚀 Quick Start

```tsx
import { Button, Modal, Chat } from "@chrryai/chrry"
import { Star, Heart } from "@chrryai/chrry/icons"

function App() {
  return (
    <div>
      <Button>Click me</Button>
      <Star size={24} />
    </div>
  )
}
```

## 📚 Documentation

Visit [chrry.dev](https://chrry.dev) for full documentation, examples, and guides.

## 🛠️ Components

Chrry includes 50+ production-ready components:

- **Layout**: Sidebar, Menu, Modal, Skeleton
- **Forms**: Input, Select, Checkbox, Search
- **Data Display**: Message, Thread, Calendar, Weather
- **Feedback**: Loading, Toast, EmptyState
- **Navigation**: Breadcrumbs, Tabs, Pagination
- **And many more...**

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

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 🔗 Links

- [Website](https://chrry.dev)
- [Documentation](https://chrry.dev/docs)
- [GitHub](https://github.com/AskVex/chrry)
- [npm](https://www.npmjs.com/package/@chrryai/chrry)

---

**Built with ❤️ by the Vex team**
