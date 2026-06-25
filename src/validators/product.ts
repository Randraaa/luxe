import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(3, "Nama produk minimal 3 karakter"),
  description: z.string().min(10, "Deskripsi minimal 10 karakter"),
  brand: z.string().optional(),
  price: z.number().positive("Harga harus lebih dari 0"),
  discountPrice: z.number().positive().optional().nullable(),
  sku: z.string().min(3, "SKU minimal 3 karakter"),
  weight: z.number().positive("Berat harus lebih dari 0"),
  categoryId: z.string().min(1, "Kategori harus dipilih"),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const productVariantSchema = z.object({
  size: z.string().min(1, "Size harus dipilih"),
  color: z.string().min(1, "Color harus dipilih"),
  colorHex: z.string().optional(),
  stock: z.number().int().min(0, "Stock tidak boleh negatif"),
});

export type ProductInput = z.infer<typeof productSchema>;
export type ProductVariantInput = z.infer<typeof productVariantSchema>;
