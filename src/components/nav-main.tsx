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
                  size="lg"
                  isActive={isActive}
                  className={cn(
                    "group relative h-12 rounded-xl px-4 transition-all duration-200",
                    "hover:bg-primary/10",
                    "active:scale-[0.98]",
                    isActive &&
                      "!bg-primary/15 !text-primary-foreground font-semibold"
                  )}
                >
                  <Link
                    href={item.url}
                    className="flex items-center gap-3 w-full"
                  >
                    {item.icon && (
                      <item.icon
                        className={cn(
                          "h-5 w-5 transition-all duration-200",
                          isActive
                            ? "text-primary-foreground scale-110"
                            : "text-muted-foreground group-hover:text-primary group-hover:scale-110"
                        )}
                      />
                    )}
                    <span className="text-base font-medium tracking-tight">
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
