"use client";

import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { LogOut, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LogoutButton() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            toast.success("Berhasil keluar dari akun");
            window.location.href = "/login";
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Gagal keluar akun");
          }
        }
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Terjadi kesalahan sistem");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-neutral-250 bg-white px-5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 hover:text-black transition-all disabled:opacity-50 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800 dark:hover:text-white"
    >
      {isLoggingOut ? (
        <Loader2 size={13} className="animate-spin" />
      ) : (
        <LogOut size={13} />
      )}
      <span>Keluar</span>
    </button>
  );
}
