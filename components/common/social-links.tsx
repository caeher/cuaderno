import * as React from "react"
import { Globe, Code2, AtSign } from "lucide-react"
import { TwitterIcon, LinkedinIcon, FacebookIcon } from "@/components/common/social-icons"
import { cn } from "@/lib/utils"

export interface SocialLinksData {
  website?: string | null
  twitter?: string | null
  github?: string | null
  linkedin?: string | null
  facebook?: string | null
}

export interface SocialLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  socials: SocialLinksData
  showLabels?: boolean
  variant?: "inline" | "badges" | "icons"
  size?: "sm" | "md"
}

export function SocialLinks({
  socials,
  showLabels = true,
  variant = "inline",
  size = "md",
  className,
  ...props
}: SocialLinksProps) {
  const links: Array<{
    id: string
    href: string
    label: string
    icon: React.ElementType
  }> = []

  if (socials.website) {
    links.push({
      id: "website",
      href: socials.website.startsWith("http") ? socials.website : `https://${socials.website}`,
      label: "Sitio web",
      icon: Globe,
    })
  }

  if (socials.twitter) {
    const username = socials.twitter.replace(/^@/, "")
    links.push({
      id: "twitter",
      href: `https://twitter.com/${username}`,
      label: `@${username}`,
      icon: TwitterIcon,
    })
  }

  if (socials.github) {
    const username = socials.github.replace(/^@/, "")
    links.push({
      id: "github",
      href: `https://github.com/${username}`,
      label: username,
      icon: Code2,
    })
  }

  if (socials.linkedin) {
    links.push({
      id: "linkedin",
      href: socials.linkedin.startsWith("http") ? socials.linkedin : `https://linkedin.com/in/${socials.linkedin}`,
      label: "LinkedIn",
      icon: LinkedinIcon,
    })
  }

  if (socials.facebook) {
    links.push({
      id: "facebook",
      href: socials.facebook.startsWith("http") ? socials.facebook : `https://facebook.com/${socials.facebook}`,
      label: "Facebook",
      icon: FacebookIcon,
    })
  }

  if (links.length === 0) return null

  if (variant === "icons") {
    return (
      <div className={cn("flex items-center gap-2", className)} {...props}>
        {links.map((link) => {
          const Icon = link.icon
          return (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "flex items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition-colors hover:border-ia-border hover:bg-ia-tint hover:text-ia",
                size === "sm" ? "size-8" : "size-9"
              )}
              title={link.label}
            >
              <Icon className={size === "sm" ? "size-3.5" : "size-4"} />
            </a>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className={cn("flex flex-wrap items-center gap-4 text-sm text-muted-foreground", className)}
      {...props}
    >
      {links.map((link) => {
        const Icon = link.icon
        return (
          <a
            key={link.id}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-ia"
          >
            <Icon className="size-3.5" />
            {showLabels && <span>{link.label}</span>}
          </a>
        )
      })}
    </div>
  )
}
