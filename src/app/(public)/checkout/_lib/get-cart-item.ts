import type { OrderItem } from "../_types";

export function getCartItems(): OrderItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem("cart");
    if (!raw) return [];

    const parsed = JSON.parse(raw);

    return parsed.map((p: any): OrderItem => ({
      id: p.id,
      name: p.title ?? p.name,
      imageUrl: p.image,
      price: p.price,
      quantity: p.quantity ?? p.qty ?? 1,
      color: p.selectedVariant ?? p.color,
      size: p.selectedSize ?? p.size,
    }));
  } catch {
    return [];
  }
}
