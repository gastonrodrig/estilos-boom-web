"use client";

import { ReactNode } from "react";
import { Navbar, ClientSidebar } from "@components";
import { clientModules } from "@data";

interface ClientLayoutProps {
  children: ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <div className="min-h-screen relative">
      {/* LUNAR BACKGROUND (DARK MODE ONLY) */}
      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes lunaPulse {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(232,184,109,0.25));
            opacity: var(--luna-opacity);
          }
          50% {
            filter: drop-shadow(0 0 12px rgba(232,184,109,0.5)) drop-shadow(0 0 24px rgba(232,184,109,0.2));
            opacity: calc(var(--luna-opacity) * 1.7);
          }
        }
        @keyframes florGirar {
          from { transform: rotate(0deg);   }
          to   { transform: rotate(360deg); }
        }
        @keyframes florPulse {
          0%,100% { filter: drop-shadow(0 0 3px rgba(220,120,160,0.2)); opacity: var(--f-op); }
          50%      { filter: drop-shadow(0 0 8px rgba(220,120,160,0.4)); opacity: calc(var(--f-op) * 1.5); }
        }
        @keyframes respira {
          0%   { background-position: 0%   50%; }
          25%  { background-position: 50%  100%; }
          50%  { background-position: 100% 50%; }
          75%  { background-position: 50%  0%; }
          100% { background-position: 0%   50%; }
        }
      `}</style>
      
      <div className="absolute inset-0 z-[-1] hidden dark:block overflow-hidden pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 35% 35% at 20% 18%, rgba(255,180,210,0.18) 0%, transparent 60%),
            radial-gradient(ellipse 70% 50% at 10% 80%, rgba(180,60,100,0.25) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 85% 75%, rgba(140,40,80,0.2) 0%, transparent 55%),
            radial-gradient(ellipse 100% 80% at 50% 100%, rgba(100,20,50,0.5) 0%, transparent 60%),
            #1a0618
          `
        }}
      >
        {/* Global SVG Defs for Lunas */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter id="lunaGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </svg>

        {/* Luna 1 */}
        <div className="fixed pointer-events-none z-0" style={{ top: '6%', right: '5%', width: '85px', height: '85px', opacity: 0.5, transform: 'rotate(-20deg)', animation: 'lunaPulse 6s ease-in-out infinite', '--luna-opacity': 0.5 } as React.CSSProperties}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="28" fill="#e8b86d" filter="url(#lunaGlow)" opacity="0.9"/>
            <circle cx="62" cy="50" r="24" fill="#0d0408"/>
          </svg>
        </div>

        {/* Estrellas alrededor del Eclipse 1 */}
        {Array.from({ length: 5 }).map((_, i) => {
          const angles = [0, 72, 144, 216, 288];
          const radius = 60 + Math.random() * 15;
          const angleRad = (angles[i] + Math.random() * 20 - 10) * (Math.PI / 180);
          const topOffset = Math.sin(angleRad) * radius;
          const leftOffset = Math.cos(angleRad) * radius;
          
          return (
            <div 
              key={`e1-star-${i}`}
              className="fixed rounded-full pointer-events-none z-0"
              style={{
                width: Math.random() > 0.5 ? '1px' : '2px',
                height: Math.random() > 0.5 ? '1px' : '2px',
                top: `calc(8% + 45px + ${topOffset}px)`,
                right: `calc(6% + 45px + ${leftOffset}px)`,
                backgroundColor: '#e8b86d',
                opacity: Math.random() * 0.5 + 0.3,
                animation: `twinkle ${Math.random() * 3 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
              }}
            />
          );
        })}

        {/* Luna 2 */}
        <div className="fixed pointer-events-none z-0" style={{ top: '4%', left: '30%', width: '35px', height: '35px', opacity: 0.2, transform: 'rotate(15deg)', animation: 'lunaPulse 9s ease-in-out infinite 2s', '--luna-opacity': 0.2 } as React.CSSProperties}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="28" fill="#f0c8d8" filter="url(#lunaGlow)" opacity="0.9"/>
            <circle cx="62" cy="50" r="24" fill="#0d0408"/>
          </svg>
        </div>

        {/* Luna 3 */}
        <div className="fixed pointer-events-none z-0" style={{ top: '45%', right: '1.5%', width: '50px', height: '50px', opacity: 0.18, transform: 'rotate(-35deg)', animation: 'lunaPulse 11s ease-in-out infinite 4s', '--luna-opacity': 0.18 } as React.CSSProperties}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="28" fill="#e8b86d" filter="url(#lunaGlow)" opacity="0.9"/>
            <circle cx="62" cy="50" r="24" fill="#0d0408"/>
          </svg>
        </div>

        {/* Luna 4 */}
        <div className="fixed pointer-events-none z-0" style={{ bottom: '15%', left: '22%', width: '26px', height: '26px', opacity: 0.13, transform: 'rotate(10deg)', animation: 'lunaPulse 8s ease-in-out infinite 1.5s', '--luna-opacity': 0.13 } as React.CSSProperties}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="28" fill="#d4a8c4" filter="url(#lunaGlow)" opacity="0.9"/>
            <circle cx="62" cy="50" r="24" fill="#0d0408"/>
          </svg>
        </div>

        {/* Estrellas */}
        {Array.from({ length: 55 }).map((_, i) => {
          const isGold = Math.random() < 0.7;
          const color = isGold ? '#e8b86d' : '#fdeef5';
          const opacity = isGold ? Math.random() * 0.3 + 0.3 : Math.random() * 0.3 + 0.2;
          return (
            <div 
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() > 0.5 ? '1px' : '2px',
                height: Math.random() > 0.5 ? '1px' : '2px',
                top: Math.random() * 53 + 2 + '%',
                left: Math.random() * 100 + '%',
                backgroundColor: color,
                opacity: opacity,
                animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
              }}
            />
          );
        })}

        {/* Nubes Rosadas Base */}
        <div className="absolute bottom-0 left-[-10%] w-[500px] h-[300px] blur-[50px] rounded-[100%]" style={{ background: 'rgba(180,60,100,0.3)' }} />
        <div className="absolute bottom-[-5%] left-[30%] w-[600px] h-[350px] blur-[50px] rounded-[100%]" style={{ background: 'rgba(220,100,140,0.2)' }} />
        <div className="absolute bottom-0 right-[-10%] w-[450px] h-[280px] blur-[50px] rounded-[100%]" style={{ background: 'rgba(180,60,100,0.3)' }} />
      </div>

      {/* BACKGROUND QUE RESPIRA (LIGHT MODE) */}
      <div className="absolute inset-0 z-[-1] dark:hidden pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #fce8ee 0%, #fdf0e8 25%, #f8e8f4 50%, #fdeee8 75%, #fce8ee 100%)',
          backgroundSize: '400% 400%',
          animation: 'respira 18s ease-in-out infinite'
        }}
      >
        <div className="absolute inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 55% 45% at 85% 5%, rgba(220,120,160,0.22) 0%, transparent 50%),
              radial-gradient(ellipse 45% 40% at 10% 90%, rgba(210,150,90,0.18) 0%, transparent 50%),
              radial-gradient(ellipse 35% 30% at 50% 50%, rgba(240,200,215,0.15) 0%, transparent 55%)
            `
          }}
        />

        {/* Lottie Sakura */}
        <div className="dark:hidden fixed z-0 pointer-events-none" style={{ top: '-10px', right: '-10px', width: '220px', height: '220px', opacity: 0.55 }}>
          {/* @ts-ignore */}
          <lottie-player
            src="/animations/sakura.json"
            background="transparent"
            speed="0.15"
            loop
            autoplay
            className="sakura"
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Flor 2 */}
        <div className="absolute pointer-events-none z-0" style={{ top: '3%', left: '30%', width: '32px', height: '32px', animation: 'florPulse 6s ease-in-out infinite 1s', '--f-op': 0.2 } as React.CSSProperties}>
          <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%' }}>
            <g opacity="0.35">
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(72,30,30)"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(144,30,30)"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(216,30,30)"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(288,30,30)"/>
              <circle cx="30" cy="30" r="5" fill="rgba(184,134,11,0.7)"/>
            </g>
          </svg>
        </div>

        {/* Flor 3 */}
        <div className="absolute pointer-events-none z-0" style={{ top: '45%', right: '2%', width: '48px', height: '48px', animation: 'florPulse 9s ease-in-out infinite 2s', '--f-op': 0.18 } as React.CSSProperties}>
          <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%' }}>
            <g opacity="0.35">
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(72,30,30)"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(144,30,30)"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(216,30,30)"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(288,30,30)"/>
              <circle cx="30" cy="30" r="5" fill="rgba(184,134,11,0.7)"/>
            </g>
          </svg>
        </div>

        {/* Flor 4 */}
        <div className="absolute pointer-events-none z-0" style={{ bottom: '15%', left: '22%', width: '24px', height: '24px', animation: 'florPulse 7s ease-in-out infinite 3s', '--f-op': 0.14 } as React.CSSProperties}>
          <svg viewBox="0 0 60 60" style={{ width: '100%', height: '100%' }}>
            <g opacity="0.35">
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(72,30,30)"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(144,30,30)"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(216,30,30)"/>
              <ellipse cx="30" cy="16" rx="7" ry="13" fill="#e8a0b8" transform="rotate(288,30,30)"/>
              <circle cx="30" cy="30" r="5" fill="rgba(184,134,11,0.7)"/>
            </g>
          </svg>
        </div>

        {/* Estrellas Doradas Light Mode */}
        {Array.from({ length: 12 }).map((_, i) => {
          const isGold = Math.random() < 0.6;
          const color = isGold ? '#b8860b' : '#c4547a';
          const opacity = Math.random() * 0.2 + 0.2;
          return (
            <div 
              key={`light-star-${i}`}
              className="absolute rounded-full"
              style={{
                width: Math.random() > 0.5 ? '1px' : '2px',
                height: Math.random() > 0.5 ? '1px' : '2px',
                top: Math.random() * 50 + 2 + '%',
                left: Math.random() * 100 + '%',
                backgroundColor: color,
                opacity: opacity,
                animation: `twinkle ${Math.random() * 4 + 2}s ease-in-out ${Math.random() * 2}s infinite`,
              }}
            />
          );
        })}
      </div>

      <Navbar isHome={false} showTopBar showClientCenterMenu />

      {/* compensar navbar fixed */}
      <div className="flex pt-[114px] min-[1138px]:pt-16 relative z-10">
        <ClientSidebar items={clientModules} hasTopBar={true} />

        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
