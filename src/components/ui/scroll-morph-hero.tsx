"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, useTransform, useSpring, useMotionValue } from "framer-motion";
import { AppleButton } from "@/components/apple-button";

// --- Types ---
export type AnimationPhase = "scatter" | "line" | "circle" | "bottom-strip";

interface FlipCardProps {
  src: string;
  index: number;
  target: {
    x: number;
    y: number;
    rotation: number;
    scale: number;
    opacity: number;
  };
  imgWidth?: number;
  imgHeight?: number;
}

// --- FlipCard Component ---
const DEFAULT_IMG_WIDTH = 60;
const DEFAULT_IMG_HEIGHT = 85;

function FlipCard({
  src,
  index,
  target,
  imgWidth = DEFAULT_IMG_WIDTH,
  imgHeight = DEFAULT_IMG_HEIGHT,
}: FlipCardProps) {
  return (
    <motion.div
      // Smoothly animate to the coordinates defined by the parent
      animate={{
        x: target.x,
        y: target.y,
        rotate: target.rotation,
        scale: target.scale,
        opacity: target.opacity,
      }}
      transition={{
        type: "spring",
        stiffness: 60,
        damping: 20,
      }}
      // Initial style
      style={{
        position: "absolute",
        width: imgWidth,
        height: imgHeight,
        transformStyle: "preserve-3d", // Essential for the 3D hover effect
        perspective: "1000px",
      }}
      className="cursor-pointer group"
    >
      <motion.div
        className="relative h-full w-full"
        style={{ transformStyle: "preserve-3d" }}
        transition={{
          duration: 0.4,
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        whileHover={{ rotateY: 180 }}
      >
        {/* Front Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-200"
          style={{ backfaceVisibility: "hidden" }}
        >
          <img
            src={src}
            alt={`hero-${index}`}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/10 transition-colors group-hover:bg-transparent" />
        </div>

        {/* Back Face */}
        <div
          className="absolute inset-0 h-full w-full overflow-hidden rounded-xl shadow-lg bg-gray-900 flex flex-col items-center justify-center p-4 border border-gray-700"
          style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
        >
          <div className="text-center">
            <p className="text-[8px] font-bold text-blue-400 uppercase tracking-widest mb-1">
              View
            </p>
            <p className="text-xs font-medium text-white">Details</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- Main Hero Component ---
const TOTAL_IMAGES = 20;
const MAX_SCROLL = 300; // Virtual scroll range (reduced for faster animation and easier scrolling)

// Unsplash Images
const IMAGES = [
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&q=80",
  "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?w=300&q=80",
  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&q=80",
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&q=80",
  "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=300&q=80",
  "https://images.unsplash.com/photo-1506765515384-028b60a970df?w=300&q=80",
  "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&q=80",
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=300&q=80",
  "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?w=300&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300&q=80",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&q=80",
  "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?w=300&q=80",
  "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=300&q=80",
  "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=300&q=80",
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=300&q=80",
  "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=300&q=80",
  "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=300&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=300&q=80",
  "https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=300&q=80",
  "https://images.unsplash.com/photo-1496568816309-51d7c20e3b21?w=300&q=80",
];

// Helper for linear interpolation
const lerp = (start: number, end: number, t: number) =>
  start * (1 - t) + end * t;

export default function IntroAnimation() {
  const [introPhase, setIntroPhase] = useState<AnimationPhase>("scatter");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // --- Container Size ---
  useEffect(() => {
    if (!containerRef.current) return;

    const handleResize = (entries: ResizeObserverEntry[]) => {
      for (const entry of entries) {
        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    };

    const observer = new ResizeObserver(handleResize);
    observer.observe(containerRef.current);

    // Initial set
    setContainerSize({
      width: containerRef.current.offsetWidth,
      height: containerRef.current.offsetHeight,
    });

    return () => observer.disconnect();
  }, []);

  // --- Virtual Scroll Logic ---
  const virtualScroll = useMotionValue(0);
  const scrollRef = useRef(0); // Keep track of scroll value without re-renders

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Check if we're at the limits and user wants to scroll past
      const isScrollingDown = e.deltaY > 0;
      const isScrollingUp = e.deltaY < 0;
      const isAtMax = scrollRef.current >= MAX_SCROLL;
      const isAtMin = scrollRef.current <= 0;

      // Allow normal page scroll if:
      // 1. At max scroll and scrolling down (with some buffer)
      // 2. At min scroll and scrolling up
      // 3. Near max (within 20px) to allow easier transition
      const nearMax = scrollRef.current >= MAX_SCROLL - 20;
      if (
        (isAtMax && isScrollingDown) ||
        (nearMax && isScrollingDown) ||
        (isAtMin && isScrollingUp)
      ) {
        // Don't prevent default - allow normal page scroll
        return;
      }

      // Otherwise, handle virtual scroll
      e.preventDefault();

      // Increase scroll sensitivity (multiply by 5 for faster animation response)
      const scrollMultiplier = 5;
      const newScroll = Math.min(
        Math.max(scrollRef.current + e.deltaY * scrollMultiplier, 0),
        MAX_SCROLL
      );
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    // Touch support
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const deltaY = touchStartY - touchY;
      touchStartY = touchY;

      // Check if we're at the limits
      const isScrollingDown = deltaY > 0;
      const isScrollingUp = deltaY < 0;
      const isAtMax = scrollRef.current >= MAX_SCROLL;
      const isAtMin = scrollRef.current <= 0;
      const nearMax = scrollRef.current >= MAX_SCROLL - 20;

      // Allow normal page scroll if at limits or near max
      if (
        (isAtMax && isScrollingDown) ||
        (nearMax && isScrollingDown) ||
        (isAtMin && isScrollingUp)
      ) {
        return;
      }

      e.preventDefault();

      // Increase scroll sensitivity for touch (multiply by 5 for faster animation response)
      const scrollMultiplier = 5;
      const newScroll = Math.min(
        Math.max(scrollRef.current + deltaY * scrollMultiplier, 0),
        MAX_SCROLL
      );
      scrollRef.current = newScroll;
      virtualScroll.set(newScroll);
    };

    // Attach listeners to container instead of window for portability
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("touchstart", handleTouchStart, {
      passive: false,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [virtualScroll]);

  // 1. Morph Progress: 0 (Circle) -> 1 (Bottom Arc)
  // Happens between scroll 0 and 150 (reduced for faster response)
  const morphProgress = useTransform(virtualScroll, [0, 150], [0, 1]);
  const smoothMorph = useSpring(morphProgress, { stiffness: 60, damping: 25 });

  // 2. Scroll Rotation (Shuffling): Starts after morph (e.g., > 150)
  // Rotates the bottom arc as user continues scrolling
  const scrollRotate = useTransform(virtualScroll, [150, 300], [0, 360]);
  const smoothScrollRotate = useSpring(scrollRotate, {
    stiffness: 60,
    damping: 25,
  });

  // --- Mouse Parallax ---
  const mouseX = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 25 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;

      // Normalize -1 to 1
      const normalizedX = (relativeX / rect.width) * 2 - 1;
      // Move +/- 100px
      mouseX.set(normalizedX * 100);
    };
    container.addEventListener("mousemove", handleMouseMove);
    return () => container.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX]);

  // --- Intro Sequence ---
  useEffect(() => {
    const timer1 = setTimeout(() => setIntroPhase("line"), 300);
    const timer2 = setTimeout(() => setIntroPhase("circle"), 1200);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  // --- Random Scatter Positions ---
  const scatterPositions = useMemo(() => {
    // Generate random positions once using a seeded approach
    const positions = [];
    for (let i = 0; i < IMAGES.length; i++) {
      // Use a simple pseudo-random generator based on index
      const seed = i * 0.618033988749; // Golden ratio for better distribution
      const x = (((seed * 1000) % 1) - 0.5) * 1500;
      const y = (((seed * 1000 * 1.618) % 1) - 0.5) * 1000;
      const rotation = (((seed * 1000 * 2.618) % 1) - 0.5) * 180;
      positions.push({
        x,
        y,
        rotation,
        scale: 0.6,
        opacity: 0,
      });
    }
    return positions;
  }, []);

  // --- Render Loop (Manual Calculation for Morph) ---
  const [morphValue, setMorphValue] = useState(0);
  const [rotateValue, setRotateValue] = useState(0);
  const [parallaxValue, setParallaxValue] = useState(0);

  useEffect(() => {
    const unsubscribeMorph = smoothMorph.on("change", setMorphValue);
    const unsubscribeRotate = smoothScrollRotate.on("change", setRotateValue);
    const unsubscribeParallax = smoothMouseX.on("change", setParallaxValue);
    return () => {
      unsubscribeMorph();
      unsubscribeRotate();
      unsubscribeParallax();
    };
  }, [smoothMorph, smoothScrollRotate, smoothMouseX]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-[#FAFAFA] overflow-hidden"
    >
      {/* Container */}
      <div className="flex h-full w-full flex-col md:flex-row items-center justify-between perspective-1000 px-4 sm:px-6 md:px-12 lg:px-16 py-8 md:py-0 mt-16 md:mt-20">
        {/* Intro Text (Left Side) */}
        <div className="relative z-0 flex flex-col items-center md:items-start justify-center text-center md:text-left pointer-events-none w-full md:w-1/2 mb-6 md:mb-0">
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={
              introPhase === "circle" && morphValue < 0.5
                ? { opacity: 1 - morphValue * 2, y: 0, filter: "blur(0px)" }
                : { opacity: 0, filter: "blur(10px)" }
            }
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl font-medium tracking-tight text-gray-800 leading-tight"
          >
            The future of
            <br />
            presentation with AI.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={
              introPhase === "circle" && morphValue < 0.5
                ? { opacity: 1 - morphValue * 2, y: 0 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 md:mt-6 text-base sm:text-lg md:text-xl text-gray-600 max-w-xl leading-relaxed"
          >
            Create stunning presentations in seconds with AI-powered design.
            Transform your ideas into professional slides effortlessly.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={
              introPhase === "circle" && morphValue < 0.5
                ? { opacity: 1 - morphValue * 2, y: 0 }
                : { opacity: 0 }
            }
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-6 md:mt-8 w-full md:w-auto"
          >
            <AppleButton
              variant="primary"
              size="lg"
              className="w-full sm:w-auto text-sm sm:text-base md:text-lg px-6 sm:px-8 md:px-10 py-2.5 sm:py-3 md:py-4"
            >
              Get Started
            </AppleButton>
          </motion.div>
        </div>

        {/* Main Container (Right Side - Circle/Images) */}
        <div className="relative flex items-center justify-center w-full md:w-1/2 h-[400px] sm:h-[500px] md:h-full min-h-[400px] md:min-h-0">
          {IMAGES.slice(0, TOTAL_IMAGES).map((src, i) => {
            // Calculate responsive image sizes (calculate once per render)
            const isMobile = containerSize.width < 768;
            const isTablet =
              containerSize.width >= 768 && containerSize.width < 1024;
            let imgWidth = 60;
            let imgHeight = 85;
            if (isMobile) {
              imgWidth = 45;
              imgHeight = 64;
            } else if (isTablet) {
              imgWidth = 55;
              imgHeight = 78;
            }

            let target = { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1 };

            // 1. Intro Phases (Scatter -> Line)
            if (introPhase === "scatter") {
              target = scatterPositions[i];
            } else if (introPhase === "line") {
              // Responsive line spacing
              const lineSpacing = isMobile ? 55 : isTablet ? 65 : 70;
              const lineTotalWidth = TOTAL_IMAGES * lineSpacing;
              const lineX = i * lineSpacing - lineTotalWidth / 2;
              target = { x: lineX, y: 0, rotation: 0, scale: 1, opacity: 1 };
            } else {
              // 2. Circle Phase & Morph Logic

              // Responsive Calculations
              const isMobile = containerSize.width < 768;
              const isTablet =
                containerSize.width >= 768 && containerSize.width < 1024;
              const minDimension = Math.min(
                containerSize.width,
                containerSize.height
              );

              // A. Calculate Circle Position
              let circleRadiusMultiplier = 0.35;
              let circleRadiusMax = 350;
              if (isMobile) {
                circleRadiusMultiplier = 0.28;
                circleRadiusMax = 200;
              } else if (isTablet) {
                circleRadiusMultiplier = 0.32;
                circleRadiusMax = 280;
              }
              const circleRadius = Math.min(
                minDimension * circleRadiusMultiplier,
                circleRadiusMax
              );

              const circleAngle = (i / TOTAL_IMAGES) * 360;
              const circleRad = (circleAngle * Math.PI) / 180;
              const circlePos = {
                x: Math.cos(circleRad) * circleRadius,
                y: Math.sin(circleRad) * circleRadius,
                rotation: circleAngle + 90,
              };

              // B. Calculate Bottom Arc Position
              // "Rainbow" Arch: Convex up. Center is highest point.

              // Radius:
              const baseRadius = Math.min(
                containerSize.width,
                containerSize.height * 1.5
              );
              let arcRadiusMultiplier = 1.1;
              if (isMobile) {
                arcRadiusMultiplier = 1.2;
              } else if (isTablet) {
                arcRadiusMultiplier = 1.15;
              }
              const arcRadius = baseRadius * arcRadiusMultiplier;

              // Position:
              let arcApexYMultiplier = 0.25;
              if (isMobile) {
                arcApexYMultiplier = 0.4;
              } else if (isTablet) {
                arcApexYMultiplier = 0.3;
              }
              const arcApexY = containerSize.height * arcApexYMultiplier;
              const arcCenterY = arcApexY + arcRadius;

              // Spread angle:
              let spreadAngle = 130;
              if (isMobile) {
                spreadAngle = 90;
              } else if (isTablet) {
                spreadAngle = 115;
              }
              const startAngle = -90 - spreadAngle / 2;
              const step = spreadAngle / (TOTAL_IMAGES - 1);

              // Apply Scroll Rotation (Shuffle) with Bounds
              // We want to clamp rotation so images don't disappear.
              // Map scroll range [600, 3000] to a limited rotation range.
              // Range: [-spreadAngle/2, spreadAngle/2] keeps them roughly in view.
              // We map 0 -> 1 (progress of scroll loop) to this range.

              // Note: rotateValue comes from smoothScrollRotate which maps [600, 3000] -> [0, 360]
              // We need to adjust that mapping in the hook above, OR adjust it here.
              // Better to adjust it here relative to the spread.

              // Let's interpret rotateValue (0 to 360) as a progress 0 to 1
              const scrollProgress = Math.min(
                Math.max(rotateValue / 360, 0),
                1
              );

              // Calculate bounded rotation:
              // Move from 0 (centered) to -spreadAngle (all the way left) or similar.
              // Let's allow scrolling through the list.

              // Total sweep needed to see all items if we start at one end?

              // If we start centered, we can go +/- spreadAngle/2.

              // User wants to "stop on the last image".

              // Let's map scroll to: 0 -> -spreadAngle (shifts items left)
              const maxRotation = spreadAngle * 0.8; // Don't go all the way, keep last item visible
              const boundedRotation = -scrollProgress * maxRotation;

              const currentArcAngle = startAngle + i * step + boundedRotation;
              const arcRad = (currentArcAngle * Math.PI) / 180;

              // Scale based on device size
              let arcScale = 1.8;
              if (isMobile) {
                arcScale = 1.2;
              } else if (isTablet) {
                arcScale = 1.5;
              }

              const arcPos = {
                x: Math.cos(arcRad) * arcRadius + parallaxValue,
                y: Math.sin(arcRad) * arcRadius + arcCenterY,
                rotation: currentArcAngle + 90,
                scale: arcScale, // Responsive scale for active state
              };

              // C. Interpolate (Morph)
              target = {
                x: lerp(circlePos.x, arcPos.x, morphValue),
                y: lerp(circlePos.y, arcPos.y, morphValue),
                rotation: lerp(circlePos.rotation, arcPos.rotation, morphValue),
                scale: lerp(1, arcPos.scale, morphValue),
                opacity: 1,
              };
            }

            return (
              <FlipCard
                key={i}
                src={src}
                index={i}
                target={target}
                imgWidth={imgWidth}
                imgHeight={imgHeight}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
