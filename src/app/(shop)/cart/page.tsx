"use client";

import Link from "next/link";
import { useCart } from "@/hooks/use-cart";
import { FadeIn } from "@/components/animations/fade-in";
import { Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";

export default function CartPage() {
  const { cart, isLoading, removeItem, updateQuantity, subtotal } = useCart();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  const items = cart?.items || [];

  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-12 sm:px-6 lg:px-8 sm:pt-36 bg-neutral-950 text-white">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight text-white">Keranjang Belanja</h1>
      </FadeIn>

      {items.length === 0 ? (
        <FadeIn delay={0.2} className="py-24 text-center">
          <ShoppingBag size={48} className="mx-auto text-neutral-500" />
          <h2 className="mt-6 text-lg font-medium text-neutral-450">
            Keranjang belanja Anda kosong
          </h2>
          <p className="mt-2 text-sm text-neutral-400">
            Temukan barang-barang premium di katalog kami untuk memulai.
          </p>
          <Link
            href="/products"
            className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors select-none cursor-pointer"
          >
            Mulai Belanja
          </Link>
        </FadeIn>
      ) : (
        <div className="mt-12 grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-3">
          {/* Items List */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {
              const activePrice = Number(item.product.discountPrice ?? item.product.price);
              return (
                <FadeIn key={item.id} className="flex gap-4 border-b border-white/5 pb-6 last:border-b-0 text-white">
                  <div className="h-24 w-18 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-900 border border-white/5">
                    <img
                      src={item.product.images?.[0]?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600"}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex justify-between text-base font-semibold">
                        <Link href={`/products/${item.product.slug}`} className="text-neutral-100 hover:text-white hover:underline truncate max-w-[200px] sm:max-w-xs">
                          {item.product.name}
                        </Link>
                        <span>Rp {(activePrice * item.quantity).toLocaleString("id-ID")}</span>
                      </div>
                      <p className="mt-1 text-xs text-neutral-500 font-light">
                        Varian: {item.variant.size} / {item.variant.color}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm mt-4">
                      {/* Quantity Selector */}
                      <div className="flex h-9 items-center rounded-lg border border-white/10 bg-white/5">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 hover:text-white text-neutral-450 transition-colors"
                        >
                          -
                        </button>
                        <span className="font-semibold px-2">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 hover:text-white text-neutral-450 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-neutral-500 hover:text-red-500 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 size={16} />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    </div>
                  </div>
                </FadeIn>
              );
            })}
          </div>

          {/* Cart Summary */}
          <FadeIn delay={0.2} className="lg:col-span-1">
            <div className="rounded-2xl border border-white/5 bg-neutral-900/50 backdrop-blur-md p-6">
              <h2 className="text-lg font-semibold text-white">Ringkasan Belanja</h2>
              
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400 font-light">Subtotal</span>
                  <span className="font-medium text-white">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400 font-light">Pengiriman</span>
                  <span className="text-neutral-450 font-light">Dihitung saat checkout</span>
                </div>
                <div className="border-t border-white/5 pt-4 flex items-center justify-between">
                  <span className="font-semibold text-white">Total</span>
                  <span className="text-lg font-bold text-white">Rp {subtotal.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="group mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-white font-semibold text-black hover:bg-neutral-200 transition-colors select-none cursor-pointer"
              >
                Lanjut ke Checkout
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
}
