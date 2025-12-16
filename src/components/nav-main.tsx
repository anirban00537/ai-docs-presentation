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
        <SidebarMenu className="space-y-1">
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
                    "group relative h-10 rounded-xl px-3 transition-all duration-200",
                    "hover:bg-white/50",
                    "active:scale-[0.98]",
                    isActive && "!bg-white/65 font-semibold"
                  )}
                  style={isActive ? {
                    backdropFilter: "blur(16px) saturate(180%)",
                    WebkitBackdropFilter: "blur(16px) saturate(180%)",
                    boxShadow: `
                      0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                      0 -1px 0 0 rgba(0, 0, 0, 0.03) inset,
                      0 2px 8px rgba(0, 0, 0, 0.06)
                    `
                  } : {
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-3 w-full"
                  >
                    {item.icon && (
                      <div 
                        className={cn(
                          "flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-200",
                          isActive 
                            ? "bg-primary/15 shadow-sm" 
                            : "bg-transparent group-hover:bg-white/40"
                        )}
                        style={isActive ? {
                          boxShadow: "0 2px 6px rgba(139, 92, 246, 0.15)"
                        } : undefined}
                      >
                        <item.icon
                          className={cn(
                            "h-4 w-4 transition-all duration-200",
                            isActive
                              ? "text-primary"
                              : "text-foreground/60 group-hover:text-foreground"
                          )}
                        />
                      </div>
                    )}
                    <span 
                      className={cn(
                        "text-sm tracking-tight transition-colors duration-200",
                        isActive 
                          ? "text-foreground font-semibold" 
                          : "text-foreground/70 font-medium group-hover:text-foreground"
                      )}
                    >
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
