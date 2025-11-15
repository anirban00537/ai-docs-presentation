"use client";

import * as React from "react";
import {
  IconHelp,
  IconInnerShadowTop,
  IconSearch,
  IconSettings,
  IconUsers,
  IconPresentation,
  IconTemplate,
  IconClock,
  IconShare,
  IconBrandGoogleDrive,
  IconFileTypePdf,
  IconFileTypePpt,
  IconVideo,
  IconPlayerPlay,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
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
import { authClient } from "@/lib/auth-client";

const data = {
  navMain: [
    {
      title: "My Presentations",
      url: "/",
      icon: IconPresentation,
    },
    {
      title: "Editor",
      url: "/editor",
      icon: IconPresentation,
    },
    {
      title: "Templates",
      url: "#",
      icon: IconTemplate,
    },
    {
      title: "Recent",
      url: "#",
      icon: IconClock,
    },
    {
      title: "Shared with me",
      url: "#",
      icon: IconShare,
    },
  ],
  navClouds: [
    {
      title: "Presentations",
      icon: IconPresentation,
      isActive: true,
      url: "#",
      items: [
        {
          title: "Active",
          url: "#",
        },
        {
          title: "Archived",
          url: "#",
        },
        {
          title: "Templates",
          url: "#",
        },
      ],
    },
    {
      title: "Export & Share",
      icon: IconShare,
      url: "#",
      items: [
        {
          title: "Export as PDF",
          url: "#",
        },
        {
          title: "Export as PPTX",
          url: "#",
        },
        {
          title: "Share Link",
          url: "#",
        },
      ],
    },
    {
      title: "Collaboration",
      icon: IconUsers,
      url: "#",
      items: [
        {
          title: "Team Presentations",
          url: "#",
        },
        {
          title: "Comments",
          url: "#",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
  documents: [
    {
      name: "Export to PDF",
      url: "#",
      icon: IconFileTypePdf,
    },
    {
      name: "Export to PPTX",
      url: "#",
      icon: IconFileTypePpt,
    },
    {
      name: "Export to Video",
      url: "#",
      icon: IconVideo,
    },
    {
      name: "Present Mode",
      url: "#",
      icon: IconPlayerPlay,
    },
    {
      name: "Save to Drive",
      url: "#",
      icon: IconBrandGoogleDrive,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, isPending } = authClient.useSession();

  // Show loading state or default user data
  const user = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image,
      }
    : {
        name: "User",
        email: "",
        image: null,
      };

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
                <IconInnerShadowTop className="size-5!" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>{!isPending && <NavUser user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
