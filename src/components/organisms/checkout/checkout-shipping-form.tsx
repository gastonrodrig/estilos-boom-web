'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { CheckoutFormValues } from '@/models/checkout';
import { useAppSelector } from '@/store';
import { AddAddressModal } from '@/components/organisms/direction-modal';
import { MapPin, Plus } from 'lucide-react';
import { AddressInput } from '@models';

const CheckoutShippingForm: React.FC = () => {
  const { handleGoToDelivery } = useCheckoutStore();
  const { status, email, phone } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<AddressInput[]>([]);

  const {
    register,
    control,
    watch,
    formState: { errors, isSubmitting },
    trigger,
    setValue,
  } = useFormContext<CheckoutFormValues>();

  const selectedAddressId = watch('selectedAddressId');

  // Cargar direcciones guardadas del usuario autenticado
  useEffect(() => {
    if (isAuthenticated) {
      if (email) setValue('email', email);
      if (phone) setValue('phone', phone);
      
      // TODO: Obtener direcciones desde el store del usuario autenticado
      // Por ahora usamos direcciones de ejemplo
      setSavedAddresses([
        {
          address_line: 'Juan Fernandez 51',
          district: 'Barcelona',
          department: 'Lima',
          province: 'Lima',
          reference: '',
          is_default: true
        },
        {
          address_line: 'Ca. Los Algarillos 1982',
          district: 'Chorrillos',
          department: 'Lima',
          province: 'Lima',
          reference: '',
          is_default: false
        }
      ]);
    }
  }, [isAuthenticated, email, phone, setValue]);

  const handleNext = async () => {
    const isValid = await trigger([
      'email',
      'phone',
      'selectedAddressId',
    ]);

    if (isValid) {
      handleGoToDelivery();
    }
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
    
    // Seleccionar la dirección recién agregada
    setValue('selectedAddressId', String(savedAddresses.length));
  };

  return (
    <div className="bg-white rounded-sm p-8 border border-[#594246]/30 shadow-sm space-y-6">
      <div className="mb-6">
        {isAuthenticated ? (
          <>
            <h1 className="text-[25px] font-semibold mb-2 text-[#594246]">
              Completa tu información de contacto
            </h1>
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
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              })}
              className={`w-full px-4 py-2 border rounded-sm focus:outline-[#594246] transition-colors ${
                errors.email ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-[#594246]">Teléfono*</label>
            <input
              type="tel"
              placeholder="987654321"
              {...register('phone', { required: 'El teléfono es requerido' })}
              className={`w-full px-4 py-2 border rounded-sm focus:outline-[#594246] transition-colors ${
                errors.phone ? 'border-red-500' : 'border-gray-200'
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        {/* Sección de Dirección - Similar a la imagen adjunta */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#594246]">Elegir Dirección</h3>
            <button
              type="button"
              onClick={() => setIsAddressModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              <Plus size={16} />
              Agregar
            </button>
          </div>

          {/* Pregunta: ¿Desea agregar otra dirección? */}
          <p className="text-sm text-[#594246] mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-[#F2778D]" />
            ¿Desea agregar otra dirección?
          </p>

          {/* Listado de direcciones con radio buttons */}
          <div className="space-y-3">
            {savedAddresses.map((addr, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-4 p-4 border rounded-sm cursor-pointer transition-all ${
                  selectedAddressId === String(idx)
                    ? 'border-[#F2778D] bg-[#F2D0D3]/30'
                    : 'border-gray-200 hover:border-[#594246]'
                }`}
              >
                <input
                  type="radio"
                  {...register('selectedAddressId', { required: 'Debes seleccionar una dirección' })}
                  value={String(idx)}
                  className="w-4 h-4 accent-[#F2778D]"
                />
                <div className="flex-1">
                  <p className="font-semibold text-[#594246]">
                    {addr.address_line}
                    {addr.reference && `, Ref: ${addr.reference}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {addr.district}, {addr.department} {addr.province && `• ${addr.province}`}
                  </p>
                </div>
              </label>
            ))}
          </div>

          {errors.selectedAddressId && (
            <p className="text-red-500 text-xs mt-2">{errors.selectedAddressId.message}</p>
          )}
        </div>

        {/* Checkbox Newsletter */}
        <div className="flex items-center gap-3">
          <Controller
            name="wantsNews"
            control={control}
            render={({ field: { value, onChange } }) => (
              <input
                type="checkbox"
                id="wantsNews"
                checked={value}
                onChange={onChange}
                className="w-4 h-4 rounded"
                style={{ accentColor: '#F2778D' }}
              />
            )}
          />
          <label htmlFor="wantsNews" className="text-sm text-[#594246]">
            Me gustaría recibir actualizaciones sobre los últimos productos y promociones
          </label>
        </div>

        {/* Botón Next */}
        <div className="pt-4 flex justify-center">
          <button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-2/3 h-14 rounded-full text-black font-bold bg-[#F2B6C1] hover:bg-[#F2778D] transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Validando...' : 'Continuar Compra'}
          </button>
        </div>
      </form>

      {/* Modal para agregar nueva dirección */}
      {isAddressModalOpen && (
        <AddAddressModal
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSave={handleAddAddress}
        />
      )}
    </div>
  );
};

export default CheckoutShippingForm;
