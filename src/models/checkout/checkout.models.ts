export type CheckoutStep = 'shipping' | 'delivery' | 'payment' | 'review';

export interface BillingAddress {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  distric: string;
  postalCode: string;
  department: string;
}

export interface ShippingFormValues {
  firstName: string;
  lastName: string;
  address: string;
  apartment?: string;
  district: string;
  postalCode: string;
  department: string;
  email: string;
  phone: string;
  wantsNews: boolean;
}

export interface DeliveryMethod {
  id: string;
  name: string;
  description: string;
  price: number;
  estimatedDays: number;
}

export interface PaymentFormValues {
  paymentMethod: 'card' | 'transfer' | 'cash' | 'qr';
  cardNumber?: string;
  expiryDate?: string;
  securityCode?: string;
  billingSameAsShipping: boolean;
  billingAddress?: BillingAddress;
}

export interface CheckoutFormValues extends ShippingFormValues, PaymentFormValues {
  selectedDeliveryMethod?: DeliveryMethod;
}

export interface CheckoutState {
  currentStep: CheckoutStep;
}
