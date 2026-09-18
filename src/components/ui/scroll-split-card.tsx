"use client";

import React, { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform, useMotionTemplate, useSpring } from "framer-motion";
import { ArrowDown, Layers, Sparkles, CheckCircle2, Sliders } from "lucide-react";

export interface ScrollSplitCardItem {
  title: string;
  description: string;
  bgColor: string;
  textColor: string;
  icon?: React.ReactNode;
}

export interface ScrollSplitCardProps {
  className?: string;
  imageSrc: string;
  cards: ScrollSplitCardItem[];
  containerRef?: React.RefObject<HTMLElement | null>;
  startText?: string;
  endText?: string;
  onScrollPast?: () => void;
}

export function ScrollSplitCard({
  className,
  imageSrc,
  cards,
  containerRef: externalContainerRef,
  startText = "Scroll or tap to split & inspect cards",
  endText = "Hear Beyond the Surface",
  onScrollPast,
}: ScrollSplitCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [manualProgress, setManualProgress] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Viewport-based scroll tracking: starts as soon as top reaches 80% viewport
  // and completes smoothly when centered, NEVER locking or trapping the user!
  const { scrollYProgress } = useScroll({
    target: containerRef,
    container: externalContainerRef,
    offset: ["start 85%", "center 30%"],
  });

  const smoothScrollProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.2,
  });

  // Effective progress combines scroll and manual interaction
  const effectiveProgress = manualProgress !== null ? manualProgress : 0;

  // Transforms driven by scroll progress
  const leftX = useTransform(smoothScrollProgress, [0, 0.45, 0.9], [0, -44, -18]);
  const rightX = useTransform(smoothScrollProgress, [0, 0.45, 0.9], [0, 44, 18]);
  const scale = useTransform(smoothScrollProgress, [0, 0.5], [1, 0.96]);

  const rotateY = useTransform(smoothScrollProgress, [0.2, 0.8], [0, 180]);
  const rotateZLeft = useTransform(smoothScrollProgress, [0.2, 0.8], [0, 3.5]);
  const rotateZRight = useTransform(smoothScrollProgress, [0.2, 0.8], [0, -3.5]);

  const borderRadiusLeft = useTransform(smoothScrollProgress, [0, 0.25], ["20px 0px 0px 20px", "20px 20px 20px 20px"]);
  const borderRadiusMiddle = useTransform(smoothScrollProgress, [0, 0.25], ["0px 0px 0px 0px", "20px 20px 20px 20px"]);
  const borderRadiusRight = useTransform(smoothScrollProgress, [0, 0.25], ["0px 20px 20px 0px", "20px 20px 20px 20px"]);
  const borderOpacity = useTransform(smoothScrollProgress, [0, 0.25], [0, 0.85]);
  const shadowOpacity = useTransform(smoothScrollProgress, [0, 0.25], [0.04, 0.16]);
  const boxShadow = useMotionTemplate`0 20px 48px -8px rgba(2, 132, 199, ${shadowOpacity}), inset 0 1px 1px rgba(255, 255, 255, ${borderOpacity})`;

  // Header and Footer text animations
  const textOpacity = useTransform(smoothScrollProgress, [0.65, 0.95], [0, 1]);
  const textY = useTransform(smoothScrollProgress, [0.65, 0.95], [20, 0]);
  const startTextOpacity = useTransform(smoothScrollProgress, [0, 0.25], [1, 0]);

  // Handle clicking on the card to toggle split state
  const handleCardClick = () => {
    if (manualProgress === null || manualProgress < 0.5) {
      setManualProgress(1);
    } else {
      setManualProgress(0);
    }
  };

  const handleSkipScroll = () => {
    if (onScrollPast) {
      onScrollPast();
      return;
    }
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      window.scrollBy({ top: rect.bottom - window.innerHeight + 120, behavior: "smooth" });
    }
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full py-12 sm:py-20 flex flex-col items-center", className)}
    >
      {/* Top Interactive Controls & Prompt */}
      <div className="w-full max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6 z-20">
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-sky-100 shadow-soft-blue text-blue-700 text-xs font-semibold backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Interactive Multi-Layer Acoustic Split</span>
          </div>
          <span className="text-xs text-slate-600 hidden sm:inline-block">
            Scroll into view or tap to separate layers
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick toggle button */}
          <button
            onClick={handleCardClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-sky-50 text-slate-700 border border-sky-200/80 shadow-xs transition-all cursor-pointer"
          >
            <Layers className="h-3.5 w-3.5 text-blue-600" />
            <span>{manualProgress && manualProgress > 0.5 ? "Fold Card" : "Split Card"}</span>
          </button>

          <button
            onClick={handleSkipScroll}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-mono text-slate-500 hover:text-blue-600 hover:bg-sky-50 transition-colors cursor-pointer"
          >
            <span>Next section</span>
            <ArrowDown className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Main 3D Card Stage */}
      <div className="w-full max-w-5xl px-4 flex flex-col items-center justify-center [perspective:1400px]">
        <motion.div
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            scale,
            transformStyle: "preserve-3d",
          }}
          className="flex h-[440px] sm:h-[460px] w-full relative z-10 cursor-pointer transition-transform duration-300 select-none"
        >
          {cards.slice(0, 3).map((card, i) => {
            // If user manually toggled, override transform coordinates gracefully
            const isManualFlipped = manualProgress !== null && manualProgress > 0.5;
            const manualX = isManualFlipped ? (i === 0 ? -28 : i === 2 ? 28 : 0) : 0;
            const manualRotateY = isManualFlipped ? 180 : 0;

            return (
              <motion.div
                key={i}
                className="relative h-full flex-1"
                animate={
                  manualProgress !== null
                    ? {
                        x: manualX,
                        rotateY: manualRotateY,
                        rotateZ: isManualFlipped ? (i === 0 ? 3 : i === 2 ? -3 : 0) : 0,
                      }
                    : undefined
                }
                style={
                  manualProgress === null
                    ? {
                        x: i === 0 ? leftX : i === 2 ? rightX : 0,
                        rotateY,
                        rotateZ: i === 0 ? rotateZLeft : i === 2 ? rotateZRight : 0,
                        zIndex: i,
                        transformStyle: "preserve-3d",
                      }
                    : {
                        zIndex: i,
                        transformStyle: "preserve-3d",
                      }
                }
                transition={{ type: "spring", stiffness: 180, damping: 22 }}
              >
                {/* FRONT FACE: Precision Acoustic Lab Artwork (Cut across 3 panels) */}
                <motion.div
                  className="absolute inset-0 overflow-hidden [backface-visibility:hidden] border border-sky-200/80 bg-slate-900"
                  style={{
                    zIndex: 2,
                    borderRadius: i === 0 ? borderRadiusLeft : i === 2 ? borderRadiusRight : borderRadiusMiddle,
                    boxShadow,
                  }}
                >
                  <div
                    className="absolute inset-0 h-full w-[300%] transition-all duration-700"
                    style={{
                      left: `${-100 * i}%`,
                      backgroundImage: `url(${imageSrc})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      filter: isHovered ? "brightness(1.05) contrast(1.02)" : "none",
                    }}
                  />

                  {/* High tech HUD overlay on front face */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/30 pointer-events-none p-5 flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[11px] font-mono text-sky-300/90 tracking-wider">
                      <span className="bg-blue-900/60 backdrop-blur-md px-2 py-0.5 rounded border border-sky-400/30">
                        {i === 0 ? "CH-1: SPECTRUM" : i === 1 ? "CH-2: BIOMETRIC" : "CH-3: FORENSIC"}
                      </span>
                      <span className="text-white/60">0{i + 1}/03</span>
                    </div>

                    <div className="text-left">
                      <p className="text-xs font-mono uppercase tracking-widest text-sky-400 font-semibold mb-0.5">
                        Acoustic Matrix
                      </p>
                      <p className="text-sm font-semibold text-white tracking-tight">
                        {i === 0 ? "1024-Band FFT" : i === 1 ? "Neural Embedding" : "Zero-Retention Core"}
                      </p>
                    </div>
                  </div>
                </motion.div>

                {/* BACK FACE: High-Res Glass Information Card */}
                <motion.div
                  className={cn(
                    "absolute inset-0 overflow-hidden flex flex-col justify-between p-6 sm:p-8 [backface-visibility:hidden] will-change-transform",
                    "border border-white/70 shadow-[0_20px_50px_-10px_rgba(2,132,199,0.16),inset_0_1px_1px_rgba(255,255,255,0.95)]"
                  )}
                  style={{
                    backgroundColor: card.bgColor,
                    color: card.textColor,
                    transform: "rotateY(180deg)",
                    zIndex: 1,
                    borderRadius: i === 0 ? borderRadiusLeft : i === 2 ? borderRadiusRight : borderRadiusMiddle,
                    boxShadow,
                  }}
                >
                  {/* Subtle technical background grid */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-10 mix-blend-overlay"
                    style={{
                      backgroundImage: `radial-gradient(circle, currentColor 1px, transparent 1px)`,
                      backgroundSize: "16px 16px",
                    }}
                  />

                  <div className="relative z-10 flex items-center justify-between">
                    {card.icon}
                    <span className="font-mono text-[10px] tracking-wider font-semibold uppercase px-2.5 py-0.5 rounded-full border border-current/25 opacity-85">
                      {i === 0 ? "1. Spectral Scan" : i === 1 ? "2. Voice Biometrics" : "3. Ephemeral Vault"}
                    </span>
                  </div>

                  <div className="relative z-10 space-y-2 mt-auto">
                    <h3 className="text-xl sm:text-2xl font-bold font-display leading-tight tracking-tight">
                      {card.title}
                    </h3>
                    <p className="text-xs sm:text-sm opacity-90 leading-relaxed font-sans">{card.description}</p>
                    <div className="pt-2 flex items-center gap-1.5 text-[11px] font-mono opacity-75">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      <span>Certified Telemetry Level 3</span>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Dynamic Subtitle */}
      <motion.div
        className="mt-8 flex flex-col items-center justify-center text-center px-4"
        style={manualProgress === null ? { opacity: textOpacity, y: textY } : { opacity: 1, y: 0 }}
      >
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-2xl bg-white/90 border border-sky-100 shadow-soft-blue backdrop-blur-xl">
          <Sparkles className="h-4 w-4 text-blue-600" />
          <p className="text-base sm:text-lg font-bold font-display tracking-tight text-slate-900">
            {endText}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
