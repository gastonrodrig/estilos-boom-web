export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

export interface CartResponse {
  items: CartItem[];
}

export interface UpdateQuantityPayload {
  productId: string;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
}
