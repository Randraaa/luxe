import type { Metadata } from "next";
import { Bodoni_Moda, Pacifico } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { CartProvider } from "@/hooks/use-cart";
import { SmoothScrollProvider } from "@/components/providers/smooth-scroll-provider";

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bodoni",
});

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pacifico",
});

export const metadata: Metadata = {
  title: {
    default: "LUXE — Premium Fashion Store",
    template: "%s | LUXE",
  },
  description:
    "Discover curated premium fashion collections. Modern, elegant, and timeless style for the contemporary individual.",
  keywords: [
    "fashion",
    "premium",
    "clothing",
    "style",
    "ecommerce",
    "luxury",
    "modern fashion",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "LUXE",
    title: "LUXE — Premium Fashion Store",
    description:
      "Discover curated premium fashion collections. Modern, elegant, and timeless style.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={`${bodoni.variable} ${pacifico.variable}`}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <CartProvider>
          <SmoothScrollProvider>
            {children}
          </SmoothScrollProvider>
        </CartProvider>
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
