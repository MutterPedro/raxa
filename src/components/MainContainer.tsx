import { SyntheticEvent, useState } from 'react';

import NewExpenseJumboButton from './expense/NewExpenseJumboButton';
import NewBillForm from './expense/NewBillForm';
import BillsList from './expense/BillsList';
import Bill from '../core/entities/Bill';
import NewExpenseFloatButton from './expense/NewExpenseFloatButton';
import { useBillService } from './state/BillServiceContext';

export default function MainContainer() {
  const billService = useBillService();
  const [showingForm, showForm] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);

  billService.getBills().then((bills) => {
    setBills(bills);
  });

  async function handleSubmitBill(event: SyntheticEvent) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const bill = await billService.createBill({
      name: formData.get('name') as string,
      amount: Number(formData.get('amount')),
      date: new Date((formData.get('date') as string) || new Date()),
      ownerId: 0,
    });

    setBills([...bills, bill]);
    showForm(false);
  }

  return (
    <div className="container flex flex-col items-center mx-auto">
      {showingForm ? (
        <NewBillForm handleSubmitBill={handleSubmitBill} handleCancel={() => showForm(!showingForm)} />
      ) : bills.length > 0 ? (
        <NewExpenseFloatButton handleOnClick={() => showForm(!showingForm)} />
      ) : (
        <NewExpenseJumboButton handleOnClick={() => showForm(!showingForm)} />
      )}
      {bills.length > 0 && <BillsList bills={bills} />}
    </div>
  );
}
