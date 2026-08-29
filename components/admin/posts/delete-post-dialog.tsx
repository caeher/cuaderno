"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"
import { deletePostAction } from "@/app/actions/blog-actions"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "@/components/common/confirm-dialog"

export interface DeletePostDialogProps {
  postId: string
  postTitle: string
}

export function DeletePostDialog({ postId, postTitle }: DeletePostDialogProps) {
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const res = await deletePostAction(postId)
      if (res.success) {
        toast.success("Post eliminado correctamente")
      } else {
        toast.error("Error al eliminar el post")
      }
    } catch (error) {
      console.error(error)
      toast.error("Ocurrió un error inesperado al eliminar")
    } finally {
      setIsDeleting(false)
      setOpen(false)
    }
  }

  return (
    <>
      <DropdownMenuItem
        variant="destructive"
        onClick={(e) => {
          e.preventDefault()
          setOpen(true)
        }}
        className="cursor-pointer"
      >
        <Trash2 data-icon="inline-start" />
        Eliminar
      </DropdownMenuItem>

      <ConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="¿Eliminar este post?"
        description={`¿Estás seguro de que deseas eliminar permanentemente "${postTitle}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar post"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  )
}
