# EmptyStateTips Component

The `EmptyStateTips` component is used to display AI-generated suggestions and placeholders when a chat thread is empty.

## ✨ Features

- **AI-Generated Suggestions**: The component can display a list of AI-generated suggestions to help users get started.
- **Placeholders**: The component can display a placeholder message to encourage users to start a conversation.
- **Customizable**: The component can be customized to display different suggestions and placeholders.

## 🚀 Usage

```tsx
import { EmptyStateTips } from "@chrryai/chrry"

function App() {
  const tips = [
    "Ask me about the weather.",
    "Tell me a joke.",
    "What's the meaning of life?",
  ]

  return <EmptyStateTips tips={tips} />
}
```

## props API

The `EmptyStateTips` component accepts the following props:

| Prop          | Type       | Description                                    |
| ------------- | ---------- | ---------------------------------------------- |
| `tips`        | `array`    | An array of strings to display as suggestions. |
| `placeholder` | `string`   | The placeholder text to display.               |
| `onSelect`    | `function` | A callback function to handle tip selection.   |

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
