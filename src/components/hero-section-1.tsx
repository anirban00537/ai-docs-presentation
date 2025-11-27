"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Menu, X } from "lucide-react";
import { Variants } from "framer-motion";

import { AppleButton } from "@/components/editor/apple-button";
import { AnimatedGroup } from "@/components/ui/animated-group";
import { cn } from "@/lib/utils";
import Image from "next/image";

const transitionVariants: { item: Variants } = {
  item: {
    hidden: {
      opacity: 0,
      filter: "blur(12px)",
      y: 12,
    },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: {
        type: "spring" as const,
        bounce: 0.3,
        duration: 1.5,
      },
    },
  },
};

export function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <section className="">
          <div className="relative pt-24 md:pt-36">
            <div className="mx-auto max-w-7xl px-6">
              <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                <AnimatedGroup variants={transitionVariants}>
                  <Link
                    href="#link"
                    className="hover:bg-background dark:hover:border-t-border bg-muted/80 backdrop-blur-sm group mx-auto flex w-fit items-center gap-4 rounded-full border border-primary/20 p-1.5 pl-5 shadow-lg shadow-primary/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
                  >
                    <span className="text-foreground text-sm font-medium tracking-wide">
                      Create Smooth, Butter-Like Presentations with AI
                    </span>
                    <span className="dark:border-background block h-4 w-0.5 border-l bg-primary/30 dark:bg-zinc-700" />

                    <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                      <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                        <span className="flex size-6">
                          <ArrowRight className="m-auto size-3" />
                        </span>
                      </div>
                    </div>
                  </Link>
                  <h1 className="mt-10 max-w-5xl mx-auto text-balance text-5xl font-bold leading-tight tracking-tight text-foreground md:text-6xl lg:mt-14 xl:text-7xl">
                    Presentations as Smooth
                    <br />
                    as Butter
                  </h1>
                  <p className="mx-auto mt-6 max-w-4xl text-balance text-lg leading-relaxed text-muted-foreground md:text-xl md:leading-relaxed">
                    Create stunning, buttery-smooth presentations effortlessly
                    with AI. Design, customize, and share professional slides
                    that flow seamlessly and captivate your audience.
                  </p>
                </AnimatedGroup>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row"
                >
                  <div
                    key={1}
                    className="bg-foreground/10 rounded-[14px] border p-0.5"
                  >
                    <AppleButton
                      asChild
                      size="lg"
                      variant="primary"
                      className="rounded-xl px-5 text-base"
                    >
                      <Link href="/editor">
                        <span className="text-nowrap">Create Presentation</span>
                      </Link>
                    </AppleButton>
                  </div>
                  <AppleButton
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-10.5 rounded-xl px-5"
                  >
                    <Link href="#link">
                      <span className="text-nowrap">
                        Explore Research Tools
                      </span>
                    </Link>
                  </AppleButton>
                </AnimatedGroup>
              </div>
            </div>
          </div>
          <section className="bg-background/50 pb-16 pt-16 md:pb-32">
            <div className="mx-auto max-w-6xl px-6">
              <p className="text-center text-sm font-medium text-muted-foreground mb-8">
                Trusted by leading companies
              </p>
              <div className="mx-auto grid max-w-4xl grid-cols-4 gap-8 sm:grid-cols-4 md:gap-12">
                <div className="flex items-center justify-center">
                  <img
                    className="h-6 w-auto opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:invert dark:opacity-40 dark:hover:opacity-70"
                    src="/nvidia.svg"
                    alt="Nvidia Logo"
                    height="24"
                    width="auto"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <img
                    className="h-6 w-auto opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:invert dark:opacity-40 dark:hover:opacity-70"
                    src="https://html.tailus.io/blocks/customers/github.svg"
                    alt="GitHub Logo"
                    height="24"
                    width="auto"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <img
                    className="h-6 w-auto opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:invert dark:opacity-40 dark:hover:opacity-70"
                    src="https://html.tailus.io/blocks/customers/openai.svg"
                    alt="OpenAI Logo"
                    height="24"
                    width="auto"
                  />
                </div>
                <div className="flex items-center justify-center">
                  <img
                    className="h-6 w-auto opacity-60 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0 dark:invert dark:opacity-40 dark:hover:opacity-70"
                    src="https://html.tailus.io/blocks/customers/nike.svg"
                    alt="Nike Logo"
                    height="24"
                    width="auto"
                  />
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </>
  );
}

const menuItems = [
  { name: "AI Research", href: "#link" },
  { name: "Templates", href: "#link" },
  { name: "Pricing", href: "#link" },
  { name: "About", href: "#link" },
];

const HeroHeader = () => {
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
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5"
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
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
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
                    <span>Login</span>
                  </Link>
                </AppleButton>
                <AppleButton
                  asChild
                  variant="primary"
                  size="sm"
                  className={cn(isScrolled && "lg:hidden")}
                >
                  <Link href="#">
                    <span>Sign Up</span>
                  </Link>
                </AppleButton>
                <AppleButton
                  asChild
                  variant="primary"
                  size="sm"
                  className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                >
                  <Link href="#">
                    <span>Start Researching</span>
                  </Link>
                </AppleButton>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
