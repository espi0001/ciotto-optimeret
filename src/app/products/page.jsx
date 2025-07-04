export const dynamic = "force-dynamic";
import ProductGrid from "@/components/ProductDetails/ProductGrid";
import { getAll } from "@/utils/supabase/api";
import TitleSection from "@/components/Sections/TitleSection";
import Button from "@/components/UI/Button";

export const metadata = {
  title: "Ciotto | Products",
  description: "Products of Ari Prasetya",
};

export default async function Products() {
  const productsRaw = await getAll("ciotto");
  // Map to the format expected by ProductGrid
  const products = (productsRaw || []).map((item) => ({
    id: item.id,
    image: Array.isArray(item.image) ? item.image[0] : typeof item.image === "string" && item.image.startsWith("[") ? JSON.parse(item.image)[0] : item.image,
    title: item.name || item.title,
    link: `/products/${item.slug}`,
  }));
  return (
    <section className="px-section">
      <article className="flex flex-col gap-8">
        <TitleSection title="Products" description="Handcrafted with precision and care, each product is made to order — shaped by hand, with time and attention to detail. Explore the collection below, or visit Ciotto at Godthåbsvej 18A to discover more pieces. To place an order, just reach out." />

        <Button withCopy delayVariant={1.5} variant="primary" link="/contact">
          Contact to purchase
        </Button>
      </article>
      <article className="mt-10 md:mt-28">
        <ProductGrid products={products} />
      </article>
    </section>
  );
}
