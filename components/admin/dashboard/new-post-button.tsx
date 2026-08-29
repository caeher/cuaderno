"use client"

import * as React from "react"
import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NewPostButton({
  variant = "default",
  size = "sm",
}: {
  variant?: "default" | "outline"
  size?: "sm" | "default"
}) {
  return (
    <Button size={size} variant={variant} className="cursor-pointer gap-1.5" render={<Link href="/panel/posts/nuevo" />}>
      <PlusCircle className="size-4" />
      <span>Nuevo post</span>
    </Button>
  )
}
