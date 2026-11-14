import React, { useEffect, useRef, useState } from 'react';

import { useUserService } from '../state/useUserService';
import Button from '../common/Button';
import Card from '../common/Card';
import Field from '../common/Field';
import SelectField, { CreatableSelectField, type SelectOption } from '../common/SelectField';
import { todayInputValue } from '../../core/utils/localDate';

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

const PLACE_HOLDER_ID = 'place_holder_id';

const toOption = (user: { id: number; name: string }): SelectOption => ({
  value: user.id.toString(),
  label: user.name,
});

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
        setOptions((prev) => {
          const known = new Map([self, ...users.map(toOption), ...prev].map((option) => [option.value, option]));
          return Array.from(known.values());
        });
      })
      .catch(console.error);
  }, [userService]);

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = (formData.get('name') as string) || '';
    const date = (formData.get('date') as string) || '';
    const amountNumber = Number(amount) || 0;

    // Users typed into the creatable select only exist after we create them; the payer
    // may reference one of those placeholders, so resolve through a shared map.
    const participantIds: number[] = [];
    let payerId: number | undefined;
    if (amountNumber > 0) {
      const placeholderIds = new Map<string, number>();
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
      if (payer) {
        payerId = payer.value.startsWith(PLACE_HOLDER_ID) ? placeholderIds.get(payer.value) : Number(payer.value);
      }
    }

    handleSubmitBill({ name, date, amount: amountNumber, participantIds, payerId });
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
            type="number"
            name="amount"
            step="0.01"
            min="0"
            hint="Sem valor agora? Crie a conta e adicione despesas depois."
            data-testid="new-bill-form-amount-input"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          {Number(amount) > 0 && (
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
                options={participants}
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
