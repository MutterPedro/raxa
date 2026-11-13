import { useEffect, useState } from 'react';

import NewBillJumboButton from './expense/NewBillJumboButton';
import NewBillForm, { NewBillFormValues } from './expense/NewBillForm';
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

  async function handleSubmitBill(values: NewBillFormValues) {
    try {
      const bill = await billService.createBill({
        name: values.name,
        date: new Date(values.date || new Date()),
        ownerId: 0,
      });

      if (values.amount > 0) {
        try {
          await billService.addExpense(bill.id, {
            name: values.name,
            amount: values.amount,
            date: new Date(values.date || Date.now()).toISOString(),
            participantIds: values.participantIds,
            payerId: values.payerId ?? 0,
          });
        } catch (expenseError) {
          // The bill was created only to hold this expense — undo it so a failed submit
          // leaves nothing behind; error surfacing comes with the toast flow later
          await billService.deleteBill(bill.id);
          throw expenseError;
        }
      }

      setBills([...bills, bill]);
      showForm(false);
    } catch (billError) {
      console.error(billError); // form stays open so the user can retry
    }
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
