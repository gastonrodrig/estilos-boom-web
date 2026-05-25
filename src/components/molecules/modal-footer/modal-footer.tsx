import { CTA } from "@components";

type ModalFooterProps = {
  onCancel: () => void;
  cancelText?: string;
  onSubmit?: () => void;
  submitText: string;
  loadingText?: string;
  loading?: boolean;
  disabled?: boolean;
  isSubmitType?: boolean;
};

export const ModalFooter = ({
  onCancel,
  cancelText = "Cancelar",
  onSubmit,
  submitText,
  loadingText = "Procesando...",
  loading = false,
  disabled = false,
  isSubmitType = false,
}: ModalFooterProps) => {
  return (
    <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:justify-end">
      <CTA 
        type="button" 
        onClick={onCancel} 
        className="sm:w-auto bg-white border border-[#f2b6c1] text-[#594246]"
      >
        {cancelText}
      </CTA>
      <CTA
        type={isSubmitType ? "submit" : "button"}
        onClick={!isSubmitType ? onSubmit : undefined}
        className="sm:w-auto"
        disabled={loading || disabled}
      >
        {loading ? loadingText : submitText}
      </CTA>
    </div>
  );
};