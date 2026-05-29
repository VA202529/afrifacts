import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";

export const Route = createFileRoute("/shop")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["products"],
      queryFn: fetchProducts,
      staleTime: 60_000,
    }),
  head: () => ({
    meta: [
      { title: "Shop | Afrifacts — African Art & Wooden Sculptures" },
      { name: "description", content: "Browse Afrifacts' full collection of handmade African wooden sculptures, masks, instruments and decorative art." },
      { property: "og:title", content: "Shop the Afrifacts Collection" },
      { property: "og:description", content: "Authentic handmade African art, wooden sculptures, masks and instruments." },
    ],
    links: [{ rel: "canonical", href: "/shop" }],
  }),
  component: Shop,
});

function Shop() {
  const { data: products = [], isError } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });
  const categories = useMemo(() => ["All", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? products : products.filter((p) => p.category === active);

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24">
      <SectionTitle eyebrow="The Collection" title="Shop African Art & Sculpture" subtitle="Handcrafted sculptures, masks, instruments and cultural decor, sourced directly from artisans." />
      {isError && (
        <p className="mt-6 border-l-2 border-gold bg-secondary/50 px-4 py-3 text-sm text-muted-foreground">
          Live products could not be loaded. Check the Google Sheet and Apps Script deployment.
        </p>
      )}
      <div className="mt-10 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`px-4 py-2 text-xs uppercase tracking-[0.2em] border transition-colors ${
              active === c
                ? "bg-wood text-cream border-wood"
                : "bg-transparent text-foreground/70 border-border hover:border-wood hover:text-wood"
            }`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
        {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
      </div>
      {!isError && filtered.length === 0 && (
        <p className="mt-12 text-muted-foreground">No active products are available in Google Sheets.</p>
      )}
    </div>
  );
}
