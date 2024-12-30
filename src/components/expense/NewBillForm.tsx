import { SyntheticEvent } from 'react';

export default function NewBillForm({ handleSubmitBill }: { handleSubmitBill: (evt: SyntheticEvent) => void }) {
  return (
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
  );
}
