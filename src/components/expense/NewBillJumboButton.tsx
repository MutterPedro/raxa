interface NewBillJumboButtonProps {
  interval?: number;
  handleOnClick: () => void;
}

export default function NewBillJumboButton({ handleOnClick }: NewBillJumboButtonProps) {
  return (
    <button
      type="button"
      className="bg-primary text-secondary-color align-middle arvo-bold text-center rounded-full max-h-36 text-4xl px-24 py-7"
      onClick={handleOnClick}
      data-testid="new-bill-jumbo-button"
    >
      + Nova Conta
    </button>
  );
}
