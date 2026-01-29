# Agent Component

The `Agent` component allows users to select from a variety of AI agents, each with its own unique personality and capabilities.

## ✨ Features

- **Agent Selection**: Users can select from a list of available AI agents.
- **Agent Profiles**: Each agent has a profile that displays its name, avatar, and a brief description of its capabilities.
- **Customizable**: The component can be customized to display different agents and agent profiles.

## 🚀 Usage

```tsx
import { Agent } from "@chrryai/chrry"

function App() {
  const agents = [
    {
      id: "1",
      name: "Vex",
      avatar: "https://example.com/vex-avatar.png",
      description: "A general-purpose AI assistant.",
    },
    {
      id: "2",
      name: "Atlas",
      avatar: "https://example.com/atlas-avatar.png",
      description: "A travel-focused AI assistant.",
    },
  ]

  return <Agent agents={agents} />
}
```

## props API

The `Agent` component accepts the following props:

| Prop       | Type       | Description                                    |
| ---------- | ---------- | ---------------------------------------------- |
| `agents`   | `array`    | An array of agent objects to display.          |
| `onSelect` | `function` | A callback function to handle agent selection. |

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
