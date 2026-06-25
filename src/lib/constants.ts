export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "LUXE";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const PRODUCTS_PER_PAGE = 12;
export const REVIEWS_PER_PAGE = 5;

export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu Pembayaran",
  PAID: "Sudah Dibayar",
  PROCESSING: "Diproses",
  PACKING: "Sedang Dikemas",
  SHIPPING: "Dalam Pengiriman",
  DELIVERED: "Diterima",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: "Menunggu",
  SUCCESS: "Berhasil",
  FAILED: "Gagal",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  REFUNDED: "Dikembalikan",
};

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
  { label: "New Arrivals", href: "/products?sort=newest" },
  { label: "Sale", href: "/products?sale=true" },
] as const;
