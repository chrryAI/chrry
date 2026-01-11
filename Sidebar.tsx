import React from "react"
import { Providers } from "./Providers"
import { Hey } from "./Hey"

export default function Sidebar({
  useExtensionIcon,
}: {
  useExtensionIcon?: (slug?: string) => void
}): React.ReactElement {
  return (
    <Providers>
      <Hey useExtensionIcon={useExtensionIcon} />
    </Providers>
  )
}

export { Hey } from "./Hey"
