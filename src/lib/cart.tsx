import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchProducts, type Product } from "./products";

export type CartItem = { id: string; qty: number };

type CartCtx = {
  items: CartItem[];
  add: (id: string, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  detailed: Array<{ product: Product; qty: number; lineTotal: number }>;
  open: boolean;
  setOpen: (v: boolean) => void;
};

const Ctx = createContext<CartCtx | null>(null);
const STORAGE_KEY = "afrifacts.cart.v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { data: liveProducts = [] } = useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
    staleTime: 60_000,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const value = useMemo<CartCtx>(() => {
    const detailed = items
      .map((it) => {
        const product = liveProducts.find((p) => p.id === it.id);
        if (!product) return null;
        return { product, qty: it.qty, lineTotal: product.price * it.qty };
      })
      .filter(Boolean) as CartCtx["detailed"];

    return {
      items,
      open,
      setOpen,
      add: (id, qty = 1) =>
        setItems((prev) => {
          const existing = prev.find((p) => p.id === id);
          if (existing) return prev.map((p) => (p.id === id ? { ...p, qty: p.qty + qty } : p));
          return [...prev, { id, qty }];
        }),
      remove: (id) => setItems((prev) => prev.filter((p) => p.id !== id)),
      setQty: (id, qty) =>
        setItems((prev) =>
          qty <= 0 ? prev.filter((p) => p.id !== id) : prev.map((p) => (p.id === id ? { ...p, qty } : p)),
        ),
      clear: () => setItems([]),
      count: items.reduce((a, b) => a + b.qty, 0),
      subtotal: detailed.reduce((a, b) => a + b.lineTotal, 0),
      detailed,
    };
  }, [items, open, liveProducts]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside CartProvider");
  return c;
}

export const formatEUR = (n: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(n);
