"use client";

export default function StorekeeperInventoryPage() {
    return (
        <div className="p-8 bg-white rounded-[2.5rem] shadow-sm min-h-[500px]">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-[#5B283A]">Gestión de Almacén</h2>
                <p className="text-sm text-gray-500 mt-1">Control de inventarios y movimientos de stock.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <h3 className="font-bold text-[#5B283A] mb-2">Inventario de Productos</h3>
                    <p className="text-xs text-gray-400 mb-4">Consulta el stock real de vinilos y productos terminados.</p>
                    <div className="h-32 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-300 text-sm">
                        Listado de productos (Próximamente)
                    </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
                    <h3 className="font-bold text-[#5B283A] mb-2">Insumos y Suministros</h3>
                    <p className="text-xs text-gray-400 mb-4">Gestión de materia prima y stock operativo.</p>
                    <div className="h-32 bg-white rounded-2xl border border-gray-100 flex items-center justify-center text-gray-300 text-sm">
                        Listado de insumos (Próximamente)
                    </div>
                </div>
            </div>
        </div>
    );
}
