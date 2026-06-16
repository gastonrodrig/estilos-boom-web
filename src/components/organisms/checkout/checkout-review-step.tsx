import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useCheckoutStore, useOrderSubmission } from '@/hooks/extra';
import { useCartStore } from '@/hooks';
import { CheckoutFormValues } from '@/core/models/checkout';
import { Loader2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const CheckoutReviewStep: React.FC = () => {
  const router = useRouter();
  const { handleGoToPayment, handleGoToDelivery } = useCheckoutStore();
  const { items } = useCartStore();
  const { watch } = useFormContext<CheckoutFormValues>();
  const formData = watch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const {
    submitOrder,
    isLoadingAddresses,
    displayFirstName,
    displayLastName,
    displayAddress,
    displayDistrict,
    displayDepartment,
  } = useOrderSubmission();

  const [isSuccess, setIsSuccess] = useState(false);

  // Scroll to top when this step mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Si llegamos a este paso y el método fue Mercado Pago (card), 
    // verificamos que el pago realmente haya sido aprobado consultando sessionStorage.
    if (formData.paymentMethod === 'card') {
      const isApproved = sessionStorage.getItem('mp_payment_approved') === 'true';
      if (isApproved) {
        setIsSuccess(true);
        sessionStorage.removeItem('mp_payment_approved');
      }
    }
  }, [formData.paymentMethod]);

  const handleConfirmOrder = async () => {
    setIsConfirming(true);
    const success = await submitOrder();
    setIsConfirming(false);
    if(success) {
      setIsModalOpen(false);
      setIsSuccess(true);
    } else {
      toast.error('Hubo un error al procesar tu pedido. Intenta nuevamente.');
    }
  };

  const paymentLabel = formData.paymentMethod === 'card' ? 'Mercado Pago' : formData.paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'Yape / Plin';
  const paymentIconSrc = formData.paymentMethod === 'card' ? '/assets/visaymaster.png' : formData.paymentMethod === 'transfer' ? '/assets/bank.png' : '/assets/yapeyplin.png';

  if (isSuccess) {
    return (
      <div className="space-y-6 animate-in zoom-in-95 duration-500 rounded-2xl p-10 shadow-lg relative overflow-hidden bg-gradient-to-br from-[#F2778D] to-[#632034] text-white flex flex-col items-center justify-center min-h-[400px]">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-inner animate-bounce">
          <svg className="w-10 h-10 text-[#F2778D]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h2 className="text-3xl font-serif font-bold mb-2">¡Pedido Confirmado!</h2>
        <p className="text-white/80 text-center max-w-md mb-8">
          {formData.paymentMethod === 'card' ? (
            <>Tu orden ha sido registrada y tu pago fue <strong className="text-white bg-white/20 px-2 py-1 rounded-md">Aprobado</strong> exitosamente con Mercado Pago.</>
          ) : (
            <>Tu orden ha sido registrada con el estado <strong className="text-white bg-white/20 px-2 py-1 rounded-md">Verificación de Pago</strong>. Procederemos a verificar tu pago en breve.</>
          )}
        </p>

        <button 
          onClick={() => router.push('/client/orders/active')}
          className="px-8 py-4 bg-white text-[#632034] rounded-full font-bold shadow-xl hover:bg-gray-50 transition-all active:scale-95"
        >
          Ver pedido en mi panel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 border-[#594246]/30 rounded-sm p-8 border border-[#EBEAE8] shadow-sm relative">
      <header>
        <h2 className="text-[25px] font-semibold text-[#594246] pb-3">Revisa tu Pedido</h2>
        <p className="text-sm text-[#827D7D]">Confirmar que todo esté correcto antes de finalizar.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 border border-[#EBEAE8] rounded-sm bg-white">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-[#594246] uppercase text-[15px]">Envío</h3>
            <button onClick={handleGoToDelivery} className="text-[#F2778D] text-xs underline">Editar</button>
          </div>

          {isLoadingAddresses ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 size={14} className="animate-spin text-[#F2778D]" />
              <span className="text-xs text-gray-400">Cargando datos...</span>
            </div>
          ) : (
            <>
              <p className="text-sm text-[#594246] font-medium capitalize">
                {displayFirstName} {displayLastName}
              </p>
              <p className="text-sm text-[#827D7D] capitalize">
                {displayAddress}, {displayDistrict}
              </p>
              <p className="text-sm text-[#827D7D] capitalize">
                {displayDepartment}
              </p>
            </>
          )}
        </div>

        <div className="p-5 border border-[#EBEAE8] rounded-sm bg-white">
          <h3 className="font-bold text-[#594246] uppercase text-[15px] mb-3">Método de Pago</h3>
          <div className="flex items-center gap-2">
            <Image src={paymentIconSrc} alt={paymentLabel} width={35} height={20} className="object-contain" />
            <p className="text-sm text-[#594246]">
              {paymentLabel}
            </p>
          </div>
          <p className="text-xs text-[#827D7D] mt-2 font-medium">
            Envío: {formData.selectedDeliveryMethod?.name} - S/ {formData.selectedDeliveryMethod?.price}
          </p>
        </div>
      </div>

      <div className="pt-6 flex flex-col items-center gap-4">
        <p className="text-[11px] text-gray-400 text-center max-w-md">
          Al hacer clic en "Finalizar Compra", aceptarás nuestros términos y condiciones. Tu pago será procesado de forma segura.
        </p>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isLoadingAddresses}
          className="w-full md:w-2/3 py-5 bg-[#F2778D] text-white rounded-full font-bold text-lg hover:bg-[#F2778D]/90 shadow-lg transition-all active:scale-95 disabled:opacity-50"
        >
          Finalizar Compra
        </button>

        <button onClick={handleGoToPayment} className="text-[#594246] text-sm font-medium hover:underline opacity-70">
          Regresar a Pago
        </button>
      </div>

      {/* MODAL DE CONFIRMACIÓN */}
      {isModalOpen && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              disabled={isConfirming}
              className="absolute top-4 right-4 text-[#827D7D] hover:text-[#594246] transition-colors z-10 disabled:opacity-50"
            >
              <X size={24} />
            </button>

            <div className="p-8 text-center space-y-6">
              <h2 className="text-2xl font-serif text-[#594246] font-bold">¿Estás segura?</h2>
              <p className="text-[#827D7D] text-sm px-4">
                Por favor verifica que la información de tu pedido sea correcta.
              </p>

              <div className="bg-[#FAF9F6] p-5 rounded-2xl text-left border border-[#EBEAE8] space-y-4">
                <div>
                  <p className="text-[11px] text-[#827D7D] font-bold uppercase tracking-wider mb-2">Resumen de Pedido</p>
                  {items.length > 0 && (
                    <div className="flex gap-3 items-center bg-white p-2 rounded-lg border border-[#EBEAE8]">
                      <div className="w-12 h-16 shrink-0 relative">
                        <Image src={items[0].image} alt={items[0].name} width={48} height={64} className="w-full h-full object-cover rounded-md" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-[#594246] leading-tight">{items[0].name}</p>
                        <p className="text-xs text-[#827D7D]">{items[0].color} | {items[0].size}</p>
                        {items.length > 1 && <p className="text-[10px] text-[#F2778D] font-bold mt-1">Y {items.length - 1} artículo(s) más...</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[#594246]">S/ {(items[0].price || 0).toFixed(2)}</p>
                        <p className="text-xs text-[#827D7D]">Cant: {items[0].quantity}</p>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] text-[#827D7D] font-bold uppercase tracking-wider">Dirección de envío</p>
                  <p className="text-[#594246] font-medium text-sm mt-1 capitalize truncate">{displayAddress}, {displayDistrict}</p>
                </div>
                <div>
                  <p className="text-[11px] text-[#827D7D] font-bold uppercase tracking-wider">Método de pago</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Image src={paymentIconSrc} alt={paymentLabel} width={25} height={15} className="object-contain" />
                    <p className="text-[#594246] font-medium text-sm">{paymentLabel}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setIsModalOpen(false)}
                  disabled={isConfirming}
                  className="flex-1 py-3.5 rounded-full font-bold text-[#594246] border-2 border-[#EBEAE8] hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cerrar
                </button>
                <button
                  onClick={handleConfirmOrder}
                  disabled={isConfirming}
                  className="flex-1 py-3.5 rounded-full font-bold text-white bg-[#594246] hover:bg-[#F2778D] transition-colors shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {isConfirming ? <Loader2 size={18} className="animate-spin" /> : null}
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default CheckoutReviewStep;