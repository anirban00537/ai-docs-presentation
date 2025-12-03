"use client";

import React from "react";
import { PanelsLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GlobalTheme } from "@/store/slices/slidesSlice";

type EditorSidebarContextValue = {
  collapsed: boolean;
  toggle: () => void;
};

const EditorSidebarContext =
  React.createContext<EditorSidebarContextValue | null>(null);

export const EditorSidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [collapsed, setCollapsed] = React.useState(false);

  const toggle = React.useCallback(() => {
    setCollapsed((prev) => !prev);
  }, []);

  const value = React.useMemo(
    () => ({
      collapsed,
      toggle,
    }),
    [collapsed, toggle]
  );

  return (
    <EditorSidebarContext.Provider value={value}>
      {children}
    </EditorSidebarContext.Provider>
  );
};

export const useEditorSidebar = () => {
  const context = React.useContext(EditorSidebarContext);
  if (!context) {
    throw new Error(
      "useEditorSidebar must be used within an EditorSidebarProvider"
    );
  }
  return context;
};

type ShellProps = {
  children: React.ReactNode;
  className?: string;
  globalTheme?: GlobalTheme;
};

export const EditorSidebarShell: React.FC<ShellProps> = ({
  children,
  className,
  globalTheme,
}) => {
  const { collapsed } = useEditorSidebar();
  const isDarkTheme = globalTheme?.tone === "dark";

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col overflow-hidden transition-all duration-500 ease-out",
        // Solid background - theme-aware (darker for dark theme)
        isDarkTheme
          ? "bg-black"
          : "bg-white",
        // Medium height, centered vertically
        "h-[70vh]",
        // Rounded corners on the right side
        "rounded-r-2xl",
        // Enhanced borders and shadows - theme-aware
        isDarkTheme
          ? "border-r border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.4)] ring-1 ring-inset ring-white/10"
          : "border-r border-border shadow-[0_8px_32px_0_rgba(0,0,0,0.12)] ring-1 ring-inset ring-border/50",
        collapsed
          ? "w-0 min-w-0 opacity-0 pointer-events-none translate-x-[-20px]"
          : "w-48 opacity-100 pointer-events-auto translate-x-0",
        className
      )}
      style={{
        // Subtle inner shadow for depth - theme-aware
        boxShadow: collapsed
          ? undefined
          : isDarkTheme
          ? "inset 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 0 rgba(255, 255, 255, 0.15), 0 8px 32px 0 rgba(0, 0, 0, 0.4), 0 2px 8px 0 rgba(0, 0, 0, 0.2)"
          : "inset 0 0 0 1px rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(0, 0, 0, 0.1), 0 8px 32px 0 rgba(0, 0, 0, 0.12), 0 2px 8px 0 rgba(0, 0, 0, 0.08)",
      }}
      aria-hidden={collapsed}
    >
      {children}
    </aside>
  );
};

export const EditorSidebarTrigger = ({
  className,
}: {
  className?: string;
}) => {
  const { toggle, collapsed } = useEditorSidebar();

  return (
    <button
      type="button"
      aria-label="Toggle slide sidebar"
      aria-pressed={!collapsed}
      onClick={toggle}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 text-muted-foreground transition-colors hover:bg-accent/50 hover:text-foreground",
        className
      )}
    >
      <PanelsLeftRight className="h-4 w-4" />
    </button>
  );
};

