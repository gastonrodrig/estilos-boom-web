'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { useClientPersonStore } from '@/hooks'; // 👈 Asegúrate de usar la ruta correcta
import { CheckoutFormValues } from '@/models/checkout';
import { useAppSelector } from '@/store';
import { AddAddressModal } from '@/components/organisms/direction-modal';
import { MapPin, Plus, Loader2 } from 'lucide-react';
import { AddressInput } from '@models';

const CheckoutShippingForm: React.FC = () => {
  const { handleGoToDelivery } = useCheckoutStore();
  const { startLoadingMyAddresses } = useClientPersonStore(); // 👈 Traemos la función del store
  
  const { status, email, phone, id } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<AddressInput[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const {
    register, control, watch, formState: { errors, isSubmitting }, trigger, setValue,
  } = useFormContext<CheckoutFormValues>();

  const selectedAddressId = watch('selectedAddressId');

  // 🚀 FETCH LIMPIO Y REUTILIZABLE
  useEffect(() => {
    if (isAuthenticated) {
      if (email) setValue('email', email);
      if (phone) setValue('phone', phone);
      
      const fetchMyAddresses = async () => {
        setIsLoadingAddresses(true);
        
        // ✨ Una sola línea de código hace toda la magia
        const data = await startLoadingMyAddresses();
        
        if (data && data.length > 0) {
          setSavedAddresses(data);
          const defaultIndex = data.findIndex((addr: AddressInput) => addr.is_default);
          setValue('selectedAddressId', String(defaultIndex !== -1 ? defaultIndex : 0));
        }
        
        setIsLoadingAddresses(false);
      };

      fetchMyAddresses();
    }
  }, [isAuthenticated, email, phone, setValue, id]);

  const handleNext = async () => {
    const isValid = await trigger(['email', 'phone', 'selectedAddressId']);
    if (isValid) handleGoToDelivery();
  };

  const handleAddAddress = (addressData: any) => {
    const newAddress: AddressInput = {
      address_line: addressData.addressLine,
      department: addressData.departmentName || addressData.department || "",
      province: addressData.provinceName || addressData.province || "",
      district: addressData.districtName || addressData.district || "",
      reference: addressData.reference || "",
      is_default: savedAddresses.length === 0,
    };
    
    setSavedAddresses([...savedAddresses, newAddress]);
    setIsAddressModalOpen(false);
    setValue('selectedAddressId', String(savedAddresses.length));
  };

  return (
    <div className="bg-white rounded-sm p-8 border border-[#594246]/30 shadow-sm space-y-6">
      <div className="mb-6">
        {isAuthenticated ? (
          <>
            <h1 className="text-[25px] font-semibold mb-2 text-[#594246]">Completa tu información de contacto</h1>
            <p className="text-sm text-gray-500">Usa tus datos registrados o actualízalos.</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-2 text-[#594246]">Información de Contacto</h1>
            <p className="text-sm text-[#F2778D]">Completa tu email y teléfono</p>
          </>
        )}
      </div>

      <form className="space-y-6">
        {/* Email y Teléfono */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-[#594246]">Email*</label>
            <input
              type="email"
              placeholder="correo@ejemplo.com"
              {...register('email', {
                required: 'El email es requerido',
                pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Email inválido' },
              })}
              className={`w-full px-4 py-2 border rounded-sm focus:outline-[#594246] transition-colors ${errors.email ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#594246]">Teléfono*</label>
            <input
              type="tel"
              placeholder="987654321"
              {...register('phone', { required: 'El teléfono es requerido' })}
              className={`w-full px-4 py-2 border rounded-sm focus:outline-[#594246] transition-colors ${errors.phone ? 'border-red-500' : 'border-gray-200'}`}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
          </div>
        </div>

        {/* Sección de Dirección */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#594246]">Elegir Dirección</h3>
            <button type="button" onClick={() => setIsAddressModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-sm font-semibold hover:bg-gray-800 transition-colors">
              <Plus size={16} /> Agregar
            </button>
          </div>

          {isLoadingAddresses ? (
            <div className="flex items-center justify-center py-6 text-[#F2778D]">
              <Loader2 className="animate-spin w-6 h-6 mr-2" />
              <span className="text-sm font-medium text-gray-500">Cargando tus direcciones...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#594246] mb-4 flex items-center gap-2">
                <MapPin size={16} className="text-[#F2778D]" />
                {savedAddresses.length > 0 ? '¿Desea agregar otra dirección?' : 'Agrega una dirección para tu envío'}
              </p>

              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => (
                  <label
                    key={idx}
                    className={`flex items-center gap-4 p-4 border rounded-sm cursor-pointer transition-all ${
                      selectedAddressId === String(idx) ? 'border-[#F2778D] bg-[#F2D0D3]/30' : 'border-gray-200 hover:border-[#594246]'
                    }`}
                  >
                    <input type="radio" {...register('selectedAddressId', { required: 'Debes seleccionar una dirección' })} value={String(idx)} className="w-4 h-4 accent-[#F2778D]" />
                    <div className="flex-1">
                      <p className="font-semibold text-[#594246]">
                        {addr.address_line} {addr.reference && `, Ref: ${addr.reference}`}
                      </p>
                      <p className="text-xs text-gray-500">
                        {addr.district}, {addr.department} {addr.province && `• ${addr.province}`}
                      </p>
                    </div>
                  </label>
                ))}
                
                {savedAddresses.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-sm">
                    <p className="text-sm text-gray-500">No tienes direcciones guardadas.</p>
                  </div>
                )}
              </div>
            </>
          )}

          {errors.selectedAddressId && <p className="text-red-500 text-xs mt-2">{errors.selectedAddressId.message}</p>}
        </div>

        {/* Checkbox Newsletter */}
        <div className="flex items-center gap-3">
          <Controller
            name="wantsNews"
            control={control}
            render={({ field: { value, onChange } }) => (
              <input type="checkbox" id="wantsNews" checked={value} onChange={onChange} className="w-4 h-4 rounded" style={{ accentColor: '#F2778D' }} />
            )}
          />
          <label htmlFor="wantsNews" className="text-sm text-[#594246]">Me gustaría recibir actualizaciones sobre los últimos productos y promociones</label>
        </div>

        {/* Botón Next */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting || isLoadingAddresses}
            className="w-2/3 h-14 rounded-full text-black font-bold bg-[#F2B6C1] hover:bg-[#F2778D] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Validando...' : 'Continuar Compra'}
          </button>
        </div>
      </form>

      {isAddressModalOpen && (
        <AddAddressModal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} onSave={handleAddAddress} />
      )}
    </div>
  );
};

export default CheckoutShippingForm;