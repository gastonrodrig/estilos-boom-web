'use client';

import React, { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { useCheckoutStore } from '@/hooks/extra';
import { useClientPersonStore } from '@/hooks';
import { CheckoutFormValues, DeliveryMethod } from '@/core/models/checkout';
import { useAppSelector } from '@/store';
import { AddAddressModal } from '@/components/organisms/direction-modal';
import { MapPin, Plus, Loader2, Store, Train, Bike, Truck } from 'lucide-react';
import { AddressInput } from '@models';

const TRAIN_STATIONS = [
  "Villa El Salvador", "Parque Industrial", "Pumacahua", "Villa María", 
  "María Auxiliadora", "San Juan", "Atocongo", "Jorge Chávez", "Ayacucho", 
  "Cabitos", "Angamos", "San Borja Sur", "La Cultura", "Arriola", "Gamarra", 
  "Miguel Grau", "El Ángel", "Presbítero Maestro", "Caja de Agua", 
  "Pirámide del Sol", "Los Jardines", "Los Postes", "San Carlos", 
  "San Martín", "Santa Rosa", "Bayóvar"
];

const deliveryMethods: DeliveryMethod[] = [
  { id: 'store', name: 'Recojo en Tienda', description: 'Tienda física', price: 0, estimatedDays: 0 },
  { id: 'point', name: 'Punto de Encuentro', description: 'Estaciones del tren', price: 3, estimatedDays: 2 },
  { id: 'motorized', name: 'Total Motorizado', description: 'Entrega a domicilio', price: 10, estimatedDays: 1 },
  { id: 'province', name: 'Provincia - Shalom', description: 'Envío a todo el Perú', price: 15, estimatedDays: 3 },
];

const CheckoutDeliveryMethodForm: React.FC = () => {
  const { handleGoToPayment, handleGoToShipping } = useCheckoutStore();
  const { startLoadingMyAddresses } = useClientPersonStore();
  
  const { status } = useAppSelector((state) => state.auth);
  const isAuthenticated = status === 'authenticated';
  
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<AddressInput[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const {
    register, control, watch, formState: { errors, isSubmitting }, trigger, setValue,
  } = useFormContext<CheckoutFormValues>();

  const selectedAddressId = watch('selectedAddressId');
  const selectedDeliveryMethod = watch('selectedDeliveryMethod');

  useEffect(() => {
    if (isAuthenticated) {
      const fetchMyAddresses = async () => {
        setIsLoadingAddresses(true);
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
  }, [isAuthenticated, setValue]);

  const handleNext = async () => {
    let fieldsToValidate: any[] = ['selectedDeliveryMethod'];
    
    if (selectedDeliveryMethod?.id === 'motorized') {
      fieldsToValidate.push('selectedAddressId');
    } else if (selectedDeliveryMethod?.id === 'point') {
      fieldsToValidate.push('trainStation');
    } else if (selectedDeliveryMethod?.id === 'province') {
      fieldsToValidate.push('shalomAgency');
    }

    const isValid = await trigger(fieldsToValidate);
    if (isValid) handleGoToPayment();
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

  const getMethodIcon = (id: string) => {
    switch (id) {
      case 'store': return <Store size={18} className="text-[#594246]" />;
      case 'point': return <Train size={18} className="text-[#594246]" />;
      case 'motorized': return <Bike size={18} className="text-[#594246]" />;
      case 'province': return <Truck size={18} className="text-[#594246]" />;
      default: return <MapPin size={18} className="text-[#594246]" />;
    }
  };

  return (
    <div className="bg-[#FAF9F6] dark:bg-[#1a0618]/60 dark:backdrop-blur-md rounded-sm p-6 lg:p-8 border border-[#EBEAE8] dark:border-[#C5A059]/20 shadow-[0_8px_32px_rgba(0,0,0,0.3)] space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-[18px] font-serif text-[#632034] dark:text-[#C5A059] mb-1">2. Método de Entrega</h2>
        <p className="text-[13px] text-[#594246]/70 dark:text-[#f0d8e8]/70 mb-4">Selecciona cómo deseas recibir tu pedido.</p>

        <Controller
          name="selectedDeliveryMethod"
          control={control}
          rules={{ required: 'Debes seleccionar un método de entrega' }}
          render={({ field: { value, onChange } }) => (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
              {deliveryMethods.map((method) => (
                  <div
                  key={method.id}
                  onClick={() => onChange(method)}
                  className={`delivery-option p-4 cursor-pointer flex items-start gap-3 ${
                    value?.id === method.id 
                      ? "selected border-[#632034] dark:border-[#e8b86d] bg-[#FCF5F5] dark:bg-[#C5A059]/10 shadow-sm" 
                      : "border border-[#EBEAE8] dark:border-[#C5A059]/30 bg-white dark:bg-black/40 hover:border-[#D9A2A8] dark:hover:border-[#C5A059]/60"
                  }`}
                >
                  <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${value?.id === method.id ? "border-[#632034] dark:border-[#e8b86d]" : "border-gray-300 dark:border-white/30"}`}>
                    {value?.id === method.id && <div className="w-2 h-2 bg-[#632034] dark:bg-[#e8b86d] rounded-full" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <p className="delivery-option-name font-medium text-[14px] text-[#594246] dark:text-[#fdeef5]">{method.name}</p>
                      <div className="delivery-option-icon">{getMethodIcon(method.id)}</div>
                    </div>
                    <p className="delivery-option-desc text-[12px] text-[#594246]/70 dark:text-[#f0d8e8]/70">{method.description}</p>
                    <p className={`delivery-option-price mt-1 text-[13px] font-bold text-[#632034] dark:text-[#f0a0c0] ${method.price === 0 ? 'free' : ''}`}>
                      {method.price === 0 ? 'GRATIS' : `S/ ${method.price.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        />
        {errors.selectedDeliveryMethod && <p className="text-red-500 text-xs mt-1">{errors.selectedDeliveryMethod.message}</p>}

        {/* 3. CAMPOS DINÁMICOS SEGÚN MÉTODO */}
        
        {/* RECOJO EN TIENDA */}
        {selectedDeliveryMethod?.id === 'store' && (
          <div className="p-4 bg-white dark:bg-black/40 border border-[#EBEAE8] dark:border-[#C5A059]/30 rounded-sm flex items-center gap-3">
            <Store size={24} className="text-[#632034] dark:text-[#e8b86d]" />
            <p className="text-[13px] text-[#594246] dark:text-[#f0d8e8]/70">Tu pedido estará listo para recoger en nuestra tienda principal. Te notificaremos por correo.</p>
          </div>
        )}

        {/* PUNTO DE ENCUENTRO (TREN) */}
        {selectedDeliveryMethod?.id === 'point' && (
          <div className="p-4 bg-white dark:bg-black/40 border border-[#EBEAE8] dark:border-[#C5A059]/30 rounded-sm space-y-3">
            <label className="block text-[13px] font-medium text-[#594246] dark:text-[#f0d8e8]/90">Selecciona la estación de la Línea 1*</label>
            <select
              {...register('trainStation', { required: 'Selecciona una estación' })}
              className={`w-full px-4 py-2.5 text-[14px] bg-white dark:bg-[#1a0618]/80 dark:text-[#fdeef5] border rounded-sm focus:outline-[#632034] dark:focus:outline-[#e8b86d] transition-colors ${errors.trainStation ? 'border-red-500' : 'border-[#EBEAE8] dark:border-[#C5A059]/30'}`}
            >
              <option value="">Selecciona...</option>
              {TRAIN_STATIONS.map(station => (
                <option key={station} value={station}>{station}</option>
              ))}
            </select>
            {errors.trainStation && <p className="text-red-500 text-xs">{errors.trainStation.message}</p>}
          </div>
        )}

        {/* SHALOM */}
        {selectedDeliveryMethod?.id === 'province' && (
          <div className="p-4 bg-white dark:bg-black/40 border border-[#EBEAE8] dark:border-[#C5A059]/30 rounded-sm space-y-3">
            <label className="block text-[13px] font-medium text-[#594246] dark:text-[#f0d8e8]/90">Ingresa la agencia Shalom más cercana a tu domicilio*</label>
            <input
              type="text"
              placeholder="Ej: Shalom Piura Centro"
              {...register('shalomAgency', { required: 'Ingresa la agencia Shalom' })}
              className={`w-full px-4 py-2.5 text-[14px] bg-white dark:bg-[#1a0618]/80 dark:text-[#fdeef5] dark:placeholder-[#fdeef5]/30 border rounded-sm focus:outline-[#632034] dark:focus:outline-[#e8b86d] transition-colors ${errors.shalomAgency ? 'border-red-500' : 'border-[#EBEAE8] dark:border-[#C5A059]/30'}`}
            />
            {errors.shalomAgency && <p className="text-red-500 text-xs">{errors.shalomAgency.message}</p>}
            <p className="text-[12px] text-[#594246]/70 dark:text-[#f0d8e8]/70">El envío a provincia toma entre 3 a 5 días hábiles.</p>
          </div>
        )}

        {/* TOTAL MOTORIZADO (DIRECCIÓN) */}
        {selectedDeliveryMethod?.id === 'motorized' && (
          <div className="address-selector p-5 bg-white dark:bg-transparent border border-[#EBEAE8] dark:border-[#C5A059]/30 rounded-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-medium text-[#594246] dark:text-[#fdeef5]">Seleccionar Dirección de Entrega</h3>
              <button type="button" onClick={() => setIsAddressModalOpen(true)} className="btn-add-address flex items-center gap-1.5 px-3 py-1.5 bg-black text-white text-[12px] rounded-sm hover:bg-[#632034] transition-colors">
                <Plus size={14} /> Agregar
              </button>
            </div>

            {isLoadingAddresses ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="animate-spin w-5 h-5 text-[#632034] mr-2" />
                <span className="text-[13px] text-[#594246]">Cargando tus direcciones...</span>
              </div>
            ) : (
              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-3 p-4 border rounded-sm cursor-pointer transition-all ${
                      selectedAddressId === String(idx) ? 'border-[#632034] bg-[#FCF5F5]' : 'border-[#EBEAE8] hover:border-[#D9A2A8]'
                    }`}
                  >
                    <input type="radio" {...register('selectedAddressId', { required: 'Debes seleccionar una dirección' })} value={String(idx)} className="mt-1 w-3.5 h-3.5 accent-[#632034]" />
                    <div className="flex-1">
                      <p className="font-medium text-[13px] text-[#594246]">
                        {addr.address_line} {addr.reference && `(${addr.reference})`}
                      </p>
                      <p className="text-[12px] text-[#594246]/70 mt-0.5">
                        {addr.district}, {addr.department}
                      </p>
                    </div>
                  </label>
                ))}
                
                {savedAddresses.length === 0 && (
                  <div className="address-empty-text py-6 border border-dashed border-[#EBEAE8] dark:border-[#C5A059]/30 rounded-sm bg-[#FAF9F6] dark:bg-black/20">
                    <p>No tienes direcciones guardadas para entrega a domicilio.</p>
                  </div>
                )}
              </div>
            )}
            {errors.selectedAddressId && <p className="text-red-500 text-xs mt-2">{errors.selectedAddressId.message}</p>}
          </div>
        )}
      </div>

      {/* BOTONES */}
      <div className="pt-6 flex gap-4 border-t border-[#EBEAE8] dark:border-[#C5A059]/20">
        <button
          type="button"
          onClick={handleGoToShipping}
          className="btn-back w-1/2 md:w-auto px-8 py-3.5 border-2 border-gray-200 rounded-sm font-bold text-[#594246] hover:bg-gray-50 transition-colors uppercase text-[12px] tracking-wider"
        >
          Atrás
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={isSubmitting || isLoadingAddresses}
          className="btn-next w-1/2 md:w-auto px-10 py-3.5 rounded-sm text-white text-[12px] uppercase tracking-wider font-bold bg-black hover:bg-[#632034] transition-all disabled:opacity-50"
        >
          {isSubmitting ? 'Procesando...' : 'Siguiente: Pago'}
        </button>
      </div>

      {isAddressModalOpen && (
        <AddAddressModal 
          isOpen={isAddressModalOpen} 
          onClose={() => setIsAddressModalOpen(false)} 
          onSave={handleAddAddress} 
          restrictToLima={selectedDeliveryMethod?.id === 'motorized'}
        />
      )}
    </div>
  );
};

export default CheckoutDeliveryMethodForm;
