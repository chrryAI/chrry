"use client"

import React from "react"

export function withUnstyled<T extends React.ElementType>(Component: T) {
  const UnstyledComponent = React.forwardRef((props: any, ref: any) => {
    return <Component ref={ref} {...props} unstyled />
  })

  // displayName type complexity
  const componentName =
    (Component as any).displayName || (Component as any).name || "Component"
  UnstyledComponent.displayName = `Unstyled(${componentName})`

  return UnstyledComponent as any
}
