import { Link } from "@tanstack/react-router";
import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart, formatEUR } from "@/lib/cart";

export function CartDrawer() {
  const { open, setOpen, detailed, subtotal, setQty, remove } = useCart();
  return (
    <>
      <div
        className={`fixed inset-0 z-50 bg-charcoal/50 transition-opacity ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-cream shadow-warm flex flex-col transition-transform ${open ? "translate-x-0" : "translate-x-full"}`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="font-display text-xl text-wood">Your Cart</h2>
          <button onClick={() => setOpen(false)} aria-label="Close" className="h-9 w-9 inline-flex items-center justify-center hover:bg-secondary/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {detailed.length === 0 && (
            <p className="text-muted-foreground text-sm py-10 text-center">Your cart is empty.</p>
          )}
          {detailed.map(({ product, qty, lineTotal }) => (
            <div key={product.id} className="flex gap-3 border-b border-border pb-4">
              {product.image ? (
                <img src={product.image} alt={product.name} className="h-20 w-20 object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center bg-secondary px-2 text-center text-[10px] text-muted-foreground">No image</div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-display text-base text-wood truncate">{product.name}</div>
                <div className="text-xs text-muted-foreground">{formatEUR(product.price)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => setQty(product.id, qty - 1)} className="h-7 w-7 border border-border inline-flex items-center justify-center hover:bg-secondary"><Minus className="h-3 w-3" /></button>
                  <span className="w-6 text-center text-sm">{qty}</span>
                  <button onClick={() => setQty(product.id, qty + 1)} className="h-7 w-7 border border-border inline-flex items-center justify-center hover:bg-secondary"><Plus className="h-3 w-3" /></button>
                  <button onClick={() => remove(product.id)} aria-label="Remove" className="ml-auto text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="font-display text-wood">{formatEUR(lineTotal)}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-border px-5 py-5 space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-display text-xl text-wood">{formatEUR(subtotal)}</span>
          </div>
          <Link
            to="/checkout"
            onClick={() => setOpen(false)}
            className="block text-center bg-wood text-cream py-3 uppercase tracking-[0.2em] text-sm hover:bg-charcoal transition-colors"
          >
            Checkout
          </Link>
          <Link
            to="/cart"
            onClick={() => setOpen(false)}
            className="block text-center text-sm text-muted-foreground hover:text-wood"
          >
            View full cart
          </Link>
        </div>
      </aside>
    </>
  );
}
