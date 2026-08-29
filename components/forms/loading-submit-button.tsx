import * as React from "react"
import { Spinner } from "@/components/ui/spinner"
import { Button, type buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

export interface LoadingSubmitButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
  loadingText?: string
  icon?: React.ElementType
  children: React.ReactNode
}

export function LoadingSubmitButton({
  isLoading = false,
  loadingText,
  icon: Icon,
  disabled,
  children,
  className,
  ...props
}: LoadingSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={disabled || isLoading}
      className={cn("gap-2", className)}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner />
          {loadingText || children}
        </>
      ) : (
        <>
          {Icon && <Icon className="size-4" />}
          {children}
        </>
      )}
    </Button>
  )
}
