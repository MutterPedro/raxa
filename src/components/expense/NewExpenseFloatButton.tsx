interface NewExpenseFloatButtonProps {
  handleOnClick: () => void;
}

export default function NewExpenseFloatButton({ handleOnClick }: NewExpenseFloatButtonProps) {
  return (
    <div className="fixed bottom-10 right-10">
      <button
        type="button"
        className="bg-primary text-secondary-color align-middle arvo-bold text-center rounded-full max-h-36 text-4xl px-16 py-7"
        onClick={handleOnClick}
        data-testid="new-expense-float-button"
      >
        +
      </button>
    </div>
  );
}
