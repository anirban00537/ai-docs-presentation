"use client";

import Link from "next/link";
import { type Icon } from "@tabler/icons-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1.5">
          {items.map((item) => {
            const isActive =
              pathname === item.url || pathname.startsWith(item.url + "/");
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  asChild
                  size="default"
                  isActive={isActive}
                  className={cn(
                    "group relative h-9 rounded-xl px-3 transition-all duration-200",
                    "hover:bg-white/45 hover:backdrop-blur-sm",
                    "active:scale-[0.98]",
                    isActive &&
                      "!bg-white/60 font-semibold shadow-sm"
                  )}
                  style={isActive ? {
                    backdropFilter: "blur(12px)",
                    boxShadow: "0 1px 0 0 rgba(255, 255, 255, 0.8) inset, 0 2px 8px rgba(0, 0, 0, 0.06)"
                  } : undefined}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-2.5 w-full"
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "h-4 w-4 transition-all duration-200",
                          isActive
                            ? "text-foreground scale-110 drop-shadow-sm"
                            : "text-muted-foreground/80 group-hover:text-foreground group-hover:scale-105 group-hover:drop-shadow-sm"
                        )}
                      />
                    )}
                    <span className="text-sm font-medium tracking-tight">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
