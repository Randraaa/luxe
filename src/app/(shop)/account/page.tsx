import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/animations/fade-in";
import { ShoppingBag, MapPin, Calendar, User, LogOut, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { ORDER_STATUS_LABELS } from "@/lib/constants";
import { LogoutButton } from "./logout-button";
import { AddressManager } from "./address-manager";

export default async function AccountPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login");
  }

  const user = session.user;

  // Fetch all user addresses
  const addresses = await prisma.address.findMany({
    where: { userId: user.id },
    orderBy: { isDefault: "desc" },
  });

  // Fetch recent orders (take 3)
  const recentOrders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
    include: {
      items: true,
    },
  });

  // Status color mapper helper
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-amber-50 text-amber-700 border-amber-200/50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50";
      case "PAID":
      case "DELIVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200/50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50";
      case "CANCELLED":
        return "bg-red-50 text-red-700 border-red-200/50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200/50 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/50";
    }
  };

  const formattedJoinDate = new Date(user.createdAt).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-12 sm:px-6 lg:px-8 sm:pt-36 space-y-10 bg-neutral-950 text-white">
      
      {/* Upper Profile Header Banner */}
      <FadeIn className="relative overflow-hidden rounded-3xl border border-white/5 bg-neutral-900 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 justify-between">
          <div className="flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
            
            {/* Avatar block */}
            <div className="h-20 w-20 rounded-full bg-white text-black flex items-center justify-center text-3xl font-extrabold shadow-lg">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">{user.name}</h1>
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-black">
                    <ShieldCheck size={10} />
                    Admin
                  </span>
                )}
              </div>
              <p className="text-sm text-neutral-450 font-light">{user.email}</p>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-neutral-500 pt-1 font-light">
                <Calendar size={13} />
                <span>Bergabung {formattedJoinDate}</span>
              </div>
            </div>

          </div>

          <div className="flex flex-wrap gap-3 items-center justify-center w-full sm:w-auto">
            {user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="inline-flex h-10 items-center justify-center rounded-full bg-white px-5 text-xs font-semibold text-black hover:bg-neutral-200 transition-all select-none cursor-pointer"
              >
                Panel Admin
              </Link>
            )}
            <LogoutButton />
          </div>
        </div>
      </FadeIn>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Recent Orders (8/12 width) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
              <ShoppingBag size={18} />
              Pesanan Terbaru
            </h2>
            {recentOrders.length > 0 && (
              <Link href="/orders" className="text-xs text-neutral-550 hover:text-white flex items-center gap-1 font-medium transition-colors">
                Lihat Semua
                <ArrowRight size={12} />
              </Link>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-12 text-center bg-neutral-900/50">
              <ShoppingBag size={36} className="mx-auto text-neutral-500 mb-3" />
              <p className="text-sm text-neutral-450 font-medium">Belum ada riwayat pesanan</p>
              <p className="text-xs text-neutral-500 mt-1 font-light">
                Mulai isi keranjang belanjaan Anda dengan produk-produk fashion premium LUXE.
              </p>
              <Link
                href="/products"
                className="mt-5 inline-flex h-9 items-center justify-center rounded-full bg-white px-5 text-xs font-semibold text-black hover:bg-neutral-200 transition-colors select-none cursor-pointer"
              >
                Mulai Belanja
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => {
                const totalQuantity = order.items.reduce((acc, item) => acc + item.quantity, 0);
                const orderDate = new Date(order.createdAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                });
                return (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 rounded-2xl border border-white/5 bg-neutral-900 hover:shadow-md transition-shadow gap-4 text-white"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono font-bold tracking-wider uppercase text-neutral-500">
                          #{order.orderNumber}
                        </span>
                        <span className={`inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold ${getStatusColor(order.status)}`}>
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </span>
                      </div>
                      
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-white">
                          Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                        </p>
                        <p className="text-xs text-neutral-450 font-light">
                          {orderDate} • {totalQuantity} barang
                        </p>
                      </div>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="w-full sm:w-auto inline-flex h-9 items-center justify-center rounded-full border border-white/10 px-4 text-xs font-semibold hover:bg-white/10 text-neutral-300 transition-colors"
                    >
                      Detail Pesanan
                    </Link>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Address & Contact Info (4/12 width) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 text-white">
              <MapPin size={18} />
              Alamat Pengiriman
            </h2>
          </div>

          <AddressManager initialAddresses={addresses} />
        </div>

      </div>

    </div>
  );
}
