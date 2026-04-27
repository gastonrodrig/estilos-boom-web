"use client";

import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { MapPin, Navigation, Map, Mail, Phone, User } from 'lucide-react';
import { CheckoutFormValues } from '@/models/checkout';

interface AddAddressFormProps {
  fieldPrefix: string;
  showContactInfo?: boolean;
}

export const AddAddressForm = ({ fieldPrefix, showContactInfo = true }: AddAddressFormProps) => {
  const [departments, setDepartments] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  
  const { register, watch, formState: { errors } } = useFormContext<CheckoutFormValues>();

  const selectedDept = watch(`${fieldPrefix}.department` as any);

  // Cargar Departamentos
  useEffect(() => {
    fetch('https://api-ubigeo-peru.elmerastonitas.workers.dev/api/v1/pe/departments')
      .then(res => res.json())
      .then(data => {
        const deps = data.data || data;
        setDepartments(Array.isArray(deps) ? deps : []);
      })
      .catch(() => setDepartments([]));
  }, []);

  // Cargar Provincias
  useEffect(() => {
    if (selectedDept) {
      fetch(`https://api-ubigeo-peru.elmerastonitas.workers.dev/api/v1/pe/provinces?department=${selectedDept}`)
        .then(res => res.json())
        .then(data => {
          const provs = data.data || data;
          setProvinces(Array.isArray(provs) ? provs : []);
        })
        .catch(() => setProvinces([]));
    } else {
      setProvinces([]);
    }
  }, [selectedDept]);

  // Obtener errores anidados de forma segura
  const getFieldError = (field: string) => {
    const errorObj = (errors as any)?.[fieldPrefix];
    return errorObj?.[field];
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 bg-gray-50 rounded-lg">
      {/* 👤 INFORMACIÓN DE CONTACTO */}
      {showContactInfo && (
        <>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex text-xs font-bold uppercase text-[#594246] mb-1 items-center gap-1">
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                {...register(`${fieldPrefix}.email` as any, {
                  required: 'El email es requerido',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                className={`w-full px-4 py-2 border rounded-sm focus:outline-[#594246] transition-colors ${
                  getFieldError('email') ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {getFieldError('email') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('email')?.message}</p>
              )}
            </div>

            <div>
              <label className="flex text-xs font-bold uppercase text-[#594246] mb-1 items-center gap-1">
                <Phone size={14} /> Teléfono
              </label>
              <input
                type="tel"
                placeholder="987654321"
                {...register(`${fieldPrefix}.phone` as any, {
                  required: 'El teléfono es requerido',
                  pattern: {
                    value: /^[0-9]{9}$/,
                    message: 'Debe tener 9 dígitos'
                  }
                })}
                className={`w-full px-4 py-2 border rounded-sm focus:outline-[#594246] transition-colors ${
                  getFieldError('phone') ? 'border-red-500' : 'border-gray-200'
                }`}
              />
              {getFieldError('phone') && (
                <p className="text-red-500 text-xs mt-1">{getFieldError('phone')?.message}</p>
              )}
            </div>
          </div>

          <hr className="border-gray-200" />
        </>
      )}

      {/* 📍 INFORMACIÓN DE DIRECCIÓN */}
      <div>
        <label className="flex text-xs font-bold uppercase text-[#594246] mb-2 items-center gap-1">
          <MapPin size={14} /> Dirección
        </label>
        <div className="space-y-3">
          {/* Dirección Principal */}
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F2778D]" />
            <input
              type="text"
              placeholder="Jr. Fanning 331"
              {...register(`${fieldPrefix}.address` as any, { required: 'La dirección es requerida' })}
              className={`w-full pl-10 p-3 bg-white border rounded-sm focus:outline-[#594246] transition-colors ${
                getFieldError('address') ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {getFieldError('address') && (
              <p className="text-red-500 text-xs mt-1">{getFieldError('address')?.message}</p>
            )}
          </div>

          {/* Apartamento */}
          <div className="relative">
            <Navigation size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              placeholder="Apartamento, suite, etc. (opcional)"
              {...register(`${fieldPrefix}.apartment` as any)}
              className="w-full pl-10 p-3 bg-white border border-gray-200 rounded-sm focus:outline-[#594246] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 🗺️ UBIGEO */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold uppercase text-[#594246] mb-1">Departamento*</label>
          <select
            {...register(`${fieldPrefix}.department` as any, { required: 'El departamento es requerido' })}
            className={`w-full px-3 py-2 bg-white border rounded-sm focus:outline-[#594246] text-sm ${
              getFieldError('department') ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="">Seleccionar...</option>
            {departments.map((d, index) => (
              <option key={d.code || `dep-${index}`} value={d.code}>{d.name}</option>
            ))}
          </select>
          {getFieldError('department') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('department')?.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold uppercase text-[#594246] mb-1">Provincia*</label>
          <select
            disabled={!selectedDept}
            {...register(`${fieldPrefix}.province` as any, { required: 'La provincia es requerida' })}
            className={`w-full px-3 py-2 bg-white border rounded-sm focus:outline-[#594246] text-sm disabled:opacity-50 ${
              getFieldError('province') ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <option value="">Seleccionar...</option>
            {provinces.map((p, index) => (
              <option key={`prov-${index}`} value={p}>{p}</option>
            ))}
          </select>
          {getFieldError('province') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('province')?.message}</p>
          )}
        </div>
      </div>

      {/* Distrito */}
      <div>
        <label className="block text-xs font-bold uppercase text-[#594246] mb-1">Distrito*</label>
        <div className="relative">
          <Map size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Miraflores"
            {...register(`${fieldPrefix}.district` as any, { required: 'El distrito es requerido' })}
            className={`w-full pl-10 p-3 bg-white border rounded-sm focus:outline-[#594246] transition-colors ${
              getFieldError('district') ? 'border-red-500' : 'border-gray-200'
            }`}
          />
          {getFieldError('district') && (
            <p className="text-red-500 text-xs mt-1">{getFieldError('district')?.message}</p>
          )}
        </div>
      </div>

      {/* Código Postal */}
      <div>
        <label className="block text-xs font-bold uppercase text-[#594246] mb-1">Código Postal*</label>
        <input
          type="text"
          placeholder="15022"
          {...register(`${fieldPrefix}.postalCode` as any, { required: 'El código postal es requerido' })}
          className={`w-full px-4 py-3 bg-white border rounded-sm focus:outline-[#594246] transition-colors ${
            getFieldError('postalCode') ? 'border-red-500' : 'border-gray-200'
          }`}
        />
        {getFieldError('postalCode') && (
          <p className="text-red-500 text-xs mt-1">{getFieldError('postalCode')?.message}</p>
        )}
      </div>
    </div>
  );
};
