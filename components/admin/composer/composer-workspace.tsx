"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Doc, Id } from "@/convex/_generated/dataModel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Globe,
  ListTree,
  FileText,
  Image as ImageIcon,
  Sparkles,
  MessageSquare,
  FileEdit,
} from "lucide-react"
import { ComposerHeader } from "./composer-header"
import { ComposerBriefForm } from "./composer-brief-form"
import { ComposerTimelineProgress } from "./composer-timeline-progress"
import { ComposerChatPanel } from "./composer-chat-panel"
import { ComposerResearchTab } from "./composer-research-tab"
import { ComposerOutlineTab } from "./composer-outline-tab"
import { ComposerArticleTab } from "./composer-article-tab"
import { ComposerCoverTab } from "./composer-cover-tab"
import { ComposerConfirmDialog } from "./composer-confirm-dialog"
import { ComposerErrorAlert } from "./composer-error-alert"
import {
  startComposerSessionAction,
  updateComposerBriefAction,
  appendComposerMessageAction,
  launchResearchJobAction,
  launchOutlineJobAction,
  launchDraftingJobAction,
  launchImageJobAction,
  toggleSourceExclusionAction,
  cancelComposerSessionAction,
  createDraftFromComposerSessionAction,
} from "@/app/actions/composer"
import type { ComposerBrief, ComposerSessionStatus } from "@/lib/domain/entities"

export interface ComposerWorkspaceProps {
  tenantName?: string
  initialSessionId?: string | null
  className?: string
}

export function ComposerWorkspace({
  tenantName = "Mi Blog",
  initialSessionId = null,
  className = "",
}: ComposerWorkspaceProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [currentSessionId, setCurrentSessionId] = React.useState<string | null>(
    initialSessionId || searchParams.get("session") || null
  )

  // Sync with URL search params if present
  React.useEffect(() => {
    const sessionParam = searchParams.get("session")
    if (sessionParam && sessionParam !== currentSessionId) {
      setCurrentSessionId(sessionParam)
    }
  }, [searchParams, currentSessionId])

  // Reactive subscriptions to Convex
  const session = useQuery(
    api.composer.getSession,
    currentSessionId ? { sessionId: currentSessionId as Id<"composerSessions"> } : "skip"
  )

  const jobs = useQuery(
    api.composer.getSessionJobs,
    currentSessionId ? { sessionId: currentSessionId as Id<"composerSessions"> } : "skip"
  )

  const messages = useQuery(
    api.composer.getSessionMessages,
    currentSessionId ? { sessionId: currentSessionId as Id<"composerSessions"> } : "skip"
  )

  const sources = useQuery(
    api.composer.getSessionSources,
    currentSessionId ? { sessionId: currentSessionId as Id<"composerSessions"> } : "skip"
  )

  const artifacts = useQuery(
    api.composer.getSessionArtifacts,
    currentSessionId ? { sessionId: currentSessionId as Id<"composerSessions"> } : "skip"
  )

  const coverInfo = useQuery(
    api.composer.getSessionCoverImage,
    currentSessionId ? { sessionId: currentSessionId as Id<"composerSessions"> } : "skip"
  )

  // Local state for interactive modals & active tab
  const [activeTab, setActiveTab] = React.useState<string>("research")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [dialogState, setDialogState] = React.useState<{
    open: boolean
    phase?: "research" | "outline" | "draft" | "image" | "handoff"
    title: string
    description: string
    actionLabel: string
    pendingAction?: () => Promise<void>
  }>({
    open: false,
    title: "",
    description: "",
    actionLabel: "",
  })

  // Determine active job & progress
  const activeJob = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return null
    return jobs.find((j: Doc<"composerJobs">) => j.status === "running" || j.status === "queued") || jobs[jobs.length - 1]
  }, [jobs])

  const isProcessing = activeJob?.status === "running" || activeJob?.status === "queued"
  const jobProgress = activeJob?.progress || 0

  // Artifact helpers
  const outlineArtifact = React.useMemo(() => {
    return (artifacts || []).find((a: Doc<"composerArtifacts">) => a.kind === "outline") || null
  }, [artifacts])

  const articleArtifact = React.useMemo(() => {
    return (artifacts || []).find((a: Doc<"composerArtifacts">) => a.kind === "article") || null
  }, [artifacts])

  const excerptArtifact = React.useMemo(() => {
    return (artifacts || []).find((a: Doc<"composerArtifacts">) => a.kind === "excerpt") || null
  }, [artifacts])

  const taxonomyArtifact = React.useMemo(() => {
    return (artifacts || []).find((a: Doc<"composerArtifacts">) => a.kind === "taxonomy") || null
  }, [artifacts])

  // Automatically switch tab when phase advances
  React.useEffect(() => {
    if (session?.status === "drafting" || session?.status === "awaiting_review") {
      if (articleArtifact) {
        setActiveTab("article")
      }
    } else if (session?.status === "imaging") {
      setActiveTab("cover")
    } else if (outlineArtifact && !articleArtifact) {
      setActiveTab("outline")
    } else if (sources && sources.length > 0 && !outlineArtifact) {
      setActiveTab("research")
    }
  }, [session?.status, articleArtifact, outlineArtifact, sources])

  // ─────────────────────────────────────────────────────────────────────────────
  // Action Handlers
  // ─────────────────────────────────────────────────────────────────────────────

  const handleNewSession = () => {
    setCurrentSessionId(null)
    router.push("/panel/composer")
  }

  const handleSelectSession = (id: string) => {
    setCurrentSessionId(id)
    router.push(`/panel/composer?session=${id}`)
  }

  // 1. Iniciar sesión y confirmar investigación
  const handleBriefSubmit = async (brief: ComposerBrief) => {
    setDialogState({
      open: true,
      phase: "research",
      title: "¿Iniciar investigación web?",
      description: `Composer realizará búsquedas web para extraer hechos verificables sobre "${brief.topic}".`,
      actionLabel: "Iniciar investigación",
      pendingAction: async () => {
        try {
          setIsSubmitting(true)
          toast.info("Iniciando sesión e investigación web...")

          let targetSessionId = currentSessionId
          if (!targetSessionId) {
            const createRes = await startComposerSessionAction(brief)
            if (!createRes.success || !createRes.session) {
              toast.error(createRes.error || "No se pudo crear la sesión.")
              return
            }
            targetSessionId = createRes.session.id
            setCurrentSessionId(targetSessionId)
            router.push(`/panel/composer?session=${targetSessionId}`)
          } else {
            await updateComposerBriefAction(targetSessionId, brief)
          }

          const researchRes = await launchResearchJobAction(targetSessionId)
          if (researchRes.success) {
            toast.success("Investigación en curso. Los resultados aparecerán en tiempo real.")
          } else {
            toast.error(researchRes.error || "Error al iniciar la investigación.")
          }
        } catch {
          toast.error("Error inesperado al iniciar la investigación.")
        } finally {
          setIsSubmitting(false)
          setDialogState((prev) => ({ ...prev, open: false }))
        }
      },
    })
  }

  // 2. Lanzar Outline
  const handleLaunchOutline = () => {
    if (!currentSessionId) return

    setDialogState({
      open: true,
      phase: "outline",
      title: "¿Generar esquema editorial estructurado?",
      description: "Composer organizará las secciones y puntos clave a partir de las fuentes verificadas.",
      actionLabel: "Generar esquema",
      pendingAction: async () => {
        try {
          setIsSubmitting(true)
          const res = await launchOutlineJobAction(currentSessionId)
          if (res.success) {
            toast.success("Generando esquema editorial...")
            setActiveTab("outline")
          } else {
            toast.error(res.error || "Error al generar el esquema.")
          }
        } catch {
          toast.error("Error inesperado al generar el esquema.")
        } finally {
          setIsSubmitting(false)
          setDialogState((prev) => ({ ...prev, open: false }))
        }
      },
    })
  }

  // 3. Lanzar Redacción de Borrador
  const handleLaunchDraft = () => {
    if (!currentSessionId) return

    setDialogState({
      open: true,
      phase: "draft",
      title: "¿Redactar borrador completo del artículo?",
      description: "Composer escribirá el artículo en formato TipTap con citas enlazadas a las fuentes aprobadas.",
      actionLabel: "Comenzar redacción",
      pendingAction: async () => {
        try {
          setIsSubmitting(true)
          const res = await launchDraftingJobAction(currentSessionId)
          if (res.success) {
            toast.success("Redacción iniciada en segundo plano...")
            setActiveTab("article")
          } else {
            toast.error(res.error || "Error al iniciar la redacción.")
          }
        } catch {
          toast.error("Error inesperado al redactar el artículo.")
        } finally {
          setIsSubmitting(false)
          setDialogState((prev) => ({ ...prev, open: false }))
        }
      },
    })
  }

  // 4. Lanzar Portada
  const handleLaunchImage = () => {
    if (!currentSessionId) return

    setDialogState({
      open: true,
      phase: "image",
      title: "¿Generar imagen de portada?",
      description: "Se creará una ilustración o fotografía editorial panorámica 16:9 con texto accesible.",
      actionLabel: "Generar portada",
      pendingAction: async () => {
        try {
          setIsSubmitting(true)
          const res = await launchImageJobAction(currentSessionId)
          if (res.success) {
            toast.success("Generando portada visual...")
            setActiveTab("cover")
          } else {
            toast.error(res.error || "Error al generar la portada.")
          }
        } catch {
          toast.error("Error inesperado al generar la imagen.")
        } finally {
          setIsSubmitting(false)
          setDialogState((prev) => ({ ...prev, open: false }))
        }
      },
    })
  }

  // 5. Excluir / Incluir fuente
  const handleToggleSource = async (sourceId: string, isExcluded: boolean) => {
    if (!currentSessionId) return
    try {
      await toggleSourceExclusionAction(currentSessionId, sourceId, isExcluded)
      toast.info(isExcluded ? "Fuente excluida de la redacción" : "Fuente re-incluida para redacción")
    } catch {
      toast.error("No se pudo actualizar la fuente.")
    }
  }

  // 6. Enviar mensaje de chat
  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) return
    try {
      await appendComposerMessageAction(currentSessionId, "user", content)
    } catch {
      toast.error("No se pudo enviar el mensaje.")
    }
  }

  // 7. Cancelar sesión
  const handleCancelSession = async () => {
    if (!currentSessionId) return
    try {
      await cancelComposerSessionAction(currentSessionId)
      toast.info("Sesión cancelada.")
    } catch {
      toast.error("Error al cancelar la sesión.")
    }
  }

  // 8. Crear borrador y navegar al editor
  const handleCreateDraftHandoff = () => {
    if (!currentSessionId) return

    setDialogState({
      open: true,
      phase: "handoff",
      title: "¿Crear borrador en el editor?",
      description: "Se creará un nuevo post en estado BORRADOR (draft) con el contenido, metadatos y portada generados.",
      actionLabel: "Crear borrador y abrir editor",
      pendingAction: async () => {
        try {
          setIsSubmitting(true)
          toast.info("Creando borrador de post...")
          const res = await createDraftFromComposerSessionAction(currentSessionId)
          if (res.success && res.postId) {
            toast.success("¡Borrador creado con éxito! Redirigiendo al editor...")
            router.push(`/panel/posts/${res.postId}`)
          } else {
            toast.error(res.error || "No se pudo crear el borrador.")
          }
        } catch {
          toast.error("Error inesperado al transferir el borrador.")
        } finally {
          setIsSubmitting(false)
          setDialogState((prev) => ({ ...prev, open: false }))
        }
      },
    })
  }

  // Retry handler
  const handleRetryPhase = () => {
    if (session?.status === "failed") {
      if (articleArtifact) {
        handleLaunchDraft()
      } else if (outlineArtifact) {
        handleLaunchDraft()
      } else {
        handleLaunchOutline()
      }
    }
  }

  const sessionStatus = (session?.status as ComposerSessionStatus) || "collecting"
  const failureReason = session?.failureReason || (activeJob?.status === "failed" ? activeJob?.error : null)

  return (
    <div className={`flex flex-1 flex-col gap-6 p-6 md:p-8 max-w-7xl mx-auto w-full ${className}`}>
      {/* Header Bar */}
      <ComposerHeader
        sessionId={currentSessionId}
        title={session?.title || session?.brief?.topic}
        status={sessionStatus}
        tenantName={tenantName}
        isCreatingDraft={isSubmitting}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onCreateDraft={handleCreateDraftHandoff}
      />

      {/* Error Alert if any */}
      {failureReason && (
        <ComposerErrorAlert
          error={failureReason}
          phase={activeJob?.kind}
          onRetry={handleRetryPhase}
          onDismiss={() => {}}
        />
      )}

      {/* Main Split-View Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Controls, Timeline & Chat (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Timeline */}
          {currentSessionId && (
            <ComposerTimelineProgress
              status={sessionStatus}
              activeJobKind={activeJob?.kind}
              progress={jobProgress}
              wantsCover={session?.brief?.wantsCoverImage !== false}
              isProcessing={isProcessing}
              onCancel={handleCancelSession}
              onRetry={handleRetryPhase}
            />
          )}

          {/* Initial Brief Form or Active Session Controls */}
          {!currentSessionId || sessionStatus === "collecting" ? (
            <div className="rounded-xl border border-border/80 bg-card p-5 shadow-xs">
              <h3 className="font-serif text-base font-bold text-foreground mb-4">
                Configuración del artículo
              </h3>
              <ComposerBriefForm
                initialBrief={session?.brief}
                isSubmitting={isSubmitting || isProcessing}
                onSubmit={handleBriefSubmit}
              />
            </div>
          ) : (
            /* Chat Stream */
            <ComposerChatPanel
              messages={
                (messages || []).map((m: Doc<"composerMessages">) => ({
                  id: m._id,
                  sessionId: m.sessionId,
                  tenantId: m.tenantId,
                  role: m.role,
                  content: m.content,
                  createdAt: m.createdAt,
                }))
              }
              isSending={isSubmitting}
              onSendMessage={handleSendMessage}
            />
          )}
        </div>

        {/* RIGHT COLUMN: Live Artifacts & Review Tabs (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 w-full h-10 p-1 bg-muted/40 border border-border/60">
              <TabsTrigger value="research" className="text-xs cursor-pointer gap-1.5">
                <Globe className="size-3.5" />
                <span className="hidden sm:inline">Fuentes</span>
                <span className="font-mono text-[10px] opacity-70">
                  ({sources?.length || 0})
                </span>
              </TabsTrigger>

              <TabsTrigger value="outline" className="text-xs cursor-pointer gap-1.5">
                <ListTree className="size-3.5" />
                <span>Outline</span>
              </TabsTrigger>

              <TabsTrigger value="article" className="text-xs cursor-pointer gap-1.5">
                <FileText className="size-3.5" />
                <span>Artículo</span>
              </TabsTrigger>

              <TabsTrigger value="cover" className="text-xs cursor-pointer gap-1.5">
                <ImageIcon className="size-3.5" />
                <span>Portada</span>
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Fuentes & Claims */}
            <TabsContent value="research" className="pt-3">
              <ComposerResearchTab
                sources={
                  (sources || []).map((s: Doc<"composerSources">) => ({
                    id: s._id,
                    sessionId: s.sessionId,
                    tenantId: s.tenantId,
                    url: s.url,
                    title: s.title,
                    domain: s.domain,
                    publisher: s.publisher,
                    publishedAt: s.publishedAt,
                    fetchedAt: s.fetchedAt,
                    snippet: s.snippet,
                    isExcluded: s.isExcluded,
                    claims: s.claims || [],
                  }))
                }
                onToggleSourceExclusion={handleToggleSource}
                onProceedToOutline={outlineArtifact ? undefined : handleLaunchOutline}
                onProceedToDraft={handleLaunchDraft}
                canProceed={!isProcessing && (sources?.length || 0) > 0}
              />
            </TabsContent>

            {/* TAB 2: Esquema / Outline */}
            <TabsContent value="outline" className="pt-3">
              <ComposerOutlineTab
                outlineArtifact={
                  outlineArtifact
                    ? {
                        id: outlineArtifact._id,
                        sessionId: outlineArtifact.sessionId,
                        tenantId: outlineArtifact.tenantId,
                        kind: outlineArtifact.kind,
                        content: outlineArtifact.content,
                        storageId: outlineArtifact.storageId,
                        version: outlineArtifact.version,
                        createdAt: outlineArtifact.createdAt,
                      }
                    : null
                }
                isGeneratingDraft={isSubmitting || isProcessing}
                onProceedToDraft={handleLaunchDraft}
                onRegenerateOutline={handleLaunchOutline}
                canProceed={!isProcessing}
              />
            </TabsContent>

            {/* TAB 3: Borrador TipTap */}
            <TabsContent value="article" className="pt-3">
              <ComposerArticleTab
                articleArtifact={
                  articleArtifact
                    ? {
                        id: articleArtifact._id,
                        sessionId: articleArtifact.sessionId,
                        tenantId: articleArtifact.tenantId,
                        kind: articleArtifact.kind,
                        content: articleArtifact.content,
                        storageId: articleArtifact.storageId,
                        version: articleArtifact.version,
                        createdAt: articleArtifact.createdAt,
                      }
                    : null
                }
                excerptArtifact={
                  excerptArtifact
                    ? {
                        id: excerptArtifact._id,
                        sessionId: excerptArtifact.sessionId,
                        tenantId: excerptArtifact.tenantId,
                        kind: excerptArtifact.kind,
                        content: excerptArtifact.content,
                        storageId: excerptArtifact.storageId,
                        version: excerptArtifact.version,
                        createdAt: excerptArtifact.createdAt,
                      }
                    : null
                }
                taxonomyArtifact={
                  taxonomyArtifact
                    ? {
                        id: taxonomyArtifact._id,
                        sessionId: taxonomyArtifact.sessionId,
                        tenantId: taxonomyArtifact.tenantId,
                        kind: taxonomyArtifact.kind,
                        content: taxonomyArtifact.content,
                        storageId: taxonomyArtifact.storageId,
                        version: taxonomyArtifact.version,
                        createdAt: taxonomyArtifact.createdAt,
                      }
                    : null
                }
                title={session?.title || session?.brief?.topic}
                isCreatingDraft={isSubmitting}
                onCreateDraft={handleCreateDraftHandoff}
                onRegenerateDraft={handleLaunchDraft}
              />
            </TabsContent>

            {/* TAB 4: Portada Visual */}
            <TabsContent value="cover" className="pt-3">
              <ComposerCoverTab
                coverUrl={coverInfo?.hasCover ? coverInfo.url : null}
                altText={coverInfo?.hasCover ? coverInfo.altText : null}
                version={coverInfo?.hasCover ? coverInfo.version : 1}
                wantsCover={session?.brief?.wantsCoverImage !== false}
                isGeneratingCover={isSubmitting || isProcessing}
                onGenerateCover={handleLaunchImage}
                onRegenerateCover={handleLaunchImage}
                canProceed={!isProcessing}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ComposerConfirmDialog
        open={dialogState.open}
        onOpenChange={(open) => setDialogState((prev) => ({ ...prev, open }))}
        title={dialogState.title}
        description={dialogState.description}
        actionLabel={dialogState.actionLabel}
        phase={dialogState.phase}
        isLoading={isSubmitting}
        onConfirm={async () => {
          if (dialogState.pendingAction) {
            await dialogState.pendingAction()
          }
        }}
      />
    </div>
  )
}
