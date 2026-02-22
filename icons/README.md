# Platform-Aware Icon System

1. Smart Meeting Scheduler 🗓️
   Ask: "Schedule a team standup meeting tomorrow at 10 AM for 30 minutes with the title 'Daily Sync' and invite emma.brown@google.com"

Why it's impressive: Shows AI understanding multiple parameters (time, duration, title, attendees) and creating a complete calendar event in one command.

2. Conflict Detector ⚠️
   Ask: "Do I have any meetings between 2 PM and 5 PM today? If yes, can you reschedule my 3 PM call to tomorrow same time?"

Why it's impressive: Demonstrates AI reading calendar, detecting conflicts, and proactively suggesting/making changes.

3. Weekly Overview 📊
   Ask: "What's my schedule for this week? Highlight any back-to-back meetings and suggest breaks I should add."

Why it's impressive: Shows AI analyzing patterns, providing insights, and making smart recommendations for work-life balance.

4. Natural Language Event Creation 🎯
   Ask: "Block my calendar every Friday afternoon from 2-5 PM for the next month as 'Focus Time - No Meetings' and mark it as busy"

Why it's impressive: Demonstrates recurring event creation, natural language understanding, and calendar blocking strategy - perfect for productivity.

Pro tip for video: Start with #4 (most impressive), then show #1 (practical), then #3 (analytical), and end with #2 (problem-solving). This creates a compelling narrative from "wow" to "useful" to "intelligent."

This directory contains a platform-aware icon system that automatically uses the correct icon library based on the execution environment.

## 🎯 Features

- **Automatic Platform Detection**: Uses `lucide-react` for web and `lucide-react-native` for native
- **Single Import Path**: Import from `chrry/icons` regardless of platform
- **Type-Safe**: Full TypeScript support with `IconProps`
- **Zero Configuration**: React Native Metro and Next.js handle it automatically

## 📦 Usage

```typescript
import { Star, Heart, Settings, Menu } from 'chrry/icons'

function MyComponent() {
  return (
    <div>
      <Star size={24} color="gold" />
      <Heart size={24} color="red" />
      <Settings size={24} />
    </div>
  )
}
```

## 🔧 How It Works

The system uses platform-specific file extensions that bundlers automatically resolve:

### File Structure

```
icons/
  ├── index.tsx         # Default (web) - used by Next.js
  ├── index.web.tsx     # Web-specific exports (lucide-react)
  └── index.native.tsx  # Native-specific exports (lucide-react-native)
```

### Platform Resolution

- **Next.js**: Uses `index.tsx` → `index.web.tsx` → `lucide-react`
- **React Native Metro**: Uses `index.native.tsx` → `lucide-react-native`

This approach ensures:

- ✅ No React Native dependencies in web builds
- ✅ Proper native icons on ios/Android
- ✅ Single import path for all platforms

## 🎨 Available Icons

All Lucide icons are available with consistent naming:

- `Star`, `Heart`, `Menu`, `Settings`
- `CircleX` (mapped from `X`)
- `CircleArrowLeft` (mapped from `ArrowLeft`)
- `ImageIcon` (mapped from `Image`)
- `VideoIcon` (mapped from `Video`)
- `FileIcon` (mapped from `File`)
- `TextIcon` (mapped from `Text`)
- And 100+ more...

## 🔄 Migration from Tamagui

If you're migrating from `@tamagui/lucide-icons`:

```typescript
// Before
import { Star, Heart } from "@tamagui/lucide-icons"

// After
import { Star, Heart } from "./icons"
```

Run the replacement script:

```bash
cd packages/ui
chmod +x replace-icons.sh
./replace-icons.sh
```

## 🚀 Benefits

1. **No React Native Dependencies on Web**: Avoids `react-native-svg` build errors in Next.js
2. **True Cross-Platform**: Works seamlessly on web, ios, Android, and browser extensions
3. **Automatic Resolution**: Bundlers handle platform detection at build time
4. **Type Safety**: Full TypeScript support with proper types for each platform

## 📝 Adding New Icons

All Lucide icons are automatically available via `export *`. Just import and use:

```typescript
import { NewIcon } from 'chrry/icons'

// Works immediately if the icon exists in lucide-react/lucide-react-native
<NewIcon size={24} />
```

No manual exports needed!

## 🐛 Troubleshooting

### TypeScript errors about missing icons

- Make sure both `lucide-react` and `lucide-react-native` are installed
- Run `npm install` in the `packages/ui` directory

### Icons not rendering on web

- Verify the icon exists in `lucide-react`
- Check the import path: `from 'chrry/icons'`
- Clear Next.js cache: `rm -rf .next && npm run dev`

### Icons not rendering on native

- Verify the icon exists in `lucide-react-native`
- Check that Metro bundler is resolving `index.native.tsx`
- Clear Metro cache: `npm start -- --reset-cache`

### Build errors about react-native-svg

- This should not happen with the new structure
- Verify `index.tsx` exports from `./index.web` (not direct lucide-react-native import)
- Ensure Next.js is not trying to bundle native files
