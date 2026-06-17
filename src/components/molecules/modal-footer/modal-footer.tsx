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
    <div className="mt-8 flex flex-col sm:flex-row gap-4">
      <button
        type={isSubmitType ? "submit" : "button"}
        onClick={!isSubmitType ? onSubmit : undefined}
        disabled={loading || disabled}
        className="w-full sm:flex-1 py-4 rounded-2xl bg-gradient-to-r from-[#D6405F] to-[#F23B69] text-white font-medium text-[11px] uppercase tracking-widest shadow-lg hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center order-1 sm:order-2"
      >
        {loading ? loadingText : submitText}
      </button>
      <button
        type="button" 
        onClick={onCancel} 
        className="w-full sm:flex-1 py-4 rounded-2xl border border-[#EAE0E2] dark:border-white/10 bg-white/50 dark:bg-white/5 text-[#8C6B79] dark:text-gray-400 font-medium text-[11px] uppercase tracking-widest hover:bg-white/80 dark:hover:bg-white/10 hover:text-[#40202D] dark:hover:text-white transition-colors shadow-sm order-2 sm:order-1"
      >
        {cancelText}
      </button>
    </div>
  );
};
