"use client"

/**
 * HistoryRouterProvider - Makes window.history changes trigger React re-renders
 *
 * This provider ensures that when clientRouter.push() is called,
 * all components using pathname/searchParams will re-render properly
 */

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react"
import { clientRouter } from "../../hooks/useWindowHistory"

interface HistoryRouterContextValue {
  pathname: string
  searchParams: URLSearchParams
  forceUpdate: () => void
}

const HistoryRouterContext = createContext<HistoryRouterContextValue | null>(
  null,
)

export function useHistoryRouter() {
  const context = useContext(HistoryRouterContext)
  if (!context) {
    throw new Error(
      "useHistoryRouter must be used within HistoryRouterProvider",
    )
  }
  return context
}

interface HistoryRouterProviderProps {
  children: ReactNode
}

/**
 * HistoryRouterProvider
 *
 * Wraps the app and listens to window.history changes,
 * triggering React re-renders when navigation occurs
 *
 * @example
 * ```tsx
 * <HistoryRouterProvider>
 *   <App />
 * </HistoryRouterProvider>
 * ```
 */
export function HistoryRouterProvider({
  children,
}: HistoryRouterProviderProps): React.ReactElement {
  const [state, setState] = useState(() => clientRouter.getState())
  const [_updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    // Subscribe to router changes
    const unsubscribe = clientRouter.subscribe(() => {
      const newState = clientRouter.getState()
      setState(newState)
      setUpdateTrigger((prev) => prev + 1)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const forceUpdate = () => {
    setState(clientRouter.getState())
    setUpdateTrigger((prev) => prev + 1)
  }

  return (
    <HistoryRouterContext.Provider
      value={{
        pathname: state.pathname,
        searchParams: state.searchParams,
        forceUpdate,
      }}
    >
      {children}
    </HistoryRouterContext.Provider>
  )
}
