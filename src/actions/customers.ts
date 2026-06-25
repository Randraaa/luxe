"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createCustomer(data: {
  name: string;
  email: string;
  phone?: string;
  role: Role;
  password?: string;
}) {
  try {
    await verifyAdmin();

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      throw new Error("Email already registered");
    }

    const defaultPassword = data.password || "password123";
    const passwordHash = await hashPassword(defaultPassword);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        emailVerified: true,
        accounts: {
          create: {
            accountId: data.email,
            providerId: "credential",
            password: passwordHash,
          },
        },
      },
    });

    revalidatePath("/admin/customers");
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create customer" };
  }
}

export async function updateCustomer(
  id: string,
  data: {
    name: string;
    email: string;
    phone?: string;
    role: Role;
    password?: string;
  }
) {
  try {
    await verifyAdmin();

    // Check if email is taken by other user
    const existing = await prisma.user.findFirst({
      where: {
        email: data.email,
        NOT: { id },
      },
    });
    if (existing) {
      throw new Error("Email already taken");
    }

    const updateData: any = {
      name: data.name,
      email: data.email,
      phone: data.phone,
      role: data.role,
    };

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    // If password is provided, update it in Account
    if (data.password) {
      const passwordHash = await hashPassword(data.password);
      
      // Better Auth stores credentials in the Account table
      // Find the account or create if not exists
      const account = await prisma.account.findFirst({
        where: { userId: id, providerId: "credential" },
      });

      if (account) {
        await prisma.account.update({
          where: { id: account.id },
          data: {
            accountId: data.email,
            password: passwordHash,
          },
        });
      } else {
        await prisma.account.create({
          data: {
            userId: id,
            accountId: data.email,
            providerId: "credential",
            password: passwordHash,
          },
        });
      }
    }

    revalidatePath("/admin/customers");
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update customer" };
  }
}

export async function deleteCustomer(id: string) {
  try {
    const admin = await verifyAdmin();

    if (admin.id === id) {
      throw new Error("You cannot delete your own admin account");
    }

    await prisma.user.delete({
      where: { id },
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete customer" };
  }
}
