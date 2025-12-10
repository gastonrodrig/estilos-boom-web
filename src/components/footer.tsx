"use client";

import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="relative w-full text-gray-300">
      {/* Fondo oscuro + halo radial */}
      <div className="absolute inset-0 bg-neutral-900" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_80%_at_70%_20%,rgba(255,64,64,0.18),rgba(255,140,64,0.10)_35%,transparent_70%)]" />

      <div className="relative max-w-6xl mx-auto px-6 py-14">
        {/* Grid principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
          {/* Columna 1: Marca + descripción */}
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 flex items-center justify-center text-white font-semibold">
                EB
              </div>
              <div>
                <p className="text-xl font-semibold text-white">Estilos Boom</p>
                <p className="text-[11px] tracking-[2px] text-gray-400 -mt-1">BOUTIQUE</p>
              </div>
            </div>

            <p className="mt-6 leading-7 text-gray-300 max-w-md">
              Ropa femenina moderna y cómoda, pensada para mujeres que valoran la
              elegancia y la simplicidad.
            </p>
          </div>

          {/* Columna 2: Enlaces rápidos */}
          <div>
            <h3 className="text-lg font-semibold text-rose-300">Enlaces rápidos</h3>
            <ul className="mt-5 space-y-3 text-gray-200">
              <li><Link href="/catalog" className="hover:text-white">Catálogo</Link></li>
              <li><Link href="/offers" className="hover:text-white">Ofertas</Link></li>
              <li><Link href="/terms" className="hover:text-white">Términos y condiciones</Link></li>
              <li><Link href="/privacy" className="hover:text-white">Política de privacidad</Link></li>
            </ul>
          </div>

          {/* Columna 3: Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-rose-300">Contacto</h3>

            <ul className="mt-5 space-y-4">
              <li className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] ring-1 ring-black/20 flex items-center justify-center">
                  {/* Phone icon */}
                  <svg
                    className="w-5 h-5 text-amber-300"
                    fill="none" stroke="currentColor" strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M2.25 6.75c0 7.42 6.02 13.5 13.44 13.5.98 0 1.93-.1 2.84-.3a1.5 1.5 0 0 0 1.13-1.46v-2.31a1.5 1.5 0 0 0-1.09-1.45l-2.81-.84a1.5 1.5 0 0 0-1.61.58l-.83 1.12a9.75 9.75 0 0 1-4.61-4.61l1.12-.83a1.5 1.5 0 0 0 .58-1.61l-.84-2.81A1.5 1.5 0 0 0 8.37 3H6.06A1.5 1.5 0 0 0 4.6 4.13c-.2.9-.3 1.86-.3 2.62Z" />
                  </svg>
                </span>
                <span className="text-gray-200">+51 987 654 321</span>
              </li>

              <li className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] ring-1 ring-black/20 flex items-center justify-center">
                  {/* Mail icon */}
                  <svg
                    className="w-5 h-5 text-rose-300"
                    fill="none" stroke="currentColor" strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="m3 8 7.76 5.17a2 2 0 0 0 2.48 0L21 8" />
                  </svg>
                </span>
                <span className="text-gray-200">hola@estilosboom.pe</span>
              </li>

              <li className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.06)] ring-1 ring-black/20 flex items-center justify-center">
                  {/* Pin icon */}
                  <svg
                    className="w-5 h-5 text-amber-300"
                    fill="none" stroke="currentColor" strokeWidth="1.8"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M12 10.5a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" />
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19.5 9.75c0 5.25-7.5 10.5-7.5 10.5S4.5 15 4.5 9.75a7.5 7.5 0 1 1 15 0Z" />
                  </svg>
                </span>
                <span className="text-gray-200">Lima, Perú</span>
              </li>
            </ul>

            {/* Redes */}
            <div className="mt-6 flex items-center gap-4">
              <Link
                href="https://facebook.com"
                className="w-11 h-11 rounded-full bg-pink-500 text-white flex items-center justify-center shadow-md hover:opacity-90 transition"
                aria-label="Facebook"
              >
                {/* f */}
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M13.5 22v-8h2.7l.3-3h-3V9.4c0-.9.3-1.5 1.6-1.5H16.5V5.2C16.2 5.1 15.2 5 14 5c-2.3 0-3.9 1.4-3.9 4v2.1H7.5v3H10v8h3.5z"/>
                </svg>
              </Link>
              <Link
                href="https://instagram.com"
                className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-white flex items-center justify-center shadow-md hover:opacity-90 transition"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.51 5.51 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.75-2.25a1.25 1.25 0 1 1-1.25 1.25 1.25 1.25 0 0 1 1.25-1.25z"/>
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mt-12 h-px w-full bg-white/10" />

        {/* Copyright + barra */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} Estilos Boom. Todos los derechos reservados.
          </p>
          <span className="h-1 w-24 rounded-full bg-gradient-to-r from-pink-500 to-amber-400" />
        </div>
      </div>
    </footer>
  );
}
