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
      className="fixed bottom-6 right-6 flex size-14 items-center justify-center rounded-full bg-brand-700 text-2xl font-semibold text-brand-50 shadow-card transition-colors hover:bg-brand-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-px dark:bg-brand-600 dark:hover:bg-brand-500"
    >
      +
    </button>
  );
}
