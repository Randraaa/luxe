"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, AlertCircle, ShoppingCart, Eye, Trash, Edit, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { updateOrderStatus, deleteOrder } from "@/actions/orders";
import { OrderStatus } from "@prisma/client";

interface OrderItem {
  id: string;
  productName: string;
  productImage: string;
  size: string;
  color: string;
  quantity: number;
  price: any;
}

interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  subtotal: any;
  shippingCost: any;
  discountAmount: any;
  totalAmount: any;
  courier: string;
  waybillNumber: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
  items: OrderItem[];
}

interface OrdersManagerProps {
  initialOrders: Order[];
}

export function OrdersManager({ initialOrders }: OrdersManagerProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Status Form state
  const [statusForm, setStatusForm] = useState({
    status: OrderStatus.PENDING as OrderStatus,
    waybillNumber: "",
  });

  const handleOpenStatus = (order: Order) => {
    setSelectedOrder(order);
    setStatusForm({
      status: order.status,
      waybillNumber: order.waybillNumber || "",
    });
    setIsStatusOpen(true);
  };

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailOpen(true);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setIsLoading(true);
    try {
      const res = await updateOrderStatus(
        selectedOrder.id,
        statusForm.status,
        statusForm.waybillNumber || undefined
      );

      if (res.success) {
        toast.success("Status pesanan berhasil diperbarui");
        setIsStatusOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal memperbarui status");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus data pesanan ini? Tindakan ini tidak dapat dibatalkan.")) return;

    try {
      const res = await deleteOrder(id);
      if (res.success) {
        toast.success("Pesanan berhasil dihapus");
        router.refresh();
      } else {
        toast.error(res.error || "Gagal menghapus pesanan");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan sistem.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Manajemen Pesanan (Orders)</h1>
          <p className="mt-1.5 text-sm text-neutral-450">
            Kelola transaksi masuk, perbarui status pengiriman barang, input resi, atau hapus pesanan fiktif.
          </p>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-24 border border-white/5 rounded-2xl bg-neutral-900/20">
          <AlertCircle className="mx-auto text-neutral-500 mb-4" size={36} />
          <p className="text-sm font-semibold text-white">Belum ada pesanan</p>
          <p className="text-xs text-neutral-450 mt-1">
            Riwayat pesanan pelanggan baru akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-neutral-900/50 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead className="border-b border-white/5 bg-neutral-950 font-bold uppercase tracking-wider text-neutral-400">
                <tr>
                  <th className="px-6 py-4">Nomor Pesanan</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Total Bayar</th>
                  <th className="px-6 py-4">Kurir</th>
                  <th className="px-6 py-4">No. Resi</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-semibold text-white block">
                          {ord.user.name}
                        </span>
                        <span className="text-[10px] text-neutral-400 block font-mono">
                          {ord.user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      Rp {Number(ord.totalAmount).toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 font-mono text-neutral-400 uppercase">{ord.courier}</td>
                    <td className="px-6 py-4 font-mono text-neutral-400">{ord.waybillNumber || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          ord.status === "DELIVERED"
                            ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20"
                            : ord.status === "CANCELLED"
                            ? "bg-red-950/40 text-red-400 border border-red-500/20"
                            : "bg-amber-950/40 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(ord)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Lihat Detail Pesanan"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => handleOpenStatus(ord)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          title="Perbarui Status & Resi"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(ord.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 hover:bg-red-950/20 hover:border-red-500/30 text-neutral-450 hover:text-red-400 transition-colors cursor-pointer"
                          title="Hapus Pesanan"
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

      {/* 1. Modal Detail Order */}
      <AnimatePresence>
        {isDetailOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-28 pb-10 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDetailOpen(false)}
              className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-2xl flex flex-col rounded-3xl border border-white/5 bg-neutral-900 shadow-2xl text-white z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-6 bg-neutral-900/90 backdrop-blur-md z-20">
                <div>
                  <h2 className="text-xl font-bold text-white">Detail Pesanan #{selectedOrder.orderNumber}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">Informasi pengiriman dan item produk yang dibeli</p>
                </div>
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="rounded-full p-2 bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh] custom-scrollbar">
                {/* Status bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-neutral-950/40 p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-neutral-500">Status</span>
                    <span className="text-xs font-bold text-amber-500 font-mono">{selectedOrder.status}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-neutral-500">Metode Kirim</span>
                    <span className="text-xs font-bold text-white font-mono uppercase">{selectedOrder.courier}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-neutral-500">No. Resi</span>
                    <span className="text-xs font-bold text-white font-mono">{selectedOrder.waybillNumber || "-"}</span>
                  </div>
                  <div>
                    <span className="block text-[9px] uppercase tracking-wider text-neutral-500">Total Pembayaran</span>
                    <span className="text-xs font-bold text-emerald-400">Rp {Number(selectedOrder.totalAmount).toLocaleString("id-ID")}</span>
                  </div>
                </div>

                {/* Shipping Info */}
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">Informasi Penerima</h3>
                  <div className="p-4 rounded-2xl border border-white/5 bg-neutral-950/20 text-xs space-y-1 text-neutral-350 leading-relaxed font-light">
                    <p className="font-bold text-white">{selectedOrder.shippingName} ({selectedOrder.shippingPhone})</p>
                    <p className="pt-1 mt-1 border-t border-white/5">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>

                {/* Product Items */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-mono">Daftar Belanja</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item) => (
                      <div key={item.id} className="flex gap-4 p-3 rounded-2xl border border-white/5 bg-neutral-950/20">
                        <div className="h-14 w-11 overflow-hidden rounded bg-neutral-800 border border-white/5 flex-shrink-0">
                          <img src={item.productImage} alt="" className="h-full w-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-xs text-white truncate">{item.productName}</h4>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Warna: {item.color} | Ukuran: {item.size}
                          </p>
                          <p className="text-neutral-450 text-[10px] mt-1">
                            {item.quantity} x Rp {Number(item.price).toLocaleString("id-ID")}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <span className="font-semibold text-xs text-white">
                            Rp {(item.quantity * Number(item.price)).toLocaleString("id-ID")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="border-t border-white/5 pt-4 text-xs space-y-1.5 text-neutral-400">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-white">Rp {Number(selectedOrder.subtotal).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Ongkos Kirim</span>
                    <span className="text-white">Rp {Number(selectedOrder.shippingCost).toLocaleString("id-ID")}</span>
                  </div>
                  {Number(selectedOrder.discountAmount) > 0 && (
                    <div className="flex justify-between text-red-400">
                      <span>Potongan Kupon</span>
                      <span>-Rp {Number(selectedOrder.discountAmount).toLocaleString("id-ID")}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-sm text-white pt-2 border-t border-white/5">
                    <span>Total Pembayaran</span>
                    <span className="text-emerald-400">Rp {Number(selectedOrder.totalAmount).toLocaleString("id-ID")}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Modal Status & Resi Order */}
      <AnimatePresence>
        {isStatusOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 pt-28 pb-10 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStatusOpen(false)}
              className="fixed inset-0 bg-neutral-950/80 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full max-w-md flex flex-col rounded-3xl border border-white/5 bg-neutral-900 shadow-2xl text-white z-10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/5 p-6 bg-neutral-900/90 backdrop-blur-md z-20">
                <div>
                  <h2 className="text-xl font-bold text-white">Status Pesanan #{selectedOrder.orderNumber}</h2>
                  <p className="text-xs text-neutral-400 mt-0.5 font-light">Perbarui status kirim atau input nomor resi pengiriman</p>
                </div>
                <button
                  onClick={() => setIsStatusOpen(false)}
                  className="rounded-full p-2 bg-white/5 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Status Pengiriman / Bayar
                  </label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm({ ...statusForm, status: e.target.value as OrderStatus })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-neutral-950 px-3 text-xs outline-none focus:border-white/20 transition-all text-white cursor-pointer"
                  >
                    <option value={OrderStatus.PENDING}>PENDING (Belum Bayar)</option>
                    <option value={OrderStatus.PAID}>PAID (Sudah Bayar)</option>
                    <option value={OrderStatus.PROCESSING}>PROCESSING (Diproses)</option>
                    <option value={OrderStatus.PACKING}>PACKING (Dikemas)</option>
                    <option value={OrderStatus.SHIPPING}>SHIPPING (Dalam Pengiriman)</option>
                    <option value={OrderStatus.DELIVERED}>DELIVERED (Diterima)</option>
                    <option value={OrderStatus.CANCELLED}>CANCELLED (Batal)</option>
                    <option value={OrderStatus.REFUNDED}>REFUNDED (Dikembalikan)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
                    Nomor Resi Pengiriman (Waybill)
                  </label>
                  <input
                    type="text"
                    placeholder="RESIXXXXXXXX"
                    value={statusForm.waybillNumber}
                    onChange={(e) => setStatusForm({ ...statusForm, waybillNumber: e.target.value })}
                    className="h-10 w-full rounded-lg border border-white/10 bg-white/5 px-3 text-xs outline-none focus:border-white/20 transition-all text-white placeholder:text-neutral-600 font-mono"
                  />
                  <p className="text-[10px] text-neutral-500 mt-1">Wajib diisi jika status diubah menjadi SHIPPING (Dalam Pengiriman).</p>
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
                        <Check size={14} />
                        <span>Simpan Status Baru</span>
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
