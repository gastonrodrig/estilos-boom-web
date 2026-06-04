"use client";

import Link from "next/link";
import Image from "next/image";
import { FacebookIcon, InstagramIcon, Logo, TiktokIcon } from "@/components/atoms";
import { MailIcon, MapIcon, MapPinIcon, PhoneIcon } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative w-full border-t border-[#EBEAE8] dark:border-white/5 bg-[#FAF9F6] dark:bg-background text-[#594246] dark:text-gray-300">
      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Marca + Social */}
          <div className="space-y-6 md:col-span-12 lg:col-span-3">
            <div className="flex justify-start">
              <Logo width={160} isHome={false} />
            </div>
            <p className="text-sm leading-relaxed text-[#594246]/80 dark:text-gray-400 font-medium max-w-sm">
              Ropa femenina moderna y cómoda, pensada para mujeres que valoran la
              elegancia y la simplicidad.
            </p>
            <div className="mt-8 flex items-center gap-4">
              <Link
                href="https://www.facebook.com/estilo.boom.online"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#594246] dark:text-gray-400 hover:text-[#632034] dark:hover:text-white transition-colors"
              >
                <FacebookIcon size={24} color="currentColor" />
              </Link>
              <Link
                href="https://www.instagram.com/estilo_boom_"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#594246] dark:text-gray-400 hover:text-[#632034] dark:hover:text-white transition-colors"
              >
                <InstagramIcon size={24} color="currentColor" />
              </Link>
              <Link
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#594246] dark:text-gray-400 hover:text-[#632034] dark:hover:text-white transition-colors"
              >
                <TiktokIcon size={24} color="currentColor" />
              </Link>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div className="md:col-span-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-[#632034] dark:text-[#f2b6c1] uppercase tracking-wider mb-6">Explorar</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/catalogue" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Nueva Colección</Link>
              </li>
              <li>
                <Link href="/catalogue" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Lo Más Vendido</Link>
              </li>
              <li>
                <Link href="/catalogue" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Vestidos</Link>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div className="md:col-span-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-[#632034] dark:text-[#f2b6c1] uppercase tracking-wider mb-6">Información</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/shipping" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Envíos y entregas</Link>
              </li>
              <li>
                <Link href="/payment" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Medios de pago</Link>
              </li>
              <li>
                <Link href="/pickup" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Puntos de recojo</Link>
              </li>
              <li>
                <Link href="/terms" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Términos y condiciones</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Política de privacidad</Link>
              </li>
              <li>
                <Link href="/refund" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Política de reembolso</Link>
              </li>
            </ul>
          </div>

          {/* Nosotros */}
          <div className="md:col-span-4 lg:col-span-2">
            <h3 className="text-sm font-bold text-[#632034] dark:text-[#f2b6c1] uppercase tracking-wider mb-6">Nosotros</h3>
            <ul className="space-y-4 text-sm font-medium">
              <li>
                <Link href="/about" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Quiénes somos</Link>
              </li>
              <li>
                <Link href="/reviews" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Reseñas de clientes</Link>
              </li>
              <li>
                <Link href="/stores" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Nuestra tienda</Link>
              </li>
              <li>
                <Link href="/wholesale" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Ventas mayoristas</Link>
              </li>
              <li>
                <Link href="/jobs" className="text-[#594246]/80 dark:text-gray-400 hover:text-[#632034] dark:hover:text-[#f2b6c1] transition-colors">Trabaja con nosotros</Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div className="md:col-span-12 lg:col-span-3">
            <h3 className="text-sm font-bold text-[#632034] dark:text-[#f2b6c1] uppercase tracking-wider mb-6">Contacto</h3>
            <ul className="space-y-4 text-sm font-medium text-[#594246] dark:text-gray-300">
              <li className="flex items-start gap-3">
                <PhoneIcon size={18} className="flex-shrink-0 text-[#632034] dark:text-[#f2b6c1] mt-0.5"/>
                <span>+51 987 654 321</span>
              </li>
              <li className="flex items-start gap-3">
                <MailIcon size={18} className="flex-shrink-0 text-[#632034] dark:text-[#f2b6c1] mt-0.5"/>
                <span>estiloboom.oficial@gmail.com</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPinIcon size={18} className="flex-shrink-0 text-[#632034] dark:text-[#f2b6c1] mt-0.5"/>
                <span className="leading-tight">C. Campanillas 135-101,<br/>Ate 15022, Perú</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 w-full border-t border-[#EBEAE8] dark:border-white/10" />

        <div className="mt-8 flex flex-col gap-4 text-xs font-medium text-[#594246]/60 dark:text-gray-500 md:flex-row md:items-center md:justify-between tracking-wide">
          <p>© {new Date().getFullYear()} ESTILOS BOOM. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
      </div>
    </footer>
  );
};
