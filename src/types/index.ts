import type { Prisma } from "@prisma/client";

export type ProductWithDetails = Prisma.ProductGetPayload<{
  include: {
    category: true;
    images: true;
    variants: true;
    reviews: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            image: true;
          };
        };
      };
    };
  };
}>;

export type ProductCard = Prisma.ProductGetPayload<{
  include: {
    images: true;
    category: true;
  };
}>;

export type CartWithItems = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: {
          include: {
            images: true;
          };
        };
        variant: true;
      };
    };
  };
}>;

export type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    items: true;
    payment: true;
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

export interface ProductFilters {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  sort?: "newest" | "price-asc" | "price-desc" | "popular";
  page?: number;
  sale?: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AnalyticsStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProductsSold: number;
  revenueChange: number;
  ordersChange: number;
}

export interface RevenueData {
  date: string;
  revenue: number;
  orders: number;
}
