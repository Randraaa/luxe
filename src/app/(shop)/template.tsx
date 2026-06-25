import { PageTransition } from "@/components/animations/page-transition";

export default function ShopTemplate({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>;
}
