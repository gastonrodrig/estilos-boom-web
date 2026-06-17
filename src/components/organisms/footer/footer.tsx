"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { FacebookIcon, InstagramIcon, Logo, TiktokIcon } from "@/components/atoms";
import { Modal } from "@/components/atoms/modal/modal";
import { Mail, MapPin, Phone, Truck, CreditCard, FileText, RefreshCw } from "lucide-react";

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

  const AnimatedButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
    <button onClick={onClick} className="group relative inline-block opacity-60 hover:opacity-100 transition-opacity duration-300 text-left" style={{ fontSize: '0.8rem', letterSpacing: '0.05em' }}>
      {children}
      <span className="absolute left-0 -bottom-1 w-0 h-[1px] bg-current transition-all duration-300 group-hover:w-full" />
    </button>
  );

  const [openModal, setOpenModal] = useState<string | null>(null);

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
              <li><AnimatedButton onClick={() => setOpenModal('shipping')}>Envíos y Entregas</AnimatedButton></li>
              <li><AnimatedButton onClick={() => setOpenModal('payment')}>Medios de Pago</AnimatedButton></li>
              <li><AnimatedButton onClick={() => setOpenModal('terms')}>Términos Legales</AnimatedButton></li>
              <li><AnimatedButton onClick={() => setOpenModal('refund')}>Devoluciones</AnimatedButton></li>
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

      {/* Modals de Información */}
      <Modal 
        open={openModal === 'shipping'} 
        onClose={() => setOpenModal(null)}
        title={
          <div className="flex items-center gap-2 text-[#8B3A52] dark:text-[#f0a0c0]">
            <Truck className="w-6 h-6" />
            <span>Envíos y Entregas</span>
          </div>
        }
      >
        <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed space-y-4 mt-2">
          <p>Realizamos envíos a todo el Perú mediante agencias de confianza (Shalom, Marvisur, Olva Courier).</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Lima Metropolitana:</strong> Entregas estimadas entre 24 a 48 horas hábiles.</li>
            <li><strong>Provincias:</strong> Entregas estimadas entre 2 a 5 días hábiles, dependiendo del destino.</li>
          </ul>
          <p>El costo de envío varía según la provincia y agencia seleccionada. Te confirmaremos el número de seguimiento una vez despachado tu pedido.</p>
        </div>
      </Modal>

      <Modal 
        open={openModal === 'payment'} 
        onClose={() => setOpenModal(null)}
        title={
          <div className="flex items-center gap-2 text-[#8B3A52] dark:text-[#f0a0c0]">
            <CreditCard className="w-6 h-6" />
            <span>Medios de Pago</span>
          </div>
        }
      >
        <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed space-y-6 mt-2">
          <p>Para tu mayor comodidad y seguridad, aceptamos los siguientes métodos de pago:</p>
          
          <div className="space-y-4">
            {/* Mercado Pago */}
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-10 flex-shrink-0 bg-white rounded overflow-hidden p-1 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                <Image src="/assets/visaymaster.png" alt="Tarjetas" fill className="object-contain p-1" />
              </div>
              <div>
                <strong>Mercado Pago:</strong> Paga de forma segura con cualquier tarjeta de crédito o débito (Visa, Mastercard, Amex).
              </div>
            </div>

            {/* Yape/Plin */}
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-10 flex-shrink-0 bg-white rounded overflow-hidden p-1 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                <Image src="/assets/yapeyplin.png" alt="Yape y Plin" fill className="object-contain p-1" />
              </div>
              <div>
                <strong>Yape / Plin:</strong> Transferencias rápidas y sin comisiones.
              </div>
            </div>

            {/* Transferencias */}
            <div className="flex items-start gap-4">
              <div className="relative w-16 h-10 flex-shrink-0 bg-white rounded overflow-hidden p-1 border border-gray-100 dark:border-white/10 flex items-center justify-center">
                <Image src="/assets/bank.png" alt="Bancos" fill className="object-contain p-1" />
              </div>
              <div>
                <strong>Transferencias Bancarias:</strong> Aceptamos pagos directos a nuestras cuentas BCP, Interbank y BBVA.
              </div>
            </div>
          </div>

          <p className="pt-2 border-t border-gray-200 dark:border-white/10">Los pedidos se procesan una vez confirmado el pago en nuestros sistemas.</p>
        </div>
      </Modal>

      <Modal 
        open={openModal === 'terms'} 
        onClose={() => setOpenModal(null)}
        title={
          <div className="flex items-center gap-2 text-[#8B3A52] dark:text-[#f0a0c0]">
            <FileText className="w-6 h-6" />
            <span>Términos Legales</span>
          </div>
        }
      >
        <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed space-y-4 mt-2">
          <p>Bienvenido a Estilos Boom. Al utilizar nuestra tienda online, aceptas nuestras condiciones generales.</p>
          <p>Toda la información personal proporcionada (nombres, correos, direcciones) será tratada de manera estrictamente confidencial y se usará únicamente para procesar tus pedidos.</p>
          <p>Nos reservamos el derecho de modificar precios, ofertas y disponibilidad de productos sin previo aviso. Las promociones están sujetas a stock.</p>
        </div>
      </Modal>

      <Modal 
        open={openModal === 'refund'} 
        onClose={() => setOpenModal(null)}
        title={
          <div className="flex items-center gap-2 text-[#8B3A52] dark:text-[#f0a0c0]">
            <RefreshCw className="w-6 h-6" />
            <span>Devoluciones y Cambios</span>
          </div>
        }
      >
        <div className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed space-y-4 mt-2">
          <p>En Estilos Boom queremos que estés feliz con tu compra. Si no estás satisfecha, aceptamos cambios y devoluciones bajo las siguientes condiciones:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Tienes un plazo máximo de <strong>7 días calendario</strong> desde la recepción del pedido para solicitar el cambio.</li>
            <li>La prenda debe estar en <strong>perfectas condiciones</strong>, sin uso, sin manchas, sin olores y con todas sus etiquetas originales intactas.</li>
            <li>Los costos de envío por devoluciones o cambios por talla/modelo corren por cuenta del cliente, salvo que se trate de un defecto de fábrica.</li>
          </ul>
          <p>Contáctanos a nuestro WhatsApp o correo oficial para iniciar tu proceso de cambio.</p>
        </div>
      </Modal>

    </footer>
  );
};
