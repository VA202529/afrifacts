import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useCart, formatEUR } from "@/lib/cart";
import { createBackendOrder } from "@/lib/products";
import { SectionTitle } from "@/components/SectionTitle";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout | Afrifacts" },
      { name: "description", content: "Complete your Afrifacts order." },
    ],
    links: [{ rel: "canonical", href: "/checkout" }],
  }),
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(5).max(40),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(1).max(120),
  postal: z.string().trim().min(2).max(20),
  country: z.string().trim().min(2).max(80),
});

type FormState = z.infer<typeof schema>;

function Checkout() {
  const { detailed, subtotal, clear } = useCart();
  const [form, setForm] = useState<FormState>({
    name: "", email: "", phone: "", address: "", city: "", postal: "", country: "Netherlands",
  });
  const [agree, setAgree] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<{
    id: string;
    items: typeof detailed;
    total: number;
    customer: FormState;
    date: Date;
    marketing: boolean;
  } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { setError(r.error.issues[0].message); return; }
    if (detailed.length === 0) { setError("Your cart is empty."); return; }
    if (!agree) { setError("Please accept the Terms and Conditions and Privacy Policy to continue."); return; }
    setError(null);
    setSubmitting(true);
    try {
      const created = await createBackendOrder({
        customer_name: form.name,
        email: form.email,
        phone: form.phone,
        address: `${form.address}, ${form.country}`,
        customer_city: form.city,
        customer_postal_code: form.postal,
        delivery_type: "verzenden",
        notes: marketing ? "Customer opted in to receive product updates." : "",
        items: detailed.map(({ product, qty }) => ({ product_id: product.product_id || product.id, quantity: qty })),
      });
      setOrder({
        id: created.order_id,
        items: detailed,
        total: Number(created.total_price) || subtotal,
        customer: form,
        date: new Date(),
        marketing,
      });
      clear();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order could not be placed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="mx-auto max-w-2xl px-5 md:px-8 py-20">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.3em] text-gold">Order received</div>
          <h1 className="mt-3 font-display text-4xl text-wood">Thank you, {order.customer.name.split(" ")[0]}!</h1>
          <p className="mt-3 text-muted-foreground">Order reference <span className="text-wood font-medium">{order.id}</span></p>
        </div>

        <div className="mt-10 grid md:grid-cols-2 gap-6">
          <div className="bg-secondary p-6">
            <h2 className="font-display text-xl text-wood">Customer details</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Name</dt><dd className="text-right">{order.customer.name}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Email</dt><dd className="text-right break-all">{order.customer.email}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Phone</dt><dd className="text-right">{order.customer.phone}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Address</dt><dd className="text-right">{order.customer.address}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">City</dt><dd className="text-right">{order.customer.postal} {order.customer.city}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Country</dt><dd className="text-right">{order.customer.country}</dd></div>
              <div className="flex justify-between gap-4 pt-2 border-t border-wood/15"><dt className="text-muted-foreground">Order date</dt><dd className="text-right">{order.date.toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}</dd></div>
            </dl>
          </div>
          <div className="bg-secondary p-6">
            <h2 className="font-display text-xl text-wood">Ordered products</h2>
            <ul className="mt-4 divide-y divide-wood/15">
              {order.items.map(({ product, qty, lineTotal }) => (
                <li key={product.id} className="py-3 flex justify-between text-sm">
                  <span>{product.name} × {qty}</span>
                  <span>{formatEUR(lineTotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-wood/20 flex justify-between font-display text-xl text-wood">
              <span>Total</span><span>{formatEUR(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="mt-8 border-l-2 border-gold bg-secondary/40 p-5 text-sm text-foreground/85 leading-relaxed">
          <strong className="text-wood">Note:</strong> This is an order request. Afrifacts will contact
          you to confirm availability, payment and delivery. A confirmation will be sent to{" "}
          <span className="text-wood">{order.customer.email}</span>.
          {order.marketing && (
            <span className="block mt-2 text-muted-foreground">You opted in to receive updates about Afrifacts products.</span>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link to="/shop" className="inline-block bg-wood text-cream px-7 py-4 text-sm uppercase tracking-[0.2em] hover:bg-charcoal">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 md:px-8 py-16">
      <SectionTitle eyebrow="Checkout" title="Shipping details" />
      <div className="mt-10 grid lg:grid-cols-[1fr_380px] gap-12">
        <form onSubmit={submit} className="space-y-4">
          {([
            ["name", "Full name", "text"],
            ["email", "Email", "email"],
            ["phone", "Phone", "tel"],
            ["address", "Address", "text"],
          ] as const).map(([key, label, type]) => (
            <div key={key}>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className="mt-2 w-full border border-border bg-background px-4 py-3 focus:outline-none focus:border-wood"
              />
            </div>
          ))}
          <div className="grid sm:grid-cols-3 gap-4">
            {([
              ["city", "City"],
              ["postal", "Postal code"],
              ["country", "Country"],
            ] as const).map(([key, label]) => (
              <div key={key}>
                <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
                <input
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="mt-2 w-full border border-border bg-background px-4 py-3 focus:outline-none focus:border-wood"
                />
              </div>
            ))}
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="mt-1 h-4 w-4 accent-terracotta shrink-0"
              />
              <span className="text-foreground/85">
                I agree to the{" "}
                <Link to="/terms" className="text-terracotta underline hover:text-ember">Terms and Conditions</Link>{" "}
                and{" "}
                <Link to="/privacy" className="text-terracotta underline hover:text-ember">Privacy Policy</Link>.
                <span className="text-destructive"> *</span>
              </span>
            </label>
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={marketing}
                onChange={(e) => setMarketing(e.target.checked)}
                className="mt-1 h-4 w-4 accent-terracotta shrink-0"
              />
              <span className="text-foreground/85">
                I would like to receive updates about Afrifacts products. (optional)
              </span>
            </label>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
          <button type="submit" disabled={submitting} className="w-full bg-terracotta hover:bg-ember text-cream py-4 text-sm uppercase tracking-[0.2em] transition-colors disabled:cursor-not-allowed disabled:opacity-60">
            {submitting ? "Placing Order..." : "Place Order Request"}
          </button>
          <p className="text-xs text-muted-foreground">
            This is an order request. Afrifacts will contact you to confirm availability, payment and delivery.
          </p>
        </form>

        <aside className="bg-secondary p-6 h-fit">
          <h3 className="font-display text-xl text-wood">Your order</h3>
          {detailed.length === 0 ? (
            <p className="mt-4 text-sm text-muted-foreground">Your cart is empty. <Link to="/shop" className="underline">Browse shop</Link>.</p>
          ) : (
            <>
              <ul className="mt-4 divide-y divide-wood/15">
                {detailed.map(({ product, qty, lineTotal }) => (
                  <li key={product.id} className="py-3 flex justify-between text-sm gap-3">
                    <span className="truncate">{product.name} × {qty}</span>
                    <span className="shrink-0">{formatEUR(lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 pt-4 border-t border-wood/20 flex justify-between font-display text-xl text-wood">
                <span>Total</span><span>{formatEUR(subtotal)}</span>
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
