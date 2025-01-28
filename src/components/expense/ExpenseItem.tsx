import React from 'react';
import Expense from '../../core/entities/Expense';

interface ExpenseItemProps {
  expense: Expense;
}

const ExpenseItem: React.FC<ExpenseItemProps> = ({ expense }) => {
  return (
    <li>
      <div className="px-2 py-5">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">{expense.name}</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{expense.date.toLocaleString()}</p>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">
            Participantes: <span className="text-green-600">Active</span>
          </p>
          <a href="#" className="font-medium text-secondary-primary hover:green-900">
            R$ {expense.amount.toFixed(2)}
          </a>
        </div>
      </div>
    </li>
  );
};

export default ExpenseItem;
