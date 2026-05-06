// "use client";

// import { useMemo } from "react";
// import { 
//   CheckCircle2, 
//   Calendar, 
//   TrendingUp, 
//   ChevronRight, 
//   ExternalLink,
//   History,
//   DollarSign,
//   Eye
// } from "lucide-react";
// import { useStorehouseStore } from "@/hooks";
// import { formatCurrency, formatDate } from "@/core/utils";

// export default function CompletedOrdersPage() {
//   const { purchaseOrders, loading } = useStorehouseStore();

//   // Filtramos y calculamos métricas rápidas
//   const completedOCs = useMemo(() => {
//     return purchaseOrders
//     //   .filter((oc) => (oc.status as string) === 'COMPLETADA')
//       .sort((a, b) => {
//         // ✅ Fix Error .sort: Manejo de fechas seguro
//         const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
//         const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
//         return dateB - dateA;
//       });
//   }, [purchaseOrders]);

//   const totalInvestment = useMemo(() => 
//     completedOCs.reduce((acc, oc) => acc + (oc.total_amount || 0), 0)
//   , [completedOCs]);

//   return (
//     <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
//       {/* ── Header e Indicadores ── */}
//       <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
//         <div>
//           <div className="flex items-center gap-2 text-[#F2778D]">
//             <History className="h-5 w-5" />
//             <span className="text-sm font-bold uppercase tracking-widest">Almacén</span>
//           </div>
//           <h1 className="font-(--font-vidaloka) text-4xl text-[#594246] mt-2">Órdenes Finalizadas</h1>
//           <p className="text-[#9b8088] mt-1">Historial de mercadería ingresada al inventario de Styles Boom.</p>
//         </div>

//         <div className="flex gap-4">
//           <div className="rounded-2xl bg-white border border-rose-100 p-5 shadow-sm min-w-[200px]">
//             <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Inversión Total</p>
//             <p className="text-2xl font-black text-[#F2778D] mt-1">{formatCurrency(totalInvestment)}</p>
//           </div>
//           <div className="rounded-2xl bg-[#594246] p-5 shadow-sm min-w-[160px]">
//             <p className="text-[10px] font-bold text-rose-200/60 uppercase">Órdenes</p>
//             <p className="text-2xl font-black text-white mt-1">{completedOCs.length} OCs</p>
//           </div>
//         </div>
//       </header>

//       {/* ── Tabla de Historial ── */}
//       <main className="overflow-hidden rounded-3xl border border-rose-100 bg-white shadow-sm">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left border-collapse">
//             <thead>
//               <tr className="bg-rose-50/50 text-[11px] font-bold uppercase tracking-wider text-[#b79ca5]">
//                 <th className="px-6 py-5">Código OC</th>
//                 <th className="px-6 py-5">Proveedor</th>
//                 <th className="px-6 py-5">Fecha Llegada</th>
//                 <th className="px-6 py-5 text-center">Items</th>
//                 <th className="px-6 py-5">Inversión</th>
//                 <th className="px-6 py-5">Calidad</th>
//                 <th className="px-6 py-5 text-right">Acciones</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-rose-50 text-sm">
//               {completedOCs.map((oc) => (
//                 <tr key={oc._id} className="hover:bg-rose-50/20 transition-colors group">
//                   <td className="px-6 py-5 font-bold text-[#594246]">
//                     {oc.order_number}
//                   </td>
//                   <td className="px-6 py-5">
//           {/* Usamos la constante 'supplier' que ya tiene el cast de tipo */}
//                         <p className="font-semibold text-[#594246]">
//                             {supplier?.name_company || supplier?.name || "Proveedor"}
//                         </p>
//                         <p className="text-[11px] text-[#9b8088]">
//                             {supplier?.category?.name || "General"}
//                         </p>
//                     </td>
//                   <td className="px-6 py-5">
//                     <div className="flex items-center gap-2 text-[#594246]">
//                       <Calendar className="h-3.5 w-3.5 text-[#F2778D]" />
//                       {formatDate(oc.delivery_date_actual)}
//                     </div>
//                   </td>
//                   <td className="px-6 py-5 text-center">
//                     <span className="rounded-full bg-rose-50 px-3 py-1 text-[12px] font-bold text-[#F2778D]">
//                       {oc.items?.length || 0} SKU
//                     </span>
//                   </td>
//                   <td className="px-6 py-5 font-bold text-[#594246]">
//                     {formatCurrency(oc.total_amount)}
//                   </td>
//                   <td className="px-6 py-5">
//                     <div className="flex items-center gap-1">
//                       <span className={`h-2 w-2 rounded-full ${oc.quality_rating >= 4 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
//                       <span className="font-bold text-[#594246]">{oc.quality_rating}/5</span>
//                     </div>
//                   </td>
//                   <td className="px-6 py-5 text-right">
//                     <button className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-rose-100 text-[#9b8088] hover:bg-[#F2778D] hover:text-white transition-all">
//                       <Eye className="h-4 w-4" />
//                     </button>
//                   </td>
//                 </tr>
//               ))}

//               {completedOCs.length === 0 && !loading && (
//                 <tr>
//                   <td colSpan={7} className="px-6 py-20 text-center text-[#9b8088]">
//                     No hay órdenes completadas aún.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </main>
//     </div>
//   );
// }