import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Phone, MapPin, Clock } from "lucide-react";
import { z } from "zod";
import { SectionTitle } from "@/components/SectionTitle";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact | Afrifacts Amsterdam" },
      { name: "description", content: "Get in touch with Afrifacts in Amsterdam. Call +31 6 84158565 or send us a message." },
      { property: "og:title", content: "Contact Afrifacts" },
      { property: "og:description", content: "Visit or contact our Amsterdam studio." },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(5, "Message is too short").max(1500),
});

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = schema.safeParse(form);
    if (!r.success) { setError(r.error.issues[0].message); return; }
    setError(null);
    setSent(true);
  };

  return (
    <div className="mx-auto max-w-7xl px-5 md:px-8 py-16 md:py-24 grid md:grid-cols-2 gap-12 lg:gap-20">
      <div>
        <SectionTitle eyebrow="Get in touch" title="Visit us in Amsterdam" subtitle="We're happy to answer questions about pieces, custom orders, or import inquiries." />
        <ul className="mt-10 space-y-6">
          <li className="flex items-start gap-4">
            <span className="h-10 w-10 inline-flex items-center justify-center bg-secondary text-wood shrink-0"><MapPin className="h-5 w-5" /></span>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gold">Location</div>
              <div className="mt-1 text-foreground">Amsterdam, Netherlands</div>
              <div className="text-sm text-muted-foreground">KVK 56790414</div>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="h-10 w-10 inline-flex items-center justify-center bg-secondary text-wood shrink-0"><Phone className="h-5 w-5" /></span>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gold">Phone</div>
              <a href="tel:+31684158565" className="mt-1 block text-foreground hover:text-terracotta">+31 6 84158565</a>
            </div>
          </li>
          <li className="flex items-start gap-4">
            <span className="h-10 w-10 inline-flex items-center justify-center bg-secondary text-wood shrink-0"><Clock className="h-5 w-5" /></span>
            <div>
              <div className="text-xs uppercase tracking-[0.25em] text-gold">Opening hours</div>
              <div className="mt-1 text-foreground">Monday – Saturday · 10:00 – 18:00</div>
              <div className="text-sm text-muted-foreground">Sunday · Closed</div>
            </div>
          </li>
        </ul>
      </div>

      <form onSubmit={submit} className="bg-card border border-border p-6 md:p-10 shadow-warm">
        <h2 className="font-display text-2xl text-wood">Send a message</h2>
        {sent ? (
          <div className="mt-6 p-6 bg-secondary text-wood">
            Thanks — your message has been received. We'll reply within one business day.
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={100}
                className="mt-2 w-full border border-border bg-background px-4 py-3 focus:outline-none focus:border-wood"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={255}
                className="mt-2 w-full border border-border bg-background px-4 py-3 focus:outline-none focus:border-wood"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Message</label>
              <textarea
                rows={5}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={1500}
                className="mt-2 w-full border border-border bg-background px-4 py-3 focus:outline-none focus:border-wood resize-none"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button type="submit" className="w-full bg-wood text-cream py-3.5 text-sm uppercase tracking-[0.2em] hover:bg-charcoal transition-colors">
              Send Message
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
