"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { simulatePaymentStatus } from "@/actions/payment";
import { FadeIn } from "@/components/animations/fade-in";
import { toast } from "sonner";
import { CreditCard, Loader2, CheckCircle2, XCircle } from "lucide-react";

interface PaymentSimulatorProps {
  order: any;
}

export function PaymentSimulator({ order }: PaymentSimulatorProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSimulate = async (status: "SUCCESS" | "FAILED") => {
    setIsLoading(true);
    try {
      const res = await simulatePaymentStatus(order.id, status);
      if (res.success) {
        if (status === "SUCCESS") {
          toast.success("Simulasi pembayaran berhasil!");
        } else {
          toast.error("Simulasi pembayaran dibatalkan/gagal.");
        }
        router.push(`/orders/${order.id}`);
        router.refresh();
      } else {
        toast.error(res.error || "Gagal memperbarui status pembayaran");
        setIsLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
      setIsLoading(false);
    }
  };

  return (
    <FadeIn className="rounded-2xl border border-neutral-100 bg-white p-8 shadow-xl dark:border-neutral-850 dark:bg-neutral-900/50">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300 mb-4">
          <CreditCard size={24} />
        </div>
        
        <h2 className="text-xl font-bold">Midtrans Payment Simulator</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Simulasikan pembayaran e-commerce LUXE Anda
        </p>

        {/* Invoice Card */}
        <div className="my-8 w-full rounded-xl bg-neutral-50/50 p-4 text-xs text-left space-y-2 dark:bg-neutral-905">
          <div className="flex justify-between">
            <span className="text-neutral-450">Nomor Pesanan</span>
            <span className="font-semibold">{order.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-450">Subtotal</span>
            <span>Rp {Number(order.subtotal).toLocaleString("id-ID")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-450">Ongkos Kirim</span>
            <span>Rp {Number(order.shippingCost).toLocaleString("id-ID")}</span>
          </div>
          {Number(order.discountAmount) > 0 && (
            <div className="flex justify-between text-emerald-600">
              <span>Diskon</span>
              <span>- Rp {Number(order.discountAmount).toLocaleString("id-ID")}</span>
            </div>
          )}
          <div className="border-t border-neutral-200/50 pt-2 flex justify-between text-sm font-bold dark:border-neutral-800">
            <span>Total Bayar</span>
            <span>Rp {Number(order.totalAmount).toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full space-y-3">
          <button
            onClick={() => handleSimulate("SUCCESS")}
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={16} />
                Bayar Sekarang (Sukses)
              </>
            )}
          </button>
          <button
            onClick={() => handleSimulate("FAILED")}
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-neutral-200 bg-white font-semibold text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <XCircle size={16} />
                Batalkan Transaksi (Gagal)
              </>
            )}
          </button>
        </div>
      </div>
    </FadeIn>
  );
}
