import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/animations/fade-in";
import {
  StaggerChildren,
  StaggerItem,
} from "@/components/animations/stagger-children";
import { ArrowRight, Star } from "lucide-react";
import { HeroSection } from "@/components/shop/hero-section";
import { FeaturedCategories } from "@/components/shop/featured-categories";

export default async function HomePage() {
  // Fetch categories and featured products in parallel
  const [categories, featuredProducts] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      take: 4,
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      include: {
        images: { orderBy: { order: "asc" } },
        category: true,
      },
      take: 4,
    }),
  ]);

  return (
    <div className="bg-neutral-950 text-white min-h-screen selection:bg-white selection:text-black">
      {/* Hero Section */}
      <HeroSection />

      {/* Featured Categories (New Slide and Asymmetric Layout) */}
      <FeaturedCategories categories={categories} />

      {/* Featured Products (Best Sellers) */}
      <section className="bg-neutral-950 py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-white">
                  Best Sellers
                </h2>
                <p className="mt-3 text-neutral-400 text-sm font-light">
                  Our most popular items this season
                </p>
              </div>
              <Link
                href="/products?sort=popular"
                className="hidden items-center gap-1 text-xs font-semibold tracking-wider uppercase text-neutral-400 hover:text-white transition-colors sm:flex"
              >
                <span>View All</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>

          <StaggerChildren className="mt-12 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              const activePrice = Number(product.discountPrice ?? product.price);
              const isDiscounted = !!product.discountPrice;
              const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600";

              return (
                <StaggerItem key={product.id}>
                  <Link href={`/products/${product.slug}`} className="group cursor-pointer block">
                    <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 transition-all duration-300 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                      <img
                        src={image}
                        alt={product.name}
                        className="h-full w-full object-cover object-center transition-transform duration-750 group-hover:scale-105"
                      />
                      {isDiscounted && (
                        <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[8px] font-bold uppercase tracking-wider text-white">
                          Sale
                        </span>
                      )}
                    </div>
                    <div className="mt-4 space-y-1 px-1">
                      <h3 className="text-sm font-medium text-neutral-100 truncate group-hover:text-white transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-xs text-neutral-500 font-light">{product.category.name}</p>
                      <div className="flex items-baseline gap-2 pt-1">
                        <span className="text-sm font-bold text-white">
                          Rp {activePrice.toLocaleString("id-ID")}
                        </span>
                        {isDiscounted && (
                          <span className="text-[10px] text-neutral-500 line-through">
                            Rp {Number(product.price).toLocaleString("id-ID")}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerChildren>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-neutral-950 py-24 sm:py-32 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <FadeIn>
            <div className="relative overflow-hidden rounded-3xl bg-neutral-900 border border-white/5 px-6 py-16 text-center text-white sm:px-12 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-neutral-800/20 via-transparent to-transparent pointer-events-none" />
              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                    Stay in the Loop
                  </h2>
                  <p className="mx-auto max-w-md text-sm text-neutral-400 font-light">
                    Subscribe to get exclusive access to new drops, special offers,
                    and style inspiration.
                  </p>
                </div>
                <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row justify-center">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="h-11 w-full sm:flex-1 rounded-full border border-white/10 bg-white/5 px-5 text-sm placeholder:text-neutral-500 focus:border-white/20 focus:bg-white/10 focus:outline-none transition-all"
                  />
                  <button
                    type="submit"
                    className="h-11 w-full sm:w-auto rounded-full bg-white px-8 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 cursor-pointer select-none"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
