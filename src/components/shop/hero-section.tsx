"use client";

import { useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion, useMotionValue, useTransform, useSpring, useMotionTemplate } from "framer-motion";
import { ArrowRight, ShoppingBag, Sparkles } from "lucide-react";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Spotlight effect coordinates
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);

  // 3D tilt coordinates
  const tiltX = useMotionValue(0);
  const tiltY = useMotionValue(0);

  // Spring physics for smooth tilt
  const tiltRotateX = useSpring(useTransform(tiltY, [-300, 300], [10, -10]), { damping: 25, stiffness: 120 });
  const tiltRotateY = useSpring(useTransform(tiltX, [-300, 300], [-10, 10]), { damping: 25, stiffness: 120 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    
    // Update spotlight relative to window scroll/client viewport
    const rect = containerRef.current.getBoundingClientRect();
    spotlightX.set(e.clientX - rect.left);
    spotlightY.set(e.clientY - rect.top);

    // Update 3D tilt relative to center of container
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left - width / 2;
    const mouseY = e.clientY - rect.top - height / 2;
    
    tiltX.set(mouseX);
    tiltY.set(mouseY);
  }, [spotlightX, spotlightY, tiltX, tiltY]);

  const handleMouseLeave = useCallback(() => {
    // Reset 3D tilt to center, but keep spotlight where it was or fade out
    tiltX.set(0);
    tiltY.set(0);
  }, [tiltX, tiltY]);

  // Spotlight background string template
  const spotlightBackground = useMotionTemplate`
    radial-gradient(
      600px circle at ${spotlightX}px ${spotlightY}px,
      rgba(255, 255, 255, 0.05),
      transparent 80%
    )
  `;

  // Animate text variants
  const wordVariants = {
    hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        delay: i * 0.1,
        duration: 0.8,
        ease: [0.21, 0.47, 0.32, 0.98] as const,
      },
    }),
  };

  const titleWords = ["Redefine", "Your", "Luxury", "Standard"];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-[92vh] w-full items-center justify-center overflow-hidden bg-neutral-950 text-white py-16"
    >
      {/* Dynamic Background Spotlight */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-0"
        style={{ background: spotlightBackground }}
      />

      {/* Grid Pattern overlay with soft mask */}
      <div
        className="absolute inset-0 opacity-[0.03] z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
        }}
      />

      {/* Glowing radial gradient fallback */}
      <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-neutral-800/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[50%] w-[50%] rounded-full bg-neutral-900/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 lg:px-8 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: Text & CTA */}
        <div className="lg:col-span-6 text-left space-y-8 flex flex-col justify-center">
          
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="self-start inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-neutral-400 backdrop-blur-sm"
          >
            <Sparkles size={12} className="text-amber-400 animate-pulse" />
            <span>Koleksi Eksklusif 2026</span>
          </motion.div>

          {/* Heading with smooth word reveal */}
          <h1 className="text-5xl font-normal tracking-normal sm:text-6xl xl:text-7xl leading-none font-pacifico">
            {titleWords.map((word, idx) => (
              <span key={idx} className="inline-block mr-3 overflow-hidden py-2">
                <motion.span
                  custom={idx}
                  initial="hidden"
                  animate="visible"
                  variants={wordVariants}
                  className={`inline-block ${
                    word === "Luxury" || word === "Standard"
                      ? "bg-gradient-to-r from-neutral-200 via-white to-neutral-400 bg-clip-text text-transparent"
                      : "text-white"
                  }`}
                >
                  {word}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Subtitle description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="max-w-lg text-sm md:text-base leading-relaxed text-neutral-400 font-light"
          >
            Menghadirkan kurasi pakaian premium dengan estetika minimalis modern. Dirancang secara presisi bagi individu kontemporer yang menghargai keanggunan abadi.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <Link
              href="/products"
              className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-white px-8 text-sm font-semibold text-black transition-all hover:bg-neutral-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.15)]"
            >
              <span>Belanja Sekarang</span>
              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </Link>
            <Link
              href="/products?sort=newest"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/0 px-8 text-sm font-medium text-neutral-300 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white"
            >
              <ShoppingBag size={15} />
              <span>Produk Terbaru</span>
            </Link>
          </motion.div>

          {/* Micro Stats/Features Grid */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 1 }}
            className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5 max-w-md"
          >
            <div>
              <span className="block text-2xl font-bold font-mono">100%</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Premium Cotton</span>
            </div>
            <div>
              <span className="block text-2xl font-bold font-mono">Free</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Global Shipping</span>
            </div>
            <div>
              <span className="block text-2xl font-bold font-mono">24/7</span>
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest">Concierge Care</span>
            </div>
          </motion.div>

        </div>

        {/* Right: Premium Interactive 3D Parallax Image Cards */}
        <div className="lg:col-span-6 relative h-[450px] sm:h-[550px] w-full flex items-center justify-center">
          
          <motion.div
            style={{
              rotateX: tiltRotateX,
              rotateY: tiltRotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative w-full max-w-[400px] h-[400px] sm:h-[480px] flex items-center justify-center cursor-grab active:cursor-grabbing"
          >
            {/* Center Background glow for cards */}
            <div className="absolute w-[250px] h-[250px] rounded-full bg-neutral-800/20 blur-[60px] pointer-events-none" />

            {/* Card 1: Main Fashion card (Left Side, tilted) */}
            <motion.div
              initial={{ opacity: 0, x: -60, y: 20, rotate: -6 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: -6 }}
              transition={{ delay: 0.3, duration: 0.9, type: "spring" }}
              whileHover={{ scale: 1.05, zIndex: 30 }}
              style={{ transformStyle: "preserve-3d" }}
              className="absolute left-[-5%] sm:left-0 top-[15%] w-[180px] sm:w-[220px] aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-neutral-950/20 hover:bg-transparent transition-colors z-10" />
              <img
                src="https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=600"
                alt="Premium Jacket"
                className="h-full w-full object-cover select-none"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-neutral-950/80 backdrop-blur-md rounded-xl p-3 border border-white/5">
                <span className="text-[10px] text-neutral-400 block font-light uppercase tracking-wider">Outerwear</span>
                <span className="text-xs font-semibold text-white">Classic Leather Jacket</span>
              </div>
            </motion.div>

            {/* Card 2: Elevated Fashion card (Right Side, higher elevation) */}
            <motion.div
              initial={{ opacity: 0, x: 60, y: -20, rotate: 6 }}
              animate={{ opacity: 1, x: 0, y: 0, rotate: 6 }}
              transition={{ delay: 0.5, duration: 0.9, type: "spring" }}
              whileHover={{ scale: 1.05, zIndex: 30 }}
              style={{ transformStyle: "preserve-3d" }}
              className="absolute right-[-5%] sm:right-0 top-[5%] w-[180px] sm:w-[220px] aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-neutral-900 shadow-2xl transition-all duration-300"
            >
              <div className="absolute inset-0 bg-neutral-950/20 hover:bg-transparent transition-colors z-10" />
              <img
                src="https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600"
                alt="Sneaker Shoes"
                className="h-full w-full object-cover select-none"
              />
              <div className="absolute bottom-4 left-4 right-4 z-20 bg-neutral-950/80 backdrop-blur-md rounded-xl p-3 border border-white/5">
                <span className="text-[10px] text-neutral-400 block font-light uppercase tracking-wider">Footwear</span>
                <span className="text-xs font-semibold text-white">Urban Knit Sneakers</span>
              </div>
            </motion.div>

            {/* Card 3: Middle Accessory Card (Bottom center, floats forward) */}
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.7, duration: 0.9, type: "spring" }}
              whileHover={{ scale: 1.08, zIndex: 40, y: -10 }}
              style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
              className="absolute bottom-[5%] z-20 w-[140px] sm:w-[170px] aspect-square overflow-hidden rounded-2xl border border-white/15 bg-neutral-900 shadow-[0_20px_40px_rgba(0,0,0,0.6)] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-neutral-950/10 hover:bg-transparent transition-colors z-10" />
              <img
                src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600"
                alt="Premium Sunglasses"
                className="h-full w-full object-cover select-none"
              />
              <div className="absolute bottom-3 left-3 right-3 z-20 bg-neutral-950/80 backdrop-blur-md rounded-lg p-2 border border-white/5">
                <span className="text-[9px] text-neutral-400 block uppercase tracking-wider leading-none">Accessory</span>
                <span className="text-[10px] font-semibold text-white">Aero Black Shades</span>
              </div>
            </motion.div>

          </motion.div>
        </div>

      </div>

      {/* Decorative Elegant Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.2, duration: 1 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 cursor-pointer hover:opacity-100 transition-opacity"
      >
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-mono">Scroll</span>
        <div className="w-[18px] h-[32px] rounded-full border border-neutral-700 flex justify-center p-1">
          <motion.div
            animate={{
              y: [0, 10, 0],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-[3px] h-[6px] rounded-full bg-neutral-400"
          />
        </div>
      </motion.div>

      {/* Bottom overlay fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-neutral-950 to-transparent pointer-events-none" />
    </div>
  );
}
