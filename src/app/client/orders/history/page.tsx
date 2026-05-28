'use client';

import { CheckCircle2, XCircle, Eye, RefreshCw, ShoppingCart, Package } from 'lucide-react';
import Link from 'next/link';

// Mock Data for Order History
const HISTORY_ORDERS = [
  {
    id: "0038",
    date: "10 de mayo, 2026",
    status: "Entregado",
    total: 189.90,
    itemsCount: 3,
    products: [
      { id: 1, image: "/assets/product/vestido-corto-floral-cuello-v.png", name: "Blusa Lara" },
      { id: 2, image: "/assets/product/vestido-elegante-encaje-volantes.png", name: "Falda Midi Elegante" }
    ]
  },
  {
    id: "0034",
    date: "15 de abril, 2026",
    status: "Cancelado",
    total: 95.00,
    itemsCount: 1,
    products: [
      { id: 3, image: "/assets/product/vestido-escote-v.png", name: "Vestido Escote V" }
    ]
  },
  {
    id: "0021",
    date: "02 de enero, 2026",
    status: "Entregado",
    total: 250.00,
    itemsCount: 2,
    products: [
      { id: 4, image: "/assets/product/vestido-linea-a-floral.png", name: "Vestido Línea A Floral" },
      { id: 5, image: "/assets/product/vestido-midi-halter.png", name: "Vestido Midi Halter" }
    ]
  }
];

export default function OrderHistoryPage() {
  return (
    <div className="space-y-10 w-full pb-10">
      
      {/* Header */}
      <div className="relative z-10">
        <h1 className="text-3xl font-serif font-medium text-[#594246] tracking-wide">Historial de Pedidos</h1>
        <p className="text-[#594246]/70 text-sm mt-1 font-medium">Revisa tus compras anteriores, descarga tus boletas o vuelve a comprar.</p>
      </div>

      {/* Orders List */}
      <div className="space-y-6 relative z-10">
        {HISTORY_ORDERS.map((order) => (
          <div key={order.id} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_10px_40px_-10px_rgba(89,66,70,0.12)] border border-[#EBEAE8] p-6 lg:p-8 relative overflow-hidden transition-all duration-300 hover:shadow-[0_15px_50px_-10px_rgba(89,66,70,0.18)] hover:border-[#F2D0D3]/60 flex flex-col lg:flex-row gap-6 lg:gap-10">
            
            {/* Status Strip */}
            <div className={`absolute top-0 left-0 w-1.5 h-full ${order.status === 'Entregado' ? 'bg-gradient-to-b from-[#F2778D] to-[#F2B6C1]' : 'bg-[#EBEAE8]'}`}></div>

            {/* Left Column: Order Info */}
            <div className="flex flex-col gap-4 lg:w-1/3 shrink-0 lg:border-r border-[#EBEAE8]/70 lg:pr-8 pl-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-[#632034]">Pedido #{order.id}</h2>
                  <p className="text-[#594246]/60 font-medium text-sm mt-0.5">{order.date}</p>
                </div>
                {/* Status Pill */}
                {order.status === "Entregado" ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold shadow-sm">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Entregado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-500 border border-gray-200 rounded-full text-xs font-bold shadow-sm">
                    <XCircle className="w-3.5 h-3.5" /> Cancelado
                  </span>
                )}
              </div>

              <div className="mt-auto pt-4 flex items-end justify-between border-t border-[#EBEAE8]/50 border-dashed">
                <span className="text-[#594246]/60 text-sm font-medium">{order.itemsCount} {order.itemsCount === 1 ? 'artículo' : 'artículos'}</span>
                <span className="text-xl font-bold text-[#F2778D]">S/ {order.total.toFixed(2)}</span>
              </div>
            </div>

            {/* Middle Column: Product Thumbnails */}
            <div className="flex-1 flex flex-col justify-center">
              <p className="text-[#632034] font-bold text-sm mb-3">Productos comprados</p>
              <div className="flex flex-wrap gap-3">
                {order.products.map((product) => (
                  <div key={product.id} className="relative group cursor-pointer">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#EBEAE8] shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:border-[#F2D0D3] group-hover:shadow-md">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#632034] text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg pointer-events-none z-20">
                      {product.name}
                      {/* Little triangle */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#632034]"></div>
                    </div>
                  </div>
                ))}
                
                {/* if there are more products than shown, a "+X" box could go here, but we show all for now */}
              </div>
            </div>

            {/* Right Column: Actions */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-center shrink-0 lg:w-48">
              
              <Link href={`/client/orders/${order.id}`} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all duration-300 shadow-sm bg-white border border-[#EBEAE8] text-[#632034] hover:border-[#F2D0D3] hover:bg-[#FAF9F6]">
                <Eye className="w-4 h-4" />
                Ver detalles
              </Link>
              
              {order.status === "Entregado" && (
                <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl font-bold transition-all duration-300 shadow-sm bg-[#632034] text-white hover:bg-[#F2778D] hover:shadow-md border border-transparent">
                  <ShoppingCart className="w-4 h-4" />
                  Volver a comprar
                </button>
              )}

            </div>

          </div>
        ))}
      </div>
      
    </div>
  );
}
