import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { CustomersManager } from "./customers-manager";

export default async function AdminCustomersPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all customers/users
  const customers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <CustomersManager initialCustomers={customers} currentAdminId={session.user.id} />
  );
}
