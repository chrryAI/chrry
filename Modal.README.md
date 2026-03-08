# Modal Component

The `Modal` component is a foundational component for displaying modal dialogs.

## ✨ Features

- **Accessible**: The component is designed to be accessible to all users, including those with disabilities.
- **Customizable**: The component can be customized to display different content and to support different modal features.
- **Platform-Agnostic**: The component is designed to work on both web and native platforms.

## 🚀 Usage

```tsx
import { Modal } from "@chrryai/chrry"

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button type="button"  onClick={() => setIsOpen(true)}>Open Modal</button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <h2>Modal Title</h2>
        <p>This is the content of the modal.</p>
      </Modal>
    </div>
  )
}
```

## props API

The `Modal` component accepts the following props:

| Prop       | Type       | Description                                      |
| ---------- | ---------- | ------------------------------------------------ |
| `isOpen`   | `boolean`  | Whether the modal is open.                       |
| `onClose`  | `function` | A callback function to handle closing the modal. |
| `children` | `node`     | The content to display in the modal.             |

## 🤝 Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
