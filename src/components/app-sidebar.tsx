"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  IconDashboard,
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

// Navigation items
const navItems = [
  { title: "Home", url: "/home", icon: IconDashboard },
  { title: "My Presentations", url: "/my-presentations", icon: IconPresentation },
  { title: "Media", url: "/media", icon: IconPhoto },
];

const secondaryItems = [
  { title: "Settings", url: "/settings", icon: IconSettings },
];

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

  const handleSignOut = () => {
    signOutMutation.mutate();
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={() => setIsMobileOpen(true)}
        className="fixed top-4 left-4 z-50 p-2.5 rounded-full md:hidden bg-white/70 backdrop-blur-xl border border-white/20 shadow-sm text-foreground/80 hover:bg-white/90 transition-all custom-shadow"
      >
        <IconMenu2 size={20} />
      </motion.button>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/10 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar - Fixed */}
      <motion.aside
        initial={false}
        animate={{ x: isMobile ? (isMobileOpen ? 0 : "-100%") : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
        className="fixed inset-y-0 left-0 z-50 w-[280px] flex flex-col"
      >
        {/* Main Glass Container */}
        <div 
          className="absolute inset-0 w-full h-full overflow-hidden border-r border-white/20"
          style={{
            background: "rgba(255, 255, 255, 0.65)", // Slightly more opaque for better readability
            backdropFilter: "blur(50px) saturate(200%)", // Increased blur and saturation
            WebkitBackdropFilter: "blur(50px) saturate(200%)",
          }}
        >
          {/* Subtle noise texture or gradient for depth */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
        </div>

        {/* Content wrapper */}
        <div className="relative z-10 flex flex-col h-full overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 pb-2">
            <Link href="/home" className="flex items-center group">
              <div className="relative transition-transform duration-300 group-hover:scale-105">
                <Image
                  src="/logo.svg"
                  alt="Butterfast"
                  width={140}
                  height={40}
                  priority
                  className="object-contain" // Ensure logo fits well
                />
              </div>
            </Link>
            
            {/* Mobile close button */}
            <button
              onClick={() => setIsMobileOpen(false)}
              className="p-2 rounded-full md:hidden hover:bg-black/5 transition-colors text-foreground/60"
            >
              <IconX size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto custom-scrollbar-light">
            <p className="px-3 text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2 select-none">
              Menu
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.url || pathname.startsWith(item.url + "/");
              
              return (
                <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setIsMobileOpen(false)}
                  className="relative group block outline-none"
                >
                  <div
                    className={cn(
                      "relative flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-300 ease-out",
                      isActive 
                        ? "bg-white/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] text-primary" 
                        : "hover:bg-white/40 text-foreground/70 hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-nav-bg"
                        className="absolute inset-0 bg-white/60 rounded-xl"
                        initial={false}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{ backdropFilter: "blur(8px)" }}
                      />
                    )}
                    
                    <span className="relative z-10 flex items-center justify-center">
                      <item.icon
                        size={20}
                        stroke={isActive ? 2 : 1.5}
                        className={cn(
                          "transition-colors duration-300",
                          isActive ? "text-primary" : "text-foreground/60 group-hover:text-foreground/80"
                        )}
                      />
                    </span>
                    
                    <span 
                      className={cn(
                        "relative z-10 text-[14px] font-medium tracking-tight transition-all duration-300",
                        isActive ? "font-semibold" : ""
                      )}
                    >
                      {item.title}
                    </span>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-auto"
                      >
                         <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </motion.div>
                    )}
                  </div>
                </Link>
              );
            })}
            
            {/* Secondary Section Label */}
            <div className="pt-6 pb-2">
                 <p className="px-3 text-[10px] font-bold text-foreground/40 uppercase tracking-widest select-none">
                  Preferences
                </p>
            </div>
             {secondaryItems.map((item) => {
              const isActive = pathname === item.url;
              return (
                 <Link
                  key={item.url}
                  href={item.url}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-white/60 text-foreground font-medium" 
                      : "hover:bg-white/30 text-foreground/70 hover:text-foreground"
                  )}
                >
                  <item.icon 
                    size={20} 
                    stroke={1.5} 
                    className="text-foreground/50 group-hover:text-foreground/80 transition-colors" 
                  />
                  <span className="text-[14px] font-medium">
                    {item.title}
                  </span>
                </Link>
              );
            })}

          </nav>

          {/* Bottom Actions */}
          <div className="p-4 space-y-4">
             {/* Premium Card - Refined */}
            <div 
              className="relative overflow-hidden rounded-2xl p-[1px] group"
            >
              <div 
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-500"
              />
               <div 
                className="relative rounded-[15px] p-4 bg-white/40 backdrop-blur-md overflow-hidden"
              >
                 <div className="flex items-start gap-4 mb-3">
                   <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary shadow-inner">
                      <IconSparkles size={20} className="" />
                   </div>
                   <div className="flex-1 min-w-0">
                     <h4 className="text-sm font-bold text-foreground leading-none mb-1">Scale Plan</h4>
                     <p className="text-[11px] text-muted-foreground leading-tight line-clamp-2">
                        Unlock infinite generation & advanced tools.
                     </p>
                   </div>
                 </div>
                 
                <AppleButton
                  variant="primary"
                  size="sm"
                  className="w-full justify-center h-9 text-xs font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30"
                >
                  Upgrade to Pro
                </AppleButton>
              </div>
            </div>

            {/* User Section - Minimal Glass */}
            <div className="pt-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-full group flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-white/50 outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                  >
                    <Avatar className="h-10 w-10 rounded-xl shadow-sm border border-white/50 ring-2 ring-white/20 group-hover:ring-white/40 transition-all">
                      {user?.photo ? (
                        <AvatarImage
                          src={user.photo}
                          alt={primaryName}
                          className="rounded-xl object-cover"
                        />
                      ) : null}
                      <AvatarFallback className="rounded-xl bg-gradient-to-tr from-primary/10 to-primary/5 text-primary text-xs font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 text-left min-w-0 flex flex-col justify-center">
                      <p className="text-xs font-semibold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                        {primaryName}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                        {primaryEmail}
                      </p>
                    </div>
                    
                    <div className="bg-white/40 p-1.5 rounded-lg text-foreground/40 group-hover:text-foreground/70 group-hover:bg-white/80 transition-all">
                         <IconSettings size={14} />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent
                  align="start"
                  side="right"
                  sideOffset={16}
                  className="w-56 rounded-2xl border-0 p-1.5"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px) saturate(180%)",
                    WebkitBackdropFilter: "blur(20px) saturate(180%)",
                    boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.4) inset"
                  }}
                >
                   <div className="px-2 py-1.5 mb-1 bg-white/50 rounded-xl">
                      <p className="text-xs font-medium text-foreground">{primaryName}</p>
                       <p className="text-[10px] text-muted-foreground truncate">{primaryEmail}</p>
                   </div>
                   
                  <DropdownMenuItem className="rounded-lg cursor-pointer text-xs font-medium py-2 focus:bg-white/60 focus:text-primary">
                    <IconSettings size={14} className="mr-2" />
                    Account Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-black/5" />
                  <DropdownMenuItem 
                    onClick={handleSignOut}
                    className="rounded-lg cursor-pointer text-xs font-medium py-2 text-destructive focus:text-destructive focus:bg-red-50/50"
                  >
                    <IconLogout size={14} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Spacer for fixed sidebar on desktop */}
      <div className="hidden md:block w-[280px] shrink-0 transform-gpu" />
    </>
  );
}

