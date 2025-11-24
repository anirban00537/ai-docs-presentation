"use client";

import React from "react";
import { PanelsLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

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
};

export const EditorSidebarShell: React.FC<ShellProps> = ({
  children,
  className,
}) => {
  const { collapsed } = useEditorSidebar();

  return (
    <aside
      data-collapsed={collapsed}
      className={cn(
        "relative flex h-[calc(100vh-20px)] flex-col overflow-hidden bg-white/85 dark:bg-neutral-950/70 backdrop-blur-2xl transition-all duration-300",
        collapsed
          ? "w-0 min-w-0 opacity-0 pointer-events-none border-transparent"
          : "w-72 opacity-100 pointer-events-auto",
        className
      )}
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

