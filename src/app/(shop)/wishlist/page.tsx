import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/animations/fade-in";
import { StaggerChildren, StaggerItem } from "@/components/animations/stagger-children";
import { Heart, ArrowRight } from "lucide-react";
import Link from "next/link";

export default async function WishlistPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch user wishlist items
  const wishlistItems = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    include: {
      product: {
        include: {
          images: { orderBy: { order: "asc" } },
          category: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-12 sm:px-6 lg:px-8 sm:pt-36 space-y-8 bg-neutral-950 text-white">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Heart size={28} className="fill-white text-white" />
          Wishlist Saya
        </h1>
        <p className="mt-1 text-sm text-neutral-450 font-light">
          Simpan produk favorit Anda di sini untuk dibeli kemudian hari.
        </p>
      </FadeIn>

      {wishlistItems.length === 0 ? (
        <FadeIn delay={0.2} className="py-24 text-center border border-white/5 rounded-2xl bg-neutral-900">
          <Heart size={48} className="mx-auto text-neutral-500 mb-4" />
          <h2 className="text-lg font-medium text-neutral-400">
            Wishlist Anda kosong
          </h2>
          <p className="mt-1 text-sm text-neutral-500 font-light">
            Ketuk ikon hati pada halaman produk untuk menambahkannya ke sini.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors select-none cursor-pointer"
          >
            Jelajah Produk
          </Link>
        </FadeIn>
      ) : (
        <StaggerChildren className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:grid-cols-3">
          {wishlistItems.map(({ product }) => {
            const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600";
            const activePrice = Number(product.discountPrice ?? product.price);
            const isDiscounted = !!product.discountPrice;

            return (
              <StaggerItem key={product.id}>
                <Link href={`/products/${product.slug}`} className="group block cursor-pointer">
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-900 border border-white/5 shadow-md transition-all duration-300 group-hover:shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
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
      )}
    </div>
  );
}
