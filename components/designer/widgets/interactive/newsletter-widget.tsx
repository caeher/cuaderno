"use client"

import * as React from "react"
import { Check, Mail } from "lucide-react"
import type { BlockNode } from "@/lib/domain/block-schema"
import { blockStyleToCss } from "@/components/designer/widgets/utils/style-converter"

export function NewsletterBlock({ node }: { node: BlockNode }) {
  const style = blockStyleToCss(node.style)
  const [email, setEmail] = React.useState("")
  const [subscribed, setSubscribed] = React.useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) setSubscribed(true)
  }

  return (
    <div style={style} className="my-8 rounded-2xl">
      <div className="mx-auto max-w-md flex flex-col items-center text-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Mail className="size-6" />
        </div>
        <h3 className="font-serif text-2xl font-bold text-foreground">{node.props.title || "Boletín Semanal"}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {node.props.description || "Suscríbete para recibir los mejores artículos."}
        </p>

        {subscribed ? (
          <div className="mt-2 flex items-center gap-2 rounded-lg bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-600">
            <Check className="size-4" />
            ¡Gracias por suscribirte!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-2 flex w-full gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={node.props.placeholder || "tu-email@ejemplo.com"}
              className="flex-1 rounded-lg border border-border bg-background px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
            >
              {node.props.buttonText || "Suscribirse"}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
