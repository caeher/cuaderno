/**
 * Server-Side Speech Script Sanitizer
 *
 * Converts rich editorial post content (HTML, Markdown, TipTap, rich text)
 * into a clean, natural, and pronunciation-safe speech script for voice synthesis (Vapi / TTS).
 *
 * Excludes:
 * - HTML and XML tags (<script>, <style>, <figure>, <pre>, <code>, etc.)
 * - Code blocks and syntax-highlighted snippets
 * - Raw unreadable URLs and query strings
 * - Markdown decoration, image embeds (![...](...)), and non-editorial blocks
 * - Excessive symbols, emojis, and unpronounceable characters
 */

export interface SpeechScriptResult {
  speechScript: string
  title: string
  wordCount: number
  characterCount: number
  estimatedDurationSeconds: number
  language: string
}

export interface SanitizePostOptions {
  language?: string
  includeExcerpt?: boolean
  maxCharacters?: number
  wordsPerMinute?: number
}

const DEFAULT_OPTIONS: Required<SanitizePostOptions> = {
  language: "es",
  includeExcerpt: true,
  maxCharacters: 50000,
  wordsPerMinute: 140, // standard natural speaking rate in Spanish / English
}

/**
 * Decodes common HTML entities to natural spoken text or punctuation.
 */
function decodeHtmlEntities(text: string, language: string = "es"): string {
  const ampersandSpoken = language.toLowerCase().startsWith("es") ? " y " : " and "

  return text
    .replace(/&amp;/gi, ampersandSpoken)
    .replace(/&lt;/gi, " menor que ")
    .replace(/&gt;/gi, " mayor que ")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&mdash;/gi, " — ")
    .replace(/&ndash;/gi, " - ")
    .replace(/&hellip;/gi, "... ")
    .replace(/&#(\d+);/g, (_, dec) => {
      try {
        return String.fromCharCode(parseInt(dec, 10))
      } catch {
        return ""
      }
    })
}

/**
 * Removes non-editorial blocks such as code blocks, scripts, styles, SVG, and iframes.
 */
function removeNonEditorialBlocks(htmlOrMarkdown: string): string {
  let cleaned = htmlOrMarkdown

  // 1. Remove <script>, <style>, <svg>, <canvas>, <noscript>, <iframe> elements entirely
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
  cleaned = cleaned.replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, " ")
  cleaned = cleaned.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, " ")
  cleaned = cleaned.replace(/<noscript\b[^<]*(?:(?!<\/noscript>)<[^<]*)*<\/noscript>/gi, " ")

  // 2. Remove HTML code blocks (<pre><code>...</code></pre> or <pre>...</pre>)
  cleaned = cleaned.replace(/<pre\b[^<]*(?:(?!<\/pre>)<[^<]*)*<\/pre>/gi, " ")
  cleaned = cleaned.replace(/<code\b[^<]*(?:(?!<\/code>)<[^<]*)*<\/code>/gi, " ")

  // 3. Remove Markdown fenced code blocks (```...```)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, " ")
  cleaned = cleaned.replace(/`([^`]+)`/g, "$1") // inline code keeps text

  // 4. Remove Markdown image embeds ![alt](url)
  cleaned = cleaned.replace(/!\[.*?\]\(.*?\)/g, " ")

  // 5. Remove HTML image, audio, video and figure elements
  cleaned = cleaned.replace(/<img\b[^>]*\/?>/gi, " ")
  cleaned = cleaned.replace(/<video\b[^<]*(?:(?!<\/video>)<[^<]*)*<\/video>/gi, " ")
  cleaned = cleaned.replace(/<audio\b[^<]*(?:(?!<\/audio>)<[^<]*)*<\/audio>/gi, " ")
  cleaned = cleaned.replace(/<figcaption\b[^<]*(?:(?!<\/figcaption>)<[^<]*)*<\/figcaption>/gi, " ")

  return cleaned
}

/**
 * Strips raw URLs and replaces link markup with readable anchor text.
 */
function sanitizeLinksAndUrls(text: string): string {
  let cleaned = text

  // 1. Convert Markdown links [Anchor Text](https://...) to just "Anchor Text"
  cleaned = cleaned.replace(/\[([^\]]+)\]\((?:https?|ftp|file):\/\/[^\s)]+\)/gi, "$1")

  // 2. Convert HTML links <a href="...">Anchor Text</a> to just "Anchor Text"
  cleaned = cleaned.replace(/<a\b[^>]*>([\s\S]*?)<\/a>/gi, "$1")

  // 3. Strip bare unreadable URLs (e.g. https://domain.com/path?foo=bar#hash)
  cleaned = cleaned.replace(/(?:https?|ftp):\/\/[^\s/$.?#].[^\s]*/gi, "")

  // 4. Strip www.domain.com references that have long query parameters
  cleaned = cleaned.replace(/\bwww\.[a-z0-9.-]+\.[a-z]{2,}(?:\/[^\s]*)?/gi, "")

  return cleaned
}

/**
 * Strips remaining HTML tags while preserving proper sentence punctuation and paragraph breaks.
 */
function stripHtmlTags(html: string): string {
  let text = html

  // Add a period or space before closing block tags to avoid words merging
  text = text.replace(/<\/(p|h[1-6]|li|blockquote|div|tr)>/gi, ". ")
  text = text.replace(/<br\s*\/?>/gi, ". ")

  // Strip all other HTML tags
  text = text.replace(/<[^>]+>/g, " ")

  return text
}

/**
 * Cleans Markdown formatting markers (headers, bold, italics, blockquotes, bullet points).
 */
function stripMarkdownMarkers(markdown: string): string {
  let text = markdown

  // Remove Markdown headers (# Header -> Header.)
  text = text.replace(/^#{1,6}\s+(.+)$/gm, "$1.")

  // Remove Markdown blockquotes (> Quote -> Quote)
  text = text.replace(/^>\s+/gm, "")

  // Remove Markdown bullet points (- item, * item, + item, 1. item)
  text = text.replace(/^[\s]*[-*+]\s+/gm, "")
  text = text.replace(/^[\s]*\d+\.\s+/gm, "")

  // Remove bold and italic markers (**bold**, *italic*, __bold__, _italic_, ~~strikethrough~~)
  text = text.replace(/(\*\*|__)(.*?)\1/g, "$2")
  text = text.replace(/(\*|_)(.*?)\1/g, "$2")
  text = text.replace(/~~(.*?)~~/g, "$1")

  // Remove horizontal rules (---, ***, ___)
  text = text.replace(/^[\s]*[-*_]{3,}[\s]*$/gm, " ")

  return text
}

/**
 * Normalizes punctuation, pauses, whitespaces, and typography for natural TTS rhythm.
 */
function normalizeSpeechProsody(text: string): string {
  let normalized = text

  // 1. Remove control characters and non-printable characters
  normalized = normalized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")

  // 2. Remove emojis and excessive decorative symbols
  normalized = normalized.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, "")

  // 3. Normalize repeated punctuation (. . ., ... -> ...)
  normalized = normalized.replace(/\.{2,}/g, "... ")
  normalized = normalized.replace(/!{2,}/g, "! ")
  normalized = normalized.replace(/\?{2,}/g, "? ")
  normalized = normalized.replace(/\s+([.,!?;:])/g, "$1")

  // 4. Remove consecutive duplicate punctuation like "..", ".,", ",."
  normalized = normalized.replace(/\.+/g, ".")
  normalized = normalized.replace(/\s*\.\s*\./g, ".")
  normalized = normalized.replace(/,\./g, ".")
  normalized = normalized.replace(/\.,/g, ".")

  // 5. Replace multiple whitespaces and line breaks with a single clean space
  normalized = normalized.replace(/\s+/g, " ").trim()

  return normalized
}

/**
 * Converts post title, optional excerpt, and rich content into a clean,
 * pronunciation-safe speech script ready for Vapi AI narration.
 */
export function cleanPostToSpeechScript(
  title: string,
  content: string,
  excerpt?: string | null,
  options?: SanitizePostOptions
): SpeechScriptResult {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const cleanTitle = (title || "").trim()

  // 1. Step: Remove non-editorial blocks (code blocks, embeds, scripts)
  let rawBody = removeNonEditorialBlocks(content || "")
  let rawExcerpt = excerpt ? removeNonEditorialBlocks(excerpt) : ""

  // 2. Step: Sanitize links and strip bare URLs
  rawBody = sanitizeLinksAndUrls(rawBody)
  rawExcerpt = sanitizeLinksAndUrls(rawExcerpt)

  // 3. Step: Strip HTML tags and markdown formatting
  rawBody = stripHtmlTags(rawBody)
  rawBody = stripMarkdownMarkers(rawBody)
  rawExcerpt = stripHtmlTags(rawExcerpt)
  rawExcerpt = stripMarkdownMarkers(rawExcerpt)

  // 4. Step: Decode HTML entities
  rawBody = decodeHtmlEntities(rawBody, opts.language)
  rawExcerpt = decodeHtmlEntities(rawExcerpt, opts.language)

  // 5. Step: Normalize prosody and spacing
  const cleanBody = normalizeSpeechProsody(rawBody)
  const cleanExcerpt = normalizeSpeechProsody(rawExcerpt)

  // 6. Step: Build composed script
  const parts: string[] = []

  if (cleanTitle) {
    // Ensure title ends with a period for a natural pause before body
    const titleWithPause = cleanTitle.replace(/[.,!?;:]*$/, ".")
    parts.push(titleWithPause)
  }

  // Include excerpt if requested and distinct from body start
  if (opts.includeExcerpt && cleanExcerpt && !cleanBody.startsWith(cleanExcerpt)) {
    const excerptWithPause = cleanExcerpt.replace(/[.,!?;:]*$/, ".")
    parts.push(excerptWithPause)
  }

  if (cleanBody) {
    parts.push(cleanBody)
  }

  let fullScript = parts.join(" ")

  // 7. Enforce maximum safety length
  if (fullScript.length > opts.maxCharacters) {
    fullScript = fullScript.substring(0, opts.maxCharacters).replace(/\s+\S*$/, ".")
  }

  // Calculate stats
  const words = fullScript.trim() ? fullScript.trim().split(/\s+/).length : 0
  const estimatedSeconds = Math.max(1, Math.round((words / opts.wordsPerMinute) * 60))

  return {
    speechScript: fullScript,
    title: cleanTitle,
    wordCount: words,
    characterCount: fullScript.length,
    estimatedDurationSeconds: estimatedSeconds,
    language: opts.language,
  }
}
