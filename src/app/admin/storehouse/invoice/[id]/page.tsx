'use client';
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useStorehouseStore } from "@/hooks";
import { Printer } from "lucide-react";

export default function InvoicePDFPage() {
  const { id } = useParams();
  const { getPurchaseOrderById } = useStorehouseStore();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOC = async () => {
      const data = await getPurchaseOrderById(id as string);
      
      // 🕵️‍♂️ LOG DE INSPECCIÓN: Abre la consola (F12) para ver esto
      console.log("📦 Datos de la Orden recibidos:", data);
      if (data?.items) {
        console.table(data.items); // Muestra los productos en una tablita limpia
      }

      setOrder(data);
    };
    fetchOC();
  }, [id, getPurchaseOrderById]);

  if (!order) return <div className="p-10 text-center">Generando documento...</div>;

  // Cálculos seguros para evitar el error 'toFixed'
  const totalAmount = order.total_amount || 0;
  const subtotal = totalAmount / 1.18;
  const igv = totalAmount - subtotal;

  return (
    <>
    {/* 💉 Inyección de estilos para limpieza de impresión */}
    <style dangerouslySetInnerHTML={{ __html: `
      @media print {
        /* Oculta Sidebar, Header y cualquier cosa que no sea la factura */
        aside, nav, header:not(.invoice-header), .sidebar, [role="navigation"] {
          display: none !important;
        }
        /* Elimina márgenes y paddings del layout principal */
        main, body, .main-content {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
          width: 100% !important;
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
        }
        /* Asegura que la factura no tenga sombras y ocupe el ancho total */
        .max-w-[800px] {
          max-width: 100% !important;
          border: none !important;
          box-shadow: none !important;
        }
      }
    `}} />
    <div className="min-h-screen bg-white p-0 md:p-10 print:p-0">
      {/* Botones Flotantes */}
      <div className="fixed bottom-8 right-8 flex gap-3 print:hidden">
        <button 
          onClick={() => window.print()}
          className="bg-[#594246] text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Printer size={20} /> Imprimir / Guardar PDF
        </button>
      </div>

      <div className="max-w-[800px] mx-auto bg-white p-12 border border-gray-100 shadow-sm print:shadow-none print:border-none">
        
        {/* Header Factura */}
        <div className="flex justify-between items-start border-b-2 border-[#F2D0D3] pb-8 mb-8">
          <div>
            <div className="text-[#F2778D] text-3xl font-serif font-bold mb-1">ESTILOS BOOM</div>
            <p className="text-[#594246] text-xs uppercase tracking-widest font-bold">Comprobante de Ingreso Almacén</p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-[#594246]">OC: {order.order_number || 'N/A'}</h2>
            <p className="text-sm text-gray-400">Fecha: {order.updated_at ? new Date(order.updated_at).toLocaleDateString() : '---'}</p>
          </div>
        </div>

        {/* Info Proveedor */}
        <div className="grid grid-cols-2 gap-10 mb-10">
          <div>
            <h3 className="text-[#F2778D] text-[10px] font-bold uppercase mb-2">Proveedor</h3>
            <p className="font-bold text-[#594246]">{order.id_supplier?.name_company || 'Cargando proveedor...'}</p>
            <p className="text-xs text-gray-500">{order.id_supplier?.contact_name}</p>
            <p className="text-xs text-gray-500">RUC: {order.id_supplier?.ruc || '----------'}</p>
          </div>
          <div className="text-right">
            <h3 className="text-[#F2778D] text-[10px] font-bold uppercase mb-2">Destino</h3>
            <p className="font-bold text-[#594246]">Almacén Central Boom</p>
            <p className="text-xs text-gray-500">San Juan de Miraflores, Lima</p>
          </div>
        </div>

        {/* Tabla de Items */}
        <table className="w-full mb-10">
          <thead>
            <tr className="bg-[#FAF9F6] text-[#594246] text-xs uppercase">
              <th className="p-3 text-left">Descripción / SKU</th>
              <th className="p-3 text-center">Cant.</th>
              <th className="p-3 text-right">Unitario</th>
              <th className="p-3 text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
                {order.items?.map((item: any, i: number) => {
                    // 🕵️‍♂️ Mapeo según tus logs:
                    const productName = item.id_variant?.id_product?.name || "Producto sin nombre";
                    const productSku = item.id_variant?.id_product?.sku || "S/N";
                    const variantDetail = `${item.id_variant?.size} - ${item.id_variant?.color}`;
                    
                    // Cambiamos unit_price por unit_cost (que es lo que viene en tu log)
                    const price = Number(item.unit_cost || 0); 
                    const qty = Number(item.quantity || 0);

                    return (
                    <tr key={i} className="text-sm text-[#594246]">
                        <td className="p-3">
                        <p className="font-bold">{productName}</p>
                        <p className="text-[10px] opacity-50">{productSku} ({variantDetail})</p>
                        </td>
                        <td className="p-3 text-center">{qty}</td>
                        <td className="p-3 text-right">S/ {price.toFixed(2)}</td>
                        <td className="p-3 text-right font-bold">S/ {(qty * price).toFixed(2)}</td>
                    </tr>
                    );
                })}
                </tbody>
        </table>

        {/* Totales */}
        <div className="flex justify-end">
          <div className="w-64 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal:</span>
              <span className="text-[#594246]">S/ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">IGV (18%):</span>
              <span className="text-[#594246]">S/ {igv.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-[#F2D0D3] pt-2 mt-2">
              <span className="font-bold text-[#594246]">TOTAL:</span>
              <span className="font-black text-[#F2778D] text-xl">S/ {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Pie de página */}
        <div className="mt-20 text-center border-t border-gray-100 pt-8">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest">
            Este documento es un comprobante interno de recepción de mercadería. <br/>
            Estilos Boom S.A.C - Sistema de Gestión de Almacén
          </p>
        </div>
      </div>
    </div>
    </>
  );
}