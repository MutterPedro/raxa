import React, { useEffect, useState } from 'react';
import Expense from '../../core/entities/Expense';
import Avatar from '../common/Avatar';
import User from '../../core/entities/User';
import { useUserService } from '../state/useUserService';
import { formatCurrency, formatDate } from '../../core/utils/format';

interface ExpenseItemProps {
  expense: Expense;
  onEdit?: (expense: Expense) => void;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense, onEdit }) => {
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
          <p className="mt-0.5 truncate text-sm text-ink-muted">{formatDate(expense.date)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className="flex -space-x-2">
            {participants.slice(0, 4).map((p) => (
              <Avatar key={p.id} user={p} size="30px" highlight={p.id === expense.payerId} />
            ))}
          </div>
          <span className="font-bold tabular-nums text-ink">{formatCurrency(expense.amount)}</span>
          {onEdit && (
            <button
              type="button"
              aria-label={`Editar despesa ${expense.name}`}
              data-testid={`edit-expense-${expense.id}-button`}
              onClick={() => onEdit(expense)}
              className="press inline-flex min-h-11 min-w-11 items-center justify-center rounded-[var(--radius-field)] text-ink-muted hover:text-ink focus-ring"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </li>
  );
};

export default ExpenseItem;
