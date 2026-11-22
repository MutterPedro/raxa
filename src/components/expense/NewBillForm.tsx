import React, { useEffect, useRef, useState } from 'react';

import { useUserService } from '../state/useUserService';
import Button from '../common/Button';
import Card from '../common/Card';
import Field from '../common/Field';
import SelectField, { CreatableSelectField, type SelectOption } from '../common/SelectField';
import { mergeOptions, placeholderOption, resolveUserIds, toOption, toUserId } from '../common/userOptions';
import { todayInputValue } from '../../core/utils/localDate';
import { parseAmount } from '../../core/utils/format';

export interface NewBillFormValues {
  name: string;
  /** '' when blank, otherwise yyyy-mm-dd from the date input. */
  date: string;
  /** 0 when blank/invalid — the quick expense section is then skipped entirely. */
  amount: number;
  participantIds: number[];
  payerId?: number;
}

export interface NewBillFormProps {
  handleSubmitBill: (values: NewBillFormValues) => void;
  handleCancel: () => void;
}

export default function NewBillForm({ handleSubmitBill, handleCancel }: NewBillFormProps) {
  const userService = useUserService();
  const [amount, setAmount] = useState('');
  const [participants, setParticipants] = useState<SelectOption[]>([]);
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [payer, setPayer] = useState<SelectOption | null>();
  const placeholderSeq = useRef(0);

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
        setOptions((prev) => mergeOptions([self], users.map(toOption), prev));
      })
      .catch(console.error);
  }, [userService]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = (formData.get('name') as string) || '';
    const date = (formData.get('date') as string) || '';
    const amountNumber = parseAmount(amount) || 0;

    // Typed-in names become real users here; the payer resolves through the same map
    // so a payer that is still a placeholder lands on the very same new user.
    const participantIds: number[] = [];
    let payerId: number | undefined;
    if (amountNumber > 0) {
      const { ids, placeholderIds } = await resolveUserIds(participants, userService);
      participantIds.push(...ids);
      if (payer) payerId = toUserId(payer, placeholderIds);
    }

    handleSubmitBill({ name, date, amount: amountNumber, participantIds, payerId });
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
      <form data-testid="new-bill-form" onSubmit={handleFormSubmit}>
        <h2 className="type-display text-2xl font-bold text-ink">Nova conta</h2>
        <div className="mt-4 flex flex-col gap-4">
          <Field
            label="Nome da conta"
            required
            autoFocus
            name="name"
            placeholder="Jantar de aniversário"
            data-testid="new-bill-form-name-input"
          />
          <Field label="Data" type="date" name="date" id="date" defaultValue={todayInputValue()} />
          <Field
            label="Valor"
            inputMode="decimal"
            name="amount"
            hint="Sem valor agora? Crie a conta e adicione despesas depois."
            data-testid="new-bill-form-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {parseAmount(amount) > 0 && (
            <div
              role="group"
              aria-label="Divisão da primeira despesa"
              className="flex flex-col gap-4 rounded-[var(--radius-field)] bg-surface-sunken p-4"
            >
              <CreatableSelectField
                label="Com quem?"
                inputId="new-bill-form-participant-input"
                options={options}
                value={participants}
                onCreateOption={createParticipant}
                onChange={(values) => setParticipants(Array.from(values))}
                isClearable
              />
              <SelectField
                label="Quem pagou"
                inputId="new-bill-form-payer-input"
                options={options}
                value={payer}
                onChange={setPayer}
              />
            </div>
          )}
          <Button type="submit" size="lg" className="w-full">
            Criar
          </Button>
          <Button type="button" variant="ghost" onClick={handleCancel} className="w-full">
            Cancelar
          </Button>
        </div>
      </form>
    </Card>
  );
}
