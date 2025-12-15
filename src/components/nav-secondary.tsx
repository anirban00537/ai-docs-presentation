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
import { AppleButton } from "./apple-button";

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
        <div 
          className="relative overflow-hidden rounded-2xl p-4"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(20px) saturate(180%)",
            WebkitBackdropFilter: "blur(20px) saturate(180%)",
            boxShadow: `
              0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
              0 -1px 0 0 rgba(0, 0, 0, 0.03) inset,
              1px 0 0 0 rgba(255, 255, 255, 0.7) inset,
              -1px 0 0 0 rgba(0, 0, 0, 0.03) inset,
              0 4px 16px rgba(0, 0, 0, 0.06)
            `,
          }}
        >
          {/* Glass shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-transparent pointer-events-none rounded-2xl" />

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
            <AppleButton
              variant="primary"
              size="sm"
              className="w-full text-xs font-semibold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-200"
            >
              <p className="text-white text-xs font-semibold">Upgrade Now</p>
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
