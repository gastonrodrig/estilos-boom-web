"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: any) => void;
  restrictToLima?: boolean;
}

export const AddAddressModal = ({ isOpen, onClose, onSave, restrictToLima = false }: AddressModalProps) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    addressLine: '',
    apartment: '',
    reference: '',
    department: '',
    province: '',
    district: '',
    phone: '',
    saveForFuture: true,
  });

  // Cargar Departamentos
  useEffect(() => {
    if (isOpen) {
      fetch('https://api-ubigeo-peru.elmerastonitas.workers.dev/api/v1/pe/departments')
        .then(res => res.json())
        .then(data => {
          let deps = data.data || data;
          if (Array.isArray(deps)) {
            if (restrictToLima) {
              deps = deps.filter((d: any) => d.name.toUpperCase() === 'LIMA');
              if (deps.length > 0) {
                setForm(prev => ({ ...prev, department: deps[0].code }));
              }
            }
            setDepartments(deps);
          }
        })
        .catch(() => setDepartments([]));
    }
  }, [isOpen, restrictToLima]);

  // Cargar Provincias
  useEffect(() => {
    if (form.department) {
      fetch(`https://api-ubigeo-peru.elmerastonitas.workers.dev/api/v1/pe/provinces?department=${form.department}`)
        .then(res => res.json())
        .then(data => {
          let provs = data.data || data;
          if (Array.isArray(provs)) {
            if (restrictToLima) {
              provs = provs.filter((p: string) => p.toUpperCase() === 'LIMA');
              if (provs.length > 0) {
                setForm(prev => ({ ...prev, province: provs[0] }));
              }
            }
            setProvinces(provs);
          }
        })
        .catch(() => setProvinces([]));
    } else {
      setProvinces([]);
    }
  }, [form.department, restrictToLima]);

  if (!isOpen) return null;

  const isFormValid = 
    form.firstName && form.lastName && form.addressLine && 
    form.department && form.province && form.district && form.phone;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={(e) => {
        e.nativeEvent.stopImmediatePropagation(); 
        onClose();
      }}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 flex flex-col max-h-[90vh]"
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <h3 className="text-[22px] font-semibold text-[#594246]">Dirección de entrega</h3>
            <p className="text-[13px] text-gray-500 mt-1">Completa los datos para que podamos enviarte tu pedido</p>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body Scrollable */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Fila Nombres y Apellidos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#594246] mb-1">
                Nombres <span className="text-[#D9A2A8]">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Ej: María"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#D9A2A8] outline-none text-[14px]"
                value={form.firstName}
                onChange={(e) => setForm({...form, firstName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#594246] mb-1">
                Apellidos <span className="text-[#D9A2A8]">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Ej: López Torres"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#D9A2A8] outline-none text-[14px]"
                value={form.lastName}
                onChange={(e) => setForm({...form, lastName: e.target.value})}
              />
            </div>
          </div>

          {/* Fila Dirección */}
          <div>
            <label className="block text-[13px] font-bold text-[#594246] mb-1">
              Dirección <span className="text-[#D9A2A8]">*</span>
            </label>
            <input 
              type="text" 
              placeholder="Ej: Av. Benavides 1234"
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#D9A2A8] outline-none text-[14px]"
              value={form.addressLine}
              onChange={(e) => setForm({...form, addressLine: e.target.value})}
            />
          </div>

          {/* Fila Dpto y Referencia */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#594246] mb-1">
                N° interior / Dpto <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <input 
                type="text" 
                placeholder="Ej: Dpto 302"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#D9A2A8] outline-none text-[14px]"
                value={form.apartment}
                onChange={(e) => setForm({...form, apartment: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#594246] mb-1">
                Referencia <span className="font-normal text-gray-400">(opcional)</span>
              </label>
              <input 
                type="text" 
                placeholder="Ej: Frente al parque"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#D9A2A8] outline-none text-[14px]"
                value={form.reference}
                onChange={(e) => setForm({...form, reference: e.target.value})}
              />
            </div>
          </div>

          {/* Fila Ubigeo */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-[13px] font-bold text-[#594246] mb-1">
                Departamento <span className="text-[#D9A2A8]">*</span>
              </label>
              <select 
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#D9A2A8] outline-none text-[14px] disabled:bg-gray-50"
                value={form.department}
                disabled={restrictToLima}
                onChange={(e) => setForm({...form, department: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {departments.map((d, index) => (
                  <option key={d.code || `dep-${index}`} value={d.code}>{d.name}</option> 
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#594246] mb-1">
                Provincia <span className="text-[#D9A2A8]">*</span>
              </label>
              <select 
                disabled={!form.department || restrictToLima}
                className="w-full p-3 bg-white border border-gray-200 rounded-xl disabled:bg-gray-50 outline-none text-[14px]"
                value={form.province}
                onChange={(e) => setForm({...form, province: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {provinces.map((p, index) => (
                  <option key={`prov-${index}`} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-bold text-[#594246] mb-1">
                Distrito <span className="text-[#D9A2A8]">*</span>
              </label>
              <input 
                type="text" 
                placeholder="Miraflores"
                className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#D9A2A8] outline-none text-[14px]"
                value={form.district}
                onChange={(e) => setForm({...form, district: e.target.value})}
              />
            </div>
          </div>

          {/* Fila Teléfono */}
          <div>
            <label className="block text-[13px] font-bold text-[#594246] mb-1">
              Teléfono de contacto <span className="text-[#D9A2A8]">*</span>
            </label>
            <input 
              type="tel" 
              placeholder="Ej: 987 274 915"
              className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:border-[#D9A2A8] outline-none text-[14px]"
              value={form.phone}
              onChange={(e) => setForm({...form, phone: e.target.value})}
            />
            <p className="text-[11px] text-gray-400 mt-1">Para coordinar la entrega si es necesario</p>
          </div>

          {/* Checkbox Guardar */}
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="saveAddress"
              checked={form.saveForFuture}
              onChange={(e) => setForm({...form, saveForFuture: e.target.checked})}
              className="w-4 h-4 rounded accent-[#D9A2A8]"
            />
            <label htmlFor="saveAddress" className="text-[13px] font-bold text-[#594246]">
              Guardar esta dirección para futuras compras
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 flex justify-end">
          <button 
            type="button"
            onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation();

                const depName = departments.find(d => d.code === form.department)?.name || "";
                
                onSave({
                  ...form, 
                  departmentName: depName,
                  provinceName: form.province,
                  districtName: form.district
                }); 
            }}
            disabled={!isFormValid} 
            className="w-full py-4 bg-[#D9A2A8] hover:bg-[#C98288] text-white font-bold rounded-xl transition-all disabled:opacity-50"
            >
            Confirmar dirección
          </button>
        </div>
      </div>
    </div>
  );
};