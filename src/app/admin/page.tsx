import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { FadeIn } from "@/components/animations/fade-in";
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, BarChart3 } from "lucide-react";
import { AdminCharts } from "@/components/admin/admin-charts";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Verify Admin role
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch aggregates
  const [
    revenueAgg,
    ordersCount,
    customersCount,
    soldAgg,
    recentOrders,
    categorySales,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { totalAmount: true },
      where: {
        status: { in: ["PAID", "PROCESSING", "PACKING", "SHIPPING", "DELIVERED"] },
      },
    }),
    prisma.order.count(),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.orderItem.aggregate({
      _sum: { quantity: true },
      where: {
        order: {
          status: { in: ["PAID", "PROCESSING", "PACKING", "SHIPPING", "DELIVERED"] },
        },
      },
    }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      _sum: { quantity: true },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 4,
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.totalAmount || 0);
  const totalOrders = ordersCount;
  const totalCustomers = customersCount;
  const totalProductsSold = soldAgg._sum.quantity || 0;

  // Mock revenue chart data for the week
  const revenueChartData = [
    { name: "Sen", revenue: totalRevenue * 0.1, orders: Math.floor(totalOrders * 0.1) },
    { name: "Sel", revenue: totalRevenue * 0.15, orders: Math.floor(totalOrders * 0.12) },
    { name: "Rab", revenue: totalRevenue * 0.12, orders: Math.floor(totalOrders * 0.08) },
    { name: "Kam", revenue: totalRevenue * 0.2, orders: Math.floor(totalOrders * 0.22) },
    { name: "Jum", revenue: totalRevenue * 0.18, orders: Math.floor(totalOrders * 0.18) },
    { name: "Sab", revenue: totalRevenue * 0.13, orders: Math.floor(totalOrders * 0.15) },
    { name: "Min", revenue: totalRevenue * 0.12, orders: Math.floor(totalOrders * 0.15) },
  ];

  return (
    <div className="space-y-10">
      <FadeIn>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Admin</h1>
          <p className="mt-1.5 text-sm text-neutral-450">
            Ikhtisar performa penjualan, pesanan, dan analitik toko Anda.
          </p>
        </div>
      </FadeIn>

      {/* Stats Grid */}
      <FadeIn delay={0.2} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Pendapatan",
            value: `Rp ${totalRevenue.toLocaleString("id-ID")}`,
            icon: DollarSign,
            color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400",
          },
          {
            label: "Total Pesanan",
            value: totalOrders.toString(),
            icon: ShoppingBag,
            color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400",
          },
          {
            label: "Total Pelanggan",
            value: totalCustomers.toString(),
            icon: Users,
            color: "text-violet-600 bg-violet-50 dark:bg-violet-950/20 dark:text-violet-400",
          },
          {
            label: "Produk Terjual",
            value: totalProductsSold.toString(),
            icon: Package,
            color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400",
          },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50"
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                {stat.label}
              </p>
              <h3 className="text-xl font-bold mt-1">{stat.value}</h3>
            </div>
          </div>
        ))}
      </FadeIn>

      {/* Charts section & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts component */}
        <div className="lg:col-span-2">
          <AdminCharts data={revenueChartData} />
        </div>

        {/* Recent Orders List */}
        <FadeIn delay={0.4} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm dark:border-neutral-850 dark:bg-neutral-900/50">
          <h3 className="text-sm font-semibold mb-6 flex items-center gap-2">
            <TrendingUp size={16} className="text-neutral-500" />
            Pesanan Terbaru
          </h3>
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <p className="text-xs text-neutral-400 text-center py-6">Belum ada pesanan masuk.</p>
            ) : (
              recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between border-b border-neutral-50 pb-3 last:border-b-0 last:pb-0 dark:border-neutral-850"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                      {order.user.name}
                    </p>
                    <p className="text-[10px] text-neutral-450 mt-0.5 truncate">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0 pl-2">
                    <p className="text-xs font-bold">
                      Rp {Number(order.totalAmount).toLocaleString("id-ID")}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[8px] font-bold uppercase mt-1 ${
                        order.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/20"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
