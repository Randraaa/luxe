"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}) {
  try {
    await verifyAdmin();

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug.toLowerCase().replace(/\s+/g, "-"),
        description: data.description,
        image: data.image,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create category" };
  }
}

export async function updateCategory(
  id: string,
  data: {
    name: string;
    slug: string;
    description?: string;
    image?: string;
    order?: number;
    isActive?: boolean;
  }
) {
  try {
    await verifyAdmin();

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug.toLowerCase().replace(/\s+/g, "-"),
        description: data.description,
        image: data.image,
        order: data.order ?? 0,
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true, category };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update category" };
  }
}

export async function deleteCategory(id: string) {
  try {
    await verifyAdmin();

    // Check if there are products in this category
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      throw new Error("Cannot delete category containing products");
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/categories");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete category" };
  }
}
