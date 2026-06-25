"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Semua kolom harus diisi");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (password.length < 8) {
      toast.error("Password minimal 8 karakter");
      return;
    }

    setIsLoading(true);
    try {
      await signUp.email(
        {
          email,
          password,
          name,
          callbackURL: "/",
        },
        {
          onRequest: () => setIsLoading(true),
          onSuccess: () => {
            toast.success("Pendaftaran berhasil! Silakan cek email Anda untuk verifikasi.");
            router.push("/login");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Gagal melakukan pendaftaran.");
            setIsLoading(false);
          },
        }
      );
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan sistem.");
      setIsLoading(false);
    }
  };

  return (
    <FadeIn className="w-full max-w-md">
      <div className="rounded-2xl border border-white/5 bg-neutral-900 p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block text-xl font-bold tracking-[0.2em] uppercase text-white hover:text-neutral-300 transition-colors">
            LUXE
          </Link>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
            Mulai Akun Anda
          </h2>
          <p className="mt-1.5 text-sm text-neutral-400 font-light">
            Daftar untuk menikmati pengalaman belanja premium.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm outline-none transition-all focus:border-white/20 focus:bg-white/10 text-white placeholder:text-neutral-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm outline-none transition-all focus:border-white/20 focus:bg-white/10 text-white placeholder:text-neutral-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Password
            </label>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 8 karakter"
                className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-4 pr-10 text-sm outline-none transition-all focus:border-white/20 focus:bg-white/10 text-white placeholder:text-neutral-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-200 transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Konfirmasi Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password"
              className="mt-1.5 h-11 w-full rounded-lg border border-white/10 bg-white/5 px-4 text-sm outline-none transition-all focus:border-white/20 focus:bg-white/10 text-white placeholder:text-neutral-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white font-semibold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50 select-none cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Daftar Akun
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-white hover:underline transition-colors hover:text-neutral-200"
          >
            Login Di Sini
          </Link>
        </p>
      </div>
    </FadeIn>
  );
}
