"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-md text-sm font-semibold transition-all duration-300 ease-out outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white relative overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.1)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none hover:shadow-[0_6px_16px_-4px_rgba(0,0,0,0.15)] hover:bg-primary/95 hover:-translate-y-[0.5px] active:scale-[0.98] active:translate-y-0",
        secondary:
          "bg-secondary/80 text-white relative overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.08)] before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none hover:bg-secondary/90 hover:shadow-[0_4px_12px_-2px_rgba(0,0,0,0.12)] hover:-translate-y-[0.5px] active:scale-[0.98] active:translate-y-0",
        outline:
          "bg-background/40 text-foreground border border-border/40 backdrop-blur-md relative overflow-hidden shadow-sm before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/5 before:to-transparent before:pointer-events-none hover:bg-background/60 hover:shadow-md hover:border-border/60 hover:-translate-y-[0.5px] active:scale-[0.98] active:translate-y-0",
        ghost:
          "bg-transparent text-foreground hover:bg-accent/40 active:scale-[0.97]",
        destructive:
          "bg-destructive text-white relative overflow-hidden shadow-sm before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none hover:bg-destructive/90 hover:shadow-md hover:-translate-y-[0.5px] active:scale-[0.98] active:translate-y-0",
        link: "text-primary underline-offset-4 hover:underline active:scale-[0.98]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 py-1.5",
        lg: "h-11 px-8 py-3 rounded-xl",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, style, children, ...props }, ref) => {

    const [mousePosition, setMousePosition] = useState({ x: 50, y: 50 });
    const [isPressed, setIsPressed] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const buttonRef = useRef<HTMLButtonElement | HTMLElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
      const target = e.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePosition({ x, y });
    }, []);

    const handleMouseEnter = useCallback(() => {
      setIsHovered(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
      setIsHovered(false);
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

    const setRefs = useCallback(
      (node: HTMLButtonElement | HTMLElement | null) => {
        if (typeof ref === "function") {
          ref(node as HTMLButtonElement);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current = node as HTMLButtonElement;
        }
        (buttonRef as React.MutableRefObject<HTMLButtonElement | HTMLElement | null>).current = node;
      },
      [ref]
    );

    const hasGlow =
      variant === "default" || variant === "secondary" || variant === "outline" || variant === "destructive";

    const glowStyle = useMemo(() => {
      if (!hasGlow) return {};
      return {
        "--glow-x": `${mousePosition.x}%`,
        "--glow-y": `${mousePosition.y}%`,
        backgroundImage: `radial-gradient(circle 100px at var(--glow-x) var(--glow-y), rgba(255,255,255,${isHovered ? "0.15" : "0"}) 0%, transparent 70%)`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
      };
    }, [hasGlow, mousePosition, isHovered]);

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        ref={setRefs as any}
        className={cn(
          buttonVariants({ variant, size }),
          isPressed && variant !== "link" &&
            "shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.1)] brightness-95",
          "relative",
          className
        )}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          ...glowStyle,
          ...style,
        }}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
