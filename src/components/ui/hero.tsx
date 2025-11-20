"use client";

import { useRef, useState, useEffect } from "react";



import { motion, AnimatePresence } from "framer-motion";

const StripeAnimation = () => {
  const stripes = [
    { color: "rgba(245,87,2,0.6)", delay: 0, duration: 15 },
    { color: "rgba(245,120,2,0.6)", delay: 2, duration: 18 },
    { color: "rgba(245,140,2,0.6)", delay: 4, duration: 20 },
    { color: "rgba(238,174,202,0.6)", delay: 1, duration: 16 },
    { color: "rgba(202,179,214,0.6)", delay: 3, duration: 19 },
    { color: "rgba(148,201,233,0.6)", delay: 5, duration: 22 },
  ];

  return (
    <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
      {/* Subtle noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.03] mix-blend-overlay z-10" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' 
        }} 
      />
      
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[80px] z-0" />
      
      {stripes.map((stripe, i) => (
        <motion.div
          key={i}
          className="absolute top-[-50%] bottom-[-50%] w-[30%] blur-[60px]"
          style={{
            background: `linear-gradient(180deg, transparent 0%, ${stripe.color} 50%, transparent 100%)`,
            left: `${(i / stripes.length) * 120 - 10}%`,
          }}
          initial={{ skewX: -25 }}
          animate={{
            x: ["-10%", "10%"],
            y: ["-5%", "5%"],
            opacity: [0.4, 0.7, 0.4],
            scaleX: [1, 1.1, 1],
            skewX: -25,
          }}
          transition={{
            duration: stripe.duration,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: stripe.delay,
          }}
        />
      ))}
    </div>
  );
};

export default function ShaderShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Generate random positions once using useState with lazy initializer

  const [particlePositions] = useState(() => {
    return Array.from({ length: 6 }, () => ({
      left: 20 + Math.random() * 60,

      top: 20 + Math.random() * 60,

      xOffset: Math.random() * 20 - 10,
    }));
  });

  // Auto-change slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % 3); // 3 slides for now
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen relative overflow-hidden bg-[radial-gradient(125%_125%_at_50%_101%,rgba(245,87,2,1)_10.5%,rgba(245,120,2,1)_16%,rgba(245,140,2,1)_17.5%,rgba(245,170,100,1)_25%,rgba(238,174,202,1)_40%,rgba(202,179,214,1)_65%,rgba(148,201,233,1)_100%)]"
    >
      <svg className="absolute inset-0 w-0 h-0">
        <defs>
          <filter
            id="glass-effect"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feTurbulence baseFrequency="0.005" numOctaves="1" result="noise" />

            <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.3" />

            <feColorMatrix
              type="matrix"
              values="1 0 0 0 0.02

                      0 1 0 0 0.02

                      0 0 1 0 0.05

                      0 0 0 0.9 0"
              result="tint"
            />
          </filter>

          <filter
            id="gooey-filter"
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />

            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
              result="gooey"
            />

            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>

          <filter id="logo-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />

            <feMerge>
              <feMergeNode in="coloredBlur" />

              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient
            id="logo-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#f97316" />

            <stop offset="50%" stopColor="#ffffff" />

            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          <linearGradient
            id="hero-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#ffffff" />

            <stop offset="30%" stopColor="#fb923c" />

            <stop offset="70%" stopColor="#f97316" />

            <stop offset="100%" stopColor="#ffffff" />
          </linearGradient>

          <filter id="text-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />

            <feMerge>
              <feMergeNode in="coloredBlur" />

              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>

      <StripeAnimation />

      <header className="relative z-20 flex items-center justify-between p-6">
        <motion.div
          className="flex items-center group cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <motion.svg
            fill="currentColor"
            viewBox="0 0 100 100"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="size-10 text-white group-hover:drop-shadow-lg transition-all duration-300"
            style={{
              filter: "url(#logo-glow)",
            }}
            whileHover={{
              fill: "url(#logo-gradient)",

              rotate: [0, -2, 2, 0],

              transition: {
                fill: { duration: 0.3 },

                rotate: { duration: 0.6, ease: "easeInOut" },
              },
            }}
          >
            <motion.path
              d="M15 85V15h12l18 35 18-35h12v70h-12V35L45 70h-10L17 35v50H15z"
              initial={{ pathLength: 1 }}
              whileHover={{
                pathLength: [1, 0, 1],

                transition: { duration: 1.2, ease: "easeInOut" },
              }}
            />
          </motion.svg>

          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            {particlePositions.map((pos, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                style={{
                  left: `${pos.left}%`,

                  top: `${pos.top}%`,
                }}
                animate={{
                  y: [-10, -20, -10],

                  x: [0, pos.xOffset, 0],

                  opacity: [0, 1, 0],

                  scale: [0, 1, 0],
                }}
                transition={{
                  duration: 2,

                  repeat: Number.POSITIVE_INFINITY,

                  delay: i * 0.2,

                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Navigation */}

        <nav className="flex items-center space-x-2">
          <a
            href="#"
            className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            Research
          </a>

          <a
            href="#"
            className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            Templates
          </a>

          <a
            href="#"
            className="text-white/80 hover:text-white text-xs font-light px-3 py-2 rounded-full hover:bg-white/10 transition-all duration-200"
          >
            AI Tools
          </a>
        </nav>

        {/* Login Button Group with Arrow */}

        <div
          id="gooey-btn"
          className="relative flex items-center group"
          style={{ filter: "url(#gooey-filter)" }}
        >
          <button className="absolute right-0 px-2.5 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center justify-center -translate-x-10 group-hover:-translate-x-19 z-0">
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 17L17 7M17 7H7M17 7V17"
              />
            </svg>
          </button>

          <button className="px-6 py-2 rounded-full bg-white text-black font-normal text-xs transition-all duration-300 hover:bg-white/90 cursor-pointer h-8 flex items-center z-10">
            Login
          </button>
        </div>
      </header>

      <main className="absolute inset-0 flex items-center z-20 pt-20">
        <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 lg:px-12">
          {/* Left side - Text content */}
          <div className="flex flex-col justify-center items-start max-w-2xl">
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-none tracking-tight text-left"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span className="block font-light text-white text-3xl md:text-4xl lg:text-5xl mb-2 tracking-wider">
                AI-Powered
              </motion.span>

              <span className="block font-black text-white drop-shadow-2xl">
                Presentations
              </span>

              <span className="block font-light text-white/80 italic">
                Research-Based Excellence
              </span>
            </motion.h1>

            <motion.p
              className="text-lg font-light text-white/70 mb-8 leading-relaxed text-left"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Transform your research into compelling presentations with
              AI-powered insights. Create data-driven, visually stunning
              presentations that engage your audience and communicate your
              findings effectively.
            </motion.p>

            <motion.div
              className="flex items-center gap-6 flex-wrap"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.button
                className="px-10 py-4 rounded-full bg-transparent border-2 border-white/30 text-white font-medium text-sm transition-all duration-300 hover:bg-white/10 hover:border-orange-400/50 hover:text-orange-100 cursor-pointer backdrop-blur-sm"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View Research
              </motion.button>

              <motion.button
                className="px-10 py-4 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold text-sm transition-all duration-300 hover:from-orange-400 hover:to-orange-500 cursor-pointer shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Create Presentation
              </motion.button>
            </motion.div>
          </div>

          {/* Right side - Slide changing animation */}
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-2xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  className="absolute inset-0 bg-white/10 backdrop-blur-sm border border-white/20"
                  initial={{ opacity: 0, x: 50, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  {/* Blank slide content for now */}
                  <div className="w-full h-full flex items-center justify-center">
                    <p className="text-white/50 text-lg">
                      Slide {currentSlide + 1}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Slide indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {[0, 1, 2].map((index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? "w-8 bg-white"
                        : "w-2 bg-white/40 hover:bg-white/60"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
