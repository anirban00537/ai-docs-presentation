"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

import { AppleButton } from "@/components/apple-button";
import { cn } from "@/lib/utils";

const menuItems = [
  { name: "Blog", href: "/blog" },
  { name: "AI Research", href: "#link" },
  { name: "Templates", href: "#link" },
  { name: "Pricing", href: "#link" },
  { name: "About", href: "#link" },
];

export function Navbar() {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2 group"
      >
        <div
          className={cn(
            "mt-2 px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-white/10 dark:bg-black/10 rounded-2xl backdrop-blur-xl lg:px-5 shadow-lg shadow-black/5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Image src="/logo.svg" alt="logo" width={200} height={200} />
              </Link>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-black dark:text-white hover:text-black/80 dark:hover:text-white/80 block duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white/10 dark:bg-black/10 backdrop-blur-xl group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl p-6 shadow-2xl shadow-black/10 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:bg-transparent lg:p-0 lg:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                <AppleButton
                  asChild
                  variant="tertiary"
                  size="sm"
                  className={cn(isScrolled && "lg:hidden")}
                >
                  <Link href="#">
                    <span className="text-black">Login</span>
                  </Link>
                </AppleButton>
                <AppleButton
                  asChild
                  variant="primary"
                  size="sm"
                  className={cn(isScrolled && "lg:hidden")}
                >
                  <Link href="#">
                    <span className="text-white">Sign Up</span>
                  </Link>
                </AppleButton>
                <AppleButton
                  asChild
                  variant="primary"
                  size="sm"
                  className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                >
                  <Link href="#">
                    <span className="text-white">Start Researching</span>
                  </Link>
                </AppleButton>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
