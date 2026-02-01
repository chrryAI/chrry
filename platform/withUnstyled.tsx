"use client"

import React from "react"

export function withUnstyled<T extends React.ElementType>(Component: T) {
  const UnstyledComponent = React.forwardRef((props: any, ref: any) => {
    return <Component ref={ref} {...props} unstyled />
  })

  // @ts-ignore - displayName type complexity
  UnstyledComponent.displayName = `Unstyled(${Component.displayName || Component.name || "Component"})`

  return UnstyledComponent as any
}
