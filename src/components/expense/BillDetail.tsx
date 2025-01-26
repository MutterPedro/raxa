import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useBillService } from '../state/BillServiceContext';
import Bill from '../../core/entities/Bill';
import LoadingGauge from '../common/LoadingGuage';
import NewExpenseForm from './NewExpenseForm';

export default function BillDetail() {
  const { billId } = useParams();
  const billService = useBillService();

  const [bill, setBill] = useState<Bill | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(false);

  useEffect(() => {
    billService
      .getById(Number(billId))
      .then((bill) => {
        setBill(bill);
      })
      .catch(console.error);
    billService
      .getTotal(Number(billId))
      .then((t) => setTotal(t))
      .catch(console.error);
  }, [billService, billId]);

  return bill ? (
    showForm ? (
      <NewExpenseForm bill={bill} handleCancel={() => setShowForm(false)} />
    ) : (
      <div className="relative w-full bg-white px-6 pt-10 pb-8 mt-8 shadow-xl ring-1 ring-gray-900/5 sm:mx-auto sm:max-w-2xl sm:rounded-lg sm:px-10">
        <div className="mx-auto px-5">
          <div className="flex flex-col items-center text-gray-900">
            <h2 className="mt-5 text-center text-3xl font-bold tracking-tight md:text-5xl">{bill.name}</h2>
            <p className="mt-3 text-lg text-neutral-500 md:text-xl">{bill.date.toLocaleString()}</p>
          </div>
          <div className="mx-auto mt-8 grid max-w-xl divide-y divide-neutral-200 text-gray-700">
            <div className="py-5">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  <span className="font-bold"> Total R$ {total.toFixed(2)}</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="group-open:animate-fadeIn mt-3 text-neutral-600">
                  Springerdata offers a variety of billing options, including monthly and annual subscription plans, as
                  well as pay-as-you-go pricing for certain services. Payment is typically made through a credit card or
                  other secure online payment method.
                </p>
              </details>
            </div>
            <div className="py-5">
              <details open className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                  <span> Divisão por participantes</span>
                  <span className="transition group-open:rotate-180">
                    <svg
                      fill="none"
                      height="24"
                      shapeRendering="geometricPrecision"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.5"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M6 9l6 6 6-6"></path>
                    </svg>
                  </span>
                </summary>
                <p className="group-open:animate-fadeIn mt-3 text-neutral-600">
                  We offer a 30-day money-back guarantee for most of its subscription plans. If you are not satisfied
                  with your subscription within the first 30 days, you can request a full refund. Refunds for
                  subscriptions that have been active for longer than 30 days may be considered on a case-by-case basis.
                </p>
              </details>
            </div>
          </div>
          <div className="mx-auto mt-8 grid max-w-xl divide-y divide-neutral-200 justify-center align-middle">
            <button
              type="button"
              className="bg-primary text-secondary-color align-middle arvo-bold text-center rounded-full max-h-36 px-12 py-5"
              onClick={() => setShowForm(true)}
              data-testid="new-expense-button"
            >
              + Nova Despesa
            </button>
          </div>
        </div>
      </div>
    )
  ) : (
    <LoadingGauge />
  );
}
