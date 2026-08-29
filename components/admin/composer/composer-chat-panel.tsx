"use client"

import * as React from "react"
import { Send, Bot, User, Sparkles, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ComposerMessage } from "@/lib/domain/entities"

export interface ComposerChatPanelProps {
  messages: ComposerMessage[]
  isSending?: boolean
  disabled?: boolean
  onSendMessage: (content: string) => void | Promise<void>
  className?: string
}

export function ComposerChatPanel({
  messages,
  isSending = false,
  disabled = false,
  onSendMessage,
  className = "",
}: ComposerChatPanelProps) {
  const [input, setInput] = React.useState("")
  const scrollRef = React.useRef<HTMLDivElement | null>(null)

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = () => {
    if (!input.trim() || disabled || isSending) return
    onSendMessage(input.trim())
    setInput("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className={`flex flex-col h-full rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 bg-muted/20 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Sparkles className="size-3.5" />
          </div>
          <span className="text-xs font-semibold text-foreground">Conversación guiada</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {messages.length} {messages.length === 1 ? "mensaje" : "mensajes"}
        </span>
      </div>

      {/* Messages List */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3.5 min-h-[260px] max-h-[420px]">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 text-muted-foreground">
            <Bot className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-xs font-medium text-foreground">Asistente listo</p>
            <p className="text-[11px] mt-0.5 max-w-xs">
              Configura tu brief para iniciar la investigación o escribe instrucciones específicas para guiar la redacción.
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user"
            const isSystem = msg.role === "system"

            if (isSystem) {
              return (
                <div key={msg.id} className="flex items-center justify-center my-1">
                  <span className="rounded-full bg-muted/60 px-3 py-1 text-[10px] text-muted-foreground flex items-center gap-1.5">
                    <AlertCircle className="size-3" />
                    {msg.content}
                  </span>
                </div>
              )
            }

            return (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted border border-border text-foreground"
                  }`}
                >
                  {isUser ? <User className="size-3" /> : <Bot className="size-3 text-primary" />}
                </div>

                <div
                  className={`flex flex-col gap-1 max-w-[85%] rounded-lg px-3.5 py-2.5 text-xs leading-relaxed ${
                    isUser
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted/50 border border-border/70 text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <span
                    className={`text-[9px] self-end opacity-70 ${
                      isUser ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 border-t border-border/60 bg-muted/10 flex items-end gap-2">
        <Textarea
          placeholder="Escribe una indicación o corrección para Composer..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled || isSending}
          rows={1}
          className="min-h-[38px] max-h-24 resize-none text-xs bg-background"
        />
        <Button
          type="button"
          size="icon-sm"
          onClick={handleSend}
          disabled={disabled || isSending || !input.trim()}
          className="size-9 shrink-0 cursor-pointer"
        >
          <Send className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
