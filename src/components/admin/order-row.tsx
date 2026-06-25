"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/actions/orders";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";
import { OrderStatus } from "@prisma/client";

interface OrderRowProps {
  order: any;
}

export function OrderRow({ order }: OrderRowProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [waybill, setWaybill] = useState(order.waybillNumber || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async () => {
    setIsLoading(true);
    try {
      const res = await updateOrderStatus(order.id, status, waybill);
      if (res.success) {
        toast.success("Status pesanan berhasil diperbarui!");
      } else {
        toast.error(res.error || "Gagal memperbarui status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
    } finally {
      setIsLoading(false);
    }
  };

  const date = new Date(order.createdAt).toLocaleDateString("id-ID", {
    dateStyle: "short",
  });

  return (
    <tr className="hover:bg-neutral-50/30 dark:hover:bg-neutral-900/30">
      <td className="px-6 py-4 font-mono font-semibold text-neutral-800 dark:text-neutral-200">
        {order.orderNumber}
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
          {order.user.name}
        </span>
        <span className="text-[10px] text-neutral-450 block">{order.user.email}</span>
      </td>
      <td className="px-6 py-4 text-neutral-500">{date}</td>
      <td className="px-6 py-4 font-bold">
        Rp {Number(order.totalAmount).toLocaleString("id-ID")}
      </td>
      <td className="px-6 py-4">
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="h-8 rounded-md border border-neutral-200 bg-white px-2.5 outline-none text-xs focus:border-black dark:border-neutral-800 dark:bg-neutral-900"
        >
          <option value="PENDING">PENDING</option>
          <option value="PAID">PAID</option>
          <option value="PACKING">PACKING</option>
          <option value="SHIPPING">SHIPPING</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="CANCELLED">CANCELLED</option>
        </select>
      </td>
      <td className="px-6 py-4">
        <input
          type="text"
          value={waybill}
          onChange={(e) => setWaybill(e.target.value)}
          placeholder="No Resi (e.g. JNE123)"
          className="h-8 w-36 rounded-md border border-neutral-200 bg-white px-2 text-xs outline-none focus:border-black dark:border-neutral-800 dark:bg-neutral-900"
        />
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={handleUpdate}
          disabled={isLoading}
          className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-black px-3 font-semibold text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
        >
          {isLoading ? (
            <Loader2 size={12} className="animate-spin" />
          ) : (
            <>
              <Check size={12} />
              Simpan
            </>
          )}
        </button>
      </td>
    </tr>
  );
}
