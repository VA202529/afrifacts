import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2 } from "@/components/LegalLayout";

export const Route = createFileRoute("/returns")({
  head: () => ({
    meta: [
      { title: "Afrifacts | Return Policy" },
      { name: "description", content: "Our return policy for handmade African art purchased through Afrifacts." },
    ],
    links: [{ rel: "canonical", href: "/returns" }],
  }),
  component: Returns,
});

function Returns() {
  return (
    <LegalLayout
      eyebrow="Customer Care"
      title="Return Policy"
      intro="How returns and exchanges work for Afrifacts orders."
    >
      <H2>14-day right of withdrawal</H2>
      <p>
        Consumers in the EU may withdraw from their purchase within 14 days of receiving the
        product, without giving a reason. Notify us in writing at +31 6 84158565 or via the contact
        form within this period.
      </p>

      <H2>Condition of returned items</H2>
      <p>
        Items must be returned in their original, unused condition, with original packaging where
        applicable. Because each piece is handmade, please handle items with care.
      </p>

      <H2>Return shipping</H2>
      <p>
        The customer is responsible for the cost and risk of return shipping unless the item was
        damaged in transit or sent incorrectly.
      </p>

      <H2>Refunds</H2>
      <p>
        Refunds are issued within 14 days of receipt of the returned item, using the original
        payment method.
      </p>

      <H2>Exceptions</H2>
      <p>
        Custom or specially commissioned pieces are excluded from the right of withdrawal.
      </p>

      <H2>Damaged in transit</H2>
      <p>
        If your order arrives damaged, contact us within 48 hours of delivery with photos so we can
        arrange a replacement or refund.
      </p>
    </LegalLayout>
  );
}
