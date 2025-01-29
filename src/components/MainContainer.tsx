import { SyntheticEvent, useEffect, useState } from 'react';

import NewBillJumboButton from './expense/NewBillJumboButton';
import NewBillForm from './expense/NewBillForm';
import BillsList from './expense/BillsList';
import Bill from '../core/entities/Bill';
import NewBillFloatButton from './expense/NewBillFloatButton';
import { useBillService } from './state/useBillService';

export default function MainContainer() {
  const [showingForm, showForm] = useState(false);
  const billService = useBillService();
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(
    function () {
      billService
        .getBills()
        .catch(console.error)
        .then((newBills) => setBills(newBills || []));
    },
    [billService],
  );

  async function handleSubmitBill(event: SyntheticEvent) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    const bill = await billService.createBill({
      name: formData.get('name') as string,
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
        <NewBillFloatButton handleOnClick={() => showForm(!showingForm)} />
      ) : (
        <NewBillJumboButton handleOnClick={() => showForm(!showingForm)} />
      )}
      {bills.length > 0 && <BillsList bills={bills} />}
    </div>
  );
}
