"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    return null;
  }
  return session.user;
}

export async function toggleWishlist(productId: string) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return { success: false, error: "Silakan login terlebih dahulu untuk menambahkan produk ke wishlist" };
    }

    // Check if product exists in database
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      return { success: false, error: "Produk tidak ditemukan" };
    }

    // Check if already in wishlist
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    if (existing) {
      // Remove from wishlist
      await prisma.wishlist.delete({
        where: { id: existing.id },
      });
      
      revalidatePath("/wishlist");
      revalidatePath(`/products/${product.slug}`);
      return { success: true, action: "removed", message: "Produk berhasil dihapus dari wishlist" };
    } else {
      // Add to wishlist
      await prisma.wishlist.create({
        data: {
          userId: user.id,
          productId: productId,
        },
      });

      revalidatePath("/wishlist");
      revalidatePath(`/products/${product.slug}`);
      return { success: true, action: "added", message: "Produk berhasil ditambahkan ke wishlist" };
    }
  } catch (error: any) {
    console.error("Error toggling wishlist:", error);
    return { success: false, error: error.message || "Gagal memperbarui wishlist" };
  }
}

export async function checkWishlistStatus(productId: string): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return false;

    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId: productId,
        },
      },
    });

    return !!existing;
  } catch (error) {
    console.error("Error checking wishlist status:", error);
    return false;
  }
}

export async function getWishlist() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) return [];
    
    return await prisma.wishlist.findMany({
      where: { userId: user.id },
      select: { productId: true },
    });
  } catch (error) {
    console.error("Error fetching wishlist list:", error);
    return [];
  }
}
