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
      district: '',
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
      <div className="min-h-screen py-12">
        <div className="max-w-7xl mx-auto px-4">
          {children}
        </div>
      </div>
    </FormProvider>
  );
};

export default CheckoutLayout;
