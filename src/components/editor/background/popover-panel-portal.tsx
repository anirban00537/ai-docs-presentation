"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface PopoverPanelPortalProps {
  children: React.ReactNode;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

export function PopoverPanelPortal({
  children,
  buttonRef,
}: PopoverPanelPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [buttonRef]);

  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className="fixed z-[9999]"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

