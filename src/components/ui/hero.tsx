"use client";

import { useRef, useState } from "react";

import { MeshGradient, PulsingBorder } from "@paper-design/shaders-react";

import { motion } from "framer-motion";

export default function ShaderShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate random positions once using useState with lazy initializer

  const [particlePositions] = useState(() => {
    return Array.from({ length: 6 }, () => ({
      left: 20 + Math.random() * 60,

      top: 20 + Math.random() * 60,

      xOffset: Math.random() * 20 - 10,
    }));
  });

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-black relative overflow-hidden"
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

      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={["#000000", "#f97316", "#ea580c", "#c2410c", "#fb923c"]}
        speed={0.3}
      />

      <MeshGradient
        className="absolute inset-0 w-full h-full opacity-60"
        colors={["#000000", "#ffffff", "#fb923c", "#f97316"]}
        speed={0.2}
      />

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

      <main className="absolute inset-0 flex items-center justify-center z-20">
        <div className="text-center max-w-4xl px-8">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
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
            className="text-lg font-light text-white/70 mb-8 leading-relaxed max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Transform your research into compelling presentations with
            AI-powered insights. Create data-driven, visually stunning
            presentations that engage your audience and communicate your
            findings effectively.
          </motion.p>

          <motion.div
            className="flex items-center justify-center gap-6 flex-wrap"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
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
      </main>

      <div className="absolute bottom-8 right-8 z-30">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <PulsingBorder
            colors={[
              "#f97316",
              "#ea580c",
              "#fb923c",
              "#ff7a00",
              "#ff9500",
              "#c2410c",
              "#ffffff",
            ]}
            colorBack="#00000000"
            speed={1.5}
            roundness={1}
            thickness={0.1}
            softness={0.2}
            intensity={5}
            spotSize={0.1}
            pulse={0.1}
            smoke={0.5}
            smokeSize={4}
            scale={0.65}
            rotation={0}
            frame={9161408.251009725}
            style={{
              width: "60px",

              height: "60px",

              borderRadius: "50%",
            }}
          />

          {/* Rotating Text Around the Pulsing Border */}

          <motion.svg
            className="absolute inset-0 w-full h-full"
            viewBox="0 0 100 100"
            animate={{ rotate: 360 }}
            transition={{
              duration: 20,

              repeat: Number.POSITIVE_INFINITY,

              ease: "linear",
            }}
            style={{ transform: "scale(1.6)" }}
          >
            <defs>
              <path
                id="circle"
                d="M 50, 50 m -38, 0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0"
              />
            </defs>

            <text className="text-sm fill-white/80 font-medium">
              <textPath href="#circle" startOffset="0%">
                AI Presentations • Research-Based • Data-Driven • Intelligent
                Design • AI Presentations •
              </textPath>
            </text>
          </motion.svg>
        </div>
      </div>
    </div>
  );
}
