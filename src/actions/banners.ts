"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { BannerPosition } from "@prisma/client";

async function verifyAdmin() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createBanner(data: {
  title: string;
  subtitle?: string;
  image: string;
  mobileImage?: string;
  link?: string;
  position: BannerPosition;
  order?: number;
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
}) {
  try {
    await verifyAdmin();

    const banner = await prisma.banner.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        mobileImage: data.mobileImage,
        link: data.link,
        position: data.position,
        order: data.order ?? 0,
        isActive: data.isActive ?? true,
        startDate: data.startDate ?? new Date(),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, banner };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create banner" };
  }
}

export async function updateBanner(
  id: string,
  data: {
    title: string;
    subtitle?: string;
    image: string;
    mobileImage?: string;
    link?: string;
    position: BannerPosition;
    order?: number;
    isActive?: boolean;
    startDate?: Date;
    endDate?: Date;
  }
) {
  try {
    await verifyAdmin();

    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        image: data.image,
        mobileImage: data.mobileImage,
        link: data.link,
        position: data.position,
        order: data.order ?? 0,
        isActive: data.isActive,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true, banner };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update banner" };
  }
}

export async function deleteBanner(id: string) {
  try {
    await verifyAdmin();

    await prisma.banner.delete({
      where: { id },
    });

    revalidatePath("/admin/banners");
    revalidatePath("/");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete banner" };
  }
}
