import React from "react"
import { useAppContext } from "./context/AppContext"
import { Volume2, VolumeX } from "./icons"
import { useTheme } from "./platform"

export default function EnableSound() {
  const { enableSound, setEnableSound } = useTheme()
  return (
    <button
      title={enableSound ? "Disable sound" : "Enable sound"}
      className="link"
      onClick={() => setEnableSound(!enableSound)}
    >
      {enableSound ? (
        <Volume2 size={18} color="var(--accent-6)" />
      ) : (
        <VolumeX size={18} color="var(--accent-1)" />
      )}
    </button>
  )
}
