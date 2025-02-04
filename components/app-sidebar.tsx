"use client";
import { CheckCircle, Home, LogOut, List } from "lucide-react";
import { usePathname } from "next/navigation";

import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Hjem",
    href: "/",
    icon: Home,
  },
  {
    title: "Ankomst",
    href: "/check-in",
    icon: CheckCircle,
  },
  {
    title: "Afrejse",
    href: "/check-ud",
    icon: LogOut,
  },
  {
    title: "Fra A->Å",
    href: "/guide",
    icon: List,
  },
];

export function AppSidebar() {
  const { setOpenMobile } = useSidebar();
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Svinø</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="text-base" asChild isActive={pathname === item.href}>
                    <Link href={item.href} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
