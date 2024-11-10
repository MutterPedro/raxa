import { useEffect, useState } from 'react';
import { myContainer } from '../../inversify.config';
import { BillService } from '../../core/services/BillService';
import { TYPES } from '../../infra/di';
import Bill from '../../core/entities/Bill';

interface NewExpenseJumboButtonProps {
  interval?: number;
}

export default function NewExpenseJumboButton({ interval = 2000 }: NewExpenseJumboButtonProps) {
  const wordsList = ['+ Nova Conta', '+ Nova Despesa', '+ Nova Compra', '+ Novo Rolê', '+ Novo RAXA!'];

  const [wordIndex, setWordIndex] = useState(0);
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    setTimeout(() => {
      setWordIndex((wordIndex + 1) % wordsList.length);
    }, 2000);
  }, [wordIndex, interval, wordsList.length]);

  async function handleOnClick() {
    const billService = myContainer.get<BillService>(TYPES.BillService);

    const bill = await billService.createBill({
      name: 'Nova Despesa',
      amount: 1000,
      date: new Date(),
    });

    setBills([...bills, bill]);
  }

  return (
    <div className="container">
      <button
        type="button"
        className="bg-primary text-secondary-color align-middle arvo-bold text-center rounded-full max-h-36 text-4xl px-24 py-7"
        onClick={handleOnClick}
      >
        {wordsList[wordIndex]}
      </button>
      <ul role="list" className="divide-y divide-gray-100 bg-gray-300">
        {bills.map((bill) => (
          <li className="flex justify-between gap-x-6 py-5" key={`bill-${bill.id}`}>
            <div className="flex min-w-0 gap-x-4">
              <img
                className="h-12 w-12 flex-none rounded-full bg-gray-50"
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
              <div className="min-w-0 flex-auto">
                <p className="text-sm font-semibold leading-6 text-gray-900">{bill.name}</p>
                <p className="mt-1 truncate text-xs leading-5 text-gray-500">leslie.alexander@example.com</p>
              </div>
            </div>
            <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
              <p className="text-sm leading-6 text-gray-900">{bill.amount}</p>
              <p className="mt-1 text-xs leading-5 text-gray-500">
                Last seen <time dateTime="2023-01-23T13:23Z">3h ago</time>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
