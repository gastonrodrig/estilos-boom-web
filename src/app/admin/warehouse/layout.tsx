export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 sm:-m-8 relative min-h-[calc(100vh-64px)] flex flex-col z-0">
      
      {/* MAGICAL BACKGROUND IMAGE (DARK MODE ONLY) - BLURRED */}
      {/* Expanded slightly in all directions (especially right) to cover any container gaps or scrollbar tracks */}
      <div className="absolute top-[-20px] bottom-[-20px] left-[-20px] right-[-40px] z-[-1] hidden dark:block overflow-hidden bg-[#0A0508] pointer-events-none">
        {/* Background image heavily blurred so it's not distracting */}
        <div 
          className="absolute inset-0 opacity-[0.65] bg-cover bg-center bg-no-repeat blur-[16px] scale-110"
          style={{ backgroundImage: "url('/assets/golden-bg.png')" }}
        />
        {/* Calm pink blur/fade overlay instead of gold */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#E1A0AD]/25 via-[#F2778D]/15 to-transparent mix-blend-overlay blur-3xl" />
        {/* Dark vignette to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0508] via-[#0A0508]/60 to-[#0A0508]/80" />
      </div>

      {/* AMBIENT GLOWS FOR LIGHT MODE */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#F2778D] to-transparent rounded-full blur-[140px] pointer-events-none z-[-1] mix-blend-multiply opacity-15 dark:hidden" />

      {/* GLOBAL CONTENT CONTAINER FOR WAREHOUSE */}
      <div className="flex-1 w-full bg-[#FDFBFB] dark:bg-transparent p-6 md:p-10 lg:p-12 font-sans relative transition-colors duration-700">
        {children}
      </div>
    </div>
  );
}
