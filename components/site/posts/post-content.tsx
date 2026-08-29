"use client"

import * as React from "react"
import { CodeBlockRenderer } from "@/components/common/code-block-renderer"

export interface PostContentProps {
  content: string
}

/**
 * Renders post content. Supports two formats:
 * - Rich HTML produced by the Tiptap block editor (Notion-like)
 * - The lightweight markdown-style format used by mock posts: blank-line
 *   separated paragraphs, "## " headings, and "- " bullet lists.
 */
export function PostContent({ content }: PostContentProps) {
  const trimmed = content.trim()

  // Check if content is HTML from Tiptap or contains HTML tags
  if (/^<([a-z0-9-]+)[\s>]/i.test(trimmed)) {
    return (
      <div
        className="tiptap post-content flex flex-col gap-6 text-foreground"
        dangerouslySetInnerHTML={{ __html: trimmed }}
      />
    )
  }

  // Fallback for markdown-style plain text posts
  const blocks = trimmed.split(/\n\n+/)

  return (
    <div className="post-content flex flex-col gap-6 text-foreground">
      {blocks.map((block, index) => {
        if (block.startsWith("```")) {
          const lines = block.split("\n")
          const lang = lines[0].replace("```", "").trim()
          const code = lines.slice(1, -1).join("\n")
          return <CodeBlockRenderer key={index} code={code} language={lang} />
        }

        if (block.startsWith("## ")) {
          return (
            <h2 key={index} className="text-xl font-semibold leading-snug tracking-tight text-balance text-foreground">
              {block.replace("## ", "")}
            </h2>
          )
        }

        if (block.split("\n").every((line) => line.startsWith("- "))) {
          return (
            <ul key={index} className="flex flex-col gap-2 pl-1">
              {block.split("\n").map((line, lineIndex) => (
                <li key={lineIndex} className="flex gap-2 text-base text-foreground">
                  <span className="mt-2.5 size-1.5 flex-none rounded-full bg-text-tertiary" />
                  <span>{line.replace("- ", "")}</span>
                </li>
              ))}
            </ul>
          )
        }

        return (
          <p key={index} className="text-base text-foreground">
            {block}
          </p>
        )
      })}
    </div>
  )
}
