import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PaymentSimulator } from "@/components/shop/payment-simulator";

interface PageProps {
  searchParams: Promise<{
    orderId?: string;
  }>;
}

export default async function PaymentPage({ searchParams }: PageProps) {
  const { orderId } = await searchParams;

  if (!orderId) {
    redirect("/");
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      payment: true,
    },
  });

  if (!order) {
    redirect("/");
  }

  // If already paid, redirect to confirmation/tracking page
  if (order.status !== "PENDING") {
    redirect(`/orders/${order.id}`);
  }

  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <PaymentSimulator order={order} />
    </div>
  );
}
