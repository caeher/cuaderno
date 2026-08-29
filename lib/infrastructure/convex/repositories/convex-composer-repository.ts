/**
 * Implementación de infraestructura en Convex para ComposerRepository.
 */

import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type {
  ComposerArtifact,
  ComposerArtifactKind,
  ComposerBrief,
  ComposerJob,
  ComposerJobKind,
  ComposerMessage,
  ComposerMessageRole,
  ComposerSession,
  ComposerSessionStatus,
  ComposerSource,
} from "@/lib/domain/entities"
import type { ComposerRepository } from "@/lib/domain/repositories"
import { convexMutation, convexQuery } from "../client"
import {
  convexDocToComposerArtifact,
  convexDocToComposerJob,
  convexDocToComposerMessage,
  convexDocToComposerSession,
  convexDocToComposerSource,
} from "../mappers"

export class ConvexComposerRepository implements ComposerRepository {
  async findSessionById(id: string): Promise<ComposerSession | null> {
    const doc = await convexQuery(api.composer.getSession, {
      sessionId: id as Id<"composerSessions">,
    })
    return doc ? convexDocToComposerSession(doc) : null
  }

  async listSessionsByTenant(
    _tenantId: string,
    status?: ComposerSessionStatus
  ): Promise<ComposerSession[]> {
    const docs = await convexQuery(api.composer.listSessions, {
      status,
    })
    return (docs || []).map((doc) => convexDocToComposerSession(doc))
  }

  async createSession(brief?: Partial<ComposerBrief>): Promise<ComposerSession> {
    const sessionId = await convexMutation(api.composer.createSession, {
      brief: brief as any,
    })
    const doc = await convexQuery(api.composer.getSession, { sessionId })
    return convexDocToComposerSession(doc)
  }

  async updateBrief(sessionId: string, brief: Partial<ComposerBrief>): Promise<void> {
    await convexMutation(api.composer.updateBrief, {
      sessionId: sessionId as Id<"composerSessions">,
      brief: brief as any,
    })
  }

  async cancelSession(sessionId: string): Promise<void> {
    await convexMutation(api.composer.cancelSession, {
      sessionId: sessionId as Id<"composerSessions">,
    })
  }

  async listMessagesBySession(sessionId: string): Promise<ComposerMessage[]> {
    const docs = await convexQuery(api.composer.getSessionMessages, {
      sessionId: sessionId as Id<"composerSessions">,
    })
    return (docs || []).map((doc) => convexDocToComposerMessage(doc))
  }

  async appendMessage(
    sessionId: string,
    role: ComposerMessageRole,
    content: string
  ): Promise<string> {
    const messageId = await convexMutation(api.composer.appendMessage, {
      sessionId: sessionId as Id<"composerSessions">,
      role,
      content,
    })
    return messageId as string
  }

  async listJobsBySession(sessionId: string): Promise<ComposerJob[]> {
    const docs = await convexQuery(api.composer.getSessionJobs, {
      sessionId: sessionId as Id<"composerSessions">,
    })
    return (docs || []).map((doc) => convexDocToComposerJob(doc))
  }

  async enqueueJob(
    sessionId: string,
    kind: ComposerJobKind,
    idempotencyKey: string
  ): Promise<string> {
    const jobId = await convexMutation(api.composer.enqueueJob, {
      sessionId: sessionId as Id<"composerSessions">,
      kind,
      idempotencyKey,
    })
    return jobId as string
  }

  async listSourcesBySession(sessionId: string): Promise<ComposerSource[]> {
    const docs = await convexQuery(api.composer.getSessionSources, {
      sessionId: sessionId as Id<"composerSessions">,
    })
    return (docs || []).map((doc) => convexDocToComposerSource(doc))
  }

  async toggleSourceExclusion(
    sessionId: string,
    sourceId: string,
    isExcluded: boolean
  ): Promise<void> {
    await convexMutation(api.composer.toggleSourceExclusion, {
      sessionId: sessionId as Id<"composerSessions">,
      sourceId: sourceId as Id<"composerSources">,
      isExcluded,
    })
  }

  async listArtifactsBySession(
    sessionId: string,
    kind?: ComposerArtifactKind
  ): Promise<ComposerArtifact[]> {
    const docs = await convexQuery(api.composer.getSessionArtifacts, {
      sessionId: sessionId as Id<"composerSessions">,
      kind,
    })
    return (docs || []).map((doc) => convexDocToComposerArtifact(doc))
  }

  async createDraftFromSession(sessionId: string): Promise<string> {
    const postId = await convexMutation(api.composer.createDraftFromSession, {
      sessionId: sessionId as Id<"composerSessions">,
    })
    return postId as string
  }

  async getSessionUsage(sessionId: string): Promise<{
    events: any[]
    totalEstimatedCostUsd: number
    totalInputTokens: number
    totalOutputTokens: number
    totalImageCount: number
    totalToolCalls: number
  }> {
    const usage = await convexQuery(api.composer.getSessionUsage, {
      sessionId: sessionId as Id<"composerSessions">,
    })
    return (
      usage || {
        events: [],
        totalEstimatedCostUsd: 0,
        totalInputTokens: 0,
        totalOutputTokens: 0,
        totalImageCount: 0,
        totalToolCalls: 0,
      }
    )
  }
}
