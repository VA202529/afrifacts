import type { ReactNode } from "react";
import { SectionTitle } from "@/components/SectionTitle";

export function LegalLayout({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-5 md:px-8 py-16">
      <SectionTitle eyebrow={eyebrow} title={title} subtitle={intro} />
      <div className="mt-10 prose-legal space-y-6 text-foreground/85 leading-relaxed">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
          Last updated: {new Date().getFullYear()}
        </p>
        {children}
        <div className="mt-12 border-t border-border pt-6 text-sm text-muted-foreground">
          <p className="italic">
            This text is a working draft provided for informational purposes only and does not
            constitute legal advice. Afrifacts recommends that the final wording is reviewed by a
            qualified legal advisor before publication.
          </p>
        </div>
      </div>
    </div>
  );
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-2xl text-wood mt-10">{children}</h2>;
}
