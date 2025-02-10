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
      <div className="px-2 py-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{expense.name}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{expense.date.toLocaleString()}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm font-medium text-gray-500 flex -space-x-2">
            {participants.map((p, index) => (
              <Avatar key={index} user={p} size="30px" highlight={p.id === expense.payerId} />
            ))}
          </div>

          <a href="#" className="font-medium text-secondary-primary hover:green-900">
            R$ {expense.amount.toFixed(2)}
          </a>
        </div>
      </div>
    </li>
  );
};

export default ExpenseItem;
