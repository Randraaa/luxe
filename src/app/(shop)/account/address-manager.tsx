"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAddress } from "@/actions/checkout";
import { toast } from "sonner";
import { Plus, X, MapPin, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Address {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

interface AddressManagerProps {
  initialAddresses: Address[];
}

export function AddressManager({ initialAddresses }: AddressManagerProps) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    label: "",
    recipientName: "",
    phone: "",
    street: "",
    district: "",
    city: "",
    province: "",
    postalCode: "",
    isDefault: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await addAddress(form);
      if (res.success && res.address) {
        toast.success("Alamat baru berhasil ditambahkan!");
        setIsOpen(false);
        setForm({
          label: "",
          recipientName: "",
          phone: "",
          street: "",
          district: "",
          city: "",
          province: "",
          postalCode: "",
          isDefault: false,
        });
        
        // Optimistic state update or trigger refresh
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menambahkan alamat");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem saat menyimpan alamat.");
    } finally {
      setIsLoading(false);
    }
  };

  const defaultAddress = initialAddresses.find((a) => a.isDefault) || initialAddresses[0];

  return (
    <div className="space-y-4">
      {/* Alamat card */}
      <div className="rounded-2xl border border-white/5 bg-neutral-900 p-5 space-y-4">
        {defaultAddress ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <span className="inline-flex rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-neutral-300">
                {defaultAddress.label} {defaultAddress.isDefault && "(Utama)"}
              </span>
              <button
                onClick={() => setIsOpen(true)}
                className="text-[10px] font-bold uppercase tracking-wider text-neutral-450 hover:text-white transition-colors cursor-pointer select-none"
              >
                Kelola Alamat ({initialAddresses.length})
              </button>
            </div>
            
            <div className="text-xs space-y-1 text-neutral-400 leading-relaxed font-light">
              <p className="font-bold text-white text-sm">{defaultAddress.recipientName}</p>
              <p className="text-neutral-500">{defaultAddress.phone}</p>
              <p className="pt-2 mt-2 border-t border-white/5 text-neutral-300">
                {defaultAddress.street}, {defaultAddress.district}, {defaultAddress.city}, {defaultAddress.province}, {defaultAddress.postalCode}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 space-y-3">
            <MapPin size={24} className="mx-auto text-neutral-500" />
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Anda belum menambahkan alamat pengiriman.
            </p>
            <button
              onClick={() => setIsOpen(true)}
              className="inline-flex h-9 items-center justify-center gap-1.5 rounded-full border border-white/10 px-5 text-xs font-semibold hover:bg-white/10 text-neutral-200 transition-colors cursor-pointer select-none"
            >
              <Plus size={14} />
              <span>Tambah Alamat</span>
            </button>
          </div>
        )}
      </div>

      {/* Addresses Management Modal */}
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
              className="relative w-full max-w-2xl max-h-[80vh] sm:max-h-[85vh] flex flex-col rounded-3xl border border-white/5 bg-neutral-900 shadow-2xl text-white z-10 overflow-hidden"
            >
              {/* Header (Fixed at top of modal) */}
              <div className="flex items-center justify-between border-b border-white/5 p-6 sm:px-8 bg-neutral-900/90 backdrop-blur-md z-20">
                <div>
                  <h2 className="text-xl font-bold text-white">Kelola Alamat</h2>
                  <p className="text-xs text-neutral-450 mt-0.5 font-light">Tambah atau pilih alamat utama Anda</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-2 bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Scrollable Content Container */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 custom-scrollbar">
                {/* Form Tambah Alamat */}
                <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-950/30 p-5 rounded-2xl border border-white/5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-500 font-mono">Form Alamat Baru</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-450 mb-1">
                        Label Alamat (cth: Rumah, Kantor)
                      </label>
                      <input
                        type="text"
                        placeholder="Rumah"
                        value={form.label}
                        onChange={(e) => setForm({ ...form, label: e.target.value })}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-450 mb-1">
                        Nama Penerima
                      </label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={form.recipientName}
                        onChange={(e) => setForm({ ...form, recipientName: e.target.value })}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-450 mb-1">
                        Nomor Telepon
                      </label>
                      <input
                        type="tel"
                        placeholder="0812xxxxxxxx"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-450 mb-1">
                        Kode Pos
                      </label>
                      <input
                        type="text"
                        placeholder="12345"
                        value={form.postalCode}
                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-450 mb-1">
                      Alamat Lengkap (Jalan, RT/RW, No. Rumah)
                    </label>
                    <textarea
                      placeholder="Jl. Sudirman No. 45, RT 02/03"
                      value={form.street}
                      onChange={(e) => setForm({ ...form, street: e.target.value })}
                      className="w-full min-h-[60px] rounded-lg border border-white/10 bg-white/5 p-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600 resize-y"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-450 mb-1">
                        Kecamatan
                      </label>
                      <input
                        type="text"
                        placeholder="Kebayoran Baru"
                        value={form.district}
                        onChange={(e) => setForm({ ...form, district: e.target.value })}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-450 mb-1">
                        Kota / Kabupaten
                      </label>
                      <input
                        type="text"
                        placeholder="Jakarta Selatan"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-450 mb-1">
                        Provinsi
                      </label>
                      <input
                        type="text"
                        placeholder="DKI Jakarta"
                        value={form.province}
                        onChange={(e) => setForm({ ...form, province: e.target.value })}
                        className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={form.isDefault}
                      onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                      className="h-4 w-4 rounded border-white/10 bg-white/5 text-white accent-white cursor-pointer"
                    />
                    <label htmlFor="isDefault" className="text-xs text-neutral-400 select-none cursor-pointer">
                      Jadikan Alamat Utama (Default)
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg bg-white text-xs font-semibold text-black hover:bg-neutral-200 transition-colors disabled:opacity-50 select-none cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>Simpan Alamat Baru</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Daftar Alamat Terdaftar */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">Daftar Alamat Saya</h3>
                  {initialAddresses.length === 0 ? (
                    <p className="text-xs text-neutral-500 font-light italic">Belum ada alamat terdaftar.</p>
                  ) : (
                    <div className="space-y-3 pb-4">
                      {initialAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`p-4 rounded-2xl border text-left transition-all ${
                            addr.isDefault
                              ? "border-white/20 bg-white/5"
                              : "border-white/5 bg-neutral-950/20"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-xs text-white">
                              {addr.label}
                            </span>
                            {addr.isDefault && (
                              <span className="inline-flex items-center gap-1 rounded bg-white text-black px-1.5 py-0.5 text-[8px] font-bold uppercase">
                                <Check size={8} />
                                Utama
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] space-y-0.5 mt-2 text-neutral-400 font-light">
                            <p className="font-bold text-neutral-200">{addr.recipientName} ({addr.phone})</p>
                            <p>{addr.street}, {addr.district}, {addr.city}, {addr.province} {addr.postalCode}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
