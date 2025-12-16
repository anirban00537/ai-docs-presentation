"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconDashboard,
  IconFileText,
  IconTemplate,
  IconSettings,
  IconPhoto,
  IconPresentation,
  IconSparkles,
  IconLogout,
  IconChevronRight,
  IconMenu2,
  IconX,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/userSlice";
import { useSignOut } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AppleButton } from "./apple-button";

// Navigation items with gradient themes
const navItems = [
  { 
    title: "Home", 
    url: "/home", 
    icon: IconDashboard,
    gradientTheme: "home" as const,
  },
  { 
    title: "My Presentations", 
    url: "/my-presentations", 
    icon: IconPresentation,
    gradientTheme: "presentations" as const,
  },
  { 
    title: "My Layouts", 
    url: "/my-layouts", 
    icon: IconFileText,
    gradientTheme: "layouts" as const,
  },
  { 
    title: "Templates", 
    url: "/templates", 
    icon: IconTemplate,
    gradientTheme: "templates" as const,
  },
  { 
    title: "Media", 
    url: "/media", 
    icon: IconPhoto,
    gradientTheme: "media" as const,
  },
];

const secondaryItems = [
  { title: "Settings", url: "/settings", icon: IconSettings },
];

// Gradient themes for different pages
type GradientTheme = "home" | "presentations" | "layouts" | "templates" | "media" | "default";

const gradientThemes: Record<GradientTheme, {
  blob1: string;
  blob2: string;
  blob3: string;
  blob4: string;
  accent: string;
}> = {
  home: {
    blob1: "rgba(196, 181, 253, 0.55)", // Lavender
    blob2: "rgba(147, 197, 253, 0.5)",  // Sky blue
    blob3: "rgba(251, 207, 232, 0.5)",  // Rose
    blob4: "rgba(167, 243, 208, 0.45)", // Mint
    accent: "#8B5CF6", // Purple
  },
  presentations: {
    blob1: "rgba(59, 130, 246, 0.5)",   // Blue
    blob2: "rgba(99, 102, 241, 0.5)",   // Indigo
    blob3: "rgba(139, 92, 246, 0.45)",  // Purple
    blob4: "rgba(167, 139, 250, 0.4)",  // Violet
    accent: "#3B82F6", // Blue
  },
  layouts: {
    blob1: "rgba(16, 185, 129, 0.5)",   // Emerald
    blob2: "rgba(20, 184, 166, 0.45)",  // Teal
    blob3: "rgba(6, 182, 212, 0.4)",    // Cyan
    blob4: "rgba(34, 197, 94, 0.45)",   // Green
    accent: "#10B981", // Emerald
  },
  templates: {
    blob1: "rgba(245, 158, 11, 0.5)",   // Amber
    blob2: "rgba(249, 115, 22, 0.45)",  // Orange
    blob3: "rgba(251, 191, 36, 0.45)",  // Yellow
    blob4: "rgba(234, 88, 12, 0.4)",    // Deep orange
    accent: "#F59E0B", // Amber
  },
  media: {
    blob1: "rgba(236, 72, 153, 0.5)",   // Pink
    blob2: "rgba(219, 39, 119, 0.45)",  // Deep pink
    blob3: "rgba(244, 114, 182, 0.45)", // Light pink
    blob4: "rgba(251, 207, 232, 0.5)",  // Rose
    accent: "#EC4899", // Pink
  },
  default: {
    blob1: "rgba(196, 181, 253, 0.5)",
    blob2: "rgba(147, 197, 253, 0.45)",
    blob3: "rgba(251, 207, 232, 0.45)",
    blob4: "rgba(167, 243, 208, 0.4)",
    accent: "#8B5CF6",
  },
};

// Helper functions
const getInitials = (name?: string, email?: string) => {
  if (name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0]?.charAt(0)?.toUpperCase() ?? "U";
    return ((parts[0]?.charAt(0) ?? "") + (parts[parts.length - 1]?.charAt(0) ?? "")).toUpperCase();
  }
  if (email) return email.charAt(0).toUpperCase();
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

// App Sidebar Component
export function AppSidebar() {
  const pathname = usePathname();
  const user = useAppSelector(selectUser);
  const signOutMutation = useSignOut();
  const isMobile = useIsMobile();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const primaryName = formatName(user);
  const primaryEmail = user?.email ?? "user@example.com";
  const userInitials = getInitials(primaryName, primaryEmail);

  // Determine active gradient theme based on current path
  const getActiveTheme = (): GradientTheme => {
    const activeItem = navItems.find(
      item => pathname === item.url || pathname.startsWith(item.url + "/")
    );
    return activeItem?.gradientTheme || "default";
  };

  const activeTheme = getActiveTheme();
  const theme = gradientThemes[activeTheme];

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 rounded-xl md:hidden"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          backdropFilter: "blur(16px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <IconMenu2 size={20} className="text-foreground" />
      </button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed */}
      <motion.aside
        initial={false}
        animate={{ x: isMobile ? (isMobileOpen ? 0 : "-100%") : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed inset-y-0 left-0 z-40 w-64 flex flex-col overflow-hidden"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.4)",
          backdropFilter: "blur(40px) saturate(180%)",
          WebkitBackdropFilter: "blur(40px) saturate(180%)",
          boxShadow: `
            1px 0 0 0 rgba(0, 0, 0, 0.03),
            0 1px 0 0 rgba(255, 255, 255, 1) inset,
            -1px 0 0 0 rgba(255, 255, 255, 0.8) inset,
            0 -1px 0 0 rgba(0, 0, 0, 0.02) inset
          `,
        }}
      >
        {/* === DYNAMIC PASTEL GRADIENT BLOBS === */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTheme}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* Blob 1 - Top */}
            <div
              className="absolute"
              style={{
                width: "200%",
                height: "45%",
                top: "-20%",
                left: "-50%",
                background: `radial-gradient(circle at center, ${theme.blob1} 0%, ${theme.blob1.replace(/[\d.]+\)$/, '0.1)')} 50%, transparent 70%)`,
                filter: "blur(45px)",
              }}
            />
            
            {/* Blob 2 - Top Right */}
            <div
              className="absolute"
              style={{
                width: "160%",
                height: "40%",
                top: "0%",
                right: "-70%",
                background: `radial-gradient(circle at center, ${theme.blob2} 0%, ${theme.blob2.replace(/[\d.]+\)$/, '0.08)')} 50%, transparent 70%)`,
                filter: "blur(50px)",
              }}
            />
            
            {/* Blob 3 - Middle */}
            <div
              className="absolute"
              style={{
                width: "180%",
                height: "45%",
                top: "35%",
                left: "-80%",
                background: `radial-gradient(ellipse at center, ${theme.blob3} 0%, ${theme.blob3.replace(/[\d.]+\)$/, '0.08)')} 50%, transparent 70%)`,
                filter: "blur(55px)",
              }}
            />
            
            {/* Blob 4 - Bottom */}
            <div
              className="absolute"
              style={{
                width: "170%",
                height: "40%",
                bottom: "-10%",
                right: "-60%",
                background: `radial-gradient(ellipse at center, ${theme.blob4} 0%, ${theme.blob4.replace(/[\d.]+\)$/, '0.08)')} 50%, transparent 70%)`,
                filter: "blur(50px)",
              }}
            />
          </motion.div>
        </AnimatePresence>

        {/* Glass shine overlay */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, transparent 40%, transparent 60%, rgba(255, 255, 255, 0.2) 100%)",
          }}
        />

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4">
            <Link href="/home" className="flex items-center">
              <Image
                src="/logo.svg"
                alt="Butterfast"
                width={130}
                height={40}
                priority
              />
            </Link>
            
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-lg md:hidden hover:bg-white/40 transition-colors"
            >
              <IconX size={18} className="text-foreground/70" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
              const itemTheme = gradientThemes[item.gradientTheme];
              
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
                    isActive 
                      ? "bg-white/65" 
                      : "hover:bg-white/45"
                  )}
                  style={isActive ? {
                    backdropFilter: "blur(16px) saturate(180%)",
                    WebkitBackdropFilter: "blur(16px) saturate(180%)",
                    boxShadow: `
                      0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                      0 -1px 0 0 rgba(0, 0, 0, 0.03) inset,
                      0 2px 8px rgba(0, 0, 0, 0.05)
                    `,
                  } : undefined}
                >
                  <div 
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200",
                      isActive ? "" : "bg-white/30 group-hover:bg-white/50"
                    )}
                    style={isActive ? {
                      backgroundColor: `${itemTheme.accent}15`,
                      boxShadow: `0 2px 6px ${itemTheme.accent}20`
                    } : undefined}
                  >
                    <item.icon
                      size={18}
                      className="transition-colors duration-200"
                      style={{ color: isActive ? itemTheme.accent : undefined }}
                    />
                  </div>
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
                  {isActive && (
                    <IconChevronRight 
                      size={14} 
                      className="ml-auto" 
                      style={{ color: `${itemTheme.accent}80` }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Premium Card */}
          <div className="px-3 pb-3">
            <div 
              className="relative overflow-hidden rounded-2xl p-4"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.55)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                boxShadow: `
                  0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                  0 -1px 0 0 rgba(0, 0, 0, 0.03) inset,
                  0 4px 16px rgba(0, 0, 0, 0.05)
                `,
              }}
            >
              {/* Glass shine effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none rounded-2xl" />

              <div className="relative space-y-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0 relative">
                    <div 
                      className="absolute inset-0 blur-md rounded-full" 
                      style={{ backgroundColor: `${theme.accent}40` }}
                    />
                    <IconSparkles 
                      className="size-5 relative z-10 drop-shadow-sm" 
                      style={{ color: theme.accent }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-foreground tracking-tight">
                        Premium Features
                      </p>
                      <span 
                        className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold border"
                        style={{
                          backgroundColor: `${theme.accent}20`,
                          color: theme.accent,
                          borderColor: `${theme.accent}30`,
                        }}
                      >
                        PRO
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Unlock advanced AI capabilities.
                    </p>
                  </div>
                </div>
                <AppleButton
                  variant="primary"
                  size="sm"
                  className="w-full text-xs font-semibold transition-all duration-200"
                  style={{
                    boxShadow: `0 4px 12px ${theme.accent}30`,
                  }}
                >
                  <p className="text-white text-xs font-semibold">Upgrade Now</p>
                </AppleButton>
              </div>
            </div>
          </div>

          {/* Secondary Navigation */}
          <div className="px-3 pb-2">
            {secondaryItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200",
                    isActive ? "bg-white/50" : "hover:bg-white/35"
                  )}
                >
                  <item.icon size={16} className="text-foreground/50" />
                  <span className="text-sm text-foreground/70 font-medium">
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div 
            className="px-3 py-3 border-t"
            style={{ borderColor: "rgba(0, 0, 0, 0.05)" }}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-all duration-200"
                  style={{
                    backdropFilter: "blur(8px)",
                  }}
                >
                  <Avatar className="h-9 w-9 rounded-xl">
                    {user?.photo ? (
                      <AvatarImage
                        src={user.photo}
                        alt={primaryName}
                        className="rounded-xl object-cover"
                      />
                    ) : null}
                    <AvatarFallback 
                      className="rounded-xl text-sm font-semibold"
                      style={{
                        backgroundColor: `${theme.accent}15`,
                        color: theme.accent,
                      }}
                    >
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {primaryName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {primaryEmail}
                    </p>
                  </div>
                  <IconChevronRight size={14} className="text-foreground/30" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                side="top"
                sideOffset={8}
                className="w-56 rounded-xl border-0"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.85)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  boxShadow: `
                    0 1px 0 0 rgba(255, 255, 255, 0.9) inset,
                    0 8px 32px rgba(0, 0, 0, 0.12)
                  `,
                }}
              >
                <DropdownMenuItem className="rounded-lg cursor-pointer">
                  <IconSettings size={16} className="mr-2" />
                  Account Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  className="rounded-lg cursor-pointer text-destructive focus:text-destructive"
                >
                  <IconLogout size={16} className="mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.aside>

      {/* Spacer for fixed sidebar on desktop */}
      <div className="hidden md:block w-64 shrink-0" />
    </>
  );
}
