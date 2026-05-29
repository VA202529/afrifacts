import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Minus, Plus, ShoppingBag, ArrowLeft, Hammer, TreePine, Sparkles, Shield, Globe2, Zap } from "lucide-react";
import { fetchProduct, fetchProducts, type Product } from "@/lib/products";
import { useCart, formatEUR } from "@/lib/cart";
import { ProductCard } from "@/components/ProductCard";
import { ShareButtons } from "@/components/ShareButtons";

export const Route = createFileRoute("/products/$id")({
  loader: async ({ params }) => {
    const product = await fetchProduct(params.id);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product | Afrifacts" }] };
    return {
      meta: [
        { title: `${p.name} | Afrifacts` },
        { name: "description", content: p.shortDescription },
        { property: "og:title", content: `${p.name} — Afrifacts` },
        { property: "og:description", content: p.shortDescription },
        { property: "og:type", content: "product" },
        ...(p.image ? [{ property: "og:image", content: p.image }] : []),
      ],
      links: [{ rel: "canonical", href: `/products/${p.id}` }],
    };
  },
  component: ProductDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-4xl text-wood">Product not found</h1>
      <Link to="/shop" className="mt-6 inline-block text-terracotta">Back to shop</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-3xl px-5 py-24 text-center">
      <h1 className="font-display text-3xl text-wood">Something went wrong</h1>
      <p className="text-muted-foreground mt-2">{error.message}</p>
    </div>
  ),
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { add, setOpen } = useCart();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState(product.image || product.images[0]?.url || "");

  useEffect(() => {
    fetchProducts()
      .then((items) => setRelated(items.filter((p) => p.id !== product.id).slice(0, 3)))
      .catch(() => {});
  }, [product.id]);

  useEffect(() => {
    setActiveImage(product.image || product.images[0]?.url || "");
  }, [product]);

  const gallery = product.images.length ? product.images : product.image ? [{ url: product.image }] : [];

  const buyNow = () => {
    if (product.stock === 0) return;
    add(product.id, qty);
    navigate({ to: "/checkout" });
  };

  const trust = [
    { icon: Hammer, label: "Handmade item" },
    { icon: TreePine, label: "Natural wood" },
    { icon: Globe2, label: "Authentic African art" },
    { icon: Sparkles, label: "Unique variations" },
    { icon: Shield, label: "Secure order request" },
  ];

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-10 md:py-16">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-wood mb-8">
        <ArrowLeft className="h-4 w-4" /> Back to shop
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        <div>
          <div className="bg-secondary aspect-square overflow-hidden">
            {activeImage ? (
              <img src={activeImage} alt={product.name} width={1200} height={1200} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center px-8 text-center text-muted-foreground">No image available</div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {gallery.map((img, index) => (
                <button
                  key={img.image_id || img.url || index}
                  onClick={() => setActiveImage(img.url)}
                  className={`aspect-square overflow-hidden border ${activeImage === img.url ? "border-wood" : "border-border"}`}
                  aria-label={`Show image ${index + 1}`}
                >
                  <img src={img.url} alt={`${product.name} ${index + 1}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-xs uppercase tracking-[0.25em] text-gold">{product.category}</div>
          <h1 className="mt-3 font-display text-4xl md:text-5xl text-wood leading-tight">{product.name}</h1>
          <div className="mt-4 font-display text-3xl text-terracotta">{formatEUR(product.price)}</div>

          <p className="mt-6 text-foreground/80 leading-relaxed">{product.description}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="uppercase tracking-[0.2em] text-xs text-muted-foreground">Material</dt>
              <dd className="mt-1 text-foreground">{product.material}</dd>
            </div>
            <div>
              <dt className="uppercase tracking-[0.2em] text-xs text-muted-foreground">Origin</dt>
              <dd className="mt-1 text-foreground">{product.origin}</dd>
            </div>
          </dl>

          <p className="mt-6 italic text-sm text-muted-foreground border-l-2 border-gold pl-4">
            Each item is handmade and may contain small natural variations.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center border border-border">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-12 w-12 inline-flex items-center justify-center hover:bg-secondary"><Minus className="h-4 w-4" /></button>
              <span className="w-12 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="h-12 w-12 inline-flex items-center justify-center hover:bg-secondary"><Plus className="h-4 w-4" /></button>
            </div>
          <button
            onClick={() => { add(product.id, qty); setOpen(true); }}
            disabled={product.stock === 0}
            className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 bg-wood text-cream h-12 px-6 text-sm uppercase tracking-[0.2em] hover:bg-charcoal transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
              <ShoppingBag className="h-4 w-4" /> Add to Cart
            </button>
          </div>
          <button
            onClick={buyNow}
            disabled={product.stock === 0}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-terracotta text-cream h-12 px-6 text-sm uppercase tracking-[0.2em] hover:bg-ember transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Zap className="h-4 w-4" /> Buy Now — Order Directly
          </button>

          <ul className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3">
            {trust.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 border border-border bg-secondary/40 px-3 py-3 text-xs text-foreground/80">
                <Icon className="h-4 w-4 text-terracotta shrink-0" />
                <span>{label}</span>
              </li>
            ))}
          </ul>

          <ShareButtons title={`${product.name} — Afrifacts`} text={product.shortDescription} />
        </div>
      </div>

      <section className="mt-24">
        <h2 className="font-display text-2xl text-wood mb-8">You may also like</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12">
          {related.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
