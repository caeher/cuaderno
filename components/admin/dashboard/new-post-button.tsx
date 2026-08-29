"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NewPostButton({
  variant = "default",
  size = "sm",
}: {
  variant?: "default" | "outline"
  size?: "sm" | "default"
}) {
  return (
    <Button
      size={size}
      variant={variant}
      className="cursor-pointer gap-1.5"
      render={<Link href="/panel/posts/nuevo" />}
    >
      <Plus className="size-4" />
      <span>Nueva entrada</span>
    </Button>
  )
}
