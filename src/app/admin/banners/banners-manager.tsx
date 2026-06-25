"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash, X, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createBanner, updateBanner, deleteBanner } from "@/actions/banners";
import { BannerPosition } from "@prisma/client";

interface Banner {
  id: string;
  title: string;
  subtitle: string | null;
  image: string;
  mobileImage: string | null;
  link: string | null;
  position: BannerPosition;
  order: number;
  isActive: boolean;
  startDate: Date;
  endDate: Date | null;
}

interface BannersManagerProps {
  initialBanners: Banner[];
}

export function BannersManager({ initialBanners }: BannersManagerProps) {
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    image: "",
    mobileImage: "",
    link: "",
    position: BannerPosition.HERO as BannerPosition,
    order: 0,
    startDate: "",
    endDate: "",
    isActive: true,
  });

  const formatDateForInput = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    const year = d.getFullYear();
    return [year, month, day].join("-");
  };

  const handleOpenAdd = () => {
    setForm({
      title: "",
      subtitle: "",
      image: "",
      mobileImage: "",
      link: "",
      position: BannerPosition.HERO,
      order: banners.length + 1,
      startDate: formatDateForInput(new Date()),
      endDate: "",
      isActive: true,
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (bn: Banner) => {
    setForm({
      title: bn.title,
      subtitle: bn.subtitle || "",
      image: bn.image,
      mobileImage: bn.mobileImage || "",
      link: bn.link || "",
      position: bn.position,
      order: bn.order,
      startDate: formatDateForInput(bn.startDate),
      endDate: bn.endDate ? formatDateForInput(bn.endDate) : "",
      isActive: bn.isActive,
    });
    setIsEditing(true);
    setCurrentId(bn.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.image) {
      toast.error("Judul spanduk dan URL gambar wajib diisi");
      return;
    }

    const payload = {
      ...form,
      startDate: form.startDate ? new Date(form.startDate) : undefined,
      endDate: form.endDate ? new Date(form.endDate) : undefined,
    };

    setIsLoading(true);
    try {
      if (isEditing && currentId) {
        const res = await updateBanner(currentId, payload);
        if (res.success && res.banner) {
          toast.success("Spanduk berhasil diperbarui");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal memperbarui spanduk");
        }
      } else {
        const res = await createBanner(payload);
        if (res.success && res.banner) {
          toast.success("Spanduk baru berhasil ditambahkan");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal membuat spanduk");
        }
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus spanduk ini?")) return;

    try {
      const res = await deleteBanner(id);
      if (res.success) {
        toast.success("Spanduk berhasil dihapus");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus spanduk");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Manajemen Banners</h1>
          <p className="mt-1.5 text-sm text-neutral-450">
            Kelola spanduk promosi, hero slider beranda, dan banner kategori Anda.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer select-none"
        >
          <Plus size={16} />
          Tambah Banner
        </button>
      </div>

      {banners.length === 0 ? (
        <div className="text-center py-24 border border-white/5 rounded-2xl bg-neutral-900/20">
          <AlertCircle className="mx-auto text-neutral-500 mb-4" size={36} />
          <p className="text-sm font-semibold text-white">Belum ada spanduk</p>
          <p className="text-xs text-neutral-400 mt-1">
            Mulai hias tampilan web store Anda dengan menambahkan banner promosi baru.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-white/5 bg-neutral-950 font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-6 py-4">Tampilan</th>
                  <th className="px-6 py-4">Judul & Subjudul</th>
                  <th className="px-6 py-4">Posisi</th>
                  <th className="px-6 py-4">Urutan</th>
                  <th className="px-6 py-4">Link Tautan</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {banners.map((bn) => (
                  <tr key={bn.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="h-10 w-16 overflow-hidden rounded bg-neutral-800 border border-white/5">
                        <img src={bn.image} alt="" className="h-full w-full object-cover" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-white text-xs block truncate max-w-[200px]">
                          {bn.title}
                        </span>
                        <span className="text-[10px] text-neutral-400 truncate block max-w-[200px]">
                          {bn.subtitle || "-"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-400">{bn.position}</td>
                    <td className="px-6 py-4 font-medium text-white">{bn.order}</td>
                    <td className="px-6 py-4 text-neutral-450 truncate max-w-[120px]">
                      {bn.link ? (
                        <a href={bn.link} target="_blank" rel="noopener noreferrer" className="hover:underline text-amber-500">
                          Link URL
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          bn.isActive
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-950/40 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {bn.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(bn)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(bn.id)}
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

      {/* Banners Add/Edit Modal */}
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
                    {isEditing ? "Edit Spanduk" : "Tambah Spanduk Baru"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">
                    {isEditing ? "Perbarui materi grafis promosi" : "Buat materi banner promosi beranda baru"}
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
                    Judul Banner
                  </label>
                  <input
                    type="text"
                    placeholder="Autumn Collection"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Subjudul (Deskripsi Singkat)
                  </label>
                  <input
                    type="text"
                    placeholder="Diskon hingga 30% untuk produk premium"
                    value={form.subtitle}
                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    URL Gambar Banner (Desktop)
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      URL Gambar Banner (Mobile)
                    </label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={form.mobileImage}
                      onChange={(e) => setForm({ ...form, mobileImage: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Link URL Redirect
                    </label>
                    <input
                      type="text"
                      placeholder="/products?category=men"
                      value={form.link}
                      onChange={(e) => setForm({ ...form, link: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Posisi Tampil
                    </label>
                    <select
                      value={form.position}
                      onChange={(e) => setForm({ ...form, position: e.target.value as BannerPosition })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-xs outline-none focus:border-white/20 transition-all text-white cursor-pointer"
                    >
                      <option value="HERO">Hero Slider Utama (Beranda)</option>
                      <option value="PROMO">Spanduk Promo Tengah</option>
                      <option value="CATEGORY">Kategori Banner</option>
                      <option value="POPUP">Pop-up Promo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Urutan
                    </label>
                    <input
                      type="number"
                      placeholder="1"
                      value={form.order}
                      onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Mulai Tayang
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Selesai Tayang (Opsional)
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-white/10 bg-white/5 text-white accent-white cursor-pointer"
                  />
                  <label htmlFor="isActive" className="text-xs text-neutral-400 select-none cursor-pointer">
                    Aktifkan Spanduk Sekarang
                  </label>
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
                        <span>{isEditing ? "Simpan Perubahan" : "Simpan Banner Baru"}</span>
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
