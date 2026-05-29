import { createFileRoute } from "@tanstack/react-router";
import { LegalLayout, H2 } from "@/components/LegalLayout";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Afrifacts | Privacy Policy" },
      { name: "description", content: "How Afrifacts collects, uses and protects your personal data." },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: Privacy,
});

function Privacy() {
  return (
    <LegalLayout
      eyebrow="Legal"
      title="Privacy Policy"
      intro="We respect your privacy and handle your data with care."
    >
      <H2>Who we are</H2>
      <p>
        Afrifacts is the data controller for personal data processed via this website. Contact:
        Amsterdam, Netherlands · KVK 56790414 · +31 6 84158565.
      </p>

      <H2>Which data we collect</H2>
      <p>
        When you place an order or contact us, we collect your name, email address, phone number,
        shipping address and the contents of your message or order.
      </p>

      <H2>Why we use your data</H2>
      <p>
        We use your data to process your order request, communicate about availability, payment and
        delivery, respond to questions, and — only with your explicit consent — send updates about
        Afrifacts products.
      </p>

      <H2>Legal basis</H2>
      <p>
        We process data based on the performance of a contract (your order), our legitimate
        business interest in responding to enquiries, and your consent where required.
      </p>

      <H2>Sharing with third parties</H2>
      <p>
        We share data only with parties needed to fulfil your order, such as shipping carriers and
        payment providers, and where legally required.
      </p>

      <H2>Retention</H2>
      <p>
        Order data is retained for the period required by Dutch tax and commercial law (currently 7
        years). Marketing data is retained until you withdraw consent.
      </p>

      <H2>Your rights</H2>
      <p>
        You have the right to access, correct, delete and port your personal data and to object to
        or restrict processing. Contact us to exercise these rights. You may also file a complaint
        with the Dutch Data Protection Authority (Autoriteit Persoonsgegevens).
      </p>

      <H2>Cookies</H2>
      <p>
        This website uses only the functional storage needed to keep your shopping cart available
        between page visits.
      </p>
    </LegalLayout>
  );
}
