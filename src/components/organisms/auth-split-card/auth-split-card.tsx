import Image from "next/image";

type AuthSplitCardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export const AuthSplitCard = ({
  title,
  subtitle,
  children,
}: AuthSplitCardProps) => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] w-full bg-[#FAF9F6]">
      {/* Columna Izquierda (Gigante, borde a borde) */}
      <div className="relative hidden md:block md:w-1/2 lg:w-[55%]">
        <Image
          src="/assets/auth-split-card-img.png"
          alt="Auth background"
          fill
          sizes="50vw"
          priority
          className="object-cover object-top transition-transform duration-1000 hover:scale-105"
        />
        {/* Subtle elegant overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#632034]/60 via-transparent to-transparent mix-blend-multiply" />
      </div>

      {/* Columna Derecha (Contenedor del formulario) */}
      <div className="w-full md:w-1/2 lg:w-[45%] flex items-center justify-center p-6 md:p-12 relative">
        {/* Patrón de fondo sutil en la zona derecha */}
        <div 
          className="absolute inset-0 z-0 opacity-60 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#E5B3B8 1.5px, transparent 1.5px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        {/* Cuadro de Inicio de Sesión flotante */}
        <div className="w-full max-w-[540px] bg-white px-8 py-8 md:px-14 md:py-10 rounded-2xl shadow-2xl shadow-[#632034]/5 border border-[#E5B3B8]/30 relative z-10 flex flex-col items-center">
          <div className="flex flex-col items-center justify-center gap-3 w-full">
            <div className="relative w-10 sm:w-12 h-10 sm:h-12 mb-1">
              <Image
                src="/assets/auth-icon.png"
                alt="Auth decoration"
                fill
                sizes="100px"
                className="object-contain"
              />
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif text-[#632034] text-center">
              {title}
            </h1>
          </div>

          {subtitle && (
            <p className="mt-2 text-sm sm:text-[15px] font-medium tracking-wide text-[#594246]/70 text-center">
              {subtitle}
            </p>
          )}

          <div className="mt-6 w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
