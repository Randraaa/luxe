"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { DiscountType } from "@prisma/client";

async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createCoupon(data: {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  startDate?: Date;
  expiresAt: Date;
  isActive?: boolean;
}) {
  try {
    await verifyAdmin();

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().replace(/\s+/g, ""),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase ?? 0,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        startDate: data.startDate ?? new Date(),
        expiresAt: new Date(data.expiresAt),
        isActive: data.isActive ?? true,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, coupon };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create coupon" };
  }
}

export async function updateCoupon(
  id: string,
  data: {
    code: string;
    description?: string;
    discountType: DiscountType;
    discountValue: number;
    minPurchase?: number;
    maxDiscount?: number;
    usageLimit?: number;
    startDate?: Date;
    expiresAt: Date;
    isActive?: boolean;
  }
) {
  try {
    await verifyAdmin();

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: data.code.toUpperCase().replace(/\s+/g, ""),
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minPurchase: data.minPurchase ?? 0,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        expiresAt: new Date(data.expiresAt),
        isActive: data.isActive,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, coupon };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update coupon" };
  }
}

export async function deleteCoupon(id: string) {
  try {
    await verifyAdmin();

    await prisma.coupon.delete({
      where: { id },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete coupon" };
  }
}
