import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/animations/fade-in";
import { ShoppingCart, Calendar, ArrowRight, Package } from "lucide-react";
import Link from "next/link";

export default async function OrdersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  // Fetch customer orders
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      payment: true,
    },
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <FadeIn>
        <h1 className="text-3xl font-bold tracking-tight">Riwayat Pesanan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pantau status pesanan dan lihat transaksi belanja Anda sebelumnya.
        </p>
      </FadeIn>

      {orders.length === 0 ? (
        <FadeIn delay={0.2} className="py-24 text-center border rounded-2xl bg-neutral-50/20 dark:bg-neutral-900/10">
          <Package size={48} className="mx-auto text-neutral-350 mb-4" />
          <h2 className="text-lg font-medium text-neutral-600 dark:text-neutral-400">
            Belum ada pesanan
          </h2>
          <p className="mt-1 text-sm text-neutral-400">
            Anda belum melakukan pemesanan produk apa pun.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-sm font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
          >
            Mulai Belanja
          </Link>
        </FadeIn>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isPending = order.status === "PENDING";
            const date = new Date(order.createdAt).toLocaleDateString("id-ID", {
              dateStyle: "medium",
            });
            
            return (
              <FadeIn key={order.id} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-neutral-50 dark:border-neutral-850">
                  <div className="space-y-1">
                    <span className="text-xs font-mono text-neutral-400">Nomor Pesanan</span>
                    <p className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 flex-wrap sm:justify-end">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] text-neutral-400 block">Tanggal</span>
                      <span className="text-xs font-medium">{date}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-neutral-400 block sm:text-right">Status</span>
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                          order.status === "PAID" || order.status === "DELIVERED"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                            : order.status === "CANCELLED"
                            ? "bg-red-50 text-red-700 dark:bg-red-950/20"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-950/20"
                        }`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items preview */}
                <div className="flex justify-between items-center gap-4">
                  <div className="text-xs text-neutral-500">
                    {order.items.length} produk • Total Bayar:{" "}
                    <span className="font-bold text-neutral-800 dark:text-neutral-250">
                      Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {isPending && order.payment?.snapUrl && (
                      <Link
                        href={order.payment.snapUrl}
                        className="rounded-full bg-black px-4 py-1.5 text-[11px] font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black"
                      >
                        Bayar
                      </Link>
                    )}
                    <Link
                      href={`/orders/${order.id}`}
                      className="group flex h-8 items-center gap-1 text-[11px] font-semibold hover:underline"
                    >
                      Detail
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </FadeIn>
            );
          })}
        </div>
      )}
    </div>
  );
}
