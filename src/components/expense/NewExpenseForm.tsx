import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import CreatableSelect from 'react-select/creatable';

import Bill from '../../core/entities/Bill';
import { useBillService } from '../state/useBillService';
import Expense from '../../core/entities/Expense';
import { useUserService } from '../state/useUserService';

interface NewExpenseFormProps {
  bill: Bill;
  handleCancel: () => void;
  onExpenseCreated: (expense: Expense) => void;
}

const PLACE_HOLDER_ID = 'place_holder_id';

const NewExpenseForm: React.FC<NewExpenseFormProps> = ({ handleCancel, onExpenseCreated, bill }) => {
  const billService = useBillService();
  const userService = useUserService();

  const [participants, setParticipants] = useState<{ value: string; label: string }[]>([]);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [payer, setPayer] = useState<{ value: string; label: string } | null>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParticipants([]);

    Promise.all(
      participants.map(async (p) => {
        let id = Number(p.value);
        if (p.value.startsWith(PLACE_HOLDER_ID)) {
          const user = await userService.createUser({ name: p.label, email: '' });
          id = user.id;
        }

        setParticipants((prev) => [...prev, { label: p.label, value: id.toString() }]);
        return id;
      }),
    )
      .then((participantIds) => {
        const formData = new FormData(e.target as HTMLFormElement);
        return billService.addExpense(bill.id, {
          participantIds,
          amount: Number(formData.get('amount')),
          date: new Date((formData.get('date') as string) || Date.now()).toISOString(),
          name: (formData.get('name') || `Conta dia ${new Date().toISOString()}`) as string,
          payerId: Number(payer?.value || 0),
        });
      })
      .then((expense) => {
        onExpenseCreated(expense);
      })
      .catch(console.error);
  };

  useEffect(() => {
    userService
      .createSelf()
      .then((me) => {
        setParticipants([{ label: me.name, value: me.id.toString() }]);
        setPayer({ label: me.name, value: me.id.toString() });
      })
      .catch(console.error);
    userService.getUsers().then((users) => {
      setOptions(
        users.map((u) => ({
          label: u.name,
          value: u.id.toString(),
        })),
      );
    });
  }, [userService]);

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
        <div className="mb-4 text-gray-700">
          <label htmlFor="participants" className="block text-sm font-bold mb-2">
            Participantes:
          </label>
          <CreatableSelect
            id="participants"
            options={options}
            className="form-control"
            value={participants}
            onCreateOption={(inputValue) => {
              const cleanedName = inputValue.trim();
              if (cleanedName) {
                setOptions([...options, { label: inputValue, value: PLACE_HOLDER_ID + `-${options.length}` }]);
                setParticipants([
                  ...participants,
                  { label: inputValue, value: PLACE_HOLDER_ID + `-${options.length}` },
                ]);
              }
            }}
            onChange={(values) => {
              setParticipants(Array.from(values));
            }}
            isMulti
            isClearable
            isSearchable
            inputId="new-expense-form-participant-input"
          />
        </div>
        <div className="mb-4 text-gray-700">
          <label htmlFor="payer" className="block text-sm font-bold mb-2">
            Quem pagou:
          </label>
          <Select inputId="payer" value={payer} onChange={setPayer} options={participants} className="form-control" />
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
