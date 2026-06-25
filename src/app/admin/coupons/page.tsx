import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CouponsManager } from "./coupons-manager";

export default async function AdminCouponsPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all coupons
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <CouponsManager initialCoupons={coupons as any} />
  );
}
