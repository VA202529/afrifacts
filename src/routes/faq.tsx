import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SectionTitle } from "@/components/SectionTitle";
import { ChevronDown } from "lucide-react";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "Afrifacts | Frequently Asked Questions" },
      { name: "description", content: "Answers to common questions about ordering authentic African art from Afrifacts." },
    ],
    links: [{ rel: "canonical", href: "/faq" }],
  }),
  component: Faq,
});

const faqs = [
  {
    q: "Are your products really handmade?",
    a: "Yes. Every sculpture, mask and instrument is handcrafted by African artisans. Small variations in colour, grain and finish are natural and part of each piece's character.",
  },
  {
    q: "Where do the pieces come from?",
    a: "Our collection is sourced directly from artisans across West, Central and East Africa, including Ghana, Senegal, Côte d'Ivoire, Mali, Kenya and Tanzania.",
  },
  {
    q: "Is the wood treated or sealed?",
    a: "Most pieces are finished with natural oils or beeswax. Care instructions are included with your order.",
  },
  {
    q: "How does ordering work?",
    a: "Orders placed via the website are treated as order requests. Afrifacts will contact you within 1–2 business days to confirm availability, shipping cost and payment.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "SEPA bank transfer, iDEAL and PayPal. International payment options are available on request.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes, we ship throughout the EU and worldwide on request. International rates and delivery times are confirmed per order.",
  },
  {
    q: "Can I return a piece?",
    a: "Consumers in the EU have a 14-day right of withdrawal. See our Return Policy for details.",
  },
  {
    q: "Do you offer custom pieces?",
    a: "Yes — contact us with your idea and we will discuss possibilities with our artisans.",
  },
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-8 py-16">
      <SectionTitle eyebrow="Help" title="Frequently Asked Questions" subtitle="Everything you may want to know before ordering." />
      <div className="mt-10 divide-y divide-border border-y border-border">
        {faqs.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={i}>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="w-full flex items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-display text-lg text-wood">{f.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen && <p className="pb-6 text-foreground/80 leading-relaxed">{f.a}</p>}
            </div>
          );
        })}
      </div>
      <p className="mt-10 text-sm text-muted-foreground">
        Still have a question? <Link to="/contact" className="text-terracotta hover:underline">Get in touch</Link>.
      </p>
    </div>
  );
}
