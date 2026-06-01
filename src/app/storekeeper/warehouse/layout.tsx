export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-[calc(100vh-64px)] flex flex-col z-0">
      
      {/* 🌟 MAGICAL BACKGROUND IMAGE (DARK MODE ONLY) - EXPANDIDO PARA TAPAR BORDES */}
      <div className="absolute -top-4 -bottom-4 -left-4 -right-4 sm:-top-8 sm:-bottom-8 sm:-left-8 sm:-right-8 z-[-1] hidden dark:block overflow-hidden bg-[#0A0508] pointer-events-none">
        <div 
          className="absolute inset-0 opacity-[0.65] bg-cover bg-center bg-no-repeat blur-[16px] scale-110"
          style={{ backgroundImage: "url('/assets/golden-bg.png')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#E1A0AD]/25 via-[#F2778D]/15 to-transparent mix-blend-overlay blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0508] via-[#0A0508]/60 to-[#0A0508]/80" />
      </div>

      {/* 🌟 MAGICAL BACKGROUND (LIGHT MODE) - EXPANDIDO PARA TAPAR BORDES */}
      <div className="absolute -top-4 -bottom-4 -left-4 -right-4 sm:-top-8 sm:-bottom-8 sm:-left-8 sm:-right-8 z-[-1] dark:hidden overflow-hidden bg-[#F2ECEE] pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-[#F2778D] rounded-full blur-[140px] opacity-[0.15] mix-blend-multiply" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] bg-[#8C6B79] rounded-full blur-[140px] opacity-[0.08] mix-blend-multiply" />
        <div className="absolute top-[30%] left-[50%] w-[600px] h-[600px] bg-white rounded-full blur-[100px] opacity-[0.5]" />
      </div>

      {/* CONTENIDO GLOBAL */}
      <div className="flex-1 w-full bg-transparent p-6 md:p-10 lg:p-12 font-sans relative transition-colors duration-700">
        {children}
      </div>
    </div>
  );
}
