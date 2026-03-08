"use client"

import type React from "react"
import FocusButton from "./FocusButton"
import Skeleton from "./Skeleton"

export default function Focus({ children }: { children?: React.ReactNode }) {
  return (
    <Skeleton>
      <FocusButton />
      {children}
    </Skeleton>
  )
}
