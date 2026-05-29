import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
import { useCart, formatEUR } from "@/lib/cart";
import type { Product } from "@/lib/products";

export function ProductCard({ product }: { product: Product }) {
  const { add, setOpen } = useCart();
  return (
    <article className="group flex flex-col">
      <Link
        to="/products/$id"
        params={{ id: product.id }}
        className="relative block overflow-hidden bg-secondary aspect-square"
      >
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            width={800}
            height={800}
            className="h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-5 text-center text-sm text-muted-foreground">
            No image available
          </div>
        )}
        <span className="absolute left-3 top-3 bg-cream/90 backdrop-blur px-2 py-1 text-[10px] uppercase tracking-widest text-wood">
          {product.category}
        </span>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <Link to="/products/$id" params={{ id: product.id }} className="block">
            <h3 className="font-display text-xl text-foreground leading-tight truncate">{product.name}</h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{product.shortDescription}</p>
          {product.stock === 0 && <p className="mt-1 text-xs uppercase tracking-[0.18em] text-destructive">Out of stock</p>}
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-lg text-wood">{formatEUR(product.price)}</div>
        </div>
      </div>
      <button
        onClick={() => {
          add(product.id, 1);
          setOpen(true);
        }}
        disabled={product.stock === 0}
        className="mt-4 inline-flex items-center justify-center gap-2 bg-wood text-cream px-4 py-2.5 text-sm tracking-wide uppercase hover:bg-charcoal transition-colors disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ShoppingBag className="h-4 w-4" /> Add to Cart
      </button>
    </article>
  );
}
