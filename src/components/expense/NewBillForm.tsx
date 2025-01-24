import { SyntheticEvent } from 'react';

export interface NewBillFormProps {
  handleSubmitBill: (evt: SyntheticEvent) => void;
  handleCancel: () => void;
}

export default function NewBillForm({ handleSubmitBill, handleCancel }: NewBillFormProps) {
  return (
    <div className="w-full max-w-xs">
      <form
        data-testid="new-expense-form"
        onSubmit={handleSubmitBill}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Nome da Conta
          </label>
          <input
            type="text"
            name="name"
            id="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            placeholder="Conta de Luz"
            data-testid="new-bill-form-name-input"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Data
          </label>
          <input
            type="date"
            name="date"
            id="date"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            className="bg-primary text-secondary-color hover:bg-green-900 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
          >
            Criar
          </button>
          <a
            className="inline-block align-baseline font-bold text-sm text-green-800 hover:text-green-900"
            href="#"
            onClick={() => handleCancel()}
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}
