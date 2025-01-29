import React, { useState } from 'react';
import Select from 'react-select';
import Bill from '../../core/entities/Bill';
import { useBillService } from '../state/useBillService';
import Expense from '../../core/entities/Expense';

interface NewExpenseFormProps {
  bill: Bill;
  handleCancel: () => void;
  onExpenseCreated: (expense: Expense) => void;
}

const NewExpenseForm: React.FC<NewExpenseFormProps> = ({ handleCancel, onExpenseCreated, bill }) => {
  const billService = useBillService();

  const [participant, setParticipant] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>(['Eu']);
  const [payer, setPayer] = useState<{ value: string; label: string } | null>({ label: 'Eu', value: 'me' });

  const handleAddParticipant = () => {
    if (participant.trim() !== '') {
      setParticipants([...participants, participant]);
      setParticipant('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);
    billService
      .addExpense(bill.id, {
        amount: Number(formData.get('amount')),
        date: new Date((formData.get('date') as string) || Date.now()).toISOString(),
        name: (formData.get('name') || `Conta dia ${new Date().toISOString()}`) as string,
        participantIds: participants.map((_, idx) => idx),
        payerId: Number(payer?.value || 0),
      })
      .then((expense) => {
        onExpenseCreated(expense);
      })
      .catch(console.error);
  };

  return (
    <div className="w-full max-w-xs">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 text-sm font-bold mb-2">
            Nome:
          </label>
          <input
            type="text"
            id="name"
            name="name"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="date" className="block text-gray-700 text-sm font-bold mb-2">
            Data:
          </label>
          <input
            type="date"
            id="date"
            name="date"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
            style={{ colorScheme: 'auto' }}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
            Valor:
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            data-testid="new-expense-form-amount-input"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
          />
        </div>
        <div className="mb-4">
          <label htmlFor="participant" className="block text-gray-700 text-sm font-bold mb-2">
            Participantes:
          </label>
          <input
            type="text"
            id="participant"
            value={participant}
            onChange={(e) => setParticipant(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-white"
          />
          <div className="flex justify-center w-full mt-3">
            <button
              type="button"
              onClick={handleAddParticipant}
              className="bg-primary text-secondary-color hover:bg-green-900 text-white font-bold px-3 rounded text-2xl justify-center focus:outline-none focus:shadow-outline"
            >
              +
            </button>
          </div>
        </div>
        <div className="mb-4">
          <ul className="list-disc list-inside text-gray-700">
            {participants.map((p, index) => (
              <li key={index}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="mb-4 text-gray-700">
          <label htmlFor="payer" className="block text-sm font-bold mb-2">
            Quem pagou:
          </label>
          <Select
            id="payer"
            value={payer}
            onChange={setPayer}
            options={[
              { label: 'Eu', value: 'me' },
              ...participants.map((p, idx) => ({ label: p, value: idx.toString() })),
            ]}
            className="form-control"
          />
        </div>
        <div className="flex items-center justify-between my-10">
          <button
            type="submit"
            role="button"
            className="bg-primary text-secondary-color cursor-pointer hover:bg-green-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Adicionar
          </button>
          <a
            className="inline-block align-baseline cursor-pointer font-bold text-sm text-green-800 hover:text-green-900"
            href="#"
            onClick={() => handleCancel()}
          >
            Cancelar
          </a>
        </div>
      </form>
    </div>
  );
};

export default NewExpenseForm;
