"use client";

import Link from "next/link";
import { FacebookIcon, InstagramIcon, Logo, TiktokIcon } from "@/components/atoms";
import { Mail, MapPin, Phone } from "lucide-react";

export const Footer = () => {
  const TopSeparator = () => (
    <div className="w-full h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(180,60,100,0.4), transparent)" }} />
  );

  const AnimatedLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <Link href={href} className="group relative inline-block opacity-60 hover:opacity-100 transition-opacity duration-300" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
      {children}
      <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
    </Link>
  );

  return (
    <footer className="relative w-full bg-[#faf7f4] dark:bg-[#0e080c] text-[#1a1018] dark:text-white transition-colors duration-500 overflow-hidden">
      {/* Dark mode noise texture (terciopelo sutil) */}
      <div className="absolute inset-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500" 
           style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E\")" }} 
      />

      {/* Separador Superior */}
      <TopSeparator />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-20">
        <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
          
          {/* Marca + Social */}
          <div className="md:col-span-12 lg:col-span-4 flex flex-col items-start">
            <Logo width={160} isHome={false} />
            <p className="mt-8 italic opacity-70" style={{ fontFamily: "var(--font-cormorant), serif", fontSize: "1rem", lineHeight: 1.8 }}>
              Ropa femenina moderna y cómoda, pensada para mujeres que valoran la elegancia y la simplicidad.
            </p>
            <div className="mt-10 flex items-center gap-[20px]">
              <Link href="https://www.facebook.com/estilo.boom.online" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:-translate-y-[2px] transition-all duration-300">
                <FacebookIcon size={22} color="currentColor" />
              </Link>
              <Link href="https://www.instagram.com/estilo_boom_" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:-translate-y-[2px] transition-all duration-300">
                <InstagramIcon size={22} color="currentColor" />
              </Link>
              <Link href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 hover:-translate-y-[2px] transition-all duration-300">
                <TiktokIcon size={22} color="currentColor" />
              </Link>
            </div>
          </div>

          {/* Enlaces Rápidos */}
          <div className="md:col-span-4 lg:col-span-2 lg:col-start-6">
            <h3 className="uppercase" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400, letterSpacing: "0.25em", fontSize: "0.75rem" }}>
              Explorar
            </h3>
            <div className="w-[24px] h-[1px] bg-[#8B3A52] mt-3 mb-6" />
            <ul className="space-y-4">
              <li><AnimatedLink href="/catalogue/new-in">Nueva Colección</AnimatedLink></li>
              <li><AnimatedLink href="/catalogue/best-seller">Lo Más Vendido</AnimatedLink></li>
              <li><AnimatedLink href="/catalogue/dresses">Vestidos</AnimatedLink></li>
            </ul>
          </div>

          {/* Información */}
          <div className="md:col-span-4 lg:col-span-2">
            <h3 className="uppercase" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400, letterSpacing: "0.25em", fontSize: "0.75rem" }}>
              Información
            </h3>
            <div className="w-[24px] h-[1px] bg-[#8B3A52] mt-3 mb-6" />
            <ul className="space-y-4">
              <li><AnimatedLink href="/home">Envíos y Entregas</AnimatedLink></li>
              <li><AnimatedLink href="/home">Medios de Pago</AnimatedLink></li>
              <li><AnimatedLink href="/home">Términos Legales</AnimatedLink></li>
              <li><AnimatedLink href="/home">Devoluciones</AnimatedLink></li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="md:col-span-4 lg:col-span-2">
            <h3 className="uppercase" style={{ fontFamily: "var(--font-cormorant), serif", fontWeight: 400, letterSpacing: "0.25em", fontSize: "0.75rem" }}>
              Contacto
            </h3>
            <div className="w-[24px] h-[1px] bg-[#8B3A52] mt-3 mb-6" />
            <ul className="space-y-5" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
              <li className="flex items-start gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
                <Phone size={16} className="text-[#8B3A52] flex-shrink-0 mt-0.5" />
                <span>+51 987 654 321</span>
              </li>
              <li className="flex items-start gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
                <Mail size={16} className="text-[#8B3A52] flex-shrink-0 mt-0.5" />
                <span>estiloboom.oficial@gmail.com</span>
              </li>
              <li className="flex items-start gap-3 opacity-70 hover:opacity-100 transition-opacity duration-300">
                <MapPin size={16} className="text-[#8B3A52] flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">C. Campanillas 135-101,<br/>Ate 15022, Perú</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 mb-8">
          <TopSeparator />
        </div>

        <div className="flex justify-center text-center">
          <p className="uppercase" style={{ fontSize: "0.7rem", letterSpacing: "0.15em", opacity: 0.35 }}>
            © {new Date().getFullYear()} ESTILOS BOOM. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </div>
    </footer>
  );
};
