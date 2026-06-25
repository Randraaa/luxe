"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import type { CartWithItems } from "@/types";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function getCart(): Promise<CartWithItems | null> {
  try {
    const user = await getAuthenticatedUser();
    
    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: {
                  orderBy: { order: "asc" },
                },
              },
            },
            variant: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
        include: {
          items: {
            include: {
              product: {
                include: {
                  images: {
                    orderBy: { order: "asc" },
                  },
                },
              },
              variant: true,
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    return cart as CartWithItems;
  } catch (error) {
    console.error("Error fetching cart:", error);
    return null;
  }
}

export async function addToCart(variantId: string, quantity: number = 1) {
  try {
    const user = await getAuthenticatedUser();
    
    // Find variant
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });

    if (!variant) throw new Error("Variant not found");
    if (variant.stock < quantity) throw new Error("Insufficient stock");

    let cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id },
      });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: cart.id,
          variantId,
        },
      },
    });

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (variant.stock < newQty) throw new Error("Insufficient stock");
      
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: variant.productId,
          variantId,
          quantity,
        },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add to cart" };
  }
}

export async function updateCartItem(itemId: string, quantity: number) {
  try {
    await getAuthenticatedUser();
    
    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: itemId },
      });
    } else {
      const cartItem = await prisma.cartItem.findUnique({
        where: { id: itemId },
        include: { variant: true },
      });

      if (!cartItem) throw new Error("Cart item not found");
      if (cartItem.variant.stock < quantity) throw new Error("Insufficient stock");

      await prisma.cartItem.update({
        where: { id: itemId },
        data: { quantity },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update item" };
  }
}

export async function removeCartItem(itemId: string) {
  try {
    await getAuthenticatedUser();
    
    await prisma.cartItem.delete({
      where: { id: itemId },
    });

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to remove item" };
  }
}

export async function clearCart() {
  try {
    const user = await getAuthenticatedUser();
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    revalidatePath("/cart");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to clear cart" };
  }
}
