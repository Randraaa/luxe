"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash, X, Loader2, AlertCircle, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createProduct, updateProduct, deleteProduct } from "@/actions/products";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  url: string;
  publicId: string;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  colorHex: string | null;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  brand: string | null;
  price: any; // Decimal
  discountPrice: any; // Decimal
  sku: string;
  weight: number;
  stock: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  categoryId: string;
  category: Category;
  images: ProductImage[];
  variants?: ProductVariant[];
}

interface ProductsManagerProps {
  initialProducts: Product[];
  categories: Category[];
}

export function ProductsManager({ initialProducts, categories }: ProductsManagerProps) {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    brand: "LUXE",
    price: 0,
    discountPrice: 0,
    sku: "",
    weight: 200,
    stock: 10,
    categoryId: categories[0]?.id || "",
    imageURL: "", // Primary image URL
    isFeatured: false,
    isNewArrival: true,
    isActive: true,
  });

  const handleOpenAdd = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      brand: "LUXE",
      price: 0,
      discountPrice: 0,
      sku: `LX-${Date.now().toString().slice(-6)}`,
      weight: 200,
      stock: 10,
      categoryId: categories[0]?.id || "",
      imageURL: "",
      isFeatured: false,
      isNewArrival: true,
      isActive: true,
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setForm({
      name: prod.name,
      slug: prod.slug,
      description: prod.description,
      brand: prod.brand || "LUXE",
      price: Number(prod.price),
      discountPrice: prod.discountPrice ? Number(prod.discountPrice) : 0,
      sku: prod.sku,
      weight: prod.weight,
      stock: prod.stock,
      categoryId: prod.categoryId,
      imageURL: prod.images?.[0]?.url || "",
      isFeatured: prod.isFeatured,
      isNewArrival: prod.isNewArrival,
      isActive: prod.isActive,
    });
    setIsEditing(true);
    setCurrentId(prod.id);
    setIsOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
    setForm((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug || !form.sku || !form.categoryId) {
      toast.error("Nama, Slug, SKU, dan Kategori wajib diisi");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentId) {
        // Edit Action
        const payload = {
          ...form,
          price: Number(form.price),
          discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
          weight: Number(form.weight),
          stock: Number(form.stock),
        };

        const res = await updateProduct(currentId, payload);
        if (res) {
          toast.success("Produk berhasil diperbarui");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error("Gagal memperbarui produk");
        }
      } else {
        // Create Action
        const payload = {
          ...form,
          price: Number(form.price),
          discountPrice: form.discountPrice ? Number(form.discountPrice) : null,
          weight: Number(form.weight),
          stock: Number(form.stock),
          images: form.imageURL
            ? [{ url: form.imageURL, publicId: `luxe/products/${form.slug}_0` }]
            : [{ url: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600", publicId: "default" }],
          variants: [
            { size: "M", color: "Hitam", colorHex: "#000000", stock: Number(form.stock) },
          ],
        };

        const res = await createProduct(payload);
        if (res) {
          toast.success("Produk baru berhasil ditambahkan");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error("Gagal membuat produk");
        }
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menonaktifkan produk ini?")) return;

    try {
      const res = await deleteProduct(id);
      if (res) {
        toast.success("Produk berhasil dinonaktifkan");
        router.refresh();
      } else {
        toast.error("Gagal menonaktifkan produk");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Manajemen Produk</h1>
          <p className="mt-1.5 text-sm text-neutral-450">
            Kelola katalog produk, edit informasi harga, perbarui stok, atau tambahkan produk baru.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer select-none"
        >
          <Plus size={16} />
          Tambah Produk
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-24 border border-white/5 rounded-2xl bg-neutral-900/20">
          <AlertCircle className="mx-auto text-neutral-500 mb-4" size={36} />
          <p className="text-sm font-semibold text-white">Belum ada produk</p>
          <p className="text-xs text-neutral-450 mt-1">
            Mulailah dengan menambahkan produk premium pertama Anda.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-white/5 bg-neutral-950 font-bold uppercase tracking-wider text-neutral-400">
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
              <tbody className="divide-y divide-white/5">
                {products.map((product) => {
                  const image = product.images?.[0]?.url || "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600";
                  return (
                    <tr key={product.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-8 overflow-hidden rounded bg-neutral-800 border border-white/5 flex-shrink-0">
                            <img src={image} alt="" className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <span className="font-semibold text-white truncate block max-w-[180px]">
                              {product.name}
                            </span>
                            <span className="text-[10px] text-neutral-400 mt-0.5 block">
                              {product.brand || "LUXE"}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-neutral-400">{product.sku}</td>
                      <td className="px-6 py-4 text-neutral-350">{product.category.name}</td>
                      <td className="px-6 py-4 font-semibold text-white">
                        Rp {Number(product.discountPrice ?? product.price).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 font-medium text-white">{product.stock}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                            product.isActive
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                              : "bg-red-950/40 text-red-400 border border-red-500/20"
                          }`}
                        >
                          {product.isActive ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-red-950/20 hover:border-red-500/30 text-neutral-450 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Products Add/Edit Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-28 pb-10 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-xl flex flex-col rounded-3xl border border-white/5 bg-neutral-900 shadow-2xl text-white z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-6 bg-neutral-900/90 backdrop-blur-md z-20">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isEditing ? "Edit Produk" : "Tambah Produk Baru"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">
                    {isEditing ? "Perbarui deskripsi, harga, dan stok produk" : "Tambahkan pakaian atau aksesoris mewah baru"}
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Nama Produk
                    </label>
                    <input
                      type="text"
                      placeholder="Minimalist Linen Shirt"
                      value={form.name}
                      onChange={handleNameChange}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Slug URL
                    </label>
                    <input
                      type="text"
                      placeholder="minimalist-linen-shirt"
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Brand / Merk
                    </label>
                    <input
                      type="text"
                      placeholder="LUXE"
                      value={form.brand}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Kode SKU (Unik)
                    </label>
                    <input
                      type="text"
                      placeholder="LX-MLS-001"
                      value={form.sku}
                      onChange={(e) => setForm({ ...form, sku: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Kategori Produk
                    </label>
                    <select
                      value={form.categoryId}
                      onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-xs outline-none focus:border-white/20 transition-all text-white cursor-pointer"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Harga Asli (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="500000"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Harga Promo / Diskon (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="400000"
                      value={form.discountPrice}
                      onChange={(e) => setForm({ ...form, discountPrice: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Berat Kirim (Gram)
                    </label>
                    <input
                      type="number"
                      placeholder="200"
                      value={form.weight}
                      onChange={(e) => setForm({ ...form, weight: parseInt(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Total Stok Gudang
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={form.stock}
                      onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    URL Gambar Utama Produk
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={form.imageURL}
                    onChange={(e) => setForm({ ...form, imageURL: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={form.isFeatured}
                      onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-white accent-white cursor-pointer"
                    />
                    <label htmlFor="isFeatured" className="text-xs text-neutral-400 select-none cursor-pointer">
                      Featured (Unggulan)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isNewArrival"
                      checked={form.isNewArrival}
                      onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-white accent-white cursor-pointer"
                    />
                    <label htmlFor="isNewArrival" className="text-xs text-neutral-400 select-none cursor-pointer">
                      New Arrival (Terbaru)
                    </label>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-white accent-white cursor-pointer"
                    />
                    <label htmlFor="isActive" className="text-xs text-neutral-400 select-none cursor-pointer">
                      Aktifkan Katalog
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Deskripsi Detail Produk
                  </label>
                  <textarea
                    placeholder="Tulis spesifikasi bahan, ukuran pas badan, dan deskripsi produk..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full min-h-[90px] rounded-lg border border-white/10 bg-white/5 p-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600 resize-y"
                    required
                  />
                </div>

                <div className="pt-4 border-t border-white/5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 select-none cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <span>{isEditing ? "Simpan Perubahan" : "Simpan Produk Baru"}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
