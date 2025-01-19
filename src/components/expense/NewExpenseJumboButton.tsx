import { useEffect, useState } from 'react';

interface NewBillJumboButtonProps {
  interval?: number;
  handleOnClick: () => void;
}

export default function NewBillJumboButton({ interval = 2000, handleOnClick }: NewBillJumboButtonProps) {
  const wordsList = ['+ Nova Conta', '+ Nova Despesa', '+ Nova Compra', '+ Novo Rolê', '+ Novo RAXA!'];

  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setWordIndex((wordIndex + 1) % wordsList.length);
    }, 2000);
  }, [wordIndex, interval, wordsList.length]);

  return (
    <button
      type="button"
      className="bg-primary text-secondary-color align-middle arvo-bold text-center rounded-full max-h-36 text-4xl px-24 py-7"
      onClick={handleOnClick}
      data-testid="new-bill-jumbo-button"
    >
      {wordsList[wordIndex]}
    </button>
  );
}
