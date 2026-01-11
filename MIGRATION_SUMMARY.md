# Component Migration - Quick Reference

## 🚀 Quick Start

```bash
cd packages/ui
node migrate-components.js
```

## 📦 What Gets Migrated

**60+ Components** including:

- A, About, Account, AddToHomeScreen, Agent, App
- Bookmark, Button, Calendar, CharacterProfile, Chat
- Checkbox, Collaborate, ColorScheme, ConfirmButton
- DeleteThread, EditThread, EmptyStateTips, EventModal
- Image, Instructions, LanguageSwitcher, LifeOS, Loading
- MarkdownContent, MemoryConsent, Menu, Message, Messages
- Modal, Privacy, Providers, QuotaDisplay, ResponsiveDrawer
- Search, Select, Share, Sidebar, SignIn, Skeleton, Star
- Subscribe, Terms, Testimonials, Thread, Threads
- TypingIndicator, Users, Weather, Why
- And more...

## 📁 New Structure

```
packages/ui/
├── Button/
│   ├── Button.tsx
│   ├── Button.module.scss
│   └── Button.styles.ts
├── Modal/
│   ├── Modal.tsx
│   ├── Modal.module.scss
│   └── Modal.styles.ts
├── Chat/
│   ├── Chat.tsx
│   ├── Chat.module.scss
│   └── Chat.styles.ts
├── index.ts (barrel export)
├── hooks/
├── context/
├── lib/
└── utils/
```

## ✅ Backward Compatible

```typescript
// Still works after migration!
import { Button, Modal, Chat } from "chrry"
```

## 🎯 Benefits

- ✅ Clean root directory
- ✅ Organized component structure
- ✅ Grouped related files
- ✅ Barrel exports for clean imports
- ✅ No breaking changes

## 📋 Checklist

- [ ] Run migration script
- [ ] Review new structure
- [ ] Test imports in apps
- [ ] Run type checking
- [ ] Commit changes

## 🔧 Commands

```bash
# Run migration
node migrate-components.js

# Check types
npm run check-types

# Run linter
npm run lint
```
