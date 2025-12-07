"use client";

import React, { useState, useRef, useCallback } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const appleButtonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-white relative overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.12),0_1px_2px_0_rgba(0,0,0,0.24)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.15),0_2px_4px_0_rgba(0,0,0,0.2)] hover:bg-primary/95 hover:-translate-y-[1px] active:scale-[0.98]",
        secondary:
          "bg-secondary/80 text-white relative overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.12),0_1px_2px_0_rgba(0,0,0,0.24)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none hover:bg-secondary/90 hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.15),0_2px_4px_0_rgba(0,0,0,0.2)] hover:-translate-y-[1px] active:scale-[0.98]",
        tertiary:
          "bg-background/60 text-white border border-border/60 relative overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.12),0_1px_2px_0_rgba(0,0,0,0.24)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/30 before:to-transparent before:pointer-events-none hover:bg-background/80 hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.15),0_2px_4px_0_rgba(0,0,0,0.2)] hover:border-border hover:-translate-y-[1px] active:scale-[0.98]",
        ghost:
          "bg-transparent text-white hover:bg-accent/50 active:scale-[0.97]",
      },
      size: {
        default: "h-8 px-3.5 py-1.5",
        sm: "h-7 px-3 py-1.5",
        lg: "h-9 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface AppleButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof appleButtonVariants> {
  asChild?: boolean;
}

export const AppleButton = React.forwardRef<
  HTMLButtonElement,
  AppleButtonProps
>(({ className, variant, size, asChild = false, children, ...props }, ref) => {
  const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | HTMLElement>(null);
  const internalRef = ref || buttonRef;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePosition({ x, y });
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Reset to center when mouse leaves
    setMousePosition({ x: 50, y: 50 });
  }, []);

  const handleMouseDown = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleMouseUp = useCallback(() => {
    setIsPressed(false);
  }, []);

  const handleTouchStart = useCallback(() => {
    setIsPressed(true);
  }, []);

  const handleTouchEnd = useCallback(() => {
    setIsPressed(false);
  }, []);

  // Combine refs
  const setRefs = useCallback(
    (node: HTMLButtonElement | HTMLElement | null) => {
      if (typeof internalRef === "function") {
        internalRef(node as HTMLButtonElement);
      } else if (internalRef) {
        (
          internalRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node as HTMLButtonElement;
      }
      buttonRef.current = node;
    },
    [internalRef]
  );

  const hasGlow =
    variant === "primary" || variant === "secondary" || variant === "tertiary";

  if (asChild) {
    // When asChild is true, we need to clone the child and add our elements to it
    const child = React.Children.only(children) as React.ReactElement<
      React.HTMLAttributes<HTMLElement>
    >;
    const childProps = child.props as React.HTMLAttributes<HTMLElement>;
    return (
      <Slot
        ref={setRefs}
        className={cn(
          appleButtonVariants({ variant, size }),
          isPressed &&
            "translate-y-[2px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.2)] transition-transform duration-75 ease-out",
          "relative",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        {...props}
      >
        {React.cloneElement(child, {
          ...childProps,
          children: (
            <>
              {hasGlow && (
                <span
                  className="absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none z-0"
                  style={{
                    background: `radial-gradient(circle 120px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.35) 0%, transparent 70%)`,
                    opacity: isPressed ? 0 : 0.8,
                    transition:
                      "opacity 300ms ease-out, background 100ms ease-out",
                  }}
                />
              )}
              <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
                {childProps.children}
              </span>
            </>
          ),
        })}
      </Slot>
    );
  }

  return (
    <button
      ref={setRefs}
      className={cn(
        appleButtonVariants({ variant, size }),
        isPressed &&
          "translate-y-[2px] shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.2)] transition-transform duration-75 ease-out",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      {...props}
    >
      {hasGlow && (
        <span
          className="absolute inset-0 rounded-xl transition-opacity duration-300 pointer-events-none z-0"
          style={{
            background: `radial-gradient(circle 120px at ${mousePosition.x}% ${mousePosition.y}%, rgba(255,255,255,0.35) 0%, transparent 70%)`,
            opacity: isPressed ? 0 : 0.8,
            transition: "opacity 300ms ease-out, background 100ms ease-out",
          }}
        />
      )}
      <span className="relative z-10 inline-flex items-center justify-center gap-2.5">
        {children}
      </span>
    </button>
  );
});

AppleButton.displayName = "AppleButton";
