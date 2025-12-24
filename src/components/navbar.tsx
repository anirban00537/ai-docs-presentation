"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion, useScroll, useMotionValueEvent } from "framer-motion";

const menuItems = [
  { name: "Blog", href: "/blog" },
  { name: "Research", href: "#research" },
  { name: "Templates", href: "#templates" },
  { name: "Pricing", href: "#pricing" },
];

export function Navbar() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = React.useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    if (latest > 50) setIsScrolled(true);
    else setIsScrolled(false);
  });

  return (
    <motion.header 
      className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <div 
        className={cn(
          "pointer-events-auto flex items-center justify-between gap-8 h-14 pl-6 pr-2 rounded-full transition-all duration-300",
          "bg-gradient-to-b from-white/90 via-secondary/10 to-white/90 backdrop-blur-xl border border-secondary/20 shadow-sm",
          isScrolled ? "w-full max-w-4xl shadow-depth-2" : "w-full max-w-5xl"
        )}
      >
        {/* Logo */}
        <Link href="/" className="group flex items-center gap-2">
          {/* Simple Butterfast Logo Text */}
          <span className="font-serif text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
            Butterfast.
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center gap-1">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="px-4 py-2 text-sm font-medium text-foreground/70 hover:text-foreground transition-colors relative group"
            >
              {item.name}
              <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-primary rounded-full transition-all duration-300 group-hover:w-4" />
            </Link>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="hidden sm:inline-flex text-foreground/70 hover:text-foreground hover:bg-secondary/20 rounded-full px-5"
          >
            Log in
          </Button>
          <Button 
            size="sm" 
            className="rounded-full bg-primary hover:bg-primary/90 text-white px-5 shadow-coral-glow transition-all hover:scale-105"
          >
            Get Started
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
