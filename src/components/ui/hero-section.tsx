"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ProgressiveBlur } from "@/components/ui/progressive-blur";
import { TimelineContent } from "@/components/ui/timeline-animation";
import { useRef } from "react";

export const blocksDesign = [
  {
    id: "hero-section",
    name: "Hero Section",
    url: "/blocks/hero-section",
    des: "Beautiful hero layouts to start your landing page.",
    imgclass: "object-cover",
    textClass: "text-white",
    imgSrc:
      "https://images.unsplash.com/photo-1754630551378-e1ecffe9da6b?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "faq-section",
    name: "FAQ Section",
    url: "/blocks/faq-section",
    des: "Beautiful FAQ layouts to start your landing page.",
    imgclass: "object-contain",
    textClass: "text-primary",
    imgSrc:
      "https://images.unsplash.com/photo-1755543041886-41944f3e08c8?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "testimonial-section",
    name: "Testimonial Section",
    url: "/blocks/testimonial-section",
    des: "Beautiful testimonial layouts to start your landing page.",
    imgclass: "object-contain",
    textClass: "text-primary",
    imgSrc:
      "https://images.unsplash.com/photo-1750688650387-48fbdc7399b3?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "newsletter-section",
    name: "Newsletter Section",
    url: "/blocks/newsletter",
    blocks: 16,
    des: "Beautiful newsletter layouts to start your landing page.",
    imgSrc:
      "https://images.unsplash.com/photo-1654649451086-dd75d8170a27?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "carousel-section",
    name: "Carousel Section",
    url: "/blocks/carousel",
    blocks: 6,
    des: "Beautiful carousel layouts to start your landing page.",
    imgSrc:
      "https://images.unsplash.com/photo-1609323170444-197be3079778?q=80&w=687&auto=format&fit=crop",
  },
  {
    id: "testimonial-section",
    name: "Testimonial Section",
    url: "/blocks/testimonial",
    blocks: 13,
    des: "Beautiful testimonials layouts to start your landing page.",
    imgSrc:
      "https://images.unsplash.com/photo-1635776062764-e025521e3df3?q=80&w=687&auto=format&fit=crop",
  },
];

function Others1() {
  const timelineRef = useRef<HTMLDivElement>(null);
  const revealVariants = {
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.4,
        duration: 0.5,
      },
    }),
    hidden: {
      filter: "blur(10px)",
      y: -20,
      opacity: 0,
    },
  };

  return (
    <main ref={timelineRef} className="bg-white">
      <div className="pt-28 pb-5 max-w-screen-2xl mx-auto min-h-screen px-4">
        <article className="w-fit mx-auto 2xl:max-w-5xl xl:max-w-4xl max-w-2xl text-center space-y-6">
          <TimelineContent
            as="a"
            href={"https://pro.ui-layouts.com/blocks"}
            animationNum={2}
            target="_blank"
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="flex w-fit mx-auto items-center gap-1 rounded-full bg-blue-600 border-4 border-blue-200 py-0.5 pl-0.5 pr-3 text-xs"
          >
            <div className="rounded-full bg-[#fcfdff] px-2 py-1 text-xs text-black">
              Update
            </div>
            <p className="text-white sm:text-base text-xs inline-block">
              ✨ Introducing
              <span className="px-1 font-semibold">New Blocks</span>
            </p>

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
              data-slot="icon"
              className="h-3 w-3 text-white"
            >
              <path
                fillRule="evenodd"
                d="M12.97 3.97a.75.75 0 0 1 1.06 0l7.5 7.5a.75.75 0 0 1 0 1.06l-7.5 7.5a.75.75 0 1 1-1.06-1.06l6.22-6.22H3a.75.75 0 0 1 0-1.5h16.19l-6.22-6.22a.75.75 0 0 1 0-1.06Z"
                clipRule="evenodd"
              ></path>
            </svg>
          </TimelineContent>

          <TimelineContent
            as="h1"
            animationNum={3}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="2xl:text-7xl text-black xl:text-6xl sm:text-5xl text-4xl leading-[100%]"
          >
            Build Faster with{" "}
            <span className="font-semibold bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Premium
            </span>{" "}
            Quality{" "}
            <span className="font-semibold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              Blocks
            </span>{" "}
            For Free.
          </TimelineContent>

          <TimelineContent
            as="p"
            animationNum={4}
            timelineRef={timelineRef}
            customVariants={revealVariants}
            className="lg:text-xl text-black sm:text-lg text-sm max-w-2xl mx-auto"
          >
            Beautifully designed Sections that you can copy and paste into your
            apps. Accessible. Customizable. Open Source.
          </TimelineContent>
        </article>

        <div className="grid md:grid-cols-3 grid-cols-2 gap-6 pt-20">
          {blocksDesign.map((component, index) => {
            return (
              <TimelineContent
                as="a"
                animationNum={index + 5}
                timelineRef={timelineRef}
                key={index}
                target="_blank"
                href={component?.url}
                className="transition-all aspect-video rounded-lg backdrop-blur-sm overflow-hidden"
                rel="noreferrer"
              >
                <figure className="relative h-full w-full">
                  {component.imgSrc && (
                    <Image
                      src={component.imgSrc}
                      alt="hero-sec"
                      width={400}
                      height={400}
                      className={cn("w-full h-full object-cover rounded-xl")}
                    />
                  )}
                </figure>
                <ProgressiveBlur
                  className="pointer-events-none absolute bottom-0 left-0 h-[25%] w-full"
                  blurIntensity={0.5}
                />
                <div
                  className={cn(
                    "sm:py-2 py-1 sm:px-4 px-2 absolute bottom-2 left-2"
                  )}
                >
                  <h1 className="2xl:text-xl xl:text-xl md:text-lg text-sm font-medium leading-[140%] capitalize text-white">
                    {component.name} (<span className="font-semibold">4</span>)
                  </h1>
                </div>
              </TimelineContent>
            );
          })}
        </div>
      </div>
    </main>
  );
}

export default Others1;
