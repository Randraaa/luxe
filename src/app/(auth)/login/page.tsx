"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { FadeIn } from "@/components/animations/fade-in";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Email dan password harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      await signIn.email(
        {
          email,
          password,
          callbackURL: "/",
        },
        {
          onRequest: () => setIsLoading(true),
          onSuccess: () => {
            toast.success("Login berhasil! Selamat datang kembali.");
            router.push("/");
            router.refresh();
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Email atau password salah.");
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

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn.social({
        provider: "google",
        callbackURL: "/",
      });
    } catch (err) {
      console.error(err);
      toast.error("Gagal melakukan login dengan Google.");
      setIsGoogleLoading(false);
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
            Selamat Datang Kembali
          </h2>
          <p className="mt-1.5 text-sm text-neutral-400 font-light">
            Masuk untuk mengakses keranjang dan pesanan Anda.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-neutral-400 hover:text-white transition-colors"
              >
                Lupa Password?
              </Link>
            </div>
            <div className="relative mt-1.5">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-white font-semibold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50 select-none cursor-pointer"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/5" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-900 px-2 text-neutral-400">
              Atau lanjut dengan
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading || isGoogleLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 font-medium text-neutral-200 transition-all hover:bg-white/10 disabled:opacity-50 select-none cursor-pointer"
        >
          {isGoogleLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {/* Google SVG Icon */}
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.48 14.99 1 12 1 7.35 1 3.37 3.75 1.58 7.78l3.92 3.04C6.44 7.62 9 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.27H12v4.51h6.44c-.28 1.48-1.12 2.73-2.38 3.58l3.7 2.87c2.16-1.99 3.43-4.92 3.43-8.69z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.5 14.26c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.58 6.82C.57 8.87 0 11.12 0 13.5s.57 4.63 1.58 6.68l3.92-3.04c-.23-.69-.36-1.43-.36-2.2z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.7-2.87c-1.03.69-2.35 1.1-4.26 1.1-3 0-5.56-2.58-6.5-5.78L1.58 15.58C3.37 19.61 7.35 22.36 12 22.36z"
                />
              </svg>
              Google
            </>
          )}
        </button>

        <p className="mt-6 text-center text-sm text-neutral-400">
          Belum punya akun?{" "}
          <Link
            href="/register"
            className="font-semibold text-white hover:underline transition-colors hover:text-neutral-200"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>
    </FadeIn>
  );
}
