'use client';

import React, { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { CheckoutFormValues } from '@/core/models/checkout';

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

  const [stars, setStars] = useState<{ width: string; height: string; top: string; left: string; backgroundColor: string; opacity: number; animation: string }[]>([]);

  useEffect(() => {
    const generatedStars = Array.from({ length: 12 }).map(() => ({
      width: Math.random() > 0.5 ? '1px' : '2px',
      height: Math.random() > 0.5 ? '1px' : '2px',
      top: Math.random() * 80 + 2 + '%',
      left: Math.random() * 100 + '%',
      backgroundColor: Math.random() < 0.7 ? '#e8b86d' : '#fdeef5',
      opacity: Math.random() * 0.3 + 0.2,
      animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
    }));
    setStars(generatedStars);
  }, []);

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen py-12 relative overflow-hidden">
        {/* LUNAR BACKGROUND (DARK MODE ONLY) */}
        <div className="absolute inset-0 z-[-1] hidden dark:block pointer-events-none"
          style={{
            background: `
              radial-gradient(ellipse 35% 35% at 20% 18%, rgba(255,180,210,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 70% 50% at 10% 80%, rgba(180,60,100,0.08) 0%, transparent 60%),
              radial-gradient(ellipse 60% 40% at 85% 75%, rgba(140,40,80,0.06) 0%, transparent 55%),
              radial-gradient(ellipse 100% 80% at 50% 100%, rgba(100,20,50,0.15) 0%, transparent 60%),
              #1a0618
            `
          }}
        >
          <svg width="0" height="0" className="absolute">
            <defs>
              <filter id="lunaGlowCheckout">
                <feGaussianBlur stdDeviation="2.5" result="blur"/>
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>
          </svg>
 
          <div className="fixed pointer-events-none z-0" style={{ top: '6%', right: '5%', width: '45px', height: '45px', opacity: 0.15, transform: 'rotate(-20deg)', animation: 'lunaPulse 6s ease-in-out infinite', '--luna-opacity': 0.15 } as React.CSSProperties}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              <circle cx="50" cy="50" r="28" fill="#e8b86d" filter="url(#lunaGlowCheckout)" opacity="0.9"/>
              <circle cx="62" cy="50" r="24" fill="#0d0408"/>
            </svg>
          </div>
 
          {stars.map((star, i) => (
            <div 
              key={i}
              className="absolute rounded-full"
              style={{
                width: star.width,
                height: star.height,
                top: star.top,
                left: star.left,
                backgroundColor: star.backgroundColor,
                opacity: star.opacity,
                animation: star.animation,
              }}
            />
          ))}

          <div className="absolute bottom-0 left-[-10%] w-[500px] h-[300px] blur-[50px] rounded-[100%]" style={{ background: 'rgba(180,60,100,0.1)' }} />
          <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] blur-[60px] rounded-[100%]" style={{ background: 'rgba(232,184,109,0.05)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4">
          {children}
        </div>
      </div>
    </FormProvider>
  );
};

export default CheckoutLayout;
