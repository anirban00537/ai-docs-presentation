"use client"

import * as React from "react"
import { IconSparkles, type Icon } from "@tabler/icons-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AppleButton } from "./editor/apple-button"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: Icon
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <div className="mx-2 mt-4 mb-2">
        <div className="relative overflow-hidden rounded-lg border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-3 shadow-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
          <div className="relative space-y-2.5">
            <div className="flex items-start gap-2.5">
              <div className="mt-0.5 shrink-0">
                <IconSparkles className="size-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-xs font-semibold text-foreground">
                  New Update Available
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Enhanced AI features and improved performance.
                </p>
              </div>
            </div>
            <AppleButton variant="primary" size="sm" className="w-full text-xs">
              Learn More
            </AppleButton>
          </div>
        </div>
      </div>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild>
                <a href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
