import type Bill from '../../core/entities/Bill';

export interface BillsListProps {
  bills: Bill[];
  total: number;
}

export default function BillsList({ bills, total }: BillsListProps) {
  return (
    <ul role="list" className="divide-y divide-gray-100 bg-gray-300">
      {bills.map((bill) => (
        <li className="flex justify-between gap-x-6 py-5" key={`bill-${bill.id}`}>
          <div className="flex min-w-0 gap-x-4">
            <img
              className="h-12 w-12 flex-none rounded-full bg-gray-50"
              src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">{bill.name}</p>
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">leslie.alexander@example.com</p>
            </div>
          </div>
          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <p className="text-sm leading-6 text-gray-900">{bill.amount}</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Last seen <time dateTime="2023-01-23T13:23Z">3h ago</time>
            </p>
          </div>
        </li>
      ))}
      <li data-testid="bill-total" className="flex justify-between gap-x-6 py-5">
        {total}
      </li>
    </ul>
  );
}
