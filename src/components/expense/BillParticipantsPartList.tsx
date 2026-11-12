import React, { useEffect, useState } from 'react';
import User from '../../core/entities/User';
import { useBillService } from '../state/useBillService';
import Avatar from '../common/Avatar';

interface BillParticipantsPartListProps {
  billId: number;
}

const BillParticipantsPartList: React.FC<BillParticipantsPartListProps> = ({ billId }) => {
  const [parts, setParts] = useState<{ amount: number; user: User }[]>([]);
  const billService = useBillService();

  useEffect(() => {
    billService.getParticipantsParts(billId).then((parts) => setParts(parts));
  }, [billService, billId]);

  return (
    <ul role="list" className="mt-1 divide-y divide-line">
      {parts.map((part) => (
        <li className="flex items-center gap-3 py-3" key={part.user.id}>
          <Avatar user={part.user} size="36px" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold text-ink" data-testid={`bill-part-participant-${part.user.name}`}>
              {part.user.name}
            </p>
            <p className="truncate text-xs text-ink-faint">{part.user.email}</p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={`font-bold tabular-nums ${part.amount < 0 ? 'text-success' : 'text-ink'}`}
              data-testid={`bill-part-amount-${part.user.name}`}
            >
              R$ {part.amount.toFixed(2)}
            </p>
            <p className="text-xs text-ink-faint">
              {part.amount < 0 ? 'a receber' : part.amount > 0 ? 'a pagar' : 'em dia'}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default BillParticipantsPartList;
