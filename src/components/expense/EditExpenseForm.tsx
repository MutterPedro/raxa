import React, { useEffect, useRef, useState } from 'react';

import Expense from '../../core/entities/Expense';
import { useBillService } from '../state/useBillService';
import { useUserService } from '../state/useUserService';
import { useToast } from '../common/Toast';
import Button from '../common/Button';
import Card from '../common/Card';
import Field from '../common/Field';
import SelectField, { CreatableSelectField, type SelectOption } from '../common/SelectField';
import { parseInputDate, toDateInputValue } from '../../core/utils/localDate';

interface EditExpenseFormProps {
  expense: Expense;
  handleCancel: () => void;
  onExpenseSaved: (expense: Expense) => void;
}

// Same placeholder scheme as NewExpenseForm: typed-in names only become users on submit.
const PLACE_HOLDER_ID = 'place_holder_id';

const toOption = (user: { id: number; name: string }): SelectOption => ({
  value: user.id.toString(),
  label: user.name,
});

export default function EditExpenseForm({ expense, handleCancel, onExpenseSaved }: EditExpenseFormProps) {
  const billService = useBillService();
  const userService = useUserService();
  const { notify } = useToast();

  const [amount, setAmount] = useState(String(expense.amount));
  const [participants, setParticipants] = useState<SelectOption[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [payer, setPayer] = useState<SelectOption | null>();
  const placeholderSeq = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    Promise.all([userService.getByIds(expense.participantIds), userService.getUsers()])
      .then(([expenseParticipants, allUsers]) => {
        const selected = expenseParticipants.map(toOption);
        setParticipants(selected);
        const currentPayer = expenseParticipants.find((user) => user.id === expense.payerId);
        setPayer(currentPayer ? toOption(currentPayer) : null);
        // Pickable options are every known user plus the selected ones — a participant
        // the user store no longer has must still be removable, never silently dropped.
        setOptions(
          Array.from(
            new Map([...allUsers.map(toOption), ...selected].map((option) => [option.value, option])).values(),
          ),
        );
      })
      .catch(console.error);
  }, [userService, expense]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNumber = Number(amount);
    if (!(amountNumber > 0) || participants.length === 0) return;

    try {
      // Names typed into the creatable select only exist after we create them; the payer
      // may reference one of those placeholders, so resolve through a shared map.
      const placeholderIds = new Map<string, number>();
      const participantIds: number[] = [];
      await Promise.all(
        participants.map(async (p) => {
          if (p.value.startsWith(PLACE_HOLDER_ID)) {
            const user = await userService.createUser({ name: p.label, email: '' });
            placeholderIds.set(p.value, user.id);
            participantIds.push(user.id);
          } else {
            participantIds.push(Number(p.value));
          }
        }),
      );
      let payerId = expense.payerId;
      if (payer) {
        payerId = payer.value.startsWith(PLACE_HOLDER_ID)
          ? (placeholderIds.get(payer.value) ?? expense.payerId)
          : Number(payer.value);
      }

      // A blank name keeps the current one — clearing it entirely is not a meaningful edit.
      const formData = new FormData(e.target as HTMLFormElement);
      const name = (formData.get('name') as string).trim();
      const date = formData.get('date') as string;

      const updated = await billService.updateExpense(expense.id, {
        name: name || expense.name,
        amount: amountNumber,
        date: date ? parseInputDate(date) : expense.date,
        participantIds,
        payerId,
      });
      if (!updated) throw new Error(`Expense ${expense.id} no longer exists`);
      onExpenseSaved(updated);
    } catch (error) {
      // Keep the form open for a retry; the toast action re-submits it as it stands.
      console.error(error);
      notify('Não foi possível salvar a despesa', {
        action: { label: 'Tentar novamente', onClick: () => formRef.current?.requestSubmit() },
      });
    }
  }

  function createParticipant(inputValue: string) {
    const cleaned = inputValue.trim();
    if (!cleaned) return;
    const placeholder = { label: cleaned, value: `${PLACE_HOLDER_ID}-${placeholderSeq.current++}` };
    setOptions((prev) => [...prev, placeholder]);
    setParticipants((prev) => [...prev, placeholder]);
  }

  return (
    <Card className="w-full max-w-md p-6">
      <form ref={formRef} data-testid="edit-expense-form" onSubmit={handleFormSubmit}>
        <h2 className="type-display text-2xl font-bold text-ink">Editar despesa</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Field label="Nome da despesa" name="name" defaultValue={expense.name} />
          <Field
            label="Valor"
            type="number"
            name="amount"
            step="0.01"
            min="0"
            autoFocus
            data-testid="edit-expense-form-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Field label="Data" type="date" name="date" defaultValue={toDateInputValue(expense.date)} />
          <CreatableSelectField
            label="Com quem?"
            inputId="edit-expense-form-participant-input"
            options={options}
            value={participants}
            onCreateOption={createParticipant}
            onChange={(values) => setParticipants(Array.from(values))}
            isClearable
          />
          <SelectField
            label="Quem pagou"
            inputId="edit-payer"
            options={participants}
            value={payer}
            onChange={setPayer}
          />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={!(Number(amount) > 0) || participants.length === 0}
            data-testid="edit-expense-form-submit"
          >
            Salvar
          </Button>
          <Button type="button" variant="ghost" onClick={handleCancel} className="w-full">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
