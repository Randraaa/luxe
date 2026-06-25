"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash, X, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createCategory, updateCategory, deleteCategory } from "@/actions/categories";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  order: number;
  isActive: boolean;
}

interface CategoriesManagerProps {
  initialCategories: Category[];
}

export function CategoriesManager({ initialCategories }: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    order: 0,
    isActive: true,
  });

  const handleOpenAdd = () => {
    setForm({
      name: "",
      slug: "",
      description: "",
      image: "",
      order: categories.length + 1,
      isActive: true,
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setForm({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      order: cat.order,
      isActive: cat.isActive,
    });
    setIsEditing(true);
    setCurrentId(cat.id);
    setIsOpen(true);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-5-_]/g, "");
    setForm((prev) => ({ ...prev, name, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.slug) {
      toast.error("Nama dan Slug wajib diisi");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentId) {
        const res = await updateCategory(currentId, form);
        if (res.success && res.category) {
          toast.success("Kategori berhasil diperbarui");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal memperbarui kategori");
        }
      } else {
        const res = await createCategory(form);
        if (res.success && res.category) {
          toast.success("Kategori baru berhasil ditambahkan");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal membuat kategori");
        }
      }
    } catch (err: any) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;

    try {
      const res = await deleteCategory(id);
      if (res.success) {
        toast.success("Kategori berhasil dihapus");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus kategori");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Manajemen Kategori</h1>
          <p className="mt-1.5 text-sm text-neutral-400">
            Kelola kategori produk untuk mempermudah navigasi toko online LUXE Anda.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer select-none"
        >
          <Plus size={16} />
          Tambah Kategori
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-24 border border-white/5 rounded-2xl bg-neutral-900/20">
          <AlertCircle className="mx-auto text-neutral-500 mb-4" size={36} />
          <p className="text-sm font-semibold text-white">Belum ada kategori</p>
          <p className="text-xs text-neutral-400 mt-1">
            Mulailah dengan menambahkan kategori pertama Anda.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-white/5 bg-neutral-950 font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-6 py-4">Foto</th>
                  <th className="px-6 py-4">Nama Kategori</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Deskripsi</th>
                  <th className="px-6 py-4">Urutan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-10 w-10 overflow-hidden rounded-lg bg-neutral-800 border border-white/5">
                        {cat.image ? (
                          <img src={cat.image} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center font-bold text-neutral-600">
                            -
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-white block">
                        {cat.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-400">{cat.slug}</td>
                    <td className="px-6 py-4 text-neutral-350 max-w-xs truncate">{cat.description || "-"}</td>
                    <td className="px-6 py-4 font-medium text-white">{cat.order}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          cat.isActive
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-950/40 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {cat.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-red-950/20 hover:border-red-500/30 text-neutral-450 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories Add/Edit Modal */}
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
              className="relative w-full max-w-lg flex flex-col rounded-3xl border border-white/5 bg-neutral-900 shadow-2xl text-white z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-6 bg-neutral-900/90 backdrop-blur-md z-20">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {isEditing ? "Edit Kategori" : "Tambah Kategori Baru"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">
                    {isEditing ? "Perbarui informasi kategori produk" : "Tambahkan kategori produk baru ke koleksi"}
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
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    placeholder="Men"
                    value={form.name}
                    onChange={handleNameChange}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Slug Kategori (URL Path)
                  </label>
                  <input
                    type="text"
                    placeholder="men"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    URL Foto Kategori
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Nomor Urutan Tampil
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                      required
                    />
                  </div>

                  <div className="flex flex-col justify-end pb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="isActive"
                        checked={form.isActive}
                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                        className="h-4 w-4 rounded border-white/10 bg-white/5 text-white accent-white cursor-pointer"
                      />
                      <label htmlFor="isActive" className="text-xs text-neutral-400 select-none cursor-pointer">
                        Aktifkan Kategori
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Deskripsi Kategori
                  </label>
                  <textarea
                    placeholder="Tulis deskripsi singkat kategori produk..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full min-h-[70px] rounded-lg border border-white/10 bg-white/5 p-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600 resize-y"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 select-none cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <span>{isEditing ? "Simpan Perubahan" : "Simpan Kategori Baru"}</span>
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
