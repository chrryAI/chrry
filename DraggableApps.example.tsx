import { useState, useCallback } from "react"
import { DraggableAppList } from "./DraggableAppList"
import { DraggableAppItem } from "./DraggableAppItem"

// Example usage
export function DraggableAppsExample() {
  const [apps, setApps] = useState([
    { id: "1", name: "Atlas", slug: "atlas" },
    { id: "2", name: "Peach", slug: "peach" },
    { id: "3", name: "Bloom", slug: "bloom" },
    { id: "4", name: "Vault", slug: "vault" },
  ])

  const moveApp = useCallback((dragIndex: number, hoverIndex: number) => {
    setApps((prevApps) => {
      const newApps = [...prevApps]
      const draggedApp = newApps[dragIndex]
      newApps.splice(dragIndex, 1)
      //   newApps.splice(hoverIndex, 0, draggedApp)
      return newApps
    })
  }, [])

  const handleDragStart = useCallback((index: number) => {
    console.log("Drag started:", index)
  }, [])

  const handleDragEnd = useCallback((index: number) => {
    console.log("Drag ended:", index)
  }, [])

  const handleDrop = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      console.log("Dropped:", dragIndex, "->", hoverIndex)
      // Here you can save the new order to the database
      // await updateAppOrder(apps)
    },
    [apps],
  )

  return (
    <DraggableAppList className="apps-grid">
      {apps.map((app, index) => (
        <DraggableAppItem
          key={app.id}
          id={app.id}
          index={index}
          onMove={moveApp}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDrop={handleDrop}
          className="app-item"
        >
          <div className="app-button">
            <img src={`/images/apps/${app.slug}.png`} alt={app.name} />
            <span>{app.name}</span>
          </div>
        </DraggableAppItem>
      ))}
    </DraggableAppList>
  )
}
