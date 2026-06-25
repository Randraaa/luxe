"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash, X, Loader2, AlertCircle, Ticket } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createCoupon, updateCoupon, deleteCoupon } from "@/actions/coupons";
import { DiscountType } from "@prisma/client";

interface Coupon {
  id: string;
  code: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: any; // Decimal type
  minPurchase: any; // Decimal type
  maxDiscount: any; // Decimal type
  usageLimit: number | null;
  usageCount: number;
  startDate: Date;
  expiresAt: Date;
  isActive: boolean;
}

interface CouponsManagerProps {
  initialCoupons: Coupon[];
}

export function CouponsManager({ initialCoupons }: CouponsManagerProps) {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    code: "",
    description: "",
    discountType: DiscountType.PERCENTAGE as DiscountType,
    discountValue: 0,
    minPurchase: 0,
    maxDiscount: 0,
    usageLimit: 0,
    startDate: "",
    expiresAt: "",
    isActive: true,
  });

  const formatDateForInput = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, "0");
    const day = `${d.getDate()}`.padStart(2, "0");
    const year = d.getFullYear();
    return [year, month, day].join("-");
  };

  const handleOpenAdd = () => {
    const today = new Date();
    const nextMonth = new Date();
    nextMonth.setMonth(today.getMonth() + 1);

    setForm({
      code: "",
      description: "",
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minPurchase: 100000,
      maxDiscount: 50000,
      usageLimit: 100,
      startDate: formatDateForInput(today),
      expiresAt: formatDateForInput(nextMonth),
      isActive: true,
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (cp: Coupon) => {
    setForm({
      code: cp.code,
      description: cp.description || "",
      discountType: cp.discountType,
      discountValue: Number(cp.discountValue),
      minPurchase: Number(cp.minPurchase),
      maxDiscount: cp.maxDiscount ? Number(cp.maxDiscount) : 0,
      usageLimit: cp.usageLimit || 0,
      startDate: formatDateForInput(cp.startDate),
      expiresAt: formatDateForInput(cp.expiresAt),
      isActive: cp.isActive,
    });
    setIsEditing(true);
    setCurrentId(cp.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.expiresAt) {
      toast.error("Kode kupon dan Tanggal kedaluwarsa wajib diisi");
      return;
    }

    const payload = {
      ...form,
      discountValue: Number(form.discountValue),
      minPurchase: Number(form.minPurchase),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      startDate: form.startDate ? new Date(form.startDate) : undefined,
      expiresAt: new Date(form.expiresAt),
    };

    setIsLoading(true);
    try {
      if (isEditing && currentId) {
        const res = await updateCoupon(currentId, payload);
        if (res.success && res.coupon) {
          toast.success("Kupon berhasil diperbarui");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal memperbarui kupon");
        }
      } else {
        const res = await createCoupon(payload);
        if (res.success && res.coupon) {
          toast.success("Kupon baru berhasil ditambahkan");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal membuat kupon");
        }
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kupon ini?")) return;

    try {
      const res = await deleteCoupon(id);
      if (res.success) {
        toast.success("Kupon berhasil dihapus");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus kupon");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Manajemen Kupon</h1>
          <p className="mt-1.5 text-sm text-neutral-400">
            Kelola diskon belanja, kupon promo, dan batas klaim pelanggan Anda.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer select-none"
        >
          <Plus size={16} />
          Tambah Kupon
        </button>
      </div>

      {coupons.length === 0 ? (
        <div className="text-center py-24 border border-white/5 rounded-2xl bg-neutral-900/20">
          <AlertCircle className="mx-auto text-neutral-500 mb-4" size={36} />
          <p className="text-sm font-semibold text-white">Belum ada kupon</p>
          <p className="text-xs text-neutral-400 mt-1">
            Mulai promosi pertama dengan menambahkan kode kupon belanja baru.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-white/5 bg-neutral-950 font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-6 py-4">Kode Kupon</th>
                  <th className="px-6 py-4">Diskon</th>
                  <th className="px-6 py-4">Min. Belanja</th>
                  <th className="px-6 py-4">Batas/Total Klaim</th>
                  <th className="px-6 py-4">Tgl Kedaluwarsa</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {coupons.map((cp) => (
                  <tr key={cp.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ticket size={14} className="text-amber-500" />
                        <span className="font-mono font-bold text-white text-sm">
                          {cp.code}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      {cp.discountType === "PERCENTAGE"
                        ? `${Number(cp.discountValue)}%`
                        : `Rp ${Number(cp.discountValue).toLocaleString("id-ID")}`}
                    </td>
                    <td className="px-6 py-4 text-neutral-350">
                      Rp {Number(cp.minPurchase).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-neutral-400 font-mono">
                      {cp.usageLimit ? `${cp.usageCount} / ${cp.usageLimit}` : `${cp.usageCount} / Tanpa Batas`}
                    </td>
                    <td className="px-6 py-4 text-neutral-450 font-medium">
                      {new Date(cp.expiresAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          cp.isActive && new Date(cp.expiresAt) > new Date()
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                            : "bg-red-950/40 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {cp.isActive && new Date(cp.expiresAt) > new Date() ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cp)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cp.id)}
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

      {/* Coupons Add/Edit Modal */}
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
                    {isEditing ? "Edit Kupon Belanja" : "Tambah Kupon Baru"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">
                    {isEditing ? "Perbarui informasi aturan promo kupon" : "Buat parameter diskon kupon baru"}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Kode Kupon (Kode Unik)
                    </label>
                    <input
                      type="text"
                      placeholder="WELCOME10"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase().replace(/\s+/g, "") })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Tipe Diskon
                    </label>
                    <select
                      value={form.discountType}
                      onChange={(e) => setForm({ ...form, discountType: e.target.value as DiscountType })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-xs outline-none focus:border-white/20 transition-all text-white cursor-pointer"
                    >
                      <option value="PERCENTAGE">Persentase (%)</option>
                      <option value="FIXED_AMOUNT">Potongan Tetap (Rp)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Nilai Diskon
                    </label>
                    <input
                      type="number"
                      placeholder="10"
                      value={form.discountValue}
                      onChange={(e) => setForm({ ...form, discountValue: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Min. Belanja (Rp)
                    </label>
                    <input
                      type="number"
                      placeholder="100000"
                      value={form.minPurchase}
                      onChange={(e) => setForm({ ...form, minPurchase: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Maks. Potongan (Rp - Persentase saja)
                    </label>
                    <input
                      type="number"
                      placeholder="50000"
                      value={form.maxDiscount}
                      onChange={(e) => setForm({ ...form, maxDiscount: parseFloat(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white"
                      disabled={form.discountType === "FIXED_AMOUNT"}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Batas Kuota Penggunaan
                    </label>
                    <input
                      type="number"
                      placeholder="100"
                      value={form.usageLimit}
                      onChange={(e) => setForm({ ...form, usageLimit: parseInt(e.target.value) || 0 })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Tgl Mulai Berlaku
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
                      Tgl Kedaluwarsa
                    </label>
                    <input
                      type="date"
                      value={form.expiresAt}
                      onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white cursor-pointer"
                      required
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
                    Aktifkan Kupon Belanja
                  </label>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Deskripsi Aturan Kupon
                  </label>
                  <textarea
                    placeholder="Contoh: Diskon 10% minimal pembelian Rp 100.000 dengan kuota terbatas..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full min-h-[60px] rounded-lg border border-white/10 bg-white/5 p-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600 resize-y"
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
                        <span>{isEditing ? "Simpan Perubahan" : "Simpan Kupon Baru"}</span>
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
