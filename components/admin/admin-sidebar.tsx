"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageSquare,
  Settings,
  Globe,
  BookOpen,
  Palette,
  FolderTree,
  Sparkles,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserButton, OrganizationSwitcher, useUser } from "@clerk/nextjs"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { User } from "@/lib/domain/entities"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/format"
import { buildTenantUrl } from "@/lib/tenant-utils"

const navItems = [
  { title: "Panel", href: "/panel", icon: LayoutDashboard },
  { title: "Posts", href: "/panel/posts", icon: FileText },
  { title: "Nuevo post", href: "/panel/posts/nuevo", icon: PlusCircle },
  { title: "Composer", href: "/panel/composer", icon: Sparkles },
  { title: "Diseño del blog", href: "/panel/disenador", icon: Palette },
  { title: "Categorías y Etiquetas", href: "/panel/taxonomias", icon: FolderTree },
  { title: "Comentarios", href: "/panel/comentarios", icon: MessageSquare },
]

/**
 * Item de navegación del sidebar.
 * Reposo: texto secundario sobre superficie transparente.
 * Hover: gris hundido — nunca índigo, el índigo es solo del item activo.
 * Activo: pill índigo tenue (bg-sidebar-accent) + texto e icono índigo.
 * Las variantes `data-active:hover:*` existen para que el pill activo NO
 * pierda el índigo al pasar el cursor (ganan por especificidad).
 */
const navItemClass = [
  "h-11 gap-3 rounded-lg px-3 text-muted-foreground [&_svg]:size-5",
  "hover:bg-muted hover:text-foreground",
  "data-active:hover:bg-sidebar-accent data-active:hover:text-sidebar-accent-foreground",
].join(" ")

export function AdminSidebar({ currentUser }: { currentUser?: User | null }) {
  const pathname = usePathname()
  const { user } = useUser()
  const composerHealth = useQuery(api.ai.getConfigHealth, {})
  const composerAvailable = composerHealth?.availableForCurrentTenant === true
  const visibleNavItems = navItems.filter(
    (item) => item.href !== "/panel/composer" || composerAvailable
  )

  const username = currentUser?.username || user?.username || "admin"
  const displayName = currentUser?.name || user?.fullName || "Administrador"
  const avatarUrl = currentUser?.avatarUrl || user?.imageUrl || ""

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="gap-3 p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              render={<Link href="/" />}
              className="h-14 gap-3 rounded-lg px-2 hover:bg-transparent hover:text-foreground active:bg-transparent active:text-foreground [&_svg]:size-5"
            >
              <BookOpen className="text-foreground" />
              <span className="text-xl font-semibold lowercase tracking-tight text-foreground">
                Cuaderno
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Organization / Blog Switcher */}
        <div className="px-2 pb-1 group-data-[collapsible=icon]:hidden">
          <OrganizationSwitcher
            hidePersonal={false}
            afterCreateOrganizationUrl="/panel"
            afterSelectOrganizationUrl="/panel"
            afterLeaveOrganizationUrl="/panel"
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger:
                  "w-full justify-between gap-2 rounded-lg border border-border bg-card px-2 py-1.5 text-xs text-foreground transition-colors hover:bg-muted",
              },
            }}
          />
        </div>
      </SidebarHeader>
      <SidebarContent className="gap-0 pt-1">
        <SidebarGroup className="p-2">
          <SidebarGroupLabel className="hidden">Contenido</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className={navItemClass}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup className="mx-2 mt-2 w-auto border-t border-sidebar-border p-0 pt-3">
          <SidebarGroupLabel className="hidden">Cuenta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/panel/configuracion" />}
                  isActive={pathname === "/panel/configuracion"}
                  tooltip="Configuración"
                  className={navItemClass}
                >
                  <Settings />
                  <span>Configuración</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={
                    <a
                      href={buildTenantUrl({
                        tenantSlug: username,
                        subdomainEnabled: currentUser?.subdomainEnabled ?? true,
                        customDomain: currentUser?.customDomain,
                        absolute: true,
                      })}
                      target="_blank"
                      rel="noreferrer"
                    />
                  }
                  tooltip="Ver blog público"
                  className={navItemClass}
                >
                  <Globe />
                  <span>Ver mi blog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="gap-2 border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 p-1">
            {user ? (
              <UserButton showName />
            ) : (
              <div className="flex items-center gap-2.5 px-1 py-1">
                <Avatar className="size-8 border border-border">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="bg-muted text-xs text-muted-foreground">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden text-left">
                  <span className="truncate text-sm font-medium text-foreground">{displayName}</span>
                  <span className="truncate text-xs text-text-tertiary">@{username}</span>
                </div>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
