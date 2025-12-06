"use client";

import * as React from "react";
import Image from "next/image";
import {
  IconDashboard,
  IconFileText,
  IconTemplate,
  IconSettings,
  IconPhoto,
  IconPresentation,
} from "@tabler/icons-react";

import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const navMainData = [
  {
    title: "Home",
    url: "/home",
    icon: IconDashboard,
  },
  {
    title: "My Presentations",
    url: "/my-presentations",
    icon: IconPresentation,
  },
  {
    title: "My Layouts",
    url: "/my-layouts",
    icon: IconFileText,
  },
  {
    title: "Templates",
    url: "/templates",
    icon: IconTemplate,
  },
  {
    title: "Media",
    url: "/media",
    icon: IconPhoto,
  },
];

const navSecondaryData = [
  {
    title: "Settings",
    url: "#",
    icon: IconSettings,
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <Image
                  src="/logo.svg"
                  alt="Butterfast"
                  width={150}
                  height={150}
                />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMainData} />

        <NavSecondary items={navSecondaryData} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
