import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/animations/fade-in";
import { Plus, Edit, Trash, Package, AlertCircle } from "lucide-react";
import { deleteProduct } from "@/actions/products";

// Server action wrapper to handle delete from table
async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  if (id) {
    await deleteProduct(id);
  }
}

export default async function AdminProductsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch products
  const products = await prisma.product.findMany({
    include: {
      category: true,
      images: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      <FadeIn className="flex items-center justify-between border-b border-neutral-100 pb-6 dark:border-neutral-850">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manajemen Produk</h1>
          <p className="mt-1.5 text-sm text-neutral-450">
            Kelola produk, edit detail, perbarui stok, atau tambahkan produk baru.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex h-11 items-center gap-2 rounded-full bg-black px-6 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          <Plus size={16} />
          Tambah Produk
        </Link>
      </FadeIn>

      {products.length === 0 ? (
        <FadeIn className="text-center py-24 border rounded-2xl bg-neutral-50/20 dark:bg-neutral-900/10">
          <AlertCircle className="mx-auto text-neutral-400 mb-4" size={36} />
          <p className="text-sm font-semibold">Belum ada produk</p>
          <p className="text-xs text-neutral-450 mt-1">
            Mulailah dengan menambahkan produk premium pertama Anda.
          </p>
        </FadeIn>
      ) : (
        <FadeIn className="overflow-hidden rounded-2xl border border-neutral-100 bg-white shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-neutral-100 bg-neutral-50/50 font-bold uppercase tracking-wider text-neutral-450 dark:border-neutral-850 dark:bg-neutral-900">
                <tr>
                  <th className="px-6 py-4">Produk</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Harga</th>
                  <th className="px-6 py-4">Stok</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-850">
                {products.map((product) => {
                  const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600";
                  return (
                    <tr key={product.id} className="hover:bg-neutral-50/30 dark:hover:bg-neutral-900/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-8 overflow-hidden rounded bg-neutral-150">
                            <img src={image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <span className="font-semibold text-neutral-900 dark:text-neutral-100 truncate block max-w-[200px]">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 mt-0.5 block">
                              {product.brand || "LUXE"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-500">{product.sku}</td>
                      <td className="px-6 py-4 text-neutral-550">{product.category.name}</td>
                      <td className="px-6 py-4 font-semibold">
                        Rp {Number(product.discountPrice ?? product.price).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 font-medium">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            product.isActive
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                              : "bg-red-50 text-red-700 dark:bg-red-950/20"
                          }`}
                        >
                          {product.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-neutral-50 dark:hover:bg-neutral-800"
                          >
                            <Edit size={14} className="text-neutral-500 hover:text-black dark:hover:text-white" />
                          </Link>
                          <form action={handleDelete}>
                            <input type="hidden" name="id" value={product.id} />
                            <button
                              type="submit"
                              className="flex h-8 w-8 items-center justify-center rounded-full border hover:bg-red-50 hover:border-red-200 text-neutral-500 hover:text-red-600 dark:hover:bg-red-950/20"
                            >
                              <Trash size={14} />
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </FadeIn>
      )}
    </div>
  );
}
