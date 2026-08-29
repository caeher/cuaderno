import * as React from "react"
import {
  ArrowRight,
  ArrowDown,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Zap,
  Smartphone,
  CheckCircle,
  Share2,
  Mail,
  User as UserIcon,
} from "lucide-react"

export const ICON_MAP: Record<string, React.ElementType> = {
  ArrowRight,
  ArrowDown,
  ExternalLink,
  Info,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  Zap,
  Smartphone,
  CheckCircle,
  Share2,
  Mail,
  User: UserIcon,
}

export function getWidgetIcon(name?: string): React.ElementType {
  if (!name || !ICON_MAP[name]) return Sparkles
  return ICON_MAP[name]
}
