import type Bill from '../../core/entities/Bill';
import BillItem from './BillItem';

export interface BillsListProps {
  bills: Bill[];
}

export default function BillsList({ bills }: BillsListProps) {
  return (
    <div className="flex flex-wrap -mb-4 w-1/2 justify-center flex-col">
      <div className="space-y-6">
        {bills.map((bill) => (
          <BillItem bill={bill} key={`${bill.id}-bi`} />
        ))}
      </div>
    </div>
  );
}
