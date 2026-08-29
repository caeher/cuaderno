import * as React from "react"
import { Search } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { cn } from "@/lib/utils"

export interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name?: string
  placeholder?: string
  action?: string
  hiddenParams?: Record<string, string | undefined>
  containerClassName?: string
}

export function SearchInput({
  name = "q",
  placeholder = "Buscar...",
  defaultValue,
  action,
  hiddenParams,
  containerClassName,
  className,
  ...props
}: SearchInputProps) {
  const content = (
    <InputGroup className={cn("w-full", className)}>
      <InputGroupInput
        name={name}
        placeholder={placeholder}
        defaultValue={defaultValue}
        {...props}
      />
      <InputGroupAddon>
        <Search className="size-4 text-text-tertiary" />
      </InputGroupAddon>
    </InputGroup>
  )

  if (action) {
    return (
      <form action={action} method="get" className={cn("w-full max-w-md", containerClassName)}>
        {hiddenParams &&
          Object.entries(hiddenParams).map(([key, val]) =>
            val ? <input key={key} type="hidden" name={key} value={val} /> : null
          )}
        {content}
      </form>
    )
  }

  return content
}
