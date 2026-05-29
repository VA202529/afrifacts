import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2 } from "@/components/LegalLayout";

export const Route = createFileRoute("/payment")({
  head: () => ({
    meta: [
      { title: "Afrifacts | Payment Information" },
      { name: "description", content: "Accepted payment methods and how payment works at Afrifacts." },
    ],
    links: [{ rel: "canonical", href: "/payment" }],
  }),
  component: Payment,
});

function Payment() {
  return (
    <LegalLayout
      eyebrow="Customer Care"
      title="Payment Information"
      intro="How payment works for Afrifacts orders."
    >
      <H2>Order request first</H2>
      <p>
        Every order placed via the website is an order request. After you submit, Afrifacts will
        contact you to confirm availability, the final amount including shipping, and the
        preferred payment method.
      </p>

      <H2>Accepted payment methods</H2>
      <p>
        We accept SEPA bank transfer (IBAN), iDEAL, and PayPal. Other methods can be arranged on
        request for international orders.
      </p>

      <H2>Currency</H2>
      <p>
        All prices are listed in euros (EUR). International payments are converted by your bank or
        payment provider at their applicable rate.
      </p>

      <H2>Invoices</H2>
      <p>
        A formal invoice is issued after the order is confirmed and includes Afrifacts' KVK number
        and, where applicable, VAT details.
      </p>

      <H2>Security</H2>
      <p>
        Payment is processed outside the website by trusted banking and payment partners. Afrifacts
        does not store card details on its servers.
      </p>
    </LegalLayout>
  );
}
