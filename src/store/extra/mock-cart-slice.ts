import { createSlice } from '@reduxjs/toolkit';
import { CartItem } from '@/core/models/cart';

interface CartState {
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}

// Data de ejemplo para testing
const mockCartItems: CartItem[] = [
  {
    productId: '1',
    name: 'Vestido Elegante Rosa Pastel',
    image: '/assets/product/vestido-rosa.jpg',
    price: 89.99,
    quantity: 2,
    color: 'Rosa Pastel',
    size: 'M',
  },
];

const calculateTotals = (items: CartItem[]) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discount = subtotal > 150 ? subtotal * 0.5 : 0; // 50% si es mayor a 150
  const tax = (subtotal - discount) * 0.15; // 15% de impuesto
  const total = subtotal - discount + tax;

  return {
    subtotal: Number(subtotal.toFixed(2)),
    discount: Number(discount.toFixed(2)),
    tax: Number(tax.toFixed(2)),
    total: Number(total.toFixed(2)),
  };
};

const initialState: CartState = {
  items: mockCartItems,
  ...calculateTotals(mockCartItems),
};

const mockCartSlice = createSlice({
  name: 'mockCart',
  initialState,
  reducers: {
    addItem: (state, action) => {
      state.items.push(action.payload);
      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.discount = totals.discount;
      state.tax = totals.tax;
      state.total = totals.total;
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((item) => item.productId !== action.payload);
      const totals = calculateTotals(state.items);
      state.subtotal = totals.subtotal;
      state.discount = totals.discount;
      state.tax = totals.tax;
      state.total = totals.total;
    },
  },
});

export const { addItem, removeItem } = mockCartSlice.actions;
export default mockCartSlice.reducer;
