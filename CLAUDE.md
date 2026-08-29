@AGENTS.md

Este archivo es el punto de entrada de **Claude Code**. La guía del producto, capas, auth, Convex y Composer vive en `AGENTS.md`. No dupliques convenciones aquí: actualiza `AGENTS.md` y deja este archivo para tooling de Claude.

## Arranque de una tarea

1. Lee `AGENTS.md` y, si el cambio toca un área documentada, el doc de `docs/` que corresponda (tabla al final de `AGENTS.md`).
2. Localiza el símbolo o el flujo con graphify / ebrain (abajo) antes de un `grep` exploratorio.
3. Respeta las capas: dominio → application → infrastructure → `convex/` / Server Action delgada.
4. Next.js 16: confirma APIs en `node_modules/next/dist/docs/` si no estás seguro. El middleware del repo es `proxy.ts`.
5. Convex en local: `pnpm dev` o `pnpm convex:dev`. Nunca `convex deploy` salvo producción explícita.

## ebrain Search + Code Guidance
<!-- ebrain-guidance:start -->

This project is wired to **ebrain** (semantic knowledge, cross-source) + **graphify** (code structure). Prefer them over `grep`/`Glob` when the question is semantic or you don't yet know the exact identifier. `grep` is still right for exact strings.

**Semantic / knowledge questions** — "what did we decide", "how does X work conceptually", anything cross-project:
- In a Claude Code session: `mcp__ebrain__query "<question>"` (persistent MCP, fast; cross-source: vault + company-brain).
- From the terminal: `~/.config/ebrain/ebrain-q "<question>"` (fan-out + merge across federated sources).

**Code structure questions** — "where is X defined", "what calls Y", "the payment flow":
- `graphify query "<question>"` — this repo's knowledge graph (auto-reconstructed on commit).
- Cross-project: `bash "$HOME/Documents/Dev Brain/.scripts/query-all.sh" "<question>"`.
- Single symbol: `cat "$HOME/Documents/Dev Brain/code-graph/<project>/<Symbol>.md"`.

Cost note: ebrain semantic search is ~free (<$0.50/mo even at heavy use). `qmd search "<term>"` remains the zero-cost / offline BM25 keyword fallback.

<!-- ebrain-guidance:end -->
