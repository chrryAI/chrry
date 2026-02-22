# CharacterProfiles Component

The `CharacterProfiles` component is used to display and manage AI-generated character profiles.

## ✨ Features

- **Character Profiles**: The component can display a list of AI-generated character profiles, each with its own name, avatar, and a brief description.
- **Profile Management**: Users can create, edit, and delete character profiles.
- **Customizable**: The component can be customized to display different character profiles and to support different profile management features.

## 🚀 Usage

```tsx
import { CharacterProfiles } from "@chrryai/chrry"

function App() {
  const profiles = [
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

  return <CharacterProfiles profiles={profiles} />
}
```

## props API

The `CharacterProfiles` component accepts the following props:

| Prop       | Type       | Description                                       |
| ---------- | ---------- | ------------------------------------------------- |
| `profiles` | `array`    | An array of character profile objects to display. |
| `onCreate` | `function` | A callback function to handle profile creation.   |
| `onEdit`   | `function` | A callback function to handle profile editing.    |
| `onDelete` | `function` | A callback function to handle profile deletion.   |

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
