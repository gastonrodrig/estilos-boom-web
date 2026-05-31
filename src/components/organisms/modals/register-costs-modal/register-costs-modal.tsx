"use client";

import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Modal, CTA } from "@/components/atoms";

interface RegisterCostsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: any;
  onConfirmCosts: (costs: Record<string, number>) => Promise<void>;
}

export const RegisterCostsModal = ({ isOpen, onClose, order, onConfirmCosts }: RegisterCostsModalProps) => {
  const [tempCosts, setTempCosts] = useState<Record<string, number>>({});

  if (!order) return null;

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-lg p-8"
      title="Registro de Costos de Taller"
      titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
    >
      <div className="space-y-6 pt-2">
        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-100 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-[#F2778D] shrink-0" />
          <p className="text-xs text-[#9b8088] leading-tight text-pretty">
            Registra el costo de mano de obra pactado. Si la orden se divide en varios talleres, asegúrate de asignar el costo a cada variante correspondiente.
          </p>
        </div>

        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
          {(() => {
            const activeQuotes = order.quotes?.filter((q: any) => q.quote_status !== 'RECHAZADO') || [];
            const productName = order.base_items?.[0]?.id_variant?.id_product?.name || "Producto sin nombre";
            
            if (activeQuotes.length === 0) {
              return (
                <div className="space-y-3">
                  <div className="px-1">
                    <p className="text-[10px] font-bold text-[#b79ca5] uppercase tracking-widest mb-1">Taller General (Pendiente)</p>
                    <h5 className="text-sm font-bold text-[#594246]">{productName}</h5>
                  </div>
                  <div className="space-y-2">
                    {order.base_items?.map((item: any, idx: number) => {
                      // 🛠️ VALIDADOR DE COLOR SEGURO
                      const displayColor = typeof item.id_variant?.color === 'object' 
                        ? item.id_variant?.color?.name 
                        : (item.id_variant?.color || "Sin color");

                      return (
                        <div key={idx} className="flex items-center justify-between p-3 bg-white border border-rose-50/50 hover:border-rose-100 rounded-xl transition-all shadow-sm mb-2 last:mb-0">
                          <div>
                            <p className="text-sm font-bold text-[#594246]">{item.id_variant?.size} · {displayColor}</p>
                            <p className="text-[10px] text-[#9b8088] uppercase">{item.quantity} unidades</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-[#b79ca5]">S/</span>
                            <input 
                              type="number" min="0" step="0.01" placeholder="0.00" 
                              value={tempCosts[item.id_variant?._id || idx] || ""}
                              onChange={(e) => setTempCosts(prev => ({ ...prev, [item.id_variant?._id || idx]: parseFloat(e.target.value) || 0 }))}
                              onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                              className="w-24 h-10 rounded-lg border border-rose-100 px-3 text-right outline-none focus:ring-1 focus:ring-[#F2778D] font-bold text-[#594246] appearance-none" 
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            }

            return activeQuotes.map((quote: any, qIdx: number) => (
              <div key={qIdx} className="space-y-3">
                <div className="px-1 border-l-2 border-[#F2778D] pl-3">
                  <p className="text-[10px] font-bold text-[#F2778D] uppercase tracking-widest mb-0.5">
                    Taller: {quote.id_agent?.name_company || quote.id_agent?.name || "Taller Asignado"}
                  </p>
                  <h5 className="text-sm font-bold text-[#594246]">{productName}</h5>
                </div>
                <div className="space-y-2">
                  {order.base_items?.map((item: any, idx: number) => {
                    const agentId = typeof quote.id_agent === 'string' ? quote.id_agent : (quote.id_agent?._id || quote.id_agent?.name_company || `agent-${qIdx}`);
                    const costKey = `${agentId}_${item.id_variant?._id || idx}`;
                    
                    // 🛠️ VALIDADOR DE COLOR SEGURO
                    const displayColor = typeof item.id_variant?.color === 'object' 
                      ? item.id_variant?.color?.name 
                      : (item.id_variant?.color || "Sin color");

                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-rose-50/50 hover:border-rose-100 rounded-xl transition-all shadow-sm mb-2 last:mb-0">
                        <div>
                          <p className="text-sm font-bold text-[#594246]">{item.id_variant?.size} · {displayColor}</p>
                          <p className="text-[10px] text-[#9b8088] uppercase">{item.quantity} unidades</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[#b79ca5]">S/</span>
                          <input 
                            type="number" min="0" step="0.01" placeholder="0.00" 
                            value={tempCosts[costKey] || ""}
                            onChange={(e) => setTempCosts(prev => ({ ...prev, [costKey]: parseFloat(e.target.value) || 0 }))}
                            onKeyDown={(e) => { if (e.key === '-' || e.key === 'e') e.preventDefault(); }}
                            className="w-24 h-10 rounded-lg border border-rose-100 px-3 text-right outline-none focus:ring-1 focus:ring-[#F2778D] font-bold text-[#594246] appearance-none" 
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ));
          })()}
        </div>
      
        <CTA onClick={() => onConfirmCosts(tempCosts)} className="w-full h-14 !text-lg shadow-xl shadow-rose-100">
          Confirmar Registro de Costos
        </CTA>
      </div>
    </Modal>
  );
};