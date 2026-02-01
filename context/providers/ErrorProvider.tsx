"use client"

import { captureException as captureExceptionSentry } from "@sentry/react"
import React, { createContext, useContext, ReactNode } from "react"

interface ErrorContextType {
  captureException: (
    error: Error | unknown,
    context?: Record<string, any>,
  ) => void
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined)

interface ErrorProviderProps {
  children: ReactNode
}

export function ErrorProvider({ children }: ErrorProviderProps) {
  const captureException = (
    error: Error | unknown,
    context?: Record<string, any>,
  ) => {
    captureExceptionSentry(error, context)
    // TODO: Move error handling logic here
    console.error("Error captured:", error, context)
  }

  return (
    <ErrorContext.Provider value={{ captureException }}>
      {children}
    </ErrorContext.Provider>
  )
}

export function useError() {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error("useError must be used within ErrorProvider")
  }
  return context
}
