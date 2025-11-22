"use client";

import React, { useState, useEffect, useRef, RefObject } from "react";
import { createPortal } from "react-dom";
import type { Viewport } from "@/hooks/use-canvas-viewport";

interface ToolbarPortalProps {
  children: React.ReactNode;
  widgetRef: RefObject<HTMLElement | null>;
  viewport: Viewport;
  containerRef: RefObject<HTMLElement | null>;
  placement?: "top" | "bottom";
  offset?: number;
}

export function ToolbarPortal({
  children,
  widgetRef,
  viewport,
  containerRef,
  placement = "top",
  offset = 16,
}: ToolbarPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "top" as "top" | "bottom" });
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updatePosition = () => {
      if (!widgetRef.current || !containerRef.current) {
        return;
      }

      // Get the widget's bounding box in screen coordinates
      const widgetRect = widgetRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      // Calculate widget center in screen coordinates
      const widgetCenterX = widgetRect.left + widgetRect.width / 2;
      const widgetTop = widgetRect.top;
      const widgetBottom = widgetRect.bottom;

      // Get toolbar height if available (measure from toolbar element)
      const measuredHeight = toolbarRef.current?.offsetHeight || 64; // Default fallback

      // Determine if toolbar should be above or below widget
      // Check if there's enough space above the widget
      const spaceAbove = widgetRect.top - containerRect.top;
      const spaceBelow = containerRect.bottom - widgetRect.bottom;
      
      // Use placement prop as preference, but flip if not enough space
      let finalPlacement: "top" | "bottom" = placement;
      if (placement === "top" && spaceAbove < measuredHeight + offset + 10) {
        // Not enough space above, try bottom
        if (spaceBelow >= measuredHeight + offset + 10) {
          finalPlacement = "bottom";
        }
      } else if (placement === "bottom" && spaceBelow < measuredHeight + offset + 10) {
        // Not enough space below, try top
        if (spaceAbove >= measuredHeight + offset + 10) {
          finalPlacement = "top";
        }
      }

      // Calculate toolbar position
      let top: number;
      if (finalPlacement === "top") {
        top = widgetTop - measuredHeight - offset;
      } else {
        top = widgetBottom + offset;
      }

      // Center toolbar horizontally on widget (will use transform: translateX(-50%))
      let left = widgetCenterX;

      // Get toolbar width for boundary detection
      const toolbarWidth = toolbarRef.current?.offsetWidth || 400; // Default fallback
      
      // Boundary detection - ensure toolbar doesn't go outside container
      const minLeft = containerRect.left + 10 + toolbarWidth / 2; // Account for centering
      const maxLeft = containerRect.right - toolbarWidth / 2 - 10;

      if (left < minLeft) {
        left = minLeft;
      } else if (left > maxLeft) {
        left = maxLeft;
      }

      // Convert to absolute screen coordinates
      setPosition({
        top: top + window.scrollY,
        left: left + window.scrollX,
        placement: finalPlacement,
      });
    };

    // Use requestAnimationFrame to ensure DOM is updated
    const rafId = requestAnimationFrame(() => {
      updatePosition();
    });

    // Update on scroll, resize, and widget position changes
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    // Use ResizeObserver to watch for widget position/size changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updatePosition);
    });
    if (widgetRef.current) {
      resizeObserver.observe(widgetRef.current);
    }
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    // Observe toolbar after it renders (check on next frame)
    requestAnimationFrame(() => {
      if (toolbarRef.current) {
        resizeObserver.observe(toolbarRef.current);
      }
    });

    // Use MutationObserver to watch for DOM changes that might affect position
    const mutationObserver = new MutationObserver(() => {
      requestAnimationFrame(updatePosition);
    });
    if (widgetRef.current) {
      mutationObserver.observe(widgetRef.current, {
        attributes: true,
        attributeFilter: ["style", "class"],
      });
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [widgetRef, containerRef, placement, offset]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      ref={toolbarRef}
      data-toolbar-portal-content
      className="fixed z-[9999] pointer-events-auto"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
    >
      {children}
    </div>,
    document.body
  );
}

