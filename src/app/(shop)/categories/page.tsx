import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { CategoriesClient } from "./categories-client";

export const revalidate = 3600; // Cache for 1 hour

export const metadata: Metadata = {
  title: "Categories | LUXE Premium",
  description: "Browse our premium curated fashion categories. From minimalist men and women apparel to handcrafted accessories and footwear.",
  openGraph: {
    title: "LUXE Curated Categories",
    description: "Explore our finest premium collections designed for the contemporary individual.",
  },
};

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return (
    <div className="bg-neutral-950 text-white min-h-screen pt-12 sm:pt-20">
      <CategoriesClient categories={categories} />
    </div>
  );
}
