import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white px-4 selection:bg-white selection:text-black">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold tracking-[0.2em] uppercase text-white hover:text-neutral-300 transition-colors">
            LUXE
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
