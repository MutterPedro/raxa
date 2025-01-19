import { useState } from 'react';
import { useNavigate } from 'react-router';

import Bill from '../../core/entities/Bill';
import { useBillService } from '../state/BillServiceContext';

const avatars = [
  'https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
];

export default function BillItem({ bill }: { bill: Bill }) {
  const navigate = useNavigate();
  const billService = useBillService();

  const [total, setTotal] = useState<number>(0);

  billService.getTotal(bill.id).then((t) => setTotal(t));

  return (
    <div
      key={bill.id}
      className="flex justify-between items-center border-b pb-4 cursor-pointer"
      onClick={() => navigate(`/bill/${bill.id}`)}
    >
      <div>
        <h2 className="text-lg font-semibold text-gray-800" data-testid={`bill-item-name-${bill.id}`}>
          {bill.name}
        </h2>
        <p className="text-sm text-gray-500">
          {'Fulano, Beltrano, Ciclano'} &middot; {bill.date.toLocaleDateString()} &middot;{' '}
          {bill.date.toLocaleTimeString()}
        </p>
      </div>
      <div className="flex items-center space-x-4 w-1/3">
        <div className="flex -space-x-2">
          {avatars.map((avatar, index) => (
            <img key={index} src={avatar} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
          ))}
        </div>
        <div className="flex items-center text-gray-500 font-semibold w-1/2">
          <span className="ml-2 text-sm" data-testid={`bill-total-${bill.id}`}>
            R$ {total.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
}
