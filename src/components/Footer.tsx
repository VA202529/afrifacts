import { Link } from "@tanstack/react-router";

const help = [
  { to: "/faq", label: "FAQ" },
  { to: "/shipping", label: "Shipping Policy" },
  { to: "/returns", label: "Return Policy" },
  { to: "/payment", label: "Payment Information" },
  { to: "/contact", label: "Customer Service" },
] as const;

const legal = [
  { to: "/terms", label: "Terms and Conditions" },
  { to: "/privacy", label: "Privacy Policy" },
] as const;

export function Footer() {
  return (
    <footer className="bg-charcoal text-cream/90 mt-24">
      <div className="bg-pattern-mudcloth">
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 grid gap-12 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-terracotta" />
              <span className="font-display text-2xl text-cream">Afrifacts</span>
            </div>
            <p className="mt-4 max-w-md text-cream/70">
              Authentic handmade African wooden sculptures, masks, instruments and cultural art —
              imported with care from artisans across the continent.
            </p>
            <address className="mt-6 not-italic text-sm text-cream/70 space-y-1">
              <p>Amsterdam, Netherlands</p>
              <p>KVK number: 56790414</p>
              <p>
                Phone:{" "}
                <a href="tel:+31684158565" className="hover:text-gold">+31 6 84158565</a>
              </p>
            </address>
            <div className="mt-4 text-sm text-cream/70">
              <p className="text-xs uppercase tracking-[0.25em] text-gold mb-1">Opening hours</p>
              <p>Monday – Saturday · 10:00 – 18:00</p>
              <p>Sunday · Closed</p>
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/shop" className="hover:text-gold">All Products</Link></li>
              <li><Link to="/about" className="hover:text-gold">About</Link></li>
              <li><Link to="/cart" className="hover:text-gold">Cart</Link></li>
              <li><Link to="/contact" className="hover:text-gold">Contact</Link></li>
            </ul>

            <h4 className="text-xs uppercase tracking-[0.25em] text-gold mt-6 mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              {legal.map((l) => (
                <li key={l.to}><Link to={l.to} className="hover:text-gold">{l.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.25em] text-gold mb-4">Customer Care</h4>
            <ul className="space-y-2 text-sm">
              {help.map((l) => (
                <li key={l.to}><Link to={l.to} className="hover:text-gold">{l.label}</Link></li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-cream/10">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-cream/60">
            <p>© {new Date().getFullYear()} Afrifacts. All rights reserved.</p>
            <p>
              Powered by{" "}
              <a
                href="https://vanappiah.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                Van Appiah
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
