"use client";

import Image from "next/image";
import { Modal, CTA } from "@/components/atoms";

interface TechnicalSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: any; // El firstItem de tu lógica
}

export const TechnicalSheetModal = ({ isOpen, onClose, item }: TechnicalSheetModalProps) => {
  if (!item) return null;

  return (
    <Modal 
      open={isOpen} 
      onClose={onClose}
      panelClassName="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8"
      title="Ficha Técnica de Producción"
      titleClassName="text-xl font-bold text-[#594246] font-(--font-vidaloka)"
    >
      <div className="space-y-8 pt-4">
        <div className="flex items-start gap-6">
          <div className="relative h-32 w-32 overflow-hidden rounded-2xl border border-rose-100">
            <Image src={item?.images?.[0] || "/placeholder.png"} alt="Product" fill className="object-cover" />
          </div>
          <div className="space-y-4 flex-1">
            <div>
              <h4 className="text-2xl font-bold text-[#594246]">{item?.name}</h4>
              <p className="text-sm text-[#9b8088]">Código de Referencia: {item?.id_product || "N/A"}</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Material Principal</p>
                <p className="text-sm font-bold text-[#594246]">Tweed / Poliéster</p>
              </div>
              <div className="bg-rose-50/30 p-3 rounded-lg border border-rose-50">
                <p className="text-[10px] font-bold text-[#b79ca5] uppercase">Tipo de Confección</p>
                <p className="text-sm font-bold text-[#594246]">Sastrería</p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <h5 className="text-xs font-bold text-[#594246] uppercase tracking-widest mb-4">Especificaciones de Medidas</h5>
          <div className="overflow-hidden border border-rose-50 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-rose-50/50 text-[#b79ca5]">
                <tr>
                  <th className="p-3">Medida (cm)</th>
                  <th className="p-3 text-center">S</th>
                  <th className="p-3 text-center">M</th>
                  <th className="p-3 text-center">L</th>
                </tr>
              </thead>
              <tbody className="text-[#594246]">
                <tr className="border-t border-rose-50"><td className="p-3">Largo Total</td><td className="p-3 text-center">85</td><td className="p-3 text-center">87</td><td className="p-3 text-center">89</td></tr>
                <tr className="border-t border-rose-50"><td className="p-3">Contorno Pecho</td><td className="p-3 text-center">90</td><td className="p-3 text-center">94</td><td className="p-3 text-center">98</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <CTA className="w-full !bg-white border border-rose-100 !text-[#9b8088]" onClick={onClose}>Cerrar Ficha</CTA>
      </div>
    </Modal>
  );
};