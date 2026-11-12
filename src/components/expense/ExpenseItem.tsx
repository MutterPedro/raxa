import React, { useEffect, useState } from 'react';
import Expense from '../../core/entities/Expense';
import Avatar from '../common/Avatar';
import User from '../../core/entities/User';
import { useUserService } from '../state/useUserService';

interface ExpenseItemProps {
  expense: Expense;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  const [participants, setParticipants] = useState<User[]>([]);
  const userService = useUserService();

  useEffect(() => {
    userService
      .getByIds(expense.participantIds)
      .then((list) => setParticipants(list))
      .catch(console.error);
  }, [userService, expense]);

  return (
    <li>
      <div className="flex items-center gap-3 py-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-ink">{expense.name}</p>
          <p className="mt-0.5 truncate text-sm text-ink-muted">{expense.date.toLocaleDateString('pt-BR')}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex -space-x-2">
            {participants.slice(0, 4).map((p) => (
              <Avatar key={p.id} user={p} size="30px" highlight={p.id === expense.payerId} />
            ))}
          </div>
          <span className="font-bold tabular-nums text-ink">R$ {expense.amount.toFixed(2)}</span>
        </div>
      </div>
    </li>
  );
};

export default ExpenseItem;
