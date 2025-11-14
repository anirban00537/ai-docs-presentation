"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface CustomSidebarProps {
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
}

export function CustomSidebar({
  isOpen,
  children,
  className,
}: CustomSidebarProps) {
  const iconWidth = "4.5rem"; // 72px (to accommodate rounded border tabs)
  const expandedWidth = "20rem"; // 320px

  return (
    <div
      className={cn(
        "flex h-full bg-gradient-to-b from-background to-muted/10 border-r border-border/50 transition-all duration-300 ease-out shrink-0",
        className
      )}
      style={{
        width: isOpen ? expandedWidth : iconWidth,
      }}
    >
      {children}
    </div>
  );
}

interface CustomSidebarContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomSidebarContent({
  children,
  className,
}: CustomSidebarContentProps) {
  return (
    <div
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-auto bg-background/50 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CustomSidebarHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomSidebarHeader({
  children,
  className,
}: CustomSidebarHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center border-b border-border/50 bg-background/80 backdrop-blur-sm px-5 py-4",
        className
      )}
    >
      {children}
    </div>
  );
}

interface CustomSidebarGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomSidebarGroup({
  children,
  className,
}: CustomSidebarGroupProps) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

interface CustomSidebarMenuProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomSidebarMenu({
  children,
  className,
}: CustomSidebarMenuProps) {
  return <div className={cn("flex flex-col", className)}>{children}</div>;
}

interface CustomSidebarMenuItemProps {
  children: React.ReactNode;
  className?: string;
}

export function CustomSidebarMenuItem({
  children,
  className,
}: CustomSidebarMenuItemProps) {
  return <div className={cn("flex", className)}>{children}</div>;
}

interface CustomSidebarMenuButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  tooltip?: string;
  children: React.ReactNode;
}

export function CustomSidebarMenuButton({
  isActive = false,
  tooltip,
  children,
  className,
  ...props
}: CustomSidebarMenuButtonProps) {
  return (
    <button
      className={cn(
        "relative w-10 h-10 flex items-center justify-center transition-all duration-200 rounded-lg",
        "group",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/40",
        className
      )}
      title={tooltip}
      {...props}
    >
      <div
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 h-6 w-0.5 rounded-l-full transition-all duration-200",
          isActive
            ? "bg-primary"
            : "bg-transparent group-hover:bg-primary/30"
        )}
      />
      <div
        className={cn(
          "transition-transform duration-200",
          isActive ? "scale-110" : "group-hover:scale-105"
        )}
      >
        {children}
      </div>
    </button>
  );
}
