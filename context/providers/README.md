# Provider Architecture

## 🎯 Entry Point: DataProvider

`DataProvider` is now the **main entry point** that accepts a `token` prop and provides all app-wide context.

## 📦 Usage

### Basic Setup

```tsx
import { DataProvider } from "chrry/context/providers"

function App() {
  const [token, setToken] = useState<string | null>(null)

  // Get token from your auth system
  useEffect(() => {
    const authToken = localStorage.getItem("authToken")
    setToken(authToken)
  }, [])

  return (
    <DataProvider token={token}>
      <YourApp />
    </DataProvider>
  )
}
```

### With Authentication Flow

```tsx
import { DataProvider } from "chrry/context/providers"

function App() {
  const [token, setToken] = useState<string | null>(null)

  const handleLogin = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    const { token } = await response.json()
    setToken(token)
    localStorage.setItem("authToken", token)
  }

  const handleLogout = () => {
    setToken(null)
    localStorage.removeItem("authToken")
  }

  return (
    <DataProvider token={token}>
      {token ? (
        <AuthenticatedApp onLogout={handleLogout} />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </DataProvider>
  )
}
```

### Accessing Context

```tsx
import { useData } from "chrry/context/providers"

function MyComponent() {
  const {
    // Auth
    token,

    // Environment
    env,
    setEnv,
    isDevelopment,

    // URLs
    API_URL,
    WS_URL,
    FRONTEND_URL,
    setApiUrl,
    setWsUrl,
    setFrontendUrl,

    // Regional Routing
    enableRegionalRouting,
    setRegion,
    currentRegion,

    // Configuration
    PROMPT_LIMITS,
    setPromptLimits,

    // API Actions (all typed!)
    actions,
  } = useData()

  // Use actions
  const loadThreads = async () => {
    const threads = await actions.getThreads({ pageSize: 20 })
  }

  return <div>...</div>
}
```

## 🌍 Regional Routing

### Automatic Detection

```tsx
function App() {
  const { enableRegionalRouting } = useData()

  useEffect(() => {
    // Auto-detect and route to nearest server
    enableRegionalRouting()
  }, [])

  return <YourApp />
}
```

### Manual Region Selection

```tsx
function RegionSelector() {
  const { setRegion, currentRegion } = useData()

  return (
    <select
      value={currentRegion || ""}
      onChange={(e) => setRegion(e.target.value as Region)}
    >
      <option value="us">🇺🇸 United States</option>
      <option value="eu">🇪🇺 Europe</option>
      <option value="asia">🇨🇳 Asia</option>
      <option value="oceania">🇦🇺 Oceania</option>
      <option value="africa">🇿🇦 Africa</option>
      <option value="south-america">🇧🇷 South America</option>
    </select>
  )
}
```

## ⚙️ Admin Panel Features

### Environment Switching

```tsx
function AdminPanel() {
  const { env, setEnv, API_URL } = useData()

  return (
    <div>
      <h2>Environment</h2>
      <select value={env} onChange={(e) => setEnv(e.target.value)}>
        <option value="development">Development</option>
        <option value="staging">Staging</option>
        <option value="production">Production</option>
      </select>
      <p>Current API: {API_URL}</p>
    </div>
  )
}
```

### Custom Endpoints

```tsx
function CustomEndpoints() {
  const { setApiUrl, setWsUrl, API_URL, WS_URL } = useData()

  return (
    <div>
      <h2>Custom Endpoints</h2>
      <input
        placeholder="API URL"
        onChange={(e) => setApiUrl(e.target.value || null)}
      />
      <input
        placeholder="WebSocket URL"
        onChange={(e) => setWsUrl(e.target.value || null)}
      />
      <p>Active API: {API_URL}</p>
      <p>Active WS: {WS_URL}</p>
    </div>
  )
}
```

### Prompt Limits Configuration

```tsx
function PromptLimitsConfig() {
  const { PROMPT_LIMITS, setPromptLimits } = useData()

  const handleUpdate = () => {
    setPromptLimits({
      INPUT: 10000,
      INSTRUCTIONS: 3000,
      TOTAL: 50000,
      WARNING_THRESHOLD: 7000,
      THREAD_TITLE: 150,
    })
  }

  return (
    <div>
      <h2>Prompt Limits</h2>
      <p>Input: {PROMPT_LIMITS.INPUT}</p>
      <p>Instructions: {PROMPT_LIMITS.INSTRUCTIONS}</p>
      <p>Total: {PROMPT_LIMITS.TOTAL}</p>
      <button onClick={handleUpdate}>Update Limits</button>
    </div>
  )
}
```

## 🚀 API Actions

All API actions are fully typed and automatically include the auth token:

```tsx
function Example() {
  const { actions } = useData()

  // Thread operations
  await actions.getThreads({ pageSize: 20, sort: "date" })
  await actions.getThread({ id: "thread-id" })
  await actions.updateThread({ id: "thread-id", title: "New Title" })

  // User operations
  await actions.getUser()
  await actions.updateUser({ name: "John Doe" })
  await actions.uploadUserImage(file)

  // Message operations
  await actions.updateMessage({ messageId: "msg-id", like: true })
  await actions.deleteMessage("msg-id")

  // Calendar operations
  await actions.createCalendarEvent(eventData)
  await actions.getCalendarEvents({ startDate: "2024-01-01" })

  // App operations
  await actions.createApp(appData)
  await actions.updateApp("app-id", appData)
  await actions.deleteApp("app-id")
}
```

## 🎨 Complete Example

```tsx
import { DataProvider, useData } from "chrry/context/providers"
import { useState, useEffect } from "react"

// Root App Component
function App() {
  const [token, setToken] = useState<string | null>(null)

  useEffect(() => {
    // Load token from storage
    const savedToken = localStorage.getItem("authToken")
    setToken(savedToken)
  }, [])

  const handleLogin = async (credentials: any) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
    const { token } = await response.json()
    setToken(token)
    localStorage.setItem("authToken", token)
  }

  return (
    <DataProvider token={token}>
      {token ? <Dashboard /> : <Login onLogin={handleLogin} />}
    </DataProvider>
  )
}

// Dashboard Component
function Dashboard() {
  const { actions, enableRegionalRouting, API_URL, currentRegion } = useData()

  useEffect(() => {
    // Auto-route to nearest server
    enableRegionalRouting()

    // Load initial data
    loadData()
  }, [])

  const loadData = async () => {
    const threads = await actions.getThreads({ pageSize: 20 })
    const user = await actions.getUser()
    console.log({ threads, user })
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Region: {currentRegion}</p>
      <p>API: {API_URL}</p>
      {/* Your app content */}
    </div>
  )
}

export default App
```

## 🔥 Benefits

✅ **Single Entry Point** - One provider to rule them all  
✅ **Type-Safe** - Full TypeScript support throughout  
✅ **Flexible URLs** - Switch environments/regions on the fly  
✅ **Regional Routing** - Automatic geo-based server selection  
✅ **Admin Controls** - Runtime configuration without rebuilds  
✅ **Zero Boilerplate** - All API calls pre-configured with auth  
✅ **Production Ready** - Enterprise-grade architecture
