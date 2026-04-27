"use client";

import React, { useState, useEffect } from 'react';
import { X, MapPin, Navigation, Map } from 'lucide-react'; // Añadí el icono 'Map' para el distrito

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (address: any) => void;
}

export const AddAddressModal = ({ isOpen, onClose, onSave }: AddressModalProps) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);

  // 1. Añadimos 'district' al estado inicial
  const [form, setForm] = useState({
    department: '',
    province: '',
    district: '', 
    addressLine: '',
    reference: ''
  });

  // Cargar Departamentos
  useEffect(() => {
    if (isOpen) {
      fetch('https://api-ubigeo-peru.elmerastonitas.workers.dev/api/v1/pe/departments')
        .then(res => {
          if (!res.ok) throw new Error("Error en red");
          return res.json();
        })
        .then(data => {
          const deps = data.data || data;
          setDepartments(Array.isArray(deps) ? deps : []);
        })
        .catch(() => setDepartments([]));
    }
  }, [isOpen]);

  // Cargar Provincias
  useEffect(() => {
    if (form.department) {
      fetch(`https://api-ubigeo-peru.elmerastonitas.workers.dev/api/v1/pe/provinces?department=${form.department}`)
        .then(res => {
          if (!res.ok) throw new Error("Error en red");
          return res.json();
        })
        .then(data => {
          const provs = data.data || data;
          setProvinces(Array.isArray(provs) ? provs : []);
        })
        .catch(() => setProvinces([]));
      
      setForm(prev => ({ ...prev, province: '' }));
    } else {
      setProvinces([]);
    }
  }, [form.department]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={(e) => {
        e.nativeEvent.stopImmediatePropagation(); 
        onClose();
      }}
    >
      <div 
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => {
          e.stopPropagation();
          e.nativeEvent.stopImmediatePropagation();
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FAF9F6]">
          <div>
            <h3 className="text-lg font-bold text-[#594246]">Nueva Ubicación</h3>
            <p className="text-xs text-gray-400">Selecciona departamento y provincia</p>
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.nativeEvent.stopImmediatePropagation();
              onClose();
            }} 
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Departamento</label>
              <select 
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-[#F2D0D3] outline-none text-sm text-[#594246]"
                value={form.department}
                onChange={(e) => setForm({...form, department: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {departments.map((d, index) => (
                  <option key={d.code || `dep-${index}`} value={d.code}>{d.name}</option> 
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest font-bold text-gray-400 ml-1">Provincia</label>
              <select 
                disabled={!form.department}
                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl disabled:opacity-50 text-sm text-[#594246]"
                value={form.province}
                onChange={(e) => setForm({...form, province: e.target.value})}
              >
                <option value="">Seleccionar...</option>
                {provinces.map((p, index) => (
                  <option key={`prov-${index}`} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <hr className="border-gray-50" />

          {/* Inputs de Texto */}
          <div className="space-y-4">
            {/* 2. Nuevo Input para Distrito */}
            <div className="relative">
              <Map size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Distrito (Ej: Miraflores)"
                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:border-[#F2778D] outline-none text-sm"
                value={form.district}
                onChange={(e) => setForm({...form, district: e.target.value})}
              />
            </div>

            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F2778D]" />
              <input 
                type="text" 
                placeholder="Dirección (Ej: Jr. Fanning 331)"
                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl focus:border-[#F2778D] outline-none text-sm"
                value={form.addressLine}
                onChange={(e) => setForm({...form, addressLine: e.target.value})}
              />
            </div>

            <div className="relative">
              <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
              <input 
                type="text" 
                placeholder="Referencia (Ej: Frente al parque)"
                className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-xl outline-none text-sm"
                value={form.reference}
                onChange={(e) => setForm({...form, reference: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 flex gap-3">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 py-3 text-sm font-bold text-gray-400 hover:text-[#594246] transition-colors"
          >
            Cancelar
          </button>
          <button 
            type="button"
            onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation();

                const depName = departments.find(d => d.code === form.department)?.name || "";
                
                // 3. Enviamos el distrito escrito manualmente
                onSave({
                  ...form, 
                  departmentName: depName,
                  provinceName: form.province,
                  districtName: form.district // Mapeamos district a districtName para el padre
                }); 
            }}
            // 4. Añadimos !form.district a la validación para no dejar guardar si está vacío
            disabled={!form.province || !form.district || !form.addressLine} 
            className="flex-[2] py-3 bg-[#F2B6C1] hover:bg-[#F2778D] text-black font-bold rounded-full transition-all disabled:opacity-50"
            >
            Añadir Dirección
          </button>
        </div>
      </div>
    </div>
  );
};