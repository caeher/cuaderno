"use client"

import * as React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export interface ConfirmDialogProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  onConfirm: () => void | Promise<void>
  isLoading?: boolean
  children?: React.ReactNode
}

export function ConfirmDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "destructive",
  onConfirm,
  isLoading = false,
  children,
}: ConfirmDialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const isControlled = open !== undefined
  const isOpen = isControlled ? open : internalOpen
  const setIsOpen = isControlled ? (onOpenChange || (() => {})) : setInternalOpen

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault()
    await onConfirm()
    setIsOpen(false)
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <AlertDialogTrigger render={trigger as any} />}
      {children && <AlertDialogTrigger render={children as any} />}
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            variant={variant}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Procesando..." : confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
