import { notFound } from "next/navigation";
import { getProductBySlug } from "@/actions/products";
import { ProductDetails } from "@/components/shop/product-details";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6 lg:px-8 sm:pt-36 bg-neutral-950 text-white">
      <ProductDetails product={product} />
    </div>
  );
}
