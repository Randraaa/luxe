import Link from "next/link";
import { getProducts } from "@/actions/products";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { Search, SlidersHorizontal } from "lucide-react";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: "newest" | "price-asc" | "price-desc" | "popular";
    page?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const search = params.search || "";
  const category = params.category || "all";
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort = params.sort || "newest";
  const page = params.page ? Number(params.page) : 1;

  // Fetch products and categories in parallel
  const [categories, { data: products, totalPages }] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, orderBy: { order: "asc" } }),
    getProducts({
      search,
      category,
      minPrice,
      maxPrice,
      sort,
      page,
    }),
  ]);

  // Helper to build clean query string URLs
  const getQueryLink = (newParams: Record<string, string | number | undefined | null>) => {
    const combined = {
      search: search || undefined,
      category: category !== "all" ? category : undefined,
      minPrice: minPrice !== undefined ? minPrice : undefined,
      maxPrice: maxPrice !== undefined ? maxPrice : undefined,
      sort: sort !== "newest" ? sort : undefined,
      page: page !== 1 ? page : undefined,
      ...newParams
    };

    const urlParams = new URLSearchParams();
    Object.entries(combined).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        urlParams.set(key, String(val));
      }
    });

    const queryString = urlParams.toString();
    return `/products${queryString ? `?${queryString}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 lg:px-8 lg:pt-36 bg-neutral-950 text-white">
      {/* Title Header */}
      <FadeIn key={`${category}-${search}`}>
        <div className="border-b border-white/15 pb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white">Koleksi Produk</h1>
          <p className="mt-2 text-sm text-neutral-450 font-light">
            Temukan koleksi pakaian dan aksesoris premium untuk menyempurnakan gaya Anda.
          </p>
        </div>
      </FadeIn>

      <div className="mt-8 lg:grid lg:grid-cols-12 lg:gap-x-8">
        {/* Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-3">
          <h2 className="sr-only">Filters</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Kategori</h3>
              <div className="mt-3 space-y-2">
                <Link
                  href={getQueryLink({ category: "all", page: 1 })}
                  className={`block text-sm transition-colors ${
                    category === "all" ? "font-semibold text-white" : "text-neutral-450 hover:text-white"
                  }`}
                >
                  Semua Kategori
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={getQueryLink({ category: cat.slug, page: 1 })}
                    className={`block text-sm transition-colors ${
                      category === cat.slug ? "font-semibold text-white" : "text-neutral-450 hover:text-white"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Urutkan</h3>
              <div className="mt-3 space-y-2">
                {[
                  { label: "Terbaru", value: "newest" },
                  { label: "Terpopuler", value: "popular" },
                  { label: "Harga: Rendah ke Tinggi", value: "price-asc" },
                  { label: "Harga: Tinggi ke Rendah", value: "price-desc" },
                ].map((s) => (
                  <Link
                    key={s.value}
                    href={getQueryLink({ sort: s.value, page: 1 })}
                    className={`block text-sm transition-colors ${
                      sort === s.value ? "font-semibold text-white" : "text-neutral-450 hover:text-white"
                    }`}
                  >
                    {s.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Product Grid & Search */}
        <div className="lg:col-span-9 mt-6 lg:mt-0">
          {/* Search bar & Mobile filter button */}
          <div className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <form action="/products" method="GET">
                {category !== "all" && <input type="hidden" name="category" value={category} />}
                {sort !== "newest" && <input type="hidden" name="sort" value={sort} />}
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Cari produk premium..."
                  className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-10 pr-4 text-sm outline-none transition-all focus:border-white/20 focus:bg-white/10 text-white placeholder:text-neutral-500"
                />
              </form>
            </div>
            <button className="flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium hover:bg-white/10 lg:hidden text-white">
              <SlidersHorizontal size={16} />
              Filter
            </button>
          </div>

          {/* Products Grid */}
          {products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="text-lg font-medium text-neutral-400">Tidak ada produk ditemukan</p>
              <p className="text-sm text-neutral-500">Coba gunakan kata kunci atau filter lain.</p>
            </div>
          ) : (
            <>
              <StaggerChildren
                key={`${category}-${sort}-${page}-${search}`}
                className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-3"
              >
                {products.map((product) => {
                  const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600";
                  const activePrice = Number(product.discountPrice ?? product.price);
                  const isDiscounted = !!product.discountPrice;

                  return (
                    <StaggerItem key={product.id}>
                      <Link href={`/products/${product.slug}`} className="group block cursor-pointer">
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-900 border border-white/5 shadow-md transition-all duration-300 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                          {/* Image */}
                          <img
                            src={image}
                            alt={product.name}
                            className="h-full w-full object-cover object-center transition-transform duration-750 group-hover:scale-105"
                            loading="lazy"
                          />
                          {isDiscounted && (
                            <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                              Sale
                            </span>
                          )}
                        </div>
                        <div className="mt-4 space-y-1 px-1">
                          <h3 className="text-sm font-medium text-neutral-100 group-hover:text-white group-hover:underline truncate">
                            {product.name}
                          </h3>
                          <p className="text-xs text-neutral-500 font-light">{product.category.name}</p>
                          <div className="flex items-baseline gap-2 pt-0.5">
                            <span className="text-sm font-semibold text-white">
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

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    const isActive = page === p;
                    return (
                      <Link
                        key={p}
                        href={getQueryLink({ page: p })}
                        className={`flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-white text-black font-semibold shadow-md"
                            : "border border-white/10 hover:bg-white/5 text-neutral-300"
                        }`}
                      >
                        {p}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
