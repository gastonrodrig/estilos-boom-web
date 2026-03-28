export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
  categoryId?: string;
  categoryName?: string;
}

export interface CartResponse {
  items: CartItem[];
}

export interface AddCartItemPayload {
  productId: string;
  quantity: number;
  size: string;
  color: string;
}

export interface UpdateQuantityPayload {
  productId: string;
  size: string;
  color: string;
  quantity: number;
}

export interface RemoveCartItemPayload {
  productId: string;
  size: string;
  color: string;
}

export interface MergeCartPayload {
  items: AddCartItemPayload[];
}

export interface CartState {
  items: CartItem[];
}