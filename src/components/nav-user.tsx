"use client";

import {
  IconCreditCard,
  IconDotsVertical,
  IconLogout,
  IconNotification,
  IconUserCircle,
} from "@tabler/icons-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/userSlice";
import { useSignOut } from "@/hooks/use-auth";

const getInitials = (name?: string, email?: string) => {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0]?.charAt(0)?.toUpperCase() ?? "U";
    }
    return (
      (parts[0]?.charAt(0) ?? "") + (parts[parts.length - 1]?.charAt(0) ?? "")
    ).toUpperCase();
  }
  if (email) {
    return email.charAt(0).toUpperCase();
  }
  return "U";
};

const formatName = (user: any) => {
  if (user?.first_name || user?.last_name) {
    return [user?.first_name, user?.last_name].filter(Boolean).join(" ");
  }
  if (user?.user_name) return user.user_name;
  if (user?.email) return user.email.split("@")[0];
  return "User";
};

export function NavUser() {
  const { isMobile } = useSidebar();
  const user = useAppSelector(selectUser);
  const signOutMutation = useSignOut();

  const primaryName = formatName(user);
  const primaryEmail = user?.email ?? "user@example.com";
  const userInitials = getInitials(primaryName, primaryEmail);

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-white/60 hover:bg-white/50 rounded-xl transition-all duration-200"
              style={{
                backdropFilter: "blur(12px)",
              }}
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {user?.photo ? (
                  <AvatarImage
                    src={user.photo}
                    alt={primaryName}
                    className="rounded-lg object-cover"
                  />
                ) : null}
                <AvatarFallback className="rounded-lg">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{primaryName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {primaryEmail}
                </span>
              </div>
              <IconDotsVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-2xl border-0"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              boxShadow: `
                0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                0 -1px 0 0 rgba(0, 0, 0, 0.03) inset,
                1px 0 0 0 rgba(255, 255, 255, 0.7) inset,
                -1px 0 0 0 rgba(0, 0, 0, 0.03) inset,
                0 8px 32px rgba(0, 0, 0, 0.12)
              `,
            }}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {user?.photo ? (
                    <AvatarImage
                      src={user.photo}
                      alt={primaryName}
                      className="rounded-lg object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="rounded-lg">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{primaryName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {primaryEmail}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <IconUserCircle />
                Account
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconCreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <IconNotification />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut}>
              <IconLogout />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
