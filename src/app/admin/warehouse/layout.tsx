export default function WarehouseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-m-4 sm:-m-8 relative min-h-[calc(100vh-64px)] flex flex-col z-0">
      
      {/* WAREHOUSE LAYOUT - Background is now inherited from the global AdminLayout */}

      {/* GLOBAL CONTENT CONTAINER FOR WAREHOUSE */}
      <div className="flex-1 w-full bg-transparent p-6 md:p-10 lg:p-12 font-sans relative transition-colors duration-700">
        {children}
      </div>
    </div>
  );
}
