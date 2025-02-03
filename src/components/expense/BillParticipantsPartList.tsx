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
    <ul role="list" className="divide-y divide-gray-100">
      {parts.map((part) => (
        <li className="flex justify-between gap-x-6 py-5" key={part.user.id}>
          <div className="flex min-w-0 gap-x-4">
            <Avatar user={part.user} />
            <div className="min-w-0 flex-auto">
              <p
                className="text-sm/6 font-semibold text-gray-900"
                data-testid={`bill-part-participant-${part.user.name}`}
              >
                {part.user.name}
              </p>
              <p className="mt-1 truncate text-xs/5 text-gray-500">{part.user.email}</p>
            </div>
          </div>
          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <p className="text-sm/6 text-gray-900 font-extrabold" data-testid={`bill-part-amount-${part.user.name}`}>
              R$ {part.amount.toFixed(2)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default BillParticipantsPartList;
