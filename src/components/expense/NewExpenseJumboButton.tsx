import { SyntheticEvent, useEffect, useState } from 'react';
import Bill from '../../core/entities/Bill';
import { myContainer } from '../../inversify.config';
import { BillService } from '../../core/services/BillService';
import { TYPES } from '../../infra/di';

interface NewExpenseJumboButtonProps {
  interval?: number;
}

export default function NewExpenseJumboButton({ interval = 2000 }: NewExpenseJumboButtonProps) {
  const wordsList = ['+ Nova Conta', '+ Nova Despesa', '+ Nova Compra', '+ Novo Rolê', '+ Novo RAXA!'];
  const billService = myContainer.get<BillService>(TYPES.BillService);

  const [wordIndex, setWordIndex] = useState(0);
  const [showingForm, showForm] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setWordIndex((wordIndex + 1) % wordsList.length);
    }, 2000);
  }, [wordIndex, interval, wordsList.length]);

  function handleOnClick() {
    showForm(true);
  }

  async function handleSubmitBill(event: SyntheticEvent) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const bill = await billService.createBill({
      name: formData.get('name') as string,
      amount: Number(formData.get('amount')),
      date: new Date((formData.get('date') as string) || new Date()),
      ownerId: 0,
    });
    console.log(bill);

    setBills([...bills, bill]);
    setTotal(total + bill.amount);
  }

  return (
    <div className="container">
      <button
        type="button"
        className="bg-primary text-secondary-color align-middle arvo-bold text-center rounded-full max-h-36 text-4xl px-24 py-7"
        onClick={handleOnClick}
        data-testid="new-expense-jumbo-button"
      >
        {wordsList[wordIndex]}
      </button>
      {showingForm && (
        <form data-testid="new-expense-form" onSubmit={handleSubmitBill}>
          <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
            Nome da Conta
          </label>
          <div className="mt-2">
            <input
              type="text"
              name="name"
              id="name"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Conta de Luz"
            />
            <input
              type="number"
              name="amount"
              id="amount"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="100"
              data-testid="new-expense-form-amount-input"
            />
            <input
              type="date"
              name="date"
              id="date"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
            <input
              type="text"
              name="participants"
              id="participants"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              placeholder="Fulano, Ciclano, Beltrano..."
              data-testid="new-expense-form-participants-input"
            />
            <input type="submit" value="Criar" />
          </div>
        </form>
      )}
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
        <li data-testid="bill-total" className="flex justify-between gap-x-6 py-5">
          {total}
        </li>
      </ul>
    </div>
  );
}
