type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
};

export function SectionTitle({ eyebrow, title, subtitle, align = "left" }: Props) {
  return (
    <div className={align === "center" ? "text-center max-w-2xl mx-auto" : "max-w-2xl"}>
      {eyebrow && (
        <div className="mb-3 text-xs uppercase tracking-[0.25em] text-gold font-medium">{eyebrow}</div>
      )}
      <h2 className="text-3xl md:text-5xl text-balance text-foreground">{title}</h2>
      {subtitle && <p className="mt-4 text-muted-foreground text-balance">{subtitle}</p>}
    </div>
  );
}
