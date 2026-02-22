# Instructions Component

The `Instructions` component allows users to provide custom instructions for a chat thread, allowing them to tailor the AI's behavior to their specific needs.

## ✨ Features

- **Custom Instructions**: Users can provide a set of custom instructions for the AI to follow.
- **Real-Time Updates**: The instructions are sent to the AI in real-time, allowing for immediate feedback.
- **Markdown Support**: The component supports Markdown, allowing for rich text formatting.

## 🚀 Usage

```tsx
import { Instructions } from "@chrryai/chrry"

function App() {
  return <Instructions />
}
```

## props API

The `Instructions` component accepts the following props:

| Prop           | Type       | Description                                       |
| -------------- | ---------- | ------------------------------------------------- |
| `threadId`     | `string`   | The ID of the chat thread.                        |
| `instructions` | `string`   | The initial instructions for the chat thread.     |
| `onSave`       | `function` | A callback function to handle saved instructions. |

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
