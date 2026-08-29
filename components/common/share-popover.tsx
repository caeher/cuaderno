"use client"

import * as React from "react"
import { Share2, Check, Copy } from "lucide-react"
import { TwitterIcon, LinkedinIcon } from "@/components/common/social-icons"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

export interface SharePopoverProps {
  title?: string
  url?: string
  variant?: "outline" | "ghost" | "secondary" | "default"
  size?: "default" | "sm" | "icon" | "icon-sm"
  showText?: boolean
}

export function SharePopover({
  title = "Compartir publicación",
  url,
  variant = "outline",
  size = "sm",
  showText = true,
}: SharePopoverProps) {
  const [copied, setCopied] = React.useState(false)

  const getShareUrl = () => {
    if (url) return url
    if (typeof window !== "undefined") return window.location.href
    return ""
  }

  const handleCopyLink = async () => {
    const currentUrl = getShareUrl()
    if (!currentUrl) return

    try {
      await navigator.clipboard.writeText(currentUrl)
      setCopied(true)
      toast.success("Enlace copiado al portapapeles")
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("No se pudo copiar el enlace")
    }
  }

  const handleShareTwitter = () => {
    const currentUrl = getShareUrl()
    const text = encodeURIComponent(title)
    const shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(currentUrl)}`
    window.open(shareUrl, "_blank", "noopener,noreferrer")
  }

  const handleShareLinkedIn = () => {
    const currentUrl = getShareUrl()
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`
    window.open(shareUrl, "_blank", "noopener,noreferrer")
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={<Button variant={variant} size={size} className="gap-2 cursor-pointer" />}>
        <Share2 className="size-4" />
        {showText && <span>Compartir</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          Compartir en redes
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            <span>{copied ? "¡Copiado!" : "Copiar enlace"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareTwitter} className="cursor-pointer">
            <TwitterIcon className="size-4" />
            <span>X (Twitter)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShareLinkedIn} className="cursor-pointer">
            <LinkedinIcon className="size-4" />
            <span>LinkedIn</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
