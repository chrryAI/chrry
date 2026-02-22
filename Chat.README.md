# Chat Component

The `Chat` component is the heart of the Vex AI chat experience. It provides a full-featured, interactive interface for users to communicate with the AI platform.

## ✨ Features

- **Real-Time Messaging**: The component supports real-time, bidirectional communication with the AI platform using WebSockets.
- **AI Agent Selection**: Users can select from a variety of AI agents, each with its own unique personality and capabilities.
- **Multi-Modal Content**: The component supports a wide range of multi-modal content, including text, images, files, and more.
- **Streaming Responses**: The component can stream responses from the AI platform, providing a more responsive and engaging user experience.
- **Custom Instructions**: Users can provide custom instructions for a chat thread, allowing them to tailor the AI's behavior to their specific needs.

## 🚀 Usage

```tsx
import { Chat } from "@chrryai/chrry"

function App() {
  return <Chat />
}
```

## props API

The `Chat` component accepts the following props:

| Prop          | Type       | Description                                  |
| ------------- | ---------- | -------------------------------------------- |
| `threadId`    | `string`   | The ID of the chat thread to display.        |
| `agentId`     | `string`   | The ID of the AI agent to use.               |
| `placeholder` | `string`   | The placeholder text for the chat input.     |
| `onSend`      | `function` | A callback function to handle sent messages. |

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
