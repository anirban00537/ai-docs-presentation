"use client";

import * as React from "react";
import Link from "next/link";
import { IconSparkles, type Icon } from "@tabler/icons-react";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { AppleButton } from "./editor/apple-button";

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string;
    url: string;
    icon: Icon;
  }[];
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <div className="mx-2 mt-4 mb-2">
        <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 p-4 shadow-lg shadow-primary/10 backdrop-blur-sm">
          {/* Premium glow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-yellow-400/20 to-primary/20 opacity-50 blur-xl" />
          
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0 relative">
                <div className="absolute inset-0 bg-primary/30 blur-md rounded-full" />
                <IconSparkles className="size-5 text-primary relative z-10 drop-shadow-sm" />
              </div>
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-foreground tracking-tight">
                    Premium Features
                </p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-primary/20 text-[10px] font-semibold text-primary border border-primary/30">
                    PRO
                  </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Unlock advanced AI capabilities and exclusive templates.
                </p>
              </div>
            </div>
            <AppleButton variant="primary" size="sm" className="w-full text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200">
              Upgrade Now
            </AppleButton>
          </div>
        </div>
      </div>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                {item.url === "#" ? (
                  <a href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </a>
                ) : (
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
