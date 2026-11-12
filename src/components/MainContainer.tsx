import { SyntheticEvent, useEffect, useState } from 'react';

import NewBillJumboButton from './expense/NewBillJumboButton';
import NewBillForm from './expense/NewBillForm';
import BillsList from './expense/BillsList';
import Bill from '../core/entities/Bill';
import NewBillFloatButton from './expense/NewBillFloatButton';
import { useBillService } from './state/useBillService';
import EmptyState from './common/EmptyState';

export default function MainContainer() {
  const [showingForm, showForm] = useState(false);
  const billService = useBillService();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(
    function () {
      billService
        .getBills()
        .then((newBills) => setBills(newBills || []))
        .catch(console.error)
        .finally(() => setLoading(false));
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
    <div className="container mx-auto flex flex-col items-center gap-6">
      {showingForm ? (
        <NewBillForm handleSubmitBill={handleSubmitBill} handleCancel={() => showForm(!showingForm)} />
      ) : loading ? (
        <BillsList bills={[]} isLoading />
      ) : bills.length === 0 ? (
        <EmptyState
          title="Nenhuma conta ainda"
          hint="Crie a primeira conta e chame quem está por perto — tudo funciona offline."
          action={<NewBillJumboButton handleOnClick={() => showForm(!showingForm)} />}
        />
      ) : (
        <>
          <NewBillFloatButton handleOnClick={() => showForm(!showingForm)} />
          <BillsList bills={bills} />
        </>
      )}
    </div>
  );
}
