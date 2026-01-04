"use client"

import React from "react"
import Skeleton from "./Skeleton"
import FocusButton from "./FocusButton"

export default function Focus({ children }: { children?: React.ReactNode }) {
  return (
    <Skeleton>
      <FocusButton />
      {children}
    </Skeleton>
  )
}
