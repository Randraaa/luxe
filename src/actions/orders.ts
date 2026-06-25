"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@prisma/client";

async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  waybillNumber?: string
) {
  try {
    await verifyAdmin();

    const data: any = { status };
    if (waybillNumber !== undefined) {
      data.waybillNumber = waybillNumber;
    }

    const order = await prisma.order.update({
      where: { id: orderId },
      data,
    });

    revalidatePath("/admin/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true, order };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update order status" };
  }
}

export async function deleteOrder(id: string) {
  try {
    await verifyAdmin();

    await prisma.order.delete({
      where: { id },
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete order" };
  }
}

