import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart, formatEUR } from "@/lib/cart";
import { SectionTitle } from "@/components/SectionTitle";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart | Afrifacts" },
      { name: "description", content: "Review the items in your Afrifacts cart and continue to checkout." },
    ],
    links: [{ rel: "canonical", href: "/cart" }],
  }),
  component: CartPage,
});

function CartPage() {
  const { detailed, subtotal, setQty, remove } = useCart();

  if (detailed.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <SectionTitle align="center" eyebrow="Cart" title="Your cart is empty" subtitle="Discover handmade African sculpture, masks, instruments and more." />
        <Link to="/shop" className="mt-10 inline-block bg-wood text-cream px-7 py-4 text-sm uppercase tracking-[0.2em] hover:bg-charcoal">
          Browse the Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8 py-16">
      <SectionTitle eyebrow="Cart" title="Your Selection" />
      <div className="mt-10 grid lg:grid-cols-[1fr_360px] gap-12">
        <div className="divide-y divide-border border-y border-border">
          {detailed.map(({ product, qty, lineTotal }) => (
            <div key={product.id} className="py-6 flex gap-5">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-28 w-28 object-cover" />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center bg-secondary px-3 text-center text-xs text-muted-foreground">No image</div>
              )}
              <div className="flex-1 min-w-0">
                <Link to="/products/$id" params={{ id: product.id }} className="font-display text-xl text-wood hover:text-terracotta">{product.name}</Link>
                <div className="text-sm text-muted-foreground">{formatEUR(product.price)}</div>
                <div className="mt-3 inline-flex items-center border border-border">
                  <button onClick={() => setQty(product.id, qty - 1)} className="h-9 w-9 inline-flex items-center justify-center hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                  <span className="w-10 text-center text-sm">{qty}</span>
                  <button onClick={() => setQty(product.id, qty + 1)} className="h-9 w-9 inline-flex items-center justify-center hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-xl text-wood">{formatEUR(lineTotal)}</div>
                <button onClick={() => remove(product.id)} className="mt-3 text-muted-foreground hover:text-destructive text-sm inline-flex items-center gap-1"><Trash2 className="h-4 w-4" /> Remove</button>
              </div>
            </div>
          ))}
        </div>

        <aside className="bg-secondary p-6 h-fit">
          <h3 className="font-display text-xl text-wood">Order summary</h3>
          <div className="mt-4 flex justify-between text-sm">
            <span>Subtotal</span><span>{formatEUR(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm text-muted-foreground">
            <span>Shipping</span><span>Calculated at checkout</span>
          </div>
          <div className="mt-4 pt-4 border-t border-wood/20 flex justify-between font-display text-xl text-wood">
            <span>Total</span><span>{formatEUR(subtotal)}</span>
          </div>
          <Link to="/checkout" className="mt-6 block text-center bg-wood text-cream py-3.5 text-sm uppercase tracking-[0.2em] hover:bg-charcoal transition-colors">
            Proceed to Checkout
          </Link>
        </aside>
      </div>
    </div>
  );
}
