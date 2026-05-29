export type Product = {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  category: string;
  shortDescription: string;
  description: string;
  material: string;
  origin: string;
  image?: string;
  stock?: number;
  status?: string;
  active?: boolean;
  sku?: string;
  images: Array<{ image_id?: string; url: string; drive_file_id?: string }>;
};

export type BackendProduct = {
  product_id?: string;
  id?: string;
  name?: string;
  description?: string;
  price?: number | string;
  sell_price?: number | string;
  original_price?: number | string;
  stock?: number | string;
  status?: string;
  active?: boolean | string;
  image_url?: string;
  images?: Array<{ image_id?: string; url?: string; image_url?: string; drive_file_id?: string }>;
  sku?: string;
  category?: string;
  material?: string;
  origin?: string;
};

export type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  error?: { message?: string; code?: number } | null;
};

const API_URL =
  import.meta.env.VITE_WEBAPP_API_URL ||
  "https://script.google.com/macros/s/AKfycby4v4-8geXg2sRDQoiBonwivedBw3gWcGaqTyKE4YqnAK9AeBoRU8ul3aSi4o_dciskJw/exec";

function toNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function extractDriveId(value: string) {
  return (
    value.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1] ||
    value.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1] ||
    (/^[a-zA-Z0-9_-]{20,}$/.test(value) ? value : "")
  );
}

function toImageUrl(value: string, size = 1000) {
  const id = extractDriveId(value);
  return id ? `https://drive.google.com/thumbnail?id=${id}&sz=w${size}` : value;
}

function normalizeProduct(product: BackendProduct): Product {
  const id = String(product.product_id || product.id || "");
  const description = String(product.description || "");
  const images = (product.images || [])
    .map((img) => ({
      image_id: img.image_id,
      url: toImageUrl(String(img.url || img.image_url || "")),
      drive_file_id: img.drive_file_id,
    }))
    .filter((img) => img.url);
  const image = toImageUrl(String(product.image_url || images[0]?.url || ""));

  return {
    id,
    product_id: id,
    name: String(product.name || ""),
    price: toNumber(product.sell_price || product.price || product.original_price),
    category: String(product.category || ""),
    shortDescription: description,
    description,
    material: String(product.material || ""),
    origin: String(product.origin || ""),
    image,
    stock: toNumber(product.stock),
    status: String(product.status || "active"),
    active: String(product.active ?? "true").toLowerCase() !== "false",
    sku: product.sku ? String(product.sku) : undefined,
    images,
  };
}

async function getJson<T>(action: string, params: Record<string, string | number> = {}) {
  const url = new URL(API_URL);
  url.searchParams.set("action", action);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, String(value)));

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

  const json = (await response.json()) as ApiResponse<T>;
  if (json.success === false) throw new Error(json.error?.message || "API request failed");
  return json.data as T;
}

async function postJson<T>(payload: Record<string, unknown>) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "text/plain;charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`API request failed with status ${response.status}`);

  const json = (await response.json()) as ApiResponse<T>;
  if (json.success === false) throw new Error(json.error?.message || "API request failed");
  return json.data as T;
}

export async function fetchProducts() {
  const data = await getJson<BackendProduct[]>("getProducts");
  return Array.isArray(data) ? data.map(normalizeProduct).filter((product) => product.id) : [];
}

export async function fetchProduct(id: string) {
  const data = await postJson<BackendProduct>({ action: "getProductDetails", product_id: id });
  return normalizeProduct(data);
}

export async function createBackendOrder(payload: {
  customer_name: string;
  email: string;
  phone: string;
  address: string;
  customer_city: string;
  customer_postal_code: string;
  delivery_type: "verzenden" | "ophalen";
  notes?: string;
  items: Array<{ product_id: string; quantity: number }>;
}) {
  return postJson<{
    order_id: string;
    total_price: number;
    payment_status: string;
    fulfillment_status: string;
  }>({ action: "createOrder", ...payload });
}
