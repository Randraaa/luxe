import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CheckoutForm } from "@/components/shop/checkout-form";

export default async function CheckoutPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user) {
    redirect("/login?callbackURL=/checkout");
  }

  // Fetch user addresses
  const addresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: { isDefault: "desc" },
  });

  // Fetch cart
  const cart = await prisma.cart.findUnique({
    where: { userId: session.user.id },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: { orderBy: { order: "asc" } },
            },
          },
          variant: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    redirect("/cart");
  }

  // Pre-calculate subtotal and total weight
  let subtotal = 0;
  let totalWeight = 0;
  
  for (const item of cart.items) {
    const price = Number(item.product.discountPrice ?? item.product.price);
    subtotal += price * item.quantity;
    totalWeight += item.product.weight * item.quantity;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Checkout</h1>
      <CheckoutForm
        addresses={addresses}
        subtotal={subtotal}
        totalWeight={totalWeight}
        cartItems={cart.items}
      />
    </div>
  );
}
