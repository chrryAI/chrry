import type React from "react"
import { Hey } from "./Hey"
import { Providers } from "./Providers"

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
