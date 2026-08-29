"use client"

import * as React from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import {
  History,
  PlusCircle,
  Search,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
  Ban,
  ChevronRight,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export interface ComposerSessionSelectorProps {
  activeSessionId?: string | null
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  className?: string
}

export function ComposerSessionSelector({
  activeSessionId,
  onSelectSession,
  onNewSession,
  className = "",
}: ComposerSessionSelectorProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const sessions = useQuery(api.composer.listSessions, {})

  const filteredSessions = React.useMemo(() => {
    if (!sessions) return []
    if (!search.trim()) return sessions
    const q = search.toLowerCase()
    return sessions.filter(
      (s) =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.brief.topic && s.brief.topic.toLowerCase().includes(q))
    )
  }, [sessions, search])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "awaiting_review":
        return (
          <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-emerald-500/20 gap-1">
            <CheckCircle2 className="size-2.5" /> Listo
          </Badge>
        )
      case "researching":
      case "drafting":
      case "imaging":
        return (
          <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/20 animate-pulse">
            En progreso
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="text-[10px] gap-1">
            <AlertCircle className="size-2.5" /> Error
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="text-[10px] text-muted-foreground gap-1">
            <Ban className="size-2.5" /> Cancelada
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="text-[10px]">
            {status}
          </Badge>
        )
    }
  }

  const handleSelect = (id: string) => {
    onSelectSession(id)
    setOpen(false)
  }

  const handleCreateNew = () => {
    onNewSession()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`cursor-pointer gap-1.5 text-xs ${className}`}
          >
            <History className="size-3.5 text-muted-foreground" />
            <span>Sesiones previas</span>
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-4 pb-2 border-b border-border/60">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-base font-semibold flex items-center gap-2">
              <History className="size-4 text-primary" />
              Historial de sesiones de Composer
            </DialogTitle>
            <Button
              type="button"
              size="sm"
              onClick={handleCreateNew}
              className="cursor-pointer gap-1 text-xs h-7"
            >
              <PlusCircle className="size-3" />
              Nueva sesión
            </Button>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Selecciona una sesión anterior para reanudar el trabajo o revisar los artefactos generados.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="p-3 border-b border-border/40 bg-muted/20">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar por título o tema de la sesión..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 text-xs h-8 bg-background"
            />
          </div>
        </div>

        {/* Sessions list */}
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 max-h-[380px]">
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <History className="size-8 text-muted-foreground/40 mb-2" />
              <p className="text-xs font-medium text-foreground">No se encontraron sesiones</p>
              <p className="text-[11px] mt-0.5 max-w-xs">
                Inicia una nueva sesión con el brief editorial para comenzar.
              </p>
            </div>
          ) : (
            filteredSessions.map((session: Doc<"composerSessions">) => {
              const isSelected = session._id === activeSessionId
              const title = session.title || session.brief.topic || "Sesión sin título"

              return (
                <button
                  key={session._id}
                  type="button"
                  onClick={() => handleSelect(session._id)}
                  className={`flex items-center justify-between gap-3 rounded-lg border p-3 text-left transition-all cursor-pointer ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-2xs"
                      : "border-border/70 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {title}
                      </h4>
                      {getStatusBadge(session.status)}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <Clock className="size-3" />
                      <span>{new Date(session.updatedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{new Date(session.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      {session.postId && (
                        <>
                          <span>•</span>
                          <span className="text-primary font-medium">Borrador creado</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                </button>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
