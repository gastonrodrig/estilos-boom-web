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
    <div className="min-h-[calc(100vh-96px)] pt-24 bg-[#f5f5f5]">
      <div className="grid min-h-[calc(100vh-96px)] grid-cols-1 md:grid-cols-2 bg-white">
        {/* Columna Izquierda */}
        <div className="relative hidden md:block">
          <Image
            src="/assets/auth-split-card-img.png"
            alt="Auth visual"
            fill
            priority
            className="object-cover object-top"
          />
        </div>

        {/* Columna Derecha */}
        <div
          className="
            flex flex-col items-center justify-center text-center
            px-4 sm:px-6 md:px-16
          "
        >
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <div className="relative w-8 sm:w-10 h-6 sm:h-8">
            <Image
              src="/assets/auth-icon.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>

          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold">
            {title}
          </h1>
        </div>

          {subtitle && (
            <p className="mt-2 text-sm sm:text-base font-light text-neutral-500">
              {subtitle}
            </p>
          )}

          <div className="mt-6 w-full max-w-sm sm:max-w-md mx-auto">{children}</div>
        </div>
      </div>
    </div>
  );
};
