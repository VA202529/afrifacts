import { createFileRoute, Link } from "@tanstack/react-router";
import craftImg from "@/assets/about-craft.jpg";
import { SectionTitle } from "@/components/SectionTitle";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Afrifacts | Authentic African Art from Amsterdam" },
      { name: "description", content: "Afrifacts is an Amsterdam-based importer of authentic African wooden sculptures, masks and cultural art, working directly with artisans." },
      { property: "og:title", content: "About Afrifacts" },
      { property: "og:description", content: "Authentic African art, imported with care from artisans across the continent." },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: About,
});

function About() {
  return (
    <>
      <section className="bg-wood text-cream py-20 md:py-28">
        <div className="mx-auto max-w-4xl px-5 md:px-8 text-center">
          <div className="text-xs uppercase tracking-[0.35em] text-gold mb-5">Our Story</div>
          <h1 className="font-display text-4xl md:text-6xl text-balance">
            Carrying African craft, story and soul to Europe.
          </h1>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-28 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="relative aspect-[4/5] overflow-hidden">
          <img src={craftImg} alt="Artisan carving wood" loading="lazy" width={1200} height={800} className="absolute inset-0 h-full w-full object-cover" />
        </div>
        <div className="space-y-6 text-foreground/85 leading-relaxed">
          <SectionTitle eyebrow="Afrifacts" title="Authentic art, ethically sourced." />
          <p>
            Afrifacts is a small Amsterdam-based studio dedicated to authentic African
            craftsmanship. We work directly with carvers, weavers and instrument makers
            across West and East Africa to bring genuine handmade pieces to Europe.
          </p>
          <p>
            Our focus is on wooden sculpture, ceremonial masks, traditional instruments,
            and decorative cultural objects — each chosen for its craft, story and
            cultural significance. Beyond retail, we also import and export goods to and
            from Africa, supporting artisan workshops in the regions where we source.
          </p>
          <p>
            Every piece in our collection is handmade. Small natural variations, tool
            marks and grain differences aren't flaws — they are the signature of human
            hands shaping natural material.
          </p>
        </div>
      </section>

      <section className="bg-secondary py-20">
        <div className="mx-auto max-w-7xl px-5 md:px-8 grid md:grid-cols-3 gap-10">
          {[
            { t: "Heritage", d: "Pieces rooted in the symbolism and tradition of their region of origin." },
            { t: "Craftsmanship", d: "Hand-carved, hand-finished — never mass produced." },
            { t: "Direct Sourcing", d: "We work with artisans and importers directly, with fair sourcing in mind." },
          ].map((v) => (
            <div key={v.t}>
              <div className="text-xs uppercase tracking-[0.25em] text-terracotta mb-3">{v.t}</div>
              <p className="font-display text-2xl text-wood leading-snug">{v.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 md:px-8 py-20 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-wood">Visit or get in touch</h2>
        <p className="mt-4 text-muted-foreground">
          Based in Amsterdam · KVK 56790414 · Mon–Sat 10:00–18:00
        </p>
        <Link to="/contact" className="mt-8 inline-block bg-wood text-cream px-7 py-4 text-sm uppercase tracking-[0.2em] hover:bg-charcoal">
          Contact Afrifacts
        </Link>
      </section>
    </>
  );
}
