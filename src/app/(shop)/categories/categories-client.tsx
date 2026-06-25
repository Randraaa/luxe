"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { FadeIn } from "@/components/animations/fade-in";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
}

interface CategoriesClientProps {
  categories: Category[];
}

export function CategoriesClient({ categories }: CategoriesClientProps) {
  const { lang } = useCart();

  const t = {
    id: {
      title: "Jelajahi Koleksi Kami",
      subtitle: "Kategori Premium",
      description: "Temukan koleksi pilihan terbaik kami yang dirancang dengan dedikasi tinggi terhadap kualitas, estetika modern, dan kenyamanan premium.",
      explore: "Jelajahi Koleksi",
      totalProducts: "Lihat Produk",
      men: "Pria",
      women: "Wanita",
      accessories: "Aksesoris",
      footwear: "Alas Kaki",
    },
    en: {
      title: "Explore Our Collections",
      subtitle: "Premium Categories",
      description: "Discover our finest curated collections crafted with deep dedication to quality, modern aesthetics, and premium comfort.",
      explore: "Explore Collection",
      totalProducts: "View Products",
      men: "Men",
      women: "Women",
      accessories: "Accessories",
      footwear: "Footwear",
    }
  }[lang];

  const getTranslatedName = (name: string) => {
    if (lang === "en") return name;
    switch (name.toLowerCase()) {
      case "men": return t.men;
      case "women": return t.women;
      case "accessories": return t.accessories;
      case "footwear": return t.footwear;
      default: return name;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      {/* Title Header */}
      <FadeIn>
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium tracking-wider uppercase text-amber-500 backdrop-blur-sm">
            <Sparkles size={12} className="text-amber-450 animate-pulse" />
            <span>{t.subtitle}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-white">
            {t.title}
          </h1>
          <p className="text-sm md:text-base text-neutral-450 font-light leading-relaxed">
            {t.description}
          </p>
        </div>
      </FadeIn>

      {/* Grid Layout - Asymmetric Masonry */}
      <StaggerChildren className="grid grid-cols-1 md:grid-cols-12 gap-6 min-h-[600px]">
        {categories.map((cat, idx) => {
          // Dynamic layout grid classes
          // Index 0: Men -> col-span-7, row-span-2 (big hero grid)
          // Index 1: Women -> col-span-5, row-span-1
          // Index 2: Accessories -> col-span-5, row-span-1
          // Index 3: Footwear -> col-span-7, row-span-1
          // Fallback / Extra categories: col-span-6
          let gridClasses = "md:col-span-6 min-h-[300px]";
          if (idx === 0) {
            gridClasses = "md:col-span-7 md:row-span-2 min-h-[400px] md:min-h-[620px]";
          } else if (idx === 1) {
            gridClasses = "md:col-span-5 md:row-span-1 min-h-[298px]";
          } else if (idx === 2) {
            gridClasses = "md:col-span-5 md:row-span-1 min-h-[298px]";
          } else if (idx === 3) {
            gridClasses = "md:col-span-7 md:row-span-1 min-h-[298px]";
          }

          return (
            <StaggerItem key={cat.id} className={gridClasses}>
              <Link
                href={`/products?category=${cat.slug}`}
                className="group relative flex h-full w-full items-end overflow-hidden rounded-3xl border border-white/5 bg-neutral-900/40 backdrop-blur-md p-8 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_50px_rgba(255,255,255,0.05)] hover:-translate-y-1 block"
              >
                {/* Background Image with Zoom on Hover */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out group-hover:scale-105 z-0"
                  style={{ backgroundImage: `url(${cat.image || "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=600"})` }}
                />

                {/* Dark Overlays for premium legibility and depth */}
                <div className="absolute inset-0 bg-neutral-950/50 group-hover:bg-neutral-950/40 transition-colors duration-500 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent duration-500 z-10" />

                {/* Light spotlight hover effect inside card */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.06)_0%,transparent_60%)] transition-opacity duration-700 z-15 pointer-events-none" />

                {/* Card Content */}
                <div className="relative z-20 w-full space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                      {getTranslatedName(cat.name)}
                    </h2>
                    <p className="text-xs text-neutral-400 font-light tracking-wider uppercase">
                      Premium Collection
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-300 group-hover:text-white transition-colors tracking-widest uppercase">
                      <span>{t.explore}</span>
                      <ArrowRight
                        size={14}
                        className="transition-transform duration-300 group-hover:translate-x-1.5"
                      />
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono tracking-wider">
                      [ {String(idx + 1).padStart(2, "0")} ]
                    </span>
                  </div>
                </div>
              </Link>
            </StaggerItem>
          );
        })}
      </StaggerChildren>
    </div>
  );
}
