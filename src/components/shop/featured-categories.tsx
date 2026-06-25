"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/use-cart";

interface FeaturedCategoriesProps {
  categories: any[];
}

const BACKGROUND_IMAGES = [
  "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1200&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?q=80&w=1200&auto=format&fit=crop"
];

export function FeaturedCategories({ categories }: FeaturedCategoriesProps) {
  const { lang } = useCart();
  const [bgIdx, setBgIdx] = useState(0);

  // Automatic fading slideshow timer
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIdx((prev) => (prev + 1) % BACKGROUND_IMAGES.length);
    }, 4500); // Change image every 4.5 seconds

    return () => clearInterval(interval);
  }, []);

  const t = {
    id: {
      title: "Jelajah Kategori",
      subtitle: "Koleksi Kurasi Pilihan",
      desc: "Temukan gaya kontemporer terbaik Anda melalui kurasi eksklusif kami yang dirancang secara matang dan presisi.",
      explore: "Selengkapnya",
      allProducts: "Lihat Semua Produk"
    },
    en: {
      title: "Shop by Category",
      subtitle: "Our Curated Collections",
      desc: "Discover your best contemporary style through our exclusive curation designed carefully and precisely.",
      explore: "Explore",
      allProducts: "View All Products"
    }
  }[lang];

  // Helper to place categories inside asymmetric grid layout
  // 1st category (Men): Large column span at left or row span
  // 2nd category (Women): Large width card
  // 3rd and 4th categories (Accessories, Footwear): Grid cells
  return (
    <section 
      id="categories" 
      className="relative overflow-hidden bg-neutral-950 text-white py-24 sm:py-32 px-4 sm:px-6 lg:px-8 w-full"
    >
      
      {/* 1. Fading Slideshow Background */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={bgIdx}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 0.5, scale: 1 }} // Increased opacity from 0.25 to 0.5 to make image more visible
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${BACKGROUND_IMAGES[bgIdx]})` }}
          />
        </AnimatePresence>
      </div>

      {/* 2. Contrast Dark Overlay (Digelapkan untuk kontras, dikurangi kegelapannya) */}
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/70 via-neutral-950/50 to-neutral-950/30 z-0 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_30%,_rgba(0,0,0,0.6)_100%)] z-0 pointer-events-none" />

      {/* 3. Grid Content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Side: Curation Copy (1/3 area) */}
        <div className="lg:col-span-4 text-left space-y-6 flex flex-col justify-center">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-500 font-mono">
              {t.subtitle}
            </span>
            <h2 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl tracking-tight leading-tight">
              {t.title}
            </h2>
          </div>
          
          <p className="text-neutral-400 text-sm md:text-base leading-relaxed font-light">
            {t.desc}
          </p>

          <Link
            href="/products"
            className="group self-start inline-flex h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 px-6 text-xs font-semibold tracking-wider uppercase text-white transition-all hover:border-white/30"
          >
            <span>{t.allProducts}</span>
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Right Side: Asymmetric Masonry Grid Layout (2/3 area) */}
        <div className="lg:col-span-8 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-4 min-h-[460px]">
            
            {categories.map((cat, idx) => {
              // Build dynamic grid placement
              // 0: Men -> big vertical card (col-span-3, row-span-2)
              // 1: Women -> wide horizontal card (col-span-3, row-span-1)
              // 2: Accessories -> small card (col-span-1 or 2)
              // 3: Footwear -> small card (col-span-1 or 2)
              let gridClasses = "";
              if (idx === 0) {
                // Men
                gridClasses = "md:col-span-3 md:row-span-2 min-h-[300px] md:min-h-full";
              } else if (idx === 1) {
                // Women
                gridClasses = "md:col-span-3 md:row-span-1 min-h-[220px]";
              } else {
                // Accessories and Footwear (idx 2 & 3)
                gridClasses = "md:col-span-3 sm:col-span-1 md:row-span-1 min-h-[220px]";
              }

              return (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className={`group relative flex items-end overflow-hidden rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md p-6 hover:border-white/20 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.06)] hover:-translate-y-1 ${gridClasses}`}
                >
                  {/* Category Image inside card */}
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105 z-0"
                    style={{ backgroundImage: `url(${cat.image})` }}
                  />
                  
                  {/* Glass overlay shade */}
                  <div className="absolute inset-0 bg-neutral-950/60 group-hover:bg-neutral-950/50 transition-colors z-10 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/30 to-transparent z-10 pointer-events-none" />

                  {/* Text on top */}
                  <div className="relative z-20 space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-white">
                      {lang === "id" && cat.name === "Men" ? "Pria" : 
                       lang === "id" && cat.name === "Women" ? "Wanita" : 
                       lang === "id" && cat.name === "Accessories" ? "Aksesoris" : 
                       lang === "id" && cat.name === "Footwear" ? "Alas Kaki" : cat.name}
                    </h3>
                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-neutral-450 group-hover:text-white transition-colors tracking-wide font-light">
                      <span>{t.explore}</span>
                      <ArrowRight
                        size={12}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </p>
                  </div>

                </Link>
              );
            })}

          </div>
        </div>

      </div>

    </section>
  );
}
