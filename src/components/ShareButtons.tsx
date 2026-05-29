import { useState } from "react";
import { Link2, MessageCircle, Share2, Check } from "lucide-react";

export function ShareButtons({ title, text }: { title: string; text?: string }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== "undefined" ? window.location.href : "";
  const message = `${title}${text ? " — " + text : ""}\n${url}`;
  const wa = `https://wa.me/?text=${encodeURIComponent(message)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {}
  };

  const native = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
      } catch {}
    } else {
      copy();
    }
  };

  const canNative = typeof navigator !== "undefined" && !!(navigator as any).share;

  return (
    <div className="mt-8 border-t border-border pt-6">
      <div className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Share this piece</div>
      <div className="flex flex-wrap items-center gap-2">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        <button
          onClick={copy}
          className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
        >
          {copied ? <Check className="h-4 w-4 text-terracotta" /> : <Link2 className="h-4 w-4" />}
          {copied ? "Link copied" : "Copy link"}
        </button>
        {canNative && (
          <button
            onClick={native}
            className="inline-flex items-center gap-2 border border-border px-4 py-2.5 text-sm hover:bg-secondary transition-colors"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>
        )}
      </div>
      {copied && (
        <p className="mt-3 text-xs text-terracotta">Link copied to clipboard.</p>
      )}
    </div>
  );
}
