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
  NotebookPen,
  Palette,
  Building2,
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


export function AdminSidebar({ currentUser }: { currentUser?: User | null }) {
  const pathname = usePathname()
  const { user, isLoaded, isSignedIn } = useUser()
  const composerHealth = useQuery(
    api.ai.getConfigHealth,
    isLoaded && isSignedIn ? {} : "skip"
  )
  const composerAvailable = composerHealth?.availableForCurrentTenant === true
  const visibleNavItems = navItems.filter(
    (item) => item.href !== "/panel/composer" || composerAvailable
  )

  const username = currentUser?.username || user?.username || "admin"
  const displayName = currentUser?.name || user?.fullName || "Administrador"
  const avatarUrl = currentUser?.avatarUrl || user?.imageUrl || ""

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="gap-3 border-b border-sidebar-border/70 pb-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" />}>
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
                <NotebookPen className="size-4" />
              </span>
              <span className="font-serif text-base font-medium">Cuaderno</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Organization / Blog Switcher */}
        <div className="px-2 group-data-[collapsible=icon]:hidden">
          <OrganizationSwitcher
            hidePersonal={false}
            afterCreateOrganizationUrl="/panel"
            afterSelectOrganizationUrl="/panel"
            afterLeaveOrganizationUrl="/panel"
            appearance={{
              elements: {
                rootBox: "w-full",
                organizationSwitcherTrigger: "w-full justify-between py-1.5 px-2 rounded-md border border-sidebar-border bg-sidebar-accent/50 text-xs text-sidebar-foreground hover:bg-sidebar-accent",
              },
            }}
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Contenido</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    render={<Link href={item.href} />}
                    isActive={pathname === item.href}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Cuenta</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link href="/panel/configuracion" />}
                  isActive={pathname === "/panel/configuracion"}
                  tooltip="Configuración"
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
                >
                  <Globe />
                  <span>Ver mi blog</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2 p-2">
            {user ? (
              <UserButton showName />
            ) : (
              <div className="flex items-center gap-2.5 px-1 py-1">
                <Avatar className="size-7">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="text-xs">{getInitials(displayName)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col overflow-hidden text-left text-xs">
                  <span className="truncate font-medium text-foreground">{displayName}</span>
                  <span className="truncate text-[10px] text-muted-foreground">@{username}</span>
                </div>
              </div>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
