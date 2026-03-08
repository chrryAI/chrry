/**
 * Custom Navigator for React Native
 * Works like React Router's history-based routing without Stack.Navigator
 */

import type React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react"

interface Route {
  name: string
  params?: Record<string, any>
}

interface NavigatorContextType {
  currentRoute: Route
  navigate: (name: string, params?: Record<string, any>) => void
  goBack: () => void
  canGoBack: () => boolean
}

const NavigatorContext = createContext<NavigatorContextType | null>(null)

export function useCustomNavigation() {
  const context = useContext(NavigatorContext)
  if (!context) {
    throw new Error("useCustomNavigation must be used within CustomNavigator")
  }
  return context
}

interface CustomNavigatorProps {
  initialRouteName: string
  children: React.ReactNode
}

export function CustomNavigator({
  initialRouteName,
  children,
}: CustomNavigatorProps) {
  const [history, setHistory] = useState<Route[]>([{ name: initialRouteName }])
  const currentRoute = history[history.length - 1] || { name: initialRouteName }

  const navigate = useCallback((name: string, params?: Record<string, any>) => {
    setHistory((prev) => [...prev, { name, params }])
  }, [])

  const goBack = useCallback(() => {
    setHistory((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))
  }, [])

  const canGoBack = useCallback(() => {
    return history.length > 1
  }, [history.length])

  const value = useMemo(
    () => ({ currentRoute, navigate, goBack, canGoBack }),
    [currentRoute, navigate, goBack, canGoBack],
  )

  return (
    <NavigatorContext.Provider value={value}>
      {children}
    </NavigatorContext.Provider>
  )
}

interface ScreenProps {
  name: string
  component: React.ComponentType<any>
}

export function Screen({ name, component: Component }: ScreenProps) {
  const { currentRoute } = useCustomNavigation()

  if (currentRoute.name !== name) {
    return null
  }

  return <Component route={currentRoute} />
}

// Export a screens renderer
export function Screens({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
