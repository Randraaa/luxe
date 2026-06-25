"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { ProductFilters, PaginatedResult, ProductWithDetails } from "@/types";

export async function getProducts(filters: ProductFilters = {}): Promise<PaginatedResult<any>> {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    sizes,
    colors,
    sort = "newest",
    page = 1,
    sale,
  } = filters;

  const pageSize = 12;
  const skip = (page - 1) * pageSize;

  const where: any = {
    isActive: true,
  };

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { brand: { contains: search, mode: "insensitive" } },
    ];
  }

  if (category && category !== "all") {
    where.category = {
      slug: category,
    };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  if (sale) {
    where.discountPrice = { not: null };
  }

  if ((sizes && sizes.length > 0) || (colors && colors.length > 0)) {
    where.variants = {
      some: {},
    };
    if (sizes && sizes.length > 0) {
      where.variants.some.size = { in: sizes };
    }
    if (colors && colors.length > 0) {
      where.variants.some.color = { in: colors };
    }
  }

  let orderBy: any = { createdAt: "desc" };
  if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "popular") orderBy = { soldCount: "desc" };

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        category: true,
      },
      orderBy,
      skip,
      take: pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  return (await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      images: {
        orderBy: { order: "asc" },
      },
      variants: {
        orderBy: { size: "asc" },
      },
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  })) as ProductWithDetails | null;
}

export async function createProduct(data: any) {
  const { name, slug, description, brand, price, discountPrice, sku, weight, categoryId, variants, images } = data;

  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      brand,
      price,
      discountPrice,
      sku,
      weight,
      categoryId,
      images: {
        create: images.map((img: any, idx: number) => ({
          url: img.url,
          publicId: img.publicId,
          order: idx,
        })),
      },
      variants: {
        create: variants.map((v: any) => ({
          size: v.size,
          color: v.color,
          colorHex: v.colorHex,
          stock: v.stock,
        })),
      },
    },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return product;
}

export async function updateProduct(id: string, data: any) {
  const { name, slug, description, brand, price, discountPrice, sku, weight, categoryId, isActive } = data;

  const product = await prisma.product.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      brand,
      price,
      discountPrice,
      sku,
      weight,
      categoryId,
      isActive,
    },
  });

  revalidatePath("/products");
  revalidatePath(`/products/${slug}`);
  revalidatePath("/admin/products");
  return product;
}

export async function deleteProduct(id: string) {
  // Soft delete
  const product = await prisma.product.update({
    where: { id },
    data: { isActive: false },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return product;
}
