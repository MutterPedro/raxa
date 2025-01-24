import React, { useState } from 'react';
import Select from 'react-select';
import Bill from '../../core/entities/Bill';

interface NewExpenseFormProps {
  bill: Bill;
  handleCancel: () => void;
}

const payers = [
  {
    value: '1',
    label: 'Fulano',
  },
  {
    value: '2',
    label: 'Beltrano',
  },
  {
    value: '3',
    label: 'Ciclano',
  },
];

const NewExpenseForm: React.FC<NewExpenseFormProps> = ({ handleCancel }) => {
  const [amount, setAmount] = useState<number>(0);
  const [participant, setParticipant] = useState<string>('');
  const [participants, setParticipants] = useState<string[]>([]);
  const [name, setName] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [payer, setPayer] = useState<{ value: string; label: string } | null>(null);

  const handleAddParticipant = () => {
    if (participant.trim() !== '') {
      setParticipants([...participants, participant]);
      setParticipant('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payer) {
      setAmount(0);
      setParticipants([]);
      setName('');
      setDate('');
      setPayer(null);
    }
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
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            value={date}
            onChange={(e) => setDate(e.target.value)}
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
            value={amount}
            data-testid="new-expense-form-amount-input"
            onChange={(e) => setAmount(parseFloat(e.target.value))}
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
          <button type="button" onClick={handleAddParticipant} className="btn btn-primary">
            +
          </button>
        </div>
        <div className="mb-4">
          <ul className="participant-list">
            {participants.map((p, index) => (
              <li key={index}>{p}</li>
            ))}
          </ul>
        </div>
        <div className="mb-4 text-gray-700">
          <label htmlFor="payer" className="block text-sm font-bold mb-2">
            Quem pagou:
          </label>
          <Select id="payer" value={payer} onChange={setPayer} options={payers} className="form-control" />
        </div>
        <div className="flex items-center justify-between my-10">
          <button
            type="submit"
            className="bg-primary text-secondary-color hover:bg-green-900 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Adicionar
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
};

export default NewExpenseForm;
