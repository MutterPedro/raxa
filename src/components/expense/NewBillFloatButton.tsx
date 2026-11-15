interface NewBillFloatButtonProps {
  handleOnClick: () => void;
}

export default function NewBillFloatButton({ handleOnClick }: NewBillFloatButtonProps) {
  return (
    <button
      type="button"
      aria-label="Nova conta"
      onClick={handleOnClick}
      data-testid="new-bill-float-button"
      className="fixed bottom-[calc(var(--spacing)*6+env(safe-area-inset-bottom,0px))] right-6 flex size-14 items-center justify-center rounded-full bg-brand-700 text-2xl font-semibold text-brand-50 shadow-card hover:bg-brand-800 dark:hover:bg-brand-600 focus-ring press"
    >
      +
    </button>
  );
}
