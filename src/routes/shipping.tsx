import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2 } from "@/components/LegalLayout";

export const Route = createFileRoute("/shipping")({
  head: () => ({
    meta: [
      { title: "Afrifacts | Shipping Policy" },
      { name: "description", content: "Shipping options, delivery times and costs for Afrifacts orders." },
    ],
    links: [{ rel: "canonical", href: "/shipping" }],
  }),
  component: Shipping,
});

function Shipping() {
  return (
    <LegalLayout
      eyebrow="Customer Care"
      title="Shipping Policy"
      intro="How we deliver authentic African art around the world."
    >
      <H2>Where we ship</H2>
      <p>
        Afrifacts ships within the Netherlands, the European Union and worldwide on request.
        International shipping rates and timelines are confirmed per order.
      </p>

      <H2>Delivery times</H2>
      <p>
        Within the Netherlands: 2–5 business days. Within the EU: 5–10 business days. Outside the
        EU: 10–21 business days, depending on destination and customs.
      </p>

      <H2>Shipping costs</H2>
      <p>
        Shipping is calculated based on weight, size and destination. The exact amount is confirmed
        when Afrifacts contacts you about your order request.
      </p>

      <H2>Packaging</H2>
      <p>
        Every piece is carefully packed to protect the wood, finish and details during transit.
      </p>

      <H2>Customs and duties</H2>
      <p>
        Customers outside the EU are responsible for any import duties, taxes or customs fees in
        the destination country.
      </p>

      <H2>Local pickup</H2>
      <p>
        Pickup in Amsterdam can be arranged by appointment.
      </p>
    </LegalLayout>
  );
}
