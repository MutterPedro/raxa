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
          {participants.map((p) => p.name).join(', ')} &middot; {bill.date.toLocaleDateString()}
        </p>
      </div>
      <div className="flex items-center space-x-4 w-1/3">
        <div className="flex -space-x-2">
          {participants.map((p, index) => (
            <Avatar key={index} user={p} size="30px" />
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
