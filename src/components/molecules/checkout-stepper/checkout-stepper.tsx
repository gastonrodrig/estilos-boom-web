"use client";

import React from "react";

interface CheckoutStepperProps {
  currentStep: number; // El índice del paso activo (0, 1, 2, etc.)
}

const steps = [
  "Carrito",
  "Identificacion",
  "Entrega",
  "Pago",
  "Confirmacion",
];

export const CheckoutStepper: React.FC<CheckoutStepperProps> = ({ currentStep }) => {
  return (
    <section className="mb-4 py-4">
      <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                {/* Círculo del paso */}
                <span
                  className={`h-2.5 w-2.5 rounded-full transition-colors duration-300 ${
                    isActive || isCompleted ? "bg-black" : "bg-gray-300"
                  }`}
                />
                
                {/* Etiqueta y línea inferior decorativa */}
                <div className="flex flex-col items-start">
                  <span
                    className={`text-[13px] md:text-[14px] font-semibold tracking-wide transition-colors duration-300 ${
                      isActive || isCompleted ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                  <span
                    className={`mt-0.5 h-px w-full transition-all duration-300 ${
                      isActive ? "bg-black" : "bg-transparent"
                    }`}
                  />
                </div>

                {/* Línea conectora entre pasos */}
                {index < steps.length - 1 && (
                  <span 
                    className={`mx-1 h-px w-4 md:w-8 transition-colors duration-300 ${
                      isCompleted ? "bg-black" : "bg-gray-300"
                    }`} 
                  />
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>
    </section>
  );
};