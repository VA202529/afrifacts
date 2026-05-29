import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2 } from "@/components/LegalLayout";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Afrifacts | Terms and Conditions" },
      { name: "description", content: "Read the Terms and Conditions for ordering authentic African art from Afrifacts." },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: Terms,
});

function Terms() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Terms and Conditions"
      intro="The agreement between you and Afrifacts when placing an order."
    >
      <H2>1. About Afrifacts</H2>
      <p>
        Afrifacts is a sole proprietorship based in Amsterdam, the Netherlands, registered with the
        Dutch Chamber of Commerce (KVK) under number 56790414. Afrifacts sells authentic handmade
        wooden African sculptures, art and cultural decoration, and imports and exports goods to
        and from Africa.
      </p>

      <H2>2. Orders</H2>
      <p>
        All orders placed via the website are treated as order requests. Afrifacts will confirm
        product availability, payment method and delivery details with the customer before the
        order is finalised.
      </p>

      <H2>3. Prices and payment</H2>
      <p>
        Prices are shown in euros and may be subject to VAT depending on destination. Payment
        instructions are communicated after the order request is confirmed.
      </p>

      <H2>4. Handmade products</H2>
      <p>
        Every item is handcrafted. Small variations in colour, grain, finish and dimensions are
        natural characteristics of authentic African art and are not considered defects.
      </p>

      <H2>5. Delivery</H2>
      <p>
        Delivery times depend on destination and stock availability. Afrifacts is not liable for
        delays caused by carriers, customs or other third parties.
      </p>

      <H2>6. Right of withdrawal</H2>
      <p>
        Consumers in the EU have a statutory right to withdraw from a purchase within 14 days of
        receipt, subject to the conditions described in our Return Policy.
      </p>

      <H2>7. Liability</H2>
      <p>
        Afrifacts' liability is limited to the value of the order. Afrifacts is not liable for
        indirect or consequential damages.
      </p>

      <H2>8. Applicable law</H2>
      <p>
        These terms are governed by Dutch law. Disputes shall be submitted to the competent court
        in Amsterdam, unless mandatory consumer law provides otherwise.
      </p>

      <H2>9. Contact</H2>
      <p>
        Afrifacts, Amsterdam, Netherlands · KVK 56790414 · +31 6 84158565.
      </p>
    </LegalLayout>
  );
}
