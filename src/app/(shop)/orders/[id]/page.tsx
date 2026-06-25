import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/animations/fade-in";
import { ChevronRight, Package, MapPin, CreditCard, Calendar, Truck } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
      payment: true,
    },
  });

  if (!order) {
    notFound();
  }

  // Authorize user: either customer owns order, or is admin
  if (order.userId !== session.user.id && (session.user as any).role !== "ADMIN") {
    redirect("/");
  }

  const activePrice = Number(order.totalAmount);
  const isPaid = order.status !== "PENDING" && order.status !== "CANCELLED";

  // Visual status indicators
  const steps = [
    { label: "Dibuat", status: "PENDING", desc: "Pesanan menunggu pembayaran" },
    { label: "Dibayar", status: "PAID", desc: "Pembayaran terverifikasi" },
    { label: "Dikemas", status: "PACKING", desc: "Pesanan sedang dipacking oleh admin" },
    { label: "Dikirim", status: "SHIPPING", desc: "Pesanan dalam perjalanan oleh kurir" },
    { label: "Diterima", status: "DELIVERED", desc: "Pesanan telah diterima oleh pembeli" },
  ];

  const currentStepIndex = steps.findIndex((step) => {
    if (order.status === "CANCELLED" || order.status === "REFUNDED") return false;
    if (order.status === "PROCESSING") return step.status === "PAID";
    return step.status === order.status;
  });

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-xs text-neutral-450">
        <Link href="/" className="hover:text-black dark:hover:text-white">Home</Link>
        <ChevronRight size={12} />
        <Link href="/orders" className="hover:text-black dark:hover:text-white">Pesanan</Link>
        <ChevronRight size={12} />
        <span className="text-neutral-900 dark:text-neutral-100 truncate">{order.orderNumber}</span>
      </nav>

      {/* Header Info */}
      <FadeIn className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-neutral-100 pb-6 dark:border-neutral-805">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Detail Pesanan</h1>
          <div className="mt-1 flex items-center gap-3 text-xs text-neutral-450 flex-wrap">
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">
              {order.orderNumber}
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-neutral-300" />
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              {new Date(order.createdAt).toLocaleDateString("id-ID", {
                dateStyle: "medium",
              })}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
              order.status === "PAID" || order.status === "DELIVERED"
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400"
                : order.status === "CANCELLED"
                ? "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400"
            }`}
          >
            {order.status}
          </span>
          {order.status === "PENDING" && order.payment?.snapUrl && (
            <Link
              href={order.payment.snapUrl}
              className="rounded-full bg-black px-4 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200"
            >
              Bayar Sekarang
            </Link>
          )}
        </div>
      </FadeIn>

      {/* Delivery Tracking timeline */}
      {order.status !== "CANCELLED" && order.status !== "REFUNDED" && (
        <FadeIn delay={0.2} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50">
          <h2 className="text-sm font-semibold flex items-center gap-2 mb-8">
            <Truck size={16} className="text-neutral-500" />
            Status Pengiriman
          </h2>
          <div className="relative pl-6 border-l border-neutral-100 dark:border-neutral-800 space-y-8">
            {steps.map((step, idx) => {
              const isCompleted = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div key={step.status} className="relative">
                  {/* Visual Node */}
                  <div
                    className={`absolute -left-[31px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 transition-all ${
                      isCompleted
                        ? "border-black bg-black dark:border-white dark:bg-white"
                        : "border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-950"
                    }`}
                  >
                    {isCurrent && (
                      <span className="h-1.5 w-1.5 rounded-full bg-white dark:bg-black animate-ping" />
                    )}
                  </div>
                  <div className="space-y-0.5">
                    <h4
                      className={`text-xs font-bold uppercase tracking-wider ${
                        isCompleted ? "text-neutral-900 dark:text-white" : "text-neutral-400"
                      }`}
                    >
                      {step.label}
                    </h4>
                    <p className="text-xs text-neutral-450">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>
      )}

      {/* Grid layouts: Left details, Right summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left components */}
        <div className="md:col-span-2 space-y-6">
          {/* Address card */}
          <FadeIn delay={0.3} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
              <MapPin size={16} className="text-neutral-500" />
              Alamat Pengiriman
            </h3>
            <div className="text-xs space-y-1">
              <p className="font-semibold text-sm">{order.shippingName}</p>
              <p className="text-neutral-500">{order.shippingPhone}</p>
              <p className="text-neutral-500 leading-relaxed">{order.shippingAddress}</p>
              {order.waybillNumber && (
                <div className="mt-4 pt-4 border-t border-neutral-50 text-[10px] text-neutral-450 dark:border-neutral-850">
                  <span className="font-bold uppercase">Nomor Resi:</span>{" "}
                  <span className="font-mono">{order.waybillNumber}</span>
                </div>
              )}
            </div>
          </FadeIn>

          {/* Items card */}
          <FadeIn delay={0.4} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50">
            <h3 className="text-sm font-semibold flex items-center gap-2 mb-6">
              <Package size={16} className="text-neutral-500" />
              Produk Dipesan
            </h3>
            <div className="space-y-6">
              {order.items.map((item) => {
                const activePrice = Number(item.discountPrice ?? item.price);
                return (
                  <div key={item.id} className="flex gap-4 text-xs">
                    <div className="h-16 w-12 flex-shrink-0 overflow-hidden rounded bg-neutral-100">
                      <img src={item.productImage} alt="" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.productName}</p>
                      <p className="text-neutral-400 mt-0.5">
                        Ukuran: {item.size} | Warna: {item.color}
                      </p>
                      <p className="text-neutral-400 mt-0.5">Jumlah: {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-sm">
                      Rp {(activePrice * item.quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        </div>

        {/* Right Summary */}
        <FadeIn delay={0.4} className="md:col-span-1">
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50/30 p-6 dark:border-neutral-800/10 dark:bg-neutral-900/10 text-xs space-y-6">
            <div>
              <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
                <CreditCard size={16} className="text-neutral-500" />
                Informasi Pembayaran
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-450 font-medium">Metode</span>
                  <span className="font-semibold uppercase">{order.payment?.method || "Simulasi"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-450 font-medium">Status</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200">
                    {order.payment?.status || "PENDING"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-neutral-100 pt-4 dark:border-neutral-850 space-y-3">
              <div className="flex justify-between">
                <span className="text-neutral-450 font-medium">Subtotal</span>
                <span className="font-semibold">Rp {Number(order.subtotal).toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-450 font-medium">Pengiriman ({order.courier.toUpperCase()})</span>
                <span className="font-semibold">Rp {Number(order.shippingCost).toLocaleString("id-ID")}</span>
              </div>
              {Number(order.discountAmount) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span className="font-medium">Diskon Kupon</span>
                  <span className="font-semibold">- Rp {Number(order.discountAmount).toLocaleString("id-ID")}</span>
                </div>
              )}
              <div className="border-t border-neutral-150 pt-3 flex justify-between text-sm font-bold dark:border-neutral-800">
                <span>Total Bayar</span>
                <span>Rp {activePrice.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
