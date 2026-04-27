'use client';

import React from 'react';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutStepRenderer, CheckoutSummaryCard } from './index';
import { CheckoutStepper } from '@/components/molecules';


const CheckoutShell: React.FC = () => {

  
  const { currentStep } = useCheckoutStore();

  const stepMap: Record<string, number> = {
    'shipping': 1, // Identificación / Envío
    'delivery': 2, // Entrega
    'payment': 3,  // Pago
    'review': 4    // Confirmación
  };

  return (
    <div className="flex flex-col w-full">
      
      {/* 3. Colocamos el Stepper aquí arriba para que siempre sea visible */}
      <div className="mb-5 mt-0 pt-0">
        <CheckoutStepper currentStep={stepMap[currentStep]} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 px-4 lg:px-0">
        {/* Columna izquierda: Formularios dinámicos */}
        <div className="lg:col-span-2">
          <CheckoutStepRenderer currentStep={currentStep} />
        </div>

        {/* Columna derecha: Resumen (Este se queda fijo) */}
        <div className="lg:col-span-1">
          <CheckoutSummaryCard />
        </div>
      </div>
    </div>
  );
};

export default CheckoutShell;
