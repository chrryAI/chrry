# Sidebar Component

The `Sidebar` component is the main navigation component for the Vex application.

## ✨ Features

- **Collapsible**: The sidebar can be collapsed to save space.
- **Navigation Links**: The sidebar displays a list of navigation links to the main sections of the application.
- **Customizable**: The component can be customized to display different navigation links and to support different sidebar features.
- **Platform-Agnostic**: The component is designed to work on both web and native platforms.

## 🚀 Usage

```tsx
import { Sidebar } from "@chrryai/chrry"

function App() {
  const navLinks = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/chat",
      label: "Chat",
    },
    {
      href: "/settings",
      label: "Settings",
    },
  ]

  return <Sidebar navLinks={navLinks} />
}
```

## props API

The `Sidebar` component accepts the following props:

| Prop          | Type       | Description                                     |
| ------------- | ---------- | ----------------------------------------------- |
| `navLinks`    | `array`    | An array of navigation link objects to display. |
| `onLinkClick` | `function` | A callback function to handle link clicks.      |

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
