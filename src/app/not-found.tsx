import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-8xl font-bold tracking-tighter text-muted-foreground/20">
        404
      </h1>
      <h2 className="text-2xl font-semibold tracking-tight">
        Halaman tidak ditemukan
      </h2>
      <p className="max-w-md text-muted-foreground">
        Halaman yang Anda cari tidak ada atau telah dipindahkan.
      </p>
      <Link
        href="/"
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
