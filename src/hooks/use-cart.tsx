"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from "@/actions/cart";
import { getWishlist, toggleWishlist as toggleWishlistAction } from "@/actions/wishlist";
import type { CartWithItems } from "@/types";
import { toast } from "sonner";

interface CartContextType {
  cart: CartWithItems | null;
  isLoading: boolean;
  totalItemsCount: number;
  subtotal: number;
  refreshCart: () => Promise<void>;
  addToCart: (variantId: string, quantity?: number) => Promise<any>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  // Wishlist global states
  wishlist: { productId: string }[];
  wishlistCount: number;
  toggleWishlist: (productId: string) => Promise<any>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
  // Language states
  lang: "id" | "en";
  setLang: (lang: "id" | "en") => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartWithItems | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [wishlist, setWishlist] = useState<{ productId: string }[]>([]);
  const [lang, setLangState] = useState<"id" | "en">("id");

  useEffect(() => {
    const savedLang = localStorage.getItem("luxe-lang");
    if (savedLang === "en" || savedLang === "id") {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: "id" | "en") => {
    setLangState(newLang);
    localStorage.setItem("luxe-lang", newLang);
  };

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const serverCart = await getCart();
      setCart(serverCart);
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchWishlist = useCallback(async () => {
    try {
      const serverWishlist = await getWishlist();
      setWishlist(serverWishlist);
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    }
  }, []);

  useEffect(() => {
    fetchCart();
    fetchWishlist();
  }, [fetchCart, fetchWishlist]);

  const handleAddToCart = async (variantId: string, quantity: number = 1) => {
    const response = await addToCart(variantId, quantity);
    if (response.success) {
      toast.success("Produk berhasil ditambahkan ke keranjang");
      await fetchCart();
    } else {
      toast.error(response.error || "Gagal menambahkan produk");
    }
    return response;
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    // Optimistic update
    if (cart) {
      const updatedItems = cart.items
        .map((item) => {
          if (item.id === itemId) {
            return { ...item, quantity: newQuantity };
          }
          return item;
        })
        .filter((item) => item.quantity > 0);

      setCart({ ...cart, items: updatedItems } as any);
    }

    const response = await updateCartItem(itemId, newQuantity);
    if (response.success) {
      await fetchCart();
    } else {
      toast.error(response.error || "Gagal memperbarui kuantitas");
      await fetchCart();
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    // Optimistic update
    if (cart) {
      const updatedItems = cart.items.filter((item) => item.id !== itemId);
      setCart({ ...cart, items: updatedItems } as any);
    }

    const response = await removeCartItem(itemId);
    if (response.success) {
      toast.success("Produk dihapus dari keranjang");
      await fetchCart();
    } else {
      toast.error(response.error || "Gagal menghapus produk");
      await fetchCart();
    }
  };

  const handleClearCart = async () => {
    setCart(null);
    const response = await clearCart();
    if (response.success) {
      toast.success("Keranjang belanja dikosongkan");
      await fetchCart();
    } else {
      toast.error(response.error || "Gagal mengosongkan keranjang");
      await fetchCart();
    }
  };

  const handleToggleWishlist = async (productId: string) => {
    // Optimistic update local state
    const isAlreadyIn = wishlist.some((item) => item.productId === productId);
    if (isAlreadyIn) {
      setWishlist(wishlist.filter((item) => item.productId !== productId));
    } else {
      setWishlist([...wishlist, { productId }]);
    }

    const response = await toggleWishlistAction(productId);
    if (response.success) {
      toast.success(response.message);
      await fetchWishlist();
    } else {
      toast.error(response.error || "Gagal memperbarui wishlist");
      await fetchWishlist();
    }
    return response;
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.productId === productId);
  };

  const totalItemsCount = cart?.items.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  const subtotal = cart?.items.reduce((acc, item) => {
    const price = Number(item.product.discountPrice ?? item.product.price);
    return acc + price * item.quantity;
  }, 0) || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        totalItemsCount,
        subtotal,
        refreshCart: fetchCart,
        addToCart: handleAddToCart,
        updateQuantity: handleUpdateQuantity,
        removeItem: handleRemoveItem,
        clearCart: handleClearCart,
        // Wishlist
        wishlist,
        wishlistCount: wishlist.length,
        toggleWishlist: handleToggleWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
        // Language
        lang,
        setLang,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
