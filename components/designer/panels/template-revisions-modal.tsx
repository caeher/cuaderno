"use client"

import * as React from "react"
import { History, RotateCcw, X, CheckCircle2, Clock } from "lucide-react"
import type { TemplateRevision } from "@/lib/domain/template-schema"
import { formatDate } from "@/lib/format"
import { Button } from "@/components/ui/button"

interface TemplateRevisionsModalProps {
  isOpen: boolean
  onClose: () => void
  revisions: TemplateRevision[]
  currentVersion: number
  onRollback: (revisionId: string) => Promise<void>
  isLoading?: boolean
}

export function TemplateRevisionsModal({
  isOpen,
  onClose,
  revisions,
  currentVersion,
  onRollback,
  isLoading,
}: TemplateRevisionsModalProps) {
  const [selectedRevId, setSelectedRevId] = React.useState<string | null>(null)
  const [isRestoring, setIsRestoring] = React.useState(false)

  if (!isOpen) return null

  const handleRollback = async (id: string) => {
    try {
      setIsRestoring(true)
      await onRollback(id)
      onClose()
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="flex flex-col max-h-[85vh] w-full max-w-lg rounded-xl border border-border bg-card shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="size-4 text-primary" />
            <h3 className="font-semibold text-foreground text-sm">Historial de Revisiones</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {revisions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              Aún no hay publicaciones en el historial de este blog.
            </div>
          ) : (
            revisions.map((rev) => {
              const isCurrent = rev.version === currentVersion
              return (
                <div
                  key={rev.id}
                  className={`flex items-center justify-between p-3.5 rounded-lg border transition-all ${
                    isCurrent
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:border-border/80 bg-background"
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-foreground">
                        Versión {rev.version}
                      </span>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          <CheckCircle2 className="size-2.5" />
                          Actual
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {rev.changeSummary || "Publicación registrada"}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      <span>{formatDate(rev.createdAt)}</span>
                      {rev.publishedBy && <span>· por {rev.publishedBy}</span>}
                    </div>
                  </div>

                  {!isCurrent && (
                    <Button
                      size="xs"
                      variant="outline"
                      disabled={isRestoring}
                      onClick={() => handleRollback(rev.id)}
                      className="cursor-pointer text-xs shrink-0"
                    >
                      <RotateCcw className="size-3" />
                      <span>Restaurar</span>
                    </Button>
                  )}
                </div>
              )
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end border-t border-border px-5 py-3 bg-muted/20">
          <Button size="sm" variant="ghost" onClick={onClose} className="cursor-pointer text-xs">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
