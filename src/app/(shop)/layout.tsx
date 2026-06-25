import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dark bg-neutral-950 text-white min-h-screen flex flex-col selection:bg-white selection:text-black">
      <Navbar />
      <main className="flex-1 w-full relative">
        {children}
      </main>
      {/* Global Transition Gradient from Dark to Light before Footer */}
      <div className="bg-gradient-to-b from-neutral-950 via-neutral-950/70 to-white h-24 sm:h-32 w-full" />
      <Footer />
    </div>
  );
}
