'use client';

import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CheckoutFormValues } from '@/models/checkout';

interface CheckoutLayoutProps {
  children: React.ReactNode;
}

const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({ children }) => {
  const methods = useForm<CheckoutFormValues>({
    mode: 'onBlur',
    defaultValues: {
      firstName: '',
      lastName: '',
      address: '',
      apartment: '',
      city: '',
      postalCode: '',
      department: '',
      email: '',
      phone: '',
      wantsNews: false,
      paymentMethod: 'card',
      billingSameAsShipping: true,
    },
  });

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Estilos Boom</h1>
            <p className="text-gray-600 mt-2">Fashion & Style</p>
          </div>
          {children}
        </div>
      </div>
    </FormProvider>
  );
};

export default CheckoutLayout;
