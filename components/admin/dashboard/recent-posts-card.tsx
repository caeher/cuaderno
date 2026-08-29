"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRight, Eye, MoreHorizontal, Palette, Pencil, Star } from "lucide-react"
import type { Post } from "@/lib/domain/entities"
import { formatCompactNumber, formatShortDate } from "@/lib/format"
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

export interface RecentPostsCardProps {
  posts: Post[]
}

export function RecentPostsCard({ posts }: RecentPostsCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle>Posts recientes</CardTitle>
          <CardDescription>Tus últimas publicaciones, borradores y diseños.</CardDescription>
        </div>
        <Button variant="ghost" size="sm" render={<Link href="/panel/posts" />}>
          Ver todos ({posts.length})
          <ArrowRight data-icon="inline-end" />
        </Button>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <EmptyState
            preset="posts"
            bordered={false}
            action={
              <Button size="sm" render={<Link href="/panel/posts/nuevo" />}>
                Crear post
              </Button>
            }
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Vistas</TableHead>
                <TableHead className="text-right">Actualizado</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map((post) => (
                <TableRow key={post.id}>
                  <TableCell className="max-w-72 truncate font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      {post.featured && <Star className="size-3.5 fill-amber-400 text-amber-500 shrink-0" />}
                      <Link href={`/panel/posts/${post.id}`} className="hover:underline truncate">
                        {post.title}
                      </Link>
                      {post.editorMode === "elementor" && (
                        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0 text-violet-600 dark:text-violet-400 border-violet-300 dark:border-violet-800">
                          Diseñador
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={post.status === "published" ? "default" : post.status === "scheduled" ? "outline" : "secondary"}>
                      {statusLabels[post.status] ?? post.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatCompactNumber(post.views)}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">
                    {formatShortDate(post.updatedAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" className="cursor-pointer" />}>
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuGroup>
                          <DropdownMenuItem render={<Link href={`/panel/posts/${post.id}`} />} className="cursor-pointer">
                            <Pencil data-icon="inline-start" />
                            Editar (Tiptap)
                          </DropdownMenuItem>
                          <DropdownMenuItem render={<Link href={`/panel/posts/${post.id}/designer`} />} className="cursor-pointer">
                            <Palette data-icon="inline-start" />
                            Diseñador Visual
                          </DropdownMenuItem>
                          {post.status === "published" && (
                            <DropdownMenuItem
                              render={<Link href={`/post/${post.slug}`} target="_blank" rel="noreferrer" />}
                              className="cursor-pointer"
                            >
                              <Eye data-icon="inline-start" />
                              Ver publicado
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
