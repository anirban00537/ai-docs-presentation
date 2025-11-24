"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const appleButtonVariants = cva(
  "inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 ease-out outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4",
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.1)] hover:bg-primary/95 active:scale-[0.97] active:shadow-[0_1px_1px_0_rgba(0,0,0,0.05)]",
        secondary:
          "bg-secondary/80 text-secondary-foreground shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-secondary/90 hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.1)] active:scale-[0.97] active:shadow-[0_1px_1px_0_rgba(0,0,0,0.05)]",
        tertiary:
          "bg-background/60 text-foreground border border-border/60 shadow-[0_1px_2px_0_rgba(0,0,0,0.05)] hover:bg-background/80 hover:shadow-[0_2px_4px_0_rgba(0,0,0,0.1)] hover:border-border active:scale-[0.97] active:shadow-[0_1px_1px_0_rgba(0,0,0,0.05)]",
        ghost:
          "bg-transparent text-foreground hover:bg-accent/50 active:scale-[0.97]",
      },
      size: {
        default: "h-10 px-4 py-2.5",
        sm: "h-9 px-3.5 py-2",
        lg: "h-11 px-5 py-3",
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

export const AppleButton = React.forwardRef<HTMLButtonElement, AppleButtonProps>(
  ({ className, variant, size, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(appleButtonVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </button>
    );
  }
);

AppleButton.displayName = "AppleButton";

