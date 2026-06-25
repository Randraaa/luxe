"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { useCart } from "@/hooks/use-cart";
import { getProducts } from "@/actions/products";

export function Navbar() {
  const { totalItemsCount, wishlistCount, lang, setLang } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Spotlight search states
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Translation helpers
  const getLinkLabel = (label: string) => {
    if (lang === "en") return label;
    switch (label) {
      case "Home": return "Beranda";
      case "Products": return "Produk";
      case "Categories": return "Kategori";
      case "New Arrivals": return "Terbaru";
      case "Sale": return "Promo";
      default: return label;
    }
  };

  const t = {
    id: {
      searchPlaceholder: "Cari produk premium (Tekan Enter untuk cari semua)...",
      searching: "Mencari...",
      found: "Produk Ditemukan",
      noResults: "Tidak ada produk yang cocok dengan pencarian Anda.",
      searchInitial: "Ketik kata kunci untuk mencari produk premium LUXE secara instan.",
      wishlist: "Wishlist",
      account: "Akun"
    },
    en: {
      searchPlaceholder: "Search premium products (Press Enter to search all)...",
      searching: "Searching...",
      found: "Products Found",
      noResults: "No products matched your search.",
      searchInitial: "Type keywords to search LUXE premium products instantly.",
      wishlist: "Wishlist",
      account: "Account"
    }
  }[lang];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut listener to close search with ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced Instant Search logic using getProducts server action
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const result = await getProducts({ search: searchQuery });
        if (result && result.data) {
          setSearchResults(result.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Instant search error:", error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-full border-b ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-neutral-200/80 text-black"
          : "bg-transparent border-transparent text-white"
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
        {/* Mobile Menu Toggle */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className={`lg:hidden p-2 -ml-2 rounded-md transition-colors ${
            isScrolled ? "hover:bg-neutral-100 text-neutral-800" : "hover:bg-white/10 text-white"
          }`}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className={`text-xl font-bold tracking-[0.2em] uppercase transition-colors duration-300 ${
            isScrolled ? "text-black" : "text-white"
          }`}
        >
          LUXE
        </Link>

        {/* Desktop Navigation */}
        <ul 
          className="hidden lg:flex items-center gap-2"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          {NAV_LINKS.map((link, idx) => (
            <li key={link.href} className="relative">
              <Link
                href={link.href}
                onMouseEnter={() => setHoveredIndex(idx)}
                className={`relative z-10 block px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  isScrolled
                    ? "text-neutral-600 hover:text-black"
                    : "text-neutral-350 hover:text-white"
                }`}
              >
                {getLinkLabel(link.label)}
              </Link>
              {hoveredIndex === idx && (
                <motion.span
                  layoutId="nav-hover-pill"
                  className={`absolute inset-0 rounded-full -z-0 ${
                    isScrolled ? "bg-neutral-100" : "bg-white/10"
                  }`}
                  transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 30,
                  }}
                />
              )}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Language Switcher */}
          <button
            onClick={() => setLang(lang === "id" ? "en" : "id")}
            className={`flex h-8 items-center justify-center rounded-full border px-2.5 text-[9px] font-bold tracking-wider transition-colors uppercase select-none cursor-pointer ${
              isScrolled
                ? "border-neutral-200 text-neutral-800 hover:bg-neutral-50"
                : "border-white/20 text-white hover:bg-white/10"
            }`}
            title={lang === "id" ? "Switch to English" : "Ubah ke Bahasa Indonesia"}
          >
            {lang === "id" ? "idn" : "en"}
          </button>

          <button
            onClick={() => setIsSearchOpen(true)}
            className={`p-2 rounded-md transition-colors ${
              isScrolled ? "hover:bg-neutral-100 text-neutral-850" : "hover:bg-white/10 text-white"
            }`}
            aria-label="Search"
          >
            <Search size={20} />
          </button>
          <Link
            href="/wishlist"
            className={`relative p-2 rounded-md transition-colors hidden sm:flex ${
              isScrolled ? "hover:bg-neutral-100 text-neutral-850" : "hover:bg-white/10 text-white"
            }`}
            aria-label="Wishlist"
          >
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-red-600">
                {wishlistCount}
              </span>
            )}
          </Link>
          <Link
            href="/cart"
            className={`relative p-2 rounded-md transition-colors ${
              isScrolled ? "hover:bg-neutral-100 text-neutral-850" : "hover:bg-white/10 text-white"
            }`}
            aria-label="Cart"
          >
            <ShoppingBag size={20} />
            {totalItemsCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-red-600">
                {totalItemsCount}
              </span>
            )}
          </Link>
          <Link
            href="/account"
            className={`p-2 rounded-md transition-colors hidden sm:flex ${
              isScrolled ? "hover:bg-neutral-100 text-neutral-850" : "hover:bg-white/10 text-white"
            }`}
            aria-label="Account"
          >
            <User size={20} />
          </Link>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className={`lg:hidden border-t ${
              isScrolled
                ? "bg-white border-neutral-200 text-black shadow-lg"
                : "bg-neutral-950/95 backdrop-blur-md border-white/5 text-white shadow-2xl"
            }`}
          >
            <ul className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                      isScrolled
                        ? "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                        : "text-neutral-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    {getLinkLabel(link.label)}
                  </Link>
                </li>
              ))}
              <li className={`border-t mt-2 pt-2 ${isScrolled ? "border-neutral-100" : "border-white/5"}`}>
                <Link
                  href="/wishlist"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isScrolled
                      ? "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Heart size={18} />
                    <span>{t.wishlist}</span>
                  </div>
                  {wishlistCount > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                    isScrolled
                      ? "text-neutral-600 hover:bg-neutral-50 hover:text-black"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <User size={18} />
                  {t.account}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spotlight Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-neutral-950/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-950 mx-4"
            >
              {/* Input Header */}
              <div className="flex items-center gap-3 border-b border-neutral-100 dark:border-neutral-800 px-4 py-4">
                <Search size={18} className="text-neutral-450" />
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                      setIsSearchOpen(false);
                    }
                  }}
                  className="flex-1"
                >
                  <input
                    type="text"
                    autoFocus
                    placeholder={t.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-sm outline-none placeholder:text-neutral-500 text-neutral-850 dark:text-neutral-150"
                  />
                </form>
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="rounded-lg border border-neutral-200 dark:border-neutral-800 px-2 py-1 text-[10px] font-medium text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  ESC
                </button>
              </div>

              {/* Instant Results Area */}
              <div className="max-h-[350px] overflow-y-auto p-2">
                {isSearching ? (
                  <div className="flex items-center justify-center py-12 text-neutral-450 gap-2">
                    <Loader2 size={16} className="animate-spin text-neutral-400" />
                    <span className="text-xs text-neutral-400">{t.searching}</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      {t.found}
                    </div>
                    {searchResults.map((product) => {
                      const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600";
                      const activePrice = Number(product.discountPrice ?? product.price);
                      return (
                        <Link
                          key={product.id}
                          href={`/products/${product.slug}`}
                          onClick={() => setIsSearchOpen(false)}
                          className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-colors"
                        >
                          <div className="h-10 w-8 overflow-hidden rounded-md bg-neutral-100 dark:bg-neutral-900 flex-shrink-0">
                            <img src={image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-semibold truncate text-neutral-900 dark:text-neutral-100">
                              {product.name}
                            </h4>
                            <p className="text-[10px] text-neutral-400 mt-0.5">
                              {product.category.name}
                            </p>
                          </div>
                          <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex-shrink-0">
                            Rp {activePrice.toLocaleString("id-ID")}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                ) : searchQuery.trim() ? (
                  <div className="py-12 text-center text-xs text-neutral-450">
                    {t.noResults}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-neutral-400">
                    {t.searchInitial}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}
