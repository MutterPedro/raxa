import React, { useEffect, useState } from 'react';
import User from '../../core/entities/User';
import { useBillService } from '../state/useBillService';
import Avatar from '../common/Avatar';
import Skeleton from '../common/Skeleton';
import { formatCurrency } from '../../core/utils/format';

interface BillParticipantsPartListProps {
  billId: number;
  /** Change to refetch the parts, e.g. after an expense was added or undone. */
  refreshKey?: number;
}

const BillParticipantsPartList: React.FC<BillParticipantsPartListProps> = ({ billId, refreshKey = 0 }) => {
  const [parts, setParts] = useState<{ amount: number; user: User }[]>([]);
  // Only the very first fetch shows skeletons; later refreshes (e.g. after undo) keep the
  // stale rows visible to avoid flickering the whole division.
  const [loaded, setLoaded] = useState<boolean>(false);
  const billService = useBillService();

  useEffect(() => {
    let active = true;
    billService.getParticipantsParts(billId).then((parts) => {
      if (!active) return;
      setParts(parts);
      setLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [billService, billId, refreshKey]);

  if (!loaded) {
    return (
      <ul role="list" className="mt-1 divide-y divide-line" aria-busy="true">
        {[0, 1, 2].map((i) => (
          <li className="flex items-center gap-3 py-3" key={i}>
            <Skeleton className="size-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-1.5">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-5 w-16 shrink-0" />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <ul role="list" className="mt-1 divide-y divide-line">
      {parts.map((part) => (
        <li className="flex items-center gap-3 py-3" key={part.user.id}>
          <Avatar user={part.user} size="36px" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink" data-testid={`bill-part-participant-${part.user.name}`}>
              {part.user.name}
            </p>
            <p className="truncate text-xs text-ink-muted">{part.user.email}</p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={`font-bold tabular-nums ${part.amount < 0 ? 'text-success' : 'text-ink'}`}
              data-testid={`bill-part-amount-${part.user.name}`}
            >
              {formatCurrency(part.amount)}
            </p>
            <p className="text-xs text-ink-muted">
              {part.amount < 0 ? 'a receber' : part.amount > 0 ? 'a pagar' : 'em dia'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default BillParticipantsPartList;
