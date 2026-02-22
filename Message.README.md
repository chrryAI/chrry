# Message Component

The `Message` component is responsible for rendering a single message in the chat interface. It supports a wide range of features, including streaming, reactions, and multi-modal content.

## ✨ Features

- **Streaming Content**: The component can stream content from the AI platform, providing a more responsive and engaging user experience.
- **Reactions**: Users can react to messages with emojis.
- **Multi-Modal Content**: The component can render a wide range of multi-modal content, including text, images, files, and more.
- **Markdown Support**: The component supports Markdown, allowing for rich text formatting.
- **Code Highlighting**: The component can highlight code snippets in a variety of programming languages.

## 🚀 Usage

```tsx
import { Message } from "@chrryai/chrry"

function App() {
  const message = {
    id: "1",
    content: "Hello, world!",
    author: "user",
  }

  return <Message message={message} />
}
```

## props API

The `Message` component accepts the following props:

| Prop      | Type       | Description                              |
| --------- | ---------- | ---------------------------------------- |
| `message` | `object`   | The message object to render.            |
| `onReact` | `function` | A callback function to handle reactions. |

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
