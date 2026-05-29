import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const { count, setOpen } = useCart();
  const [mobile, setMobile] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-cream/85 backdrop-blur-md border-b border-border">
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 md:h-20 flex items-center justify-between gap-6">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="inline-block h-2 w-2 rounded-full bg-terracotta group-hover:bg-gold transition-colors" />
          <span className="font-display text-2xl tracking-tight text-wood">Afrifacts</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: n.to === "/" }}
              activeProps={{ className: "text-wood" }}
              inactiveProps={{ className: "text-foreground/70 hover:text-wood" }}
              className="text-sm uppercase tracking-[0.18em] transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open cart"
            className="relative inline-flex items-center justify-center h-10 w-10 hover:bg-secondary/60 transition-colors"
          >
            <ShoppingBag className="h-5 w-5 text-wood" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-terracotta text-cream text-[10px] font-medium h-5 min-w-5 px-1 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
          <button
            onClick={() => setMobile((v) => !v)}
            aria-label="Menu"
            className="md:hidden inline-flex items-center justify-center h-10 w-10"
          >
            {mobile ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {mobile && (
        <div className="md:hidden border-t border-border bg-cream">
          <nav className="px-5 py-4 flex flex-col gap-3">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setMobile(false)}
                className="py-2 text-sm uppercase tracking-[0.18em] text-foreground/80"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
