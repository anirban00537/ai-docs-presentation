"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { IconSparkles, IconPlayerPlay } from "@tabler/icons-react";

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Real Unsplash Images
  const deckImages = [
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620641788427-b95c84f1d416?q=80&w=2670&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop"
  ];

  // Auto-rotate every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % deckImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [deckImages.length]);

  // Helper to determine position relative to active index
  // 0 = center, 1 = right, 2 = left (since we have 3 images)
  const getPosition = (index: number) => {
     if (index === activeIndex) return "center";
     if (index === (activeIndex + 1) % deckImages.length) return "right";
     return "left";
  };

  return (
    <section className="relative pt-32 pb-32 overflow-hidden min-h-screen flex flex-col items-center justify-start bg-[#faf9f6] dark:bg-zinc-950">
      
      {/* 1. Ambient Background Mesh */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-20%] left-[-10%] w-[70vw] h-[70vw] bg-secondary/10 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob" />
         <div className="absolute top-[-20%] right-[-10%] w-[70vw] h-[70vw] bg-primary/5 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-2000" />
         <div className="absolute bottom-[-20%] left-[20%] w-[70vw] h-[70vw] bg-pink-100/40 rounded-full blur-[120px] mix-blend-multiply opacity-70 animate-blob animation-delay-4000" />
         {/* Texture Overlay */}
         <div className="absolute inset-0 bg-noise opacity-[0.03]" />
      </div>

      <div className="container relative z-10 px-4 flex flex-col items-center">
        
        {/* 2. Editorial Headline Section */}
        <div className="text-center max-w-4xl mx-auto mb-16">
            <motion.div 
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.6 }}
               className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-secondary/20 shadow-sm mb-8"
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
               className="font-serif text-6xl md:text-8xl font-medium tracking-tight text-foreground leading-[1] mb-8"
            >
              Ideas to <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">Slides</span> <br />
              in Seconds.
            </motion.h1>

            <motion.p
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8, delay: 0.2 }}
               className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
            >
               Butterfast transforms your notes into stunning, professional presentations. 
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

        {/* 3. The Levitating 3D Carousel */}
        <div className="relative w-full h-[500px] perspective-[1200px] flex items-center justify-center -mt-8">
            {deckImages.map((src, index) => {
               const pos = getPosition(index);
               
               // Center card
               if (pos === "center") {
                   return (
                     <motion.div
                        layoutId={`card-${src}`}
                        key={`card-${index}`}
                        className="absolute w-[800px] aspect-[16/9] shadow-2xl rounded-2xl overflow-hidden border-[6px] border-white z-30"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ 
                            scale: 1, 
                            opacity: 1, 
                            rotateY: 0, 
                            z: 100,
                            x: 0 
                        }}
                        transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                     >
                        <Image src={src} alt="Active Slide" fill className="object-cover" priority />
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                     </motion.div>
                   );
               }
               
               // Left card
               if (pos === "left") {
                   return (
                       <motion.div
                          layoutId={`card-${src}`}
                          key={`card-${index}`}
                          className="absolute w-[800px] aspect-[16/9] bg-black/5 rounded-2xl overflow-hidden shadow-lg z-10 grayscale-[50%]"
                          animate={{ 
                              scale: 0.85, 
                              opacity: 0.4, 
                              rotateY: 25, 
                              z: -100, 
                              x: '-45%' 
                          }}
                          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                       >
                            <Image src={src} alt="Left Slide" fill className="object-cover" />
                            <div className="absolute inset-0 bg-white/20" />
                       </motion.div>
                   );
               }

               // Right card
               if (pos === "right") {
                    return (
                        <motion.div
                            layoutId={`card-${src}`}
                            key={`card-${index}`}
                            className="absolute w-[800px] aspect-[16/9] bg-black/5 rounded-2xl overflow-hidden shadow-lg z-10 grayscale-[50%]"
                            animate={{ 
                                scale: 0.85, 
                                opacity: 0.4, 
                                rotateY: -25, 
                                z: -100, 
                                x: '45%' 
                            }}
                            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
                        >
                            <Image src={src} alt="Right Slide" fill className="object-cover" />
                            <div className="absolute inset-0 bg-white/20" />
                        </motion.div>
                    );
               }
            })}

            {/* Reflections */}
            <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[90%] h-32 bg-gradient-to-b from-black/5 to-transparent blur-3xl rounded-[100%] z-0" />
        </div>

      </div>
    </section>
  );
}
