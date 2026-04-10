"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useClientPersonStore, useAuthStore } from "@hooks";
import { CTA, Modal, SelectInput, TextInput, Tooltip, PasswordInput } from "@/components/atoms";
import { AddAddressModal } from "../../direction-modal";
import { DocumentType, ClientType } from "@enums";
import { ClientPerson, AddressInput } from "@models"; // Importamos AddressInput
import { AlertCircle, Plus, Trash2, Mail, Wand2, MapPin } from "lucide-react";
import { generateRandomPassword as generatePwd } from "@helpers";

type ClientPersonModalProps = {
  open: boolean;
  onClose: () => void;
};

export const ClientPersonModal = ({ open, onClose }: ClientPersonModalProps) => {
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const { selected, loading, startCreateClientPerson, startUpdateClientPerson, setSelectedClientPerson } = useClientPersonStore();
  const { startPasswordReset } = useAuthStore();

  const isEdit = !!selected;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    watch,
    setValue,
  } = useForm<ClientPerson & { password?: string }>({
    defaultValues: { addresses: [] }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "addresses"
  });

  const emailValue = watch("email");

  useEffect(() => {
    if (open) {
      if (selected) {
        reset({ ...selected, addresses: selected.addresses || [] });
      } else {
        reset({
          first_name: "", last_name: "", email: "", password: "", phone: "",
          client_type: ClientType.PERSON, document_type: DocumentType.DNI,
          document_number: "", addresses: []
        });
      }
    }
  }, [open, selected, reset]);

  const handleClose = () => {
    setSelectedClientPerson(null);
    onClose();
  };

  const onSaveNewAddress = (addressData: any) => {
    // Mapeamos explícitamente a AddressInput para evitar errores de tipo
    const newAddress: AddressInput = {
      address_line: addressData.addressLine,
      department: addressData.departmentName || addressData.department || "",
      province: addressData.provinceName || addressData.province || "",
      district: addressData.districtName || addressData.district || "", 
      reference: addressData.reference || "",
      is_default: fields.length === 0,
    };

    append(newAddress);
    setIsAddressModalOpen(false);
  };

  const onSubmit = async (data: ClientPerson & { password?: string }) => {
    try {
      const formattedData = {
        ...data,
        password: data.password || undefined,
        addresses: data.addresses || [] 
      };

      const idToUpdate = (selected?._id || selected?.id_user) as string;
      const success = isEdit 
        ? await startUpdateClientPerson(idToUpdate, formattedData)
        : await startCreateClientPerson(formattedData);
        
      if (success) handleClose();
    } catch (error) {
      console.log("❌ ERROR EN ONSUBMIT:", error);
    }
  };

  return (
    <>
      <Modal
        open={open}
        onClose={isAddressModalOpen ? () => {} : handleClose} 
        title={isEdit ? "Editar Cliente" : "Nuevo Cliente"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="my-7 space-y-4 max-h-[60vh] overflow-y-auto pt-4 pr-4 custom-scrollbar">
             {/* --- (Inputs básicos: Nombre, Email, etc.) --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput label="Nombre" {...register("first_name", { required: "Obligatorio" })} error={!!errors.first_name} />
              <TextInput label="Apellido" {...register("last_name", { required: "Obligatorio" })} error={!!errors.last_name} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <TextInput label="Email" type="email" {...register("email", { required: "Obligatorio" })} error={!!errors.email} />
              <TextInput label="Teléfono" {...register("phone", { required: "Obligatorio" })} error={!!errors.phone} />
            </div>

            <TextInput 
              label="DNI (Número de Documento)" 
              {...register("document_number", { 
                required: "Obligatorio",
                minLength: { value: 8, message: "Debe tener 8 dígitos" }
              })} 
              error={!!errors.document_number} 
            />

            {/* SECCIÓN DE DIRECCIONES */}
            <div className="pt-4 border-t border-gray-100 mt-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-[#594246]">Direcciones registradas</h3>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="flex items-center gap-1 text-xs font-bold text-pink-500 hover:text-pink-600 transition-colors"
                >
                  <Plus size={14} />
                  Agregar dirección
                </button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 bg-[#FAF9F6] rounded-2xl border border-gray-100 flex items-center gap-4 group animate-in slide-in-from-right-2">
                    <div className="bg-white p-2 rounded-xl shadow-sm text-[#F2778D]">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#594246] truncate">
                        {watch(`addresses.${index}.address_line`)}
                      </p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-tight">
                        {/* Mostramos el distrito aquí si existe */}
                        {watch(`addresses.${index}.district`)} 
                        {watch(`addresses.${index}.reference`) && ` • Ref: ${watch(`addresses.${index}.reference`)}`}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                
                {fields.length === 0 && (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                    <p className="text-xs text-gray-400">No hay direcciones registradas.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4">
           <CTA type="submit" className="w-full" disabled={loading || isSubmitting}>
             {isEdit ? "Guardar Cambios" : "Crear Cliente"}
           </CTA>
         </div>
      </form>
    </Modal>

      {isAddressModalOpen && (
        <AddAddressModal 
          isOpen={isAddressModalOpen}
          onClose={() => setIsAddressModalOpen(false)}
          onSave={onSaveNewAddress}
        />
      )}
    </>
  );
};