'use client';

import React from 'react';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutStepRenderer, CheckoutSummaryCard } from './index';

const CheckoutShell: React.FC = () => {
  const { currentStep } = useCheckoutStore();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 lg:px-0">
      {/* Columna izquierda: Formularios */}
      <div className="lg:col-span-2">
        <CheckoutStepRenderer currentStep={currentStep} />
      </div>

      {/* Columna derecha: Resumen */}
      <div className="lg:col-span-1">
        <CheckoutSummaryCard />
      </div>
    </div>
  );
};

export default CheckoutShell;
