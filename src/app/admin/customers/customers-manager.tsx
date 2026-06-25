"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash, X, Loader2, AlertCircle, Shield, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { createCustomer, updateCustomer, deleteCustomer } from "@/actions/customers";
import { Role } from "@prisma/client";

interface CustomerUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt: Date;
}

interface CustomersManagerProps {
  initialCustomers: CustomerUser[];
  currentAdminId: string;
}

export function CustomersManager({ initialCustomers, currentAdminId }: CustomersManagerProps) {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerUser[]>(initialCustomers);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: Role.CUSTOMER as Role,
    password: "",
  });

  const handleOpenAdd = () => {
    setForm({
      name: "",
      email: "",
      phone: "",
      role: Role.CUSTOMER as Role,
      password: "",
    });
    setIsEditing(false);
    setCurrentId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = (c: CustomerUser) => {
    setForm({
      name: c.name,
      email: c.email,
      phone: c.phone || "",
      role: c.role,
      password: "", // Leave blank unless updating
    });
    setIsEditing(true);
    setCurrentId(c.id);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || (!isEditing && !form.password)) {
      toast.error("Nama, Email, dan Password wajib diisi");
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing && currentId) {
        const res = await updateCustomer(currentId, form);
        if (res.success && res.user) {
          toast.success("Akun pelanggan berhasil diperbarui");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal memperbarui pelanggan");
        }
      } else {
        const res = await createCustomer(form);
        if (res.success && res.user) {
          toast.success("Akun pelanggan baru berhasil ditambahkan");
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error(res.error || "Gagal mendaftarkan pelanggan");
        }
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (id === currentAdminId) {
      toast.error("Anda tidak bisa menghapus akun admin yang sedang Anda gunakan");
      return;
    }
    if (!confirm("Apakah Anda yakin ingin menghapus akun pelanggan ini? Tindakan ini permanen.")) return;

    try {
      const res = await deleteCustomer(id);
      if (res.success) {
        toast.success("Akun berhasil dihapus");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus akun");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Manajemen Customers</h1>
          <p className="mt-1.5 text-sm text-neutral-450">
            Kelola data akun pengguna, edit detail, atau perbarui hak akses (Role) admin/customer.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex h-11 items-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-neutral-200 transition-colors cursor-pointer select-none"
        >
          <Plus size={16} />
          Tambah Pengguna
        </button>
      </div>

      {customers.length === 0 ? (
        <div className="text-center py-24 border border-white/5 rounded-2xl bg-neutral-900/20">
          <AlertCircle className="mx-auto text-neutral-500 mb-4" size={36} />
          <p className="text-sm font-semibold text-white">Belum ada pelanggan terdaftar</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-white/5 bg-neutral-950 font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-6 py-4">Nama Pelanggan</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">No. Telepon</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Tgl Terdaftar</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-800 text-neutral-300 font-bold border border-white/5 text-xs">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-white">
                          {c.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-300 font-mono">{c.email}</td>
                    <td className="px-6 py-4 text-neutral-400">{c.phone || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          c.role === "ADMIN"
                            ? "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                            : "bg-neutral-800 text-neutral-300 border border-white/5"
                        }`}
                      >
                        {c.role === "ADMIN" ? (
                          <>
                            <Shield size={8} />
                            ADMIN
                          </>
                        ) : (
                          <>
                            <User size={8} />
                            CUSTOMER
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-450 font-medium">
                      {new Date(c.createdAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        {c.id !== currentAdminId && (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-red-950/20 hover:border-red-500/30 text-neutral-450 hover:text-red-400 transition-colors cursor-pointer"
                          >
                            <Trash size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customers Add/Edit Modal */}
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
                    {isEditing ? "Edit Pengguna" : "Tambah Pengguna Baru"}
                  </h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">
                    {isEditing ? "Perbarui role dan profil pelanggan" : "Buat akun pengguna baru"}
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
                    Nama Lengkap
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Alamat Email
                  </label>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Nomor Telepon
                    </label>
                    <input
                      type="tel"
                      placeholder="0812xxxxxxxx"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                      Hak Akses (Role)
                    </label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                      className="h-10 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-xs outline-none focus:border-white/20 transition-all text-white cursor-pointer"
                    >
                      <option value="CUSTOMER">Customer (Pelanggan)</option>
                      <option value="ADMIN">Admin (Pengelola Toko)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Password {isEditing && <span className="text-[9px] text-neutral-500 font-normal">(Isi hanya jika ingin ganti)</span>}
                  </label>
                  <input
                    type="password"
                    placeholder={isEditing ? "••••••••" : "Minimal 8 karakter"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600"
                    required={!isEditing}
                    minLength={8}
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
                        <span>{isEditing ? "Simpan Perubahan" : "Daftarkan Pengguna"}</span>
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
