"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { clearCart } from "./cart";

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

// Add User Address
export async function addAddress(input: {
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}) {
  try {
    const user = await getAuthenticatedUser();

    // If setting default, unset other defaults
    if (input.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: user.id,
        label: input.label,
        recipientName: input.recipientName,
        phone: input.phone,
        street: input.street,
        district: input.district,
        city: input.city,
        province: input.province,
        postalCode: input.postalCode,
        isDefault: input.isDefault,
      },
    });

    revalidatePath("/checkout");
    revalidatePath("/profile");
    return { success: true, address };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to add address" };
  }
}

// Calculate shipping cost based on weight and courier
export async function calculateShipping(weight: number, courier: string) {
  const rates: Record<string, number> = {
    "jne-reg": 9000,
    "jne-yes": 18000,
    "sicepat-reg": 8000,
    "sicepat-best": 15000,
    "jnt-reg": 9000,
  };

  const courierKey = courier.toLowerCase().replace(/\s+/g, "-");
  const baseRate = rates[courierKey] || 10000;
  
  const kg = Math.ceil(weight / 1000);
  const totalCost = baseRate * Math.max(1, kg);

  return totalCost;
}

// Validate coupon code
export async function validateCoupon(code: string, subtotal: number) {
  const coupon = await prisma.coupon.findUnique({
    where: { code, isActive: true },
  });

  if (!coupon) {
    return { valid: false, error: "Kupon tidak ditemukan atau tidak aktif" };
  }

  if (coupon.expiresAt < new Date()) {
    return { valid: false, error: "Kupon telah kedaluwarsa" };
  }

  if (Number(coupon.minPurchase) > subtotal) {
    return {
      valid: false,
      error: `Minimal pembelian untuk kupon ini adalah Rp ${Number(coupon.minPurchase).toLocaleString("id-ID")}`,
    };
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, error: "Batas pemakaian kupon telah habis" };
  }

  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount));
    }
  } else {
    discountAmount = Number(coupon.discountValue);
  }

  return {
    valid: true,
    coupon,
    discountAmount,
  };
}

// Process Checkout & Place Order
export async function createOrder(input: {
  addressId: string;
  courier: string;
  couponCode?: string;
  notes?: string;
}) {
  try {
    const user = await getAuthenticatedUser();

    const cart = await prisma.cart.findUnique({
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
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      throw new Error("Keranjang belanja kosong");
    }

    const address = await prisma.address.findFirst({
      where: { id: input.addressId, userId: user.id },
    });

    if (!address) {
      throw new Error("Alamat pengiriman tidak ditemukan");
    }

    // Validate stocks
    for (const item of cart.items) {
      if (item.variant.stock < item.quantity) {
        throw new Error(`Stok produk ${item.product.name} (${item.variant.size} - ${item.variant.color}) tidak mencukupi`);
      }
    }

    let subtotal = 0;
    let totalWeight = 0;
    
    for (const item of cart.items) {
      const price = Number(item.product.discountPrice ?? item.product.price);
      subtotal += price * item.quantity;
      totalWeight += item.product.weight * item.quantity;
    }

    const shippingCost = await calculateShipping(totalWeight, input.courier);
    
    let discountAmount = 0;
    let couponId: string | undefined = undefined;

    if (input.couponCode) {
      const couponVal = await validateCoupon(input.couponCode, subtotal);
      if (couponVal.valid && couponVal.coupon) {
        discountAmount = couponVal.discountAmount;
        couponId = couponVal.coupon.id;
      }
    }

    const totalAmount = subtotal + shippingCost - discountAmount;
    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          addressId: input.addressId,
          subtotal,
          shippingCost,
          discountAmount,
          totalAmount,
          courier: input.courier,
          couponId,
          notes: input.notes,
          shippingName: address.recipientName,
          shippingPhone: address.phone,
          shippingAddress: `${address.street}, ${address.district}, ${address.city}, ${address.province} ${address.postalCode}`,
          items: {
            create: cart.items.map((item) => {
              const price = item.product.price;
              const discountPrice = item.product.discountPrice;
              const activePrice = discountPrice ?? price;
              return {
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity,
                price: price,
                discountPrice: discountPrice,
                productName: item.product.name,
                productImage: item.product.images?.[0]?.url || "",
                size: item.variant.size,
                color: item.variant.color,
              };
            }),
          },
        },
      });

      for (const item of cart.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
            soldCount: { increment: item.quantity },
          },
        });
      }

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            usageCount: { increment: 1 },
          },
        });
      }

      const payment = await tx.payment.create({
        data: {
          orderId: order.id,
          amount: totalAmount,
          snapToken: `mock-snap-token-${Date.now()}`,
          snapUrl: `/checkout/payment?orderId=${order.id}`,
        },
      });

      return { order, payment };
    });

    await clearCart();
    
    revalidatePath("/orders");
    return { success: true, orderId: result.order.id, snapUrl: result.payment.snapUrl };
  } catch (error: any) {
    console.error("Checkout order creation error:", error);
    return { success: false, error: error.message || "Gagal membuat pesanan" };
  }
}
