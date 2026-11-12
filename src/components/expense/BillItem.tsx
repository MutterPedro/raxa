import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import Bill from '../../core/entities/Bill';
import { useBillService } from '../state/useBillService';
import User from '../../core/entities/User';
import Avatar from '../common/Avatar';

export default function BillItem({ bill }: { bill: Bill }) {
  const navigate = useNavigate();
  const billService = useBillService();

  const [total, setTotal] = useState<number>(0);
  const [participants, setParticipants] = useState<User[]>([]);

  useEffect(() => {
    billService
      .getTotal(bill.id)
      .then((t) => setTotal(t))
      .catch(console.error);
    billService
      .getParticipants(bill.id)
      .then((users) => {
        setParticipants(users);
      })
      .catch(console.error);
  }, [billService, bill]);

  return (
    <button
      type="button"
      onClick={() => navigate(`/bill/${bill.id}`)}
      className="flex w-full items-center gap-4 rounded-[var(--radius-card)] bg-surface-raised p-4 text-left shadow-card transition-colors hover:bg-brand-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-px dark:border dark:border-line dark:hover:bg-surface-sunken"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-ink" data-testid={`bill-item-name-${bill.id}`}>
          {bill.name}
        </span>
        <span className="mt-0.5 block truncate text-sm text-ink-muted">{bill.date.toLocaleDateString('pt-BR')}</span>
      </span>
      <span className="flex shrink-0 items-center gap-3">
        <span className="flex -space-x-2">
          {participants.slice(0, 4).map((p) => (
            <Avatar key={p.id} user={p} size="30px" />
          ))}
          {participants.length > 4 && (
            <span
              className="flex size-[30px] shrink-0 items-center justify-center rounded-full bg-surface-sunken text-xs font-semibold text-ink-muted ring-2 ring-surface-raised"
              aria-hidden="true"
            >
              +{participants.length - 4}
            </span>
          )}
        </span>
        <span className="text-base font-bold tabular-nums text-ink" data-testid={`bill-total-${bill.id}`}>
          R$ {total.toFixed(2)}
        </span>
      </span>
    </button>
  );
}
