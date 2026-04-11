"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { useClientPersonStore, useStorekeeperStore } from "@hooks";
import {
  CTA,
  Modal,
  SelectInput,
  TextInput,
  Tooltip,
} from "@/components/atoms";
import { Workshop } from "@/core/models/storekeeper/storekeeper.models";

type WorkShopModalProps = {
  open: boolean;
  onClose: () => void;
};

export const WorkShopConfirmationModal = ({
  open,
  onClose,
}: WorkShopModalProps) => {
  const {
    selected,
    loading,
    startSoftDeleteWorkshop,
    setSelectedWorkshop,
  } = useStorekeeperStore();

 

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<Workshop>();


  const handleClose = () => {
    setSelectedWorkshop(null);
    onClose();
  };

  const onSubmit = async (data: Workshop) => {
    try {

      const success = await startSoftDeleteWorkshop(data._id);
      if (success) handleClose();
      
    } catch (error) {
      console.log(error);
    }
  };

  const isButtonDisabled = useMemo(() => loading, [loading]);

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={"Eliminar Workshop"}
      description={
        
           `Desea eliminar el taller ${selected?.name}`
          
      }
    >

        <div className="mt-6 flex w-full items-center justify-end gap-x-6">
          
        <CTA
          type="submit"
          className="w-full"
          disabled={isButtonDisabled || isSubmitting}
          onClick={() => handleClose()}
        >
          {"Cancelar"}
        </CTA>
                <CTA
          type="submit"
          className="w-full"
          disabled={isButtonDisabled || isSubmitting}
          onClick={() => onSubmit(selected!)}
        >
          {"Aceptar"}
        </CTA>
        </div>
      {/* </form> */}
    </Modal>
  );
};
