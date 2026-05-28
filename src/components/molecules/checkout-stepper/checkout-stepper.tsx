"use client";

import React from "react";

interface CheckoutStepperProps {
  currentStep: number; // El índice del paso activo (0, 1, 2, etc.)
}

const steps = [
  "Carrito",
  "Envío",
  "Pago",
  "Confirmación",
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
                  className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                    isActive ? "bg-[#632034]" : isCompleted ? "bg-[#D9A2A8]" : "bg-[#F5E3E6]"
                  }`}
                />
                
                {/* Etiqueta y línea inferior decorativa */}
                <div className="flex flex-col items-start">
                  <span
                    className={`text-[12px] md:text-[13px] font-medium capitalize transition-colors duration-300 ${
                      isActive ? "text-[#632034]" : isCompleted ? "text-[#D9A2A8]" : "text-[#D9A2A8]/60"
                    }`}
                  >
                    {step}
                  </span>
                  <span
                    className={`mt-1 h-px w-full transition-all duration-300 ${
                      isActive ? "bg-[#632034]" : "bg-transparent"
                    }`}
                  />
                </div>

                {/* Línea conectora entre pasos */}
                {index < steps.length - 1 && (
                  <span 
                    className={`mx-1 h-px w-4 md:w-8 transition-colors duration-300 ${
                      isCompleted ? "bg-[#D9A2A8]" : "bg-[#F5E3E6]"
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