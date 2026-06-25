import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CategoriesManager } from "./categories-manager";

export default async function AdminCategoriesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all categories
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });

  return (
    <CategoriesManager initialCategories={categories} />
  );
}
