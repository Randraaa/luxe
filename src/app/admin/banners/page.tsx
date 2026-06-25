import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { BannersManager } from "./banners-manager";

export default async function AdminBannersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all banners
  const banners = await prisma.banner.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <BannersManager initialBanners={banners} />
  );
}
