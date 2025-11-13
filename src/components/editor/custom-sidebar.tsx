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
  const iconWidth = "3rem"; // 48px
  const expandedWidth = "20rem"; // 320px

  return (
    <div
      className={cn(
        "flex h-full bg-background transition-all duration-200 ease-linear shrink-0",
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
      className={cn("flex min-h-0 flex-1 flex-col overflow-auto", className)}
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
    <div className={cn("flex items-center border-b px-4 py-3", className)}>
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
        "w-full p-3 flex items-center justify-center transition-colors border-b border-border/50 last:border-b-0",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
        className
      )}
      title={tooltip}
      {...props}
    >
      {children}
    </button>
  );
}
