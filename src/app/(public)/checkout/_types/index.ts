export type CheckoutFormValues = {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  city: string;
  postalCode: string;
  department: string;
  email: string;
  phone: string;
  subscribe: boolean;
};

export type OrderItem = {
  id: string;
  name: string;
  color: string;
  size: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

export type OrderSummaryProps = {
  items: OrderItem[];
};
