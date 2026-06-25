import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().min(1, "Label alamat harus diisi"),
  recipientName: z.string().min(2, "Nama penerima minimal 2 karakter"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  street: z.string().min(5, "Alamat lengkap minimal 5 karakter"),
  district: z.string().min(2, "Kecamatan harus diisi"),
  city: z.string().min(2, "Kota harus diisi"),
  province: z.string().min(2, "Provinsi harus diisi"),
  postalCode: z.string().min(5, "Kode pos harus 5 digit"),
  isDefault: z.boolean().default(false),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Pilih alamat pengiriman"),
  courier: z.string().min(1, "Pilih kurir pengiriman"),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export type AddressInput = z.infer<typeof addressSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
