import React, { useEffect, useRef, useState } from 'react';

import Expense from '../../core/entities/Expense';
import { useBillService } from '../state/useBillService';
import { useUserService } from '../state/useUserService';
import { useToast } from '../common/Toast';
import Button from '../common/Button';
import Card from '../common/Card';
import Field from '../common/Field';
import SelectField, { CreatableSelectField, type SelectOption } from '../common/SelectField';
import { mergeOptions, placeholderOption, resolveUserIds, toOption, toUserId } from '../common/userOptions';
import { parseInputDate, toDateInputValue } from '../../core/utils/localDate';
import { amountToInputValue, parseAmount } from '../../core/utils/format';

interface EditExpenseFormProps {
  expense: Expense;
  handleCancel: () => void;
  onExpenseSaved: (expense: Expense) => void;
}

export default function EditExpenseForm({ expense, handleCancel, onExpenseSaved }: EditExpenseFormProps) {
  const billService = useBillService();
  const userService = useUserService();
  const { notify } = useToast();

  const [amount, setAmount] = useState(amountToInputValue(expense.amount));
  const [participants, setParticipants] = useState<SelectOption[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [payer, setPayer] = useState<SelectOption | null>();
  const [pending, setPending] = useState(false);
  const placeholderSeq = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // The payer may sit outside the participant list (paying on behalf of everyone),
    // so load everyone involved — not just the participants — to prefill both selects.
    const participantIdSet = new Set(expense.participantIds);
    const involvedIds = [...new Set([...expense.participantIds, expense.payerId])];
    Promise.all([userService.getByIds(involvedIds), userService.getUsers()])
      .then(([involvedUsers, allUsers]) => {
        const selected = involvedUsers.filter((user) => participantIdSet.has(user.id)).map(toOption);
        setParticipants(selected);
        const currentPayer = involvedUsers.find((user) => user.id === expense.payerId);
        setPayer(currentPayer ? toOption(currentPayer) : null);
        // Pickable options are every known user plus the selected ones — a participant
        // the user store no longer has must still be removable, never silently dropped.
        setOptions(mergeOptions(allUsers.map(toOption), selected, currentPayer ? [toOption(currentPayer)] : []));
      })
      .catch(console.error);
  }, [userService, expense]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNumber = parseAmount(amount);
    if (pending || !(amountNumber > 0) || participants.length === 0) return;
    setPending(true);

    try {
      // Typed-in names become real users here; the payer resolves through the same map
      // so a payer that is still a placeholder lands on the very same new user.
      const { ids: participantIds, placeholderIds } = await resolveUserIds(participants, userService);
      let payerId = expense.payerId;
      if (payer) payerId = toUserId(payer, placeholderIds) ?? expense.payerId;

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
    } finally {
      setPending(false);
    }
  }

  function createParticipant(inputValue: string) {
    const cleaned = inputValue.trim();
    if (!cleaned) return;
    const placeholder = placeholderOption(cleaned, placeholderSeq.current++);
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
            inputMode="decimal"
            name="amount"
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
          <SelectField label="Quem pagou" inputId="edit-payer" options={options} value={payer} onChange={setPayer} />
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={pending || !(parseAmount(amount) > 0) || participants.length === 0}
            data-testid="edit-expense-form-submit"
          >
            {pending ? 'Salvando…' : 'Salvar'}
          </Button>
          <Button type="button" variant="ghost" onClick={handleCancel} className="w-full" disabled={pending}>
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
