import { useCallback } from "react"
import type React from "react"
import { useAppContext } from "../context/AppContext"
import { app, appWithStore } from "../types"
import { reorderApps } from "../lib"
import { toast } from "react-hot-toast"
import { useAuth, useData } from "../context/providers"

interface UseAppReorderProps {
  apps: appWithStore[]
  setApps: React.Dispatch<React.SetStateAction<appWithStore[]>>
  onSave?: (apps: appWithStore[]) => Promise<void>
  autoInstall?: boolean
}

export function useAppReorder({
  apps,
  setApps,
  onSave,
  autoInstall,
}: UseAppReorderProps) {
  const { t } = useAppContext()

  const { token, API_URL } = useAuth()
  // Move app during drag (live preview)
  const moveApp = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      setApps((prevApps: appWithStore[]) => {
        const newApps = [...prevApps]
        const draggedApp = newApps[dragIndex]
        if (!draggedApp) return prevApps // Safety check

        newApps.splice(dragIndex, 1)
        newApps.splice(hoverIndex, 0, draggedApp)
        return newApps
      })
    },
    [setApps],
  )

  const { actions } = useData()

  // Save order to database when drop completes
  const handleDrop = useCallback(
    async (dragIndex: number, hoverIndex: number) => {
      console.log(`Dropped app from ${dragIndex} to ${hoverIndex}`)
      if (!token) return
      if (onSave) {
        await onSave(apps)
      } else {
        // Default save implementation
        try {
          const response = await actions.reorderApps(apps, autoInstall)

          if (response?.error) {
            toast.error(t(response.error))
            return
          }

          console.log("✅ App order saved successfully")
        } catch (error) {
          console.error("❌ Failed to save app order:", error)
          // Optionally show error toast to user
        }
      }
    },
    [apps, onSave, token, autoInstall],
  )

  const handleDragStart = useCallback((index: number) => {
    console.log("Started dragging app at index:", index)
  }, [])

  const handleDragEnd = useCallback((index: number) => {
    console.log("Stopped dragging app at index:", index)
  }, [])

  return {
    moveApp,
    handleDrop,
    handleDragStart,
    handleDragEnd,
  }
}
