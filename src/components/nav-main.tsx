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
                    "group relative h-9 rounded-lg px-3 transition-all duration-200",
                    "hover:bg-primary/10",
                    "active:scale-[0.98]",
                    isActive &&
                      "!bg-sidebar-accent !text-sidebar-accent-foreground font-semibold"
                  )}
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
                            ? "text-primary-foreground scale-110"
                            : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
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
