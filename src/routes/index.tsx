import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import heroImg from "@/assets/hero.jpg";
import craftImg from "@/assets/about-craft.jpg";
import { fetchProducts } from "@/lib/products";
import { ProductCard } from "@/components/ProductCard";
import { SectionTitle } from "@/components/SectionTitle";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  loader: ({ context }) =>
    context.queryClient.ensureQueryData({
      queryKey: ["products"],
      queryFn: fetchProducts,
      staleTime: 60_000,
    }),
  head: () => ({
    meta: [
      { title: "Afrifacts | Authentic African Art & Wooden Sculptures" },
      { name: "description", content: "Discover authentic handmade African wooden sculptures, masks, instruments and cultural art from Afrifacts in Amsterdam." },
      { property: "og:title", content: "Afrifacts — Authentic African Art" },
      { property: "og:description", content: "Handcrafted wooden sculptures and cultural art from across the African continent." },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });
  const featured = products.slice(0, 4);
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-charcoal text-cream">
        <img
          src={heroImg}
          alt="Handcrafted African wooden sculpture"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover opacity-65"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal via-charcoal/70 to-transparent" />
        <div className="relative mx-auto max-w-7xl px-5 md:px-8 py-28 md:py-44 lg:py-52">
          <div className="max-w-2xl animate-fade-up">
            <div className="text-xs uppercase tracking-[0.35em] text-gold mb-6">Amsterdam · Est. handcrafted</div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-cream text-balance">
              Authentic African Art &amp;{" "}
              <span className="italic text-gold">Handmade Wooden Sculptures</span>
            </h1>
            <p className="mt-6 text-lg md:text-xl text-cream/80 max-w-xl text-balance">
              Discover handcrafted pieces with cultural meaning, natural materials, and timeless beauty.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/shop" className="inline-flex items-center gap-2 bg-terracotta hover:bg-ember text-cream px-7 py-4 text-sm uppercase tracking-[0.2em] transition-colors">
                Shop Collection <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/about" className="inline-flex items-center gap-2 border border-cream/40 hover:border-gold hover:text-gold text-cream px-7 py-4 text-sm uppercase tracking-[0.2em] transition-colors">
                About Afrifacts
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-3 gap-10">
        {[
          { t: "Handcrafted", d: "Every piece is shaped by hand by artisans across the African continent." },
          { t: "Natural Materials", d: "Sustainably sourced hardwoods, hide, fibre and natural finishes." },
          { t: "Cultural Heritage", d: "Each work carries the symbolism and story of its origin region." },
        ].map((v) => (
          <div key={v.t} className="border-t border-border pt-6">
            <div className="text-xs uppercase tracking-[0.25em] text-gold mb-3">{v.t}</div>
            <p className="font-display text-2xl text-wood leading-snug">{v.d}</p>
          </div>
        ))}
      </section>

      {/* Featured */}
      <section className="mx-auto max-w-7xl px-5 md:px-8 pb-20">
        <div className="flex items-end justify-between mb-12 gap-6 flex-wrap">
          <SectionTitle eyebrow="The Collection" title="Featured Pieces" subtitle="A curated selection from our latest arrivals — sculpture, masks, decor and instruments." />
          <Link to="/shop" className="text-sm uppercase tracking-[0.2em] text-wood border-b border-wood pb-1 hover:text-terracotta hover:border-terracotta">View all</Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
        {featured.length === 0 && (
          <p className="text-muted-foreground">No active products are available in Google Sheets.</p>
        )}
      </section>

      {/* Story */}
      <section className="bg-wood text-cream py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img src={craftImg} alt="Artisan carving in workshop" loading="lazy" width={1200} height={800} className="absolute inset-0 h-full w-full object-cover" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-gold mb-5">Our Story</div>
            <h2 className="font-display text-4xl md:text-5xl text-cream text-balance">
              From the hands of artisans to your home in Europe.
            </h2>
            <p className="mt-6 text-cream/80 text-lg">
              Afrifacts works directly with carvers and craftspeople across West and East Africa,
              importing wooden sculpture, masks, instruments and decorative objects with the care
              they deserve.
            </p>
            <Link to="/about" className="mt-8 inline-flex items-center gap-2 text-gold border-b border-gold pb-1 text-sm uppercase tracking-[0.2em] hover:text-cream hover:border-cream">
              Read more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
