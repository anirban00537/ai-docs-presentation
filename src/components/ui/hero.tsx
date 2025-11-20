"use client";

import { useRef, useState } from "react";

import { MeshGradient } from "@paper-design/shaders-react";

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

      <MeshGradient
        className="absolute inset-0 w-full h-full"
        colors={[
          "#f55702",
          "#f57802",
          "#f58c02",
          "#f5aa64",
          "#eeaeca",
          "#cab3d6",
          "#94c9e9",
        ]}
        speed={0.5}
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
    </div>
  );
}
