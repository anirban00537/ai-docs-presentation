"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconPlayerPlay } from "@tabler/icons-react";

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  // 6 Beautiful presentation-style images
  const deckImages = [
    {
      src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      title: "Abstract Art"
    },
    {
      src: "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=1129&auto=format&fit=crop",
      title: "Gradient Flow"
    },
    {
      src: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=1170&auto=format&fit=crop",
      title: "Color Waves"
    },
    {
      src: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1287&auto=format&fit=crop",
      title: "Fluid Design"
    },
    {
      src: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=1170&auto=format&fit=crop",
      title: "3D Shapes"
    },
    {
      src: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1074&auto=format&fit=crop",
      title: "Neon Glow"
    }
  ];

  // Auto-rotate every 4 seconds (pauses on hover)
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % deckImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [deckImages.length, isHovered]);

  const nextSlide = () => setActiveIndex((prev) => (prev + 1) % deckImages.length);

  // Calculate position for each card
  const getCardStyle = (index: number) => {
    const total = deckImages.length;
    const diff = (index - activeIndex + total) % total;
    
    // Center
    if (diff === 0) {
      return { x: 0, scale: 1, rotateY: 0, z: 50, opacity: 1, filter: "none" };
    }
    // Right 1
    if (diff === 1) {
      return { x: "55%", scale: 0.75, rotateY: -35, z: 0, opacity: 0.7, filter: "brightness(0.8)" };
    }
    // Left 1
    if (diff === total - 1) {
      return { x: "-55%", scale: 0.75, rotateY: 35, z: 0, opacity: 0.7, filter: "brightness(0.8)" };
    }
    // Right 2 (far right)
    if (diff === 2) {
      return { x: "95%", scale: 0.55, rotateY: -45, z: -50, opacity: 0.4, filter: "brightness(0.6) blur(2px)" };
    }
    // Left 2 (far left)
    if (diff === total - 2) {
      return { x: "-95%", scale: 0.55, rotateY: 45, z: -50, opacity: 0.4, filter: "brightness(0.6) blur(2px)" };
    }
    // Hidden (back)
    return { x: 0, scale: 0.4, rotateY: 0, z: -100, opacity: 0, filter: "blur(10px)" };
  };

  const getZIndex = (index: number) => {
    const total = deckImages.length;
    const diff = (index - activeIndex + total) % total;
    if (diff === 0) return 50;
    if (diff === 1 || diff === total - 1) return 40;
    if (diff === 2 || diff === total - 2) return 30;
    return 10;
  };

  return (
    <section className="relative pt-28 pb-20 overflow-hidden min-h-screen flex flex-col items-center justify-start bg-gradient-to-b from-secondary/20 via-white to-primary/5 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-secondary/10 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob" />
         <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
         <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-pink-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000" />
         <div className="absolute inset-0 bg-noise opacity-[0.03]" />
      </div>

      <div className="container relative z-10 px-4 flex flex-col items-center">
        
        {/* Headline Section */}
        <div className="text-center max-w-4xl mx-auto mb-12">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur-sm border border-secondary/20 shadow-sm mb-6"
            >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-xs font-bold tracking-widest uppercase text-foreground/70">
                    AI-Powered Design v2.0
                </span>
            </motion.div>

            <motion.h1
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.1 }}
               className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium tracking-tight text-foreground leading-[1] mb-6"
            >
              Ideas to <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Slides</span> <br />
              in Seconds.
            </motion.h1>

            <motion.p
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed"
            >
               Butterfast transforms your prompts into stunning, professional presentations. 
               No design skills needed. Just pure storytelling.
            </motion.p>

            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.3 }}
               className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
               <Link href="/home">
                  <Button size="lg" className="h-14 px-10 rounded-full text-lg bg-primary text-white hover:bg-primary/90 shadow-coral-glow hover:scale-105 transition-all duration-300">
                    <IconSparkles className="mr-2 h-5 w-5" />
                    Start Creating Free
                  </Button>
               </Link>
               <Button variant="ghost" size="lg" className="h-14 px-8 rounded-full text-lg hover:bg-black/5">
                  <IconPlayerPlay className="mr-2 h-5 w-5 fill-current" />
                  See how it works
               </Button>
            </motion.div>
        </div>

        {/* Premium 3D Carousel */}
        <motion.div 
          className="relative w-full max-w-6xl h-[450px] md:h-[500px] flex items-center justify-center"
          style={{ perspective: "1500px" }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        >
          {/* Navigation Arrows - Removed */}

          {/* Cards Container */}
          <div className="relative w-full h-full flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
            {deckImages.map((image, index) => {
              const style = getCardStyle(index);
              const zIndex = getZIndex(index);
              const isActive = index === activeIndex;
              
              return (
                <motion.div
                  key={index}
                  className="absolute cursor-pointer"
                  style={{ zIndex }}
                  animate={{
                    x: style.x,
                    scale: style.scale,
                    rotateY: style.rotateY,
                    z: style.z,
                    opacity: style.opacity,
                  }}
                  transition={{ 
                    duration: 0.8, 
                    type: "spring", 
                    stiffness: 100,
                    damping: 20
                  }}
                  onClick={() => setActiveIndex(index)}
                  whileHover={isActive ? { scale: 1.02 } : {}}
                >
                  <div 
                    className={`
                      relative w-[280px] sm:w-[400px] md:w-[550px] lg:w-[650px] aspect-[16/9] 
                      rounded-2xl overflow-hidden
                      ${isActive 
                        ? 'shadow-[0_25px_80px_-15px_rgba(0,0,0,0.3)] ring-4 ring-white/80' 
                        : 'shadow-xl'
                      }
                    `}
                    style={{ filter: style.filter }}
                  >
                    {/* Image */}
                    <Image 
                      src={image.src} 
                      alt={image.title} 
                      fill 
                      className="object-cover"
                      priority={index < 3}
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-white/10" />
                    
                    {/* Active Card Glow Effect */}
                    {isActive && (
                      <>
                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 via-transparent to-orange-400/10 mix-blend-overlay" />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/30 rounded-2xl" />
                      </>
                    )}
                    
                    {/* Card Title (shown on active) */}
                    {isActive && (
                      <motion.div 
                        className="absolute bottom-4 left-4 right-4"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                          <span className="text-white/90 text-sm font-medium">{image.title}</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Reflection Effect */}
          <div className="absolute bottom-[-60px] left-1/2 -translate-x-1/2 w-[70%] h-24 bg-gradient-to-b from-black/10 to-transparent blur-2xl rounded-[100%] z-0" />
        </motion.div>

      </div>
    </section>
  );
}
