import React, { useEffect, useRef, useState } from 'react';

import Bill from '../../core/entities/Bill';
import Expense from '../../core/entities/Expense';
import { useBillService } from '../state/useBillService';
import { useUserService } from '../state/useUserService';
import { useToast } from '../common/Toast';
import Button from '../common/Button';
import Card from '../common/Card';
import Field from '../common/Field';
import SelectField, { CreatableSelectField, type SelectOption } from '../common/SelectField';
import { parseInputDate, todayInputValue } from '../../core/utils/localDate';

interface NewExpenseFormProps {
  bill: Bill;
  handleCancel: () => void;
  onExpenseCreated: (expense: Expense) => void;
}

const PLACE_HOLDER_ID = 'place_holder_id';

const toOption = (user: { id: number; name: string }): SelectOption => ({
  value: user.id.toString(),
  label: user.name,
});

export default function NewExpenseForm({ bill, handleCancel, onExpenseCreated }: NewExpenseFormProps) {
  const billService = useBillService();
  const userService = useUserService();
  const { notify } = useToast();

  const [amount, setAmount] = useState('');
  const [participants, setParticipants] = useState<SelectOption[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [payer, setPayer] = useState<SelectOption | null>();
  const [showOptions, setShowOptions] = useState(true);
  const placeholderSeq = useRef(0);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    userService
      .createSelf()
      .then(async (me) => {
        const self = toOption(me);
        // Functional updates: self arrives asynchronously and must never clobber selections
        // the user already made, only pre-fill when nothing was touched yet.
        setParticipants((prev) => (prev.length > 0 ? prev : [self]));
        setPayer((prev) => prev ?? self);
        // Chained after createSelf (not parallel) so the freshly created self is always
        // among the pickable options, and never listed twice.
        const users = await userService.getUsers();
        setOptions((prev) => {
          const known = new Map([self, ...users.map(toOption), ...prev].map((option) => [option.value, option]));
          return Array.from(known.values());
        });
      })
      .catch(console.error);
  }, [userService]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amountNumber = Number(amount);
    if (!(amountNumber > 0)) return;

    try {
      if (!showOptions) {
        // Amount-only quick capture: the service owns every default.
        const expense = await billService.quickAddExpense(bill.id, { amount: amountNumber });
        onExpenseCreated(expense);
        return;
      }

      const formData = new FormData(e.target as HTMLFormElement);
      const name = (formData.get('name') as string).trim();
      const date = formData.get('date') as string;

      // Users typed into the creatable select only exist after we create them; the payer
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
      let payerId: number | undefined;
      if (payer) {
        payerId = payer.value.startsWith(PLACE_HOLDER_ID) ? placeholderIds.get(payer.value) : Number(payer.value);
      }

      // Only forward what was actually filled; blanks fall back to the service defaults.
      const expense = await billService.quickAddExpense(bill.id, {
        amount: amountNumber,
        ...(name ? { name } : {}),
        ...(date ? { date: parseInputDate(date) } : {}),
        ...(participantIds.length > 0 ? { participantIds } : {}),
        ...(payerId === undefined ? {} : { payerId }),
      });
      onExpenseCreated(expense);
    } catch (error) {
      // Keep the form open for a retry; the toast action re-submits it as it stands.
      console.error(error);
      notify('Não foi possível adicionar a despesa', {
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
      <form ref={formRef} data-testid="new-expense-form" onSubmit={handleFormSubmit}>
        <h2 className="type-display text-2xl font-bold text-ink">Nova despesa</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Field
            label="Valor"
            type="number"
            name="amount"
            step="0.01"
            min="0"
            autoFocus
            hint="Só o valor já basta — o resto vem pronto, e você ajusta à vontade."
            data-testid="new-expense-form-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            data-testid="new-expense-more-toggle"
            aria-expanded={showOptions}
            onClick={() => setShowOptions((prev) => !prev)}
          >
            Mais opções
          </Button>
          {showOptions && (
            <div
              role="group"
              aria-label="Mais opções"
              className="flex flex-col gap-4 rounded-[var(--radius-field)] bg-surface-sunken p-4"
            >
              <Field label="Nome da despesa" name="name" placeholder="Opcional" />
              <Field label="Data" type="date" name="date" defaultValue={todayInputValue()} />
              <CreatableSelectField
                label="Com quem?"
                inputId="new-expense-form-participant-input"
                options={options}
                value={participants}
                onCreateOption={createParticipant}
                onChange={(values) => setParticipants(Array.from(values))}
                isClearable
              />
              <SelectField
                label="Quem pagou"
                inputId="payer"
                options={participants}
                value={payer}
                onChange={setPayer}
              />
            </div>
          )}
          <Button type="submit" size="lg" className="w-full" disabled={!(Number(amount) > 0)}>
            Adicionar
          </Button>
          <Button type="button" variant="ghost" onClick={handleCancel} className="w-full">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
