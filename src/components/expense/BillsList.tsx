import type Bill from '../../core/entities/Bill';

export interface BillsListProps {
  bills: Bill[];
  total: number;
}

const avatars = [
  'https://images.unsplash.com/photo-1505840717430-882ce147ef2d?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
];

export default function BillsList({ bills, total }: BillsListProps) {
  return (
    <div className="flex flex-wrap -mb-4 w-1/2 justify-center flex-col">
      <div className="space-y-6">
        {bills.map((bill) => (
          <div key={bill.id} className="flex justify-between items-center border-b pb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">{bill.name}</h2>
              <p className="text-sm text-gray-500">
                {'Fulano, Beltrano, Ciclano'} &middot; {bill.date.toLocaleDateString()} &middot;{' '}
                {bill.date?.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex items-center space-x-4 w-1/3">
              <div className="flex -space-x-2">
                {avatars.map((avatar, index) => (
                  <img key={index} src={avatar} alt="Avatar" className="w-8 h-8 rounded-full border-2 border-white" />
                ))}
              </div>
              <div className="flex items-center text-gray-500 font-semibold w-1/2">
                <span className="ml-2 text-sm">R$ {bill.amount}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center border-t pt-4">
        <h2 className="text-lg font-semibold text-gray-800">Total</h2>
        <span className="text-gray-500 text-sm font-extrabold" data-testid="bill-total">
          R$ {total}
        </span>
      </div>
    </div>
  );
}
