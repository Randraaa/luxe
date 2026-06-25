"use client";

import { useState } from "react";
import { useCart } from "@/hooks/use-cart";
import { FadeIn } from "@/components/animations/fade-in";
import { ChevronRight, Heart, Star, ShoppingBag, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface ProductDetailsProps {
  product: any;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { addToCart, toggleWishlist, isInWishlist } = useCart();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);

  const activeInWishlist = isInWishlist(product.id);

  const handleToggleWishlist = async () => {
    setIsTogglingWishlist(true);
    try {
      await toggleWishlist(product.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const images = product.images.length > 0
    ? product.images
    : [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600" }];

  // Extract unique sizes and colors
  const sizes = Array.from(new Set<string>(product.variants.map((v: any) => v.size)));
  const colors = Array.from(new Set<string>(product.variants.map((v: any) => v.color)));

  // Find match variant
  const currentVariant = product.variants.find(
    (v: any) =>
      (sizes.length === 0 || v.size === selectedSize) &&
      (colors.length === 0 || v.color === selectedColor)
  );

  const handleAddToCart = async () => {
    if (sizes.length > 0 && !selectedSize) {
      toast.error("Silakan pilih ukuran (size)");
      return;
    }
    if (colors.length > 0 && !selectedColor) {
      toast.error("Silakan pilih warna (color)");
      return;
    }
    if (!currentVariant) {
      toast.error("Varian produk tidak tersedia");
      return;
    }
    if (currentVariant.stock < quantity) {
      toast.error("Stok varian produk tidak mencukupi");
      return;
    }

    setIsAdding(true);
    try {
      await addToCart(currentVariant.id, quantity);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const activePrice = Number(product.discountPrice ?? product.price);
  const isDiscounted = !!product.discountPrice;

  return (
    <div className="space-y-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-400">
        <Link href="/" className="hover:text-white transition-colors">Home</Link>
        <ChevronRight size={12} />
        <Link href="/products" className="hover:text-white transition-colors">Products</Link>
        <ChevronRight size={12} />
        <span className="text-white truncate">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 gap-x-12 gap-y-10 lg:grid-cols-2">
        {/* Gallery */}
        <FadeIn className="space-y-4">
          <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-900 border border-white/5">
            <img
              src={images[activeImageIdx]?.url}
              alt={product.name}
              className="h-full w-full object-cover object-center"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-4">
              {images.map((img: any, idx: number) => (
                <button
                  key={img.id || idx}
                  onClick={() => setActiveImageIdx(idx)}
                  className={`aspect-[3/4] overflow-hidden rounded-xl bg-neutral-900 border-2 transition-all ${
                    activeImageIdx === idx ? "border-white" : "border-transparent"
                  }`}
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </FadeIn>

        {/* Info */}
        <FadeIn delay={0.2} className="flex flex-col justify-between">
          <div className="space-y-6">
            <div>
              <p className="text-sm text-neutral-500 font-light">{product.brand || "LUXE"}</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {product.name}
              </h1>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-4">
              <span className="text-2xl font-bold text-white">
                Rp {activePrice.toLocaleString("id-ID")}
              </span>
              {isDiscounted && (
                <span className="text-lg text-neutral-500 line-through">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="prose prose-sm dark:prose-invert">
              <p className="text-sm text-neutral-400 leading-relaxed font-light">
                {product.description}
              </p>
            </div>

            {/* Color Swatch */}
            {colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Warna</h3>
                <div className="flex flex-wrap gap-2">
                  {colors.map((color) => {
                    const variant = product.variants.find((v: any) => v.color === color);
                    return (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`flex h-9 items-center justify-center rounded-full border px-4 text-xs font-medium transition-all ${
                          selectedColor === color
                            ? "border-white bg-white text-black font-semibold"
                            : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                        }`}
                      >
                        {color}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Swatch */}
            {sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Ukuran</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-9 w-12 items-center justify-center rounded-full border text-xs font-medium transition-all ${
                        selectedSize === size
                          ? "border-white bg-white text-black font-semibold"
                          : "border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            {currentVariant && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-neutral-450">
                  <span>Jumlah</span>
                  <span className="text-neutral-500 lowercase normal-case">
                    stok tersedia: {currentVariant.stock}
                  </span>
                </div>
                <div className="flex h-11 w-32 items-center rounded-lg border border-white/10 bg-white/5">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="flex h-full w-10 items-center justify-center text-lg hover:text-white text-neutral-400 transition-colors"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-sm font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(currentVariant.stock, quantity + 1))}
                    className="flex h-full w-10 items-center justify-center text-lg hover:text-white text-neutral-400 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-4">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-white font-semibold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50 select-none cursor-pointer"
            >
              {isAdding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Tambah ke Keranjang
                </>
              )}
            </button>
            <button
              onClick={handleToggleWishlist}
              disabled={isTogglingWishlist}
              className={`flex h-12 w-12 items-center justify-center rounded-full border transition-colors ${
                activeInWishlist
                  ? "border-red-500 bg-red-950/20 text-red-500 hover:bg-red-950/40"
                  : "border-white/10 bg-white/5 hover:bg-white/10 text-neutral-300"
              }`}
              aria-label="Toggle Wishlist"
            >
              <Heart size={18} className={activeInWishlist ? "fill-current" : ""} />
            </button>
          </div>
        </FadeIn>
      </div>

      {/* Review Section */}
      <div className="border-t border-white/10 pt-16">
        <h2 className="text-2xl font-bold tracking-tight text-white mb-8">Ulasan Pelanggan</h2>
        {product.reviews.length === 0 ? (
          <p className="text-sm text-neutral-500">Belum ada ulasan untuk produk ini.</p>
        ) : (
          <div className="space-y-8">
            {product.reviews.map((review: any) => (
              <div key={review.id} className="border-b border-white/5 pb-8 last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-900 border border-white/5 flex items-center justify-center">
                    {review.user.image ? (
                      <img src={review.user.image} alt={review.user.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center font-bold text-neutral-450">
                        {review.user.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{review.user.name}</h4>
                    <div className="flex items-center gap-0.5 text-amber-400 mt-0.5">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          size={14}
                          fill={idx < review.rating ? "currentColor" : "none"}
                          className={idx < review.rating ? "text-amber-400" : "text-neutral-700"}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                {review.comment && (
                  <p className="mt-4 text-sm text-neutral-400 leading-relaxed pl-14 font-light">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
