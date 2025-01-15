import { SyntheticEvent, useState } from 'react';
import NewExpenseJumboButton from './expense/NewExpenseJumboButton';
import NewBillForm from './expense/NewBillForm';
import BillsList from './expense/BillsList';
import { myContainer } from '../inversify.config';
import Bill from '../core/entities/Bill';
import { BillService } from '../core/services/BillService';
import { TYPES } from '../infra/di';

export default function MainContainer() {
  const [showingForm, showForm] = useState(false);

  const billService = myContainer.get<BillService>(TYPES.BillService);

  const [bills, setBills] = useState<Bill[]>([]);
  billService.getBills().then((bills) => setBills(bills));

  const [total, setTotal] = useState(0);

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
    setTotal(total + bill.amount);
  }

  return (
    <div className="container flex flex-col items-center mx-auto">
      {showingForm ? (
        <NewBillForm handleSubmitBill={handleSubmitBill} handleCancel={() => showForm(!showingForm)} />
      ) : (
        <NewExpenseJumboButton handleOnClick={() => showForm(!showingForm)} />
      )}
      {bills.length > 0 && <BillsList bills={bills} total={total} />}
    </div>
  );
}
