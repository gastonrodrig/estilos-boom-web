"use client";

import Link from "next/link";
import Image from "next/image";
import { FacebookIcon, InstagramIcon, Logo, TiktokIcon } from "@/components/atoms";
import { MailIcon, MapIcon, MapPinIcon, PhoneIcon } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative w-full overflow-hidden bg-gradient-to-b from-[#f6e4ea] via-[#f2d5df] to-[#e8c8d4] text-[#6b4a4a]">
      <div className="absolute inset-0 bg-[radial-gradient(70%_70%_at_20%_10%,rgba(255,255,255,0.55),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_80%_30%,rgba(255,183,197,0.35),transparent_60%)]" />
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/assets/footer-patern.png"
          alt="footer pattern"
          fill
          className="object-cover opacity-15"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
          {/* Marca + Contacto */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <Logo width={180} isHome={false} />
            </div>
            <p className="text-sm leading-7 text-[#6b4a4a]/90">
              Ropa femenina moderna y cómoda, pensada para mujeres que valoran la
              elegancia y la simplicidad.
            </p>

            <div>
              <h3 className="text-lg font-semibold text-[#7b5050]">Contacto</h3>
              <ul className="mt-4 space-y-3 text-sm text-[#6b4a4a]">
                <li className="flex items-center gap-3">
                  <PhoneIcon size={25} className="flex-shrink-0 text-[#8b6b6b]"/>
                  <span>+51 987 654 321</span>
                </li>
                <li className="flex items-center gap-3">
                  <MailIcon size={25} className="flex-shrink-0 text-[#8b6b6b]"/>
                  <span>estiloboom.oficial@gmail.com</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPinIcon size={25} className="flex-shrink-0 text-[#8b6b6b]"/>
                  <span>C. Campanillas 135-101, Ate 15022, Perú</span>
                </li>
              </ul>

              <div className="mt-5 flex items-center gap-3">
                <Link
                  href="https://www.facebook.com/estilo.boom.online"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm hover:bg-white transition"
                >
                  <FacebookIcon size={22} color="#6b4a4a" />
                </Link>
                <Link
                  href="https://www.instagram.com/estilo_boom_"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm hover:bg-white transition"
                >
                  <InstagramIcon size={22} color="#6b4a4a" />
                </Link>
                <Link
                  href="https://tiktok.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Tiktok"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/70 shadow-sm hover:bg-white transition"
                >
                  <TiktokIcon size={22} color="#6b4a4a" />
                </Link>
              </div>
            </div>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-[#7b5050]">Enlaces rápidos</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/home" className="hover:text-[#7b5050]">New In</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-[#7b5050]">Best Seller</Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-[#7b5050]">Dresses</Link>
              </li>
            </ul>
          </div>

          {/* Información */}
          <div>
            <h3 className="text-lg font-semibold text-[#7b5050]">Información</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/shipping" className="hover:text-[#7b5050]">Envíos y entregas</Link>
              </li>
              <li>
                <Link href="/payment" className="hover:text-[#7b5050]">Medios de pago</Link>
              </li>
              <li>
                <Link href="/pickup" className="hover:text-[#7b5050]">Puntos de recojo</Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[#7b5050]">Términos y condiciones</Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[#7b5050]">Política de privacidad</Link>
              </li>
              <li>
                <Link href="/refund" className="hover:text-[#7b5050]">Política de reembolso</Link>
              </li>
            </ul>
          </div>

          {/* Nosotros */}
          <div>
            <h3 className="text-lg font-semibold text-[#7b5050]">Nosotros</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/about" className="hover:text-[#7b5050]">Quiénes somos</Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-[#7b5050]">Reviews de clientes</Link>
              </li>
              <li>
                <Link href="/stores" className="hover:text-[#7b5050]">Nuestra tienda</Link>
              </li>
              <li>
                <Link href="/wholesale" className="hover:text-[#7b5050]">Ventas mayoristas</Link>
              </li>
              <li>
                <Link href="/jobs" className="hover:text-[#7b5050]">Trabaja con nosotros</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 w-full bg-[#d7b9c0]/60 h-[2px]" />

        <div className="mt-6 flex flex-col gap-4 text-sm text-[#7b5050] md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Estilos Boom. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
