import { cn } from "@/lib/utils"

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  description?: string
  align?: "left" | "center"
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <p className="font-mono text-xs font-medium uppercase tracking-widest text-primary">{eyebrow}</p>
      )}
      <h2 className="mt-3 font-serif text-3xl font-medium leading-tight text-balance sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-base leading-relaxed text-muted-foreground">{description}</p>}
    </div>
  )
}
