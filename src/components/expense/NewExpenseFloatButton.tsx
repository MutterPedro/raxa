interface NewBillFloatButtonProps {
  handleOnClick: () => void;
}

export default function NewBillFloatButton({ handleOnClick }: NewBillFloatButtonProps) {
  return (
    <div className="fixed bottom-10 right-10">
      <button
        type="button"
        className="bg-primary text-secondary-color align-middle arvo-bold text-center rounded-full max-h-36 text-4xl px-16 py-7"
        onClick={handleOnClick}
        data-testid="new-bill-float-button"
      >
        +
      </button>
    </div>
  );
}
