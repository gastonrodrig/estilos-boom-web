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
        @keyframes eclipsePulse1 {
          0%,100% {
            opacity: var(--base-opacity);
            filter: drop-shadow(0 0 4px rgba(232,184,109,0.3));
          }
          50% {
            opacity: calc(var(--base-opacity) * 1.6);
            filter: drop-shadow(0 0 10px rgba(232,184,109,0.5));
          }
        }
        @keyframes eclipsePulse2 {
          0%,100% {
            opacity: var(--base-opacity);
            filter: drop-shadow(0 0 3px rgba(232,184,109,0.2));
          }
          50% {
            opacity: calc(var(--base-opacity) * 1.4);
            filter: drop-shadow(0 0 7px rgba(232,184,109,0.35));
          }
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
        {/* Global SVG Defs for Eclipses */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <filter id="eclipse-glow">
              <feGaussianBlur stdDeviation="2" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>
        </svg>

        {/* Eclipse 1 */}
        <div className="fixed pointer-events-none z-0" style={{ top: '8%', right: '6%', width: '90px', height: '90px', animation: 'eclipsePulse1 6s ease-in-out infinite', '--base-opacity': 0.55 } as React.CSSProperties}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="28" fill="none" stroke="#e8b86d" strokeWidth="1.5" filter="url(#eclipse-glow)"/>
            <circle cx="50" cy="50" r="24" fill="rgba(8,4,14,0.95)"/>
            <line x1="50" y1="18" x2="50" y2="8" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="50" y1="92" x2="50" y2="82" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="18" y1="50" x2="8" y2="50" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="92" y1="50" x2="82" y2="50" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="27" y1="27" x2="20" y2="20" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="73" y1="73" x2="80" y2="80" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="27" y1="73" x2="20" y2="80" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="73" y1="27" x2="80" y2="20" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
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

        {/* Eclipse 2 */}
        <div className="fixed pointer-events-none z-0" style={{ top: '3%', left: '28%', width: '38px', height: '38px', animation: 'eclipsePulse2 8s ease-in-out infinite 2s', '--base-opacity': 0.25 } as React.CSSProperties}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="28" fill="none" stroke="#e8b86d" strokeWidth="1.5" filter="url(#eclipse-glow)"/>
            <circle cx="50" cy="50" r="24" fill="rgba(8,4,14,0.95)"/>
            <line x1="50" y1="18" x2="50" y2="8" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="50" y1="92" x2="50" y2="82" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="18" y1="50" x2="8" y2="50" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="92" y1="50" x2="82" y2="50" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="27" y1="27" x2="20" y2="20" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="73" y1="73" x2="80" y2="80" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="27" y1="73" x2="20" y2="80" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="73" y1="27" x2="80" y2="20" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
          </svg>
        </div>

        {/* Eclipse 3 */}
        <div className="fixed pointer-events-none z-0" style={{ top: '48%', right: '2%', width: '55px', height: '55px', animation: 'eclipsePulse1 10s ease-in-out infinite 4s', '--base-opacity': 0.2 } as React.CSSProperties}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="28" fill="none" stroke="#e8b86d" strokeWidth="1.5" filter="url(#eclipse-glow)"/>
            <circle cx="50" cy="50" r="24" fill="rgba(8,4,14,0.95)"/>
            <line x1="50" y1="18" x2="50" y2="8" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="50" y1="92" x2="50" y2="82" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="18" y1="50" x2="8" y2="50" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="92" y1="50" x2="82" y2="50" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="27" y1="27" x2="20" y2="20" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="73" y1="73" x2="80" y2="80" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="27" y1="73" x2="20" y2="80" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="73" y1="27" x2="80" y2="20" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
          </svg>
        </div>

        {/* Eclipse 4 */}
        <div className="fixed pointer-events-none z-0" style={{ bottom: '12%', left: '20%', width: '28px', height: '28px', animation: 'eclipsePulse2 7s ease-in-out infinite 1s', '--base-opacity': 0.15 } as React.CSSProperties}>
          <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
            <circle cx="50" cy="50" r="28" fill="none" stroke="#e8b86d" strokeWidth="1.5" filter="url(#eclipse-glow)"/>
            <circle cx="50" cy="50" r="24" fill="rgba(8,4,14,0.95)"/>
            <line x1="50" y1="18" x2="50" y2="8" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="50" y1="92" x2="50" y2="82" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="18" y1="50" x2="8" y2="50" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="92" y1="50" x2="82" y2="50" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="27" y1="27" x2="20" y2="20" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="73" y1="73" x2="80" y2="80" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="27" y1="73" x2="20" y2="80" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
            <line x1="73" y1="27" x2="80" y2="20" stroke="rgba(232,184,109,0.3)" strokeWidth="0.8"/>
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

      {/* MAGICAL BACKGROUND (LIGHT MODE) */}
      <div className="absolute inset-0 z-[-1] dark:hidden overflow-hidden bg-[#faf7f4] pointer-events-none">
        <div className="absolute top-[30%] left-[50%] w-[600px] h-[600px] bg-[#F2D0D3] rounded-full blur-[100px] opacity-[0.4]" />
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
