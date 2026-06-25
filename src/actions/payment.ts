"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function simulatePaymentStatus(orderId: string, status: "SUCCESS" | "FAILED" | "EXPIRED") {
  try {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
      include: { order: true },
    });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    const orderStatus = status === "SUCCESS" ? "PAID" : status === "FAILED" ? "CANCELLED" : "CANCELLED";
    const paymentStatus = status === "SUCCESS" ? "SUCCESS" : status === "FAILED" ? "FAILED" : "EXPIRED";

    await prisma.$transaction([
      prisma.payment.update({
        where: { orderId },
        data: {
          status: paymentStatus,
          paidAt: status === "SUCCESS" ? new Date() : null,
          method: "bank_transfer",
          transactionId: `TX-${Date.now()}`,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: orderStatus,
        },
      }),
    ]);

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update payment status" };
  }
}
