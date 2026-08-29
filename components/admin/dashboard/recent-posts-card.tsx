"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Eye, Image as ImageIcon, MoreHorizontal, Pencil, Star } from "lucide-react"
import type { Post } from "@/lib/domain/entities"
import { formatCompactNumber, formatShortDate } from "@/lib/format"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/common/empty-state"
import { DeletePostDialog } from "@/components/admin/posts/delete-post-dialog"

const statusLabels: Record<string, string> = {
  published: "Publicado",
  draft: "Borrador",
  scheduled: "Programado",
}

/** Vocabulario cerrado de badges de estado — la regla de los tres colores. */
const statusBadgeStyles: Record<string, string> = {
  published: "bg-perf-tint text-perf-strong",
  draft: "bg-warn-tint text-warn-ink",
  scheduled: "bg-ia-tint text-ia",
}

const NEUTRAL_BADGE = "bg-neutral-tint text-neutral"

export interface RecentPostsCardProps {
  posts: Post[]
}

export function RecentPostsCard({ posts }: RecentPostsCardProps) {
  return (
    <Card className="gap-0 overflow-hidden rounded-xl border border-border py-0 shadow-none ring-0">
      <CardHeader className="flex flex-row items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <CardTitle className="text-base font-medium text-foreground">Entradas recientes</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Tus últimas publicaciones y borradores.
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 cursor-pointer text-ia hover:bg-ia-tint hover:text-ia-hover"
          render={<Link href="/panel/posts" />}
        >
          Ver todas
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardHeader>

      <CardContent className="border-t border-border px-0 py-0">
        {posts.length === 0 ? (
          <div className="px-5 py-8">
            <EmptyState
              preset="posts"
              bordered={false}
              title="Aún no tienes entradas"
              description="Crea tu primera entrada y empieza a publicar."
              action={
                <Button size="sm" className="cursor-pointer" render={<Link href="/panel/posts/nuevo" />}>
                  Nueva entrada
                </Button>
              }
            />
          </div>
        ) : (
          <Table className="[&_td]:px-3 [&_td:first-child]:pl-5 [&_td:last-child]:pr-5 [&_th]:px-3 [&_th:first-child]:pl-5 [&_th:last-child]:pr-5">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-11 text-xs font-medium text-muted-foreground">Título</TableHead>
                <TableHead className="h-11 text-xs font-medium text-muted-foreground">Estado</TableHead>
                <TableHead className="h-11 text-xs font-medium text-muted-foreground">Vistas</TableHead>
                <TableHead className="h-11 text-xs font-medium text-muted-foreground">Fecha</TableHead>
                <TableHead className="h-11 w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id} className="h-[68px]">
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-sunken">
                        {post.coverUrl ? (
                          <img src={post.coverUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <ImageIcon className="size-4 text-text-tertiary" />
                        )}
                      </div>
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <div className="flex items-start gap-1.5">
                          {post.featured && (
                            <Star className="mt-0.5 size-3.5 shrink-0 fill-warn text-warn" />
                          )}
                          <Link
                            href={`/panel/posts/${post.id}`}
                            className="line-clamp-2 text-sm font-medium whitespace-normal text-foreground hover:underline"
                          >
                            {post.title}
                          </Link>
                        </div>
                        <span className="truncate text-xs text-text-tertiary">/{post.slug}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 align-middle">
                    <Badge
                      className={cn(
                        "h-6 rounded-full border-transparent px-2.5 text-xs font-medium",
                        statusBadgeStyles[post.status] ?? NEUTRAL_BADGE
                      )}
                    >
                      {statusLabels[post.status] ?? post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3 align-middle text-sm tabular-nums text-muted-foreground">
                    {formatCompactNumber(post.views)}
                  </TableCell>
                  <TableCell className="py-3 align-middle text-sm tabular-nums text-muted-foreground">
                    {formatShortDate(post.updatedAt)}
                  </TableCell>
                  <TableCell className="py-3 align-middle">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="cursor-pointer text-muted-foreground hover:text-foreground"
                          />
                        }
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem render={<Link href={`/panel/posts/${post.id}`} />} className="cursor-pointer">
                            <Pencil data-icon="inline-start" />
                            Editar
                          </DropdownMenuItem>
                          {post.status === "published" && (
                            <DropdownMenuItem
                              render={<Link href={`/post/${post.slug}`} target="_blank" rel="noreferrer" />}
                              className="cursor-pointer"
                            >
                              <Eye data-icon="inline-start" />
                              Ver entrada
                            </DropdownMenuItem>
                          )}
                          <DeletePostDialog postId={post.id} postTitle={post.title} />
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
