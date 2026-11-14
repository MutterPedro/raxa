import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useBillService } from '../state/useBillService';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import Bill from '../../core/entities/Bill';
import LoadingGauge from '../common/LoadingGuage';
import NewExpenseForm from './NewExpenseForm';
import Expense from '../../core/entities/Expense';
import ExpenseItem from './ExpenseItem';
import BillParticipantsPartList from './BillParticipantsPartList';
import Card from '../common/Card';
import Button from '../common/Button';

export default function BillDetail() {
  const { billId } = useParams();
  const billService = useBillService();
  const navigate = useNavigate();
  const { notify } = useToast();

  const [bill, setBill] = useState<Bill | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // Bumped whenever the division must be refetched (expense added or undone).
  const [partsRefreshKey, setPartsRefreshKey] = useState<number>(0);

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
    billService.getExpenses(Number(billId)).then((expenses) => setExpenses(expenses));
  }, [billService, billId]);

  function refreshParts() {
    setPartsRefreshKey((key) => key + 1);
  }

  async function confirmDeleteBill() {
    setConfirmDeleteOpen(false);
    try {
      await billService.deleteBill(bill?.id ?? Number(billId));
      notify('Conta apagada');
      navigate('/');
    } catch (error) {
      // The bill survived — stay on it so the user can try again.
      console.error(error);
      notify('Não foi possível apagar a conta');
    }
  }

  function onExpenseCreated(expense: Expense) {
    setShowForm(false);
    setTotal((current) => current + expense.amount);
    setExpenses((current) => [...current, expense]);
    refreshParts();
    notify('Despesa adicionada', {
      duration: 6000,
      action: {
        label: 'Desfazer',
        onClick: () => {
          billService
            .deleteExpense(expense.id)
            .then(() => {
              setTotal((current) => current - expense.amount);
              setExpenses((current) => current.filter((e) => e.id !== expense.id));
              refreshParts();
            })
            .catch((error) => {
              console.error(error);
              notify('Não foi possível desfazer');
            });
        },
      },
    });
  }

  return bill ? (
    showForm ? (
      <NewExpenseForm bill={bill} handleCancel={() => setShowForm(false)} onExpenseCreated={onExpenseCreated} />
    ) : (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
        <Card>
          <h2 className="type-display text-2xl font-bold text-ink">{bill.name}</h2>
          <p className="mt-1 text-sm text-ink-muted">{bill.date.toLocaleDateString('pt-BR')}</p>
          <p className="mt-4 text-3xl font-bold tabular-nums text-ink" data-testid="bill-total-span">
            <span className="text-sm font-medium uppercase tracking-wide text-ink-muted">Total</span> R${' '}
            {total.toFixed(2)}
          </p>
        </Card>
        <Card>
          <details className="group" open>
            <summary className="flex cursor-pointer list-none items-center justify-between">
              <h3 className="type-display text-base font-semibold text-ink">Despesas</h3>
              <svg
                className="transition-transform group-open:rotate-180"
                fill="none"
                height="24"
                shapeRendering="geometricPrecision"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                width="24"
                aria-hidden="true"
              >
                <path d="M6 9l6 6 6-6"></path>
              </svg>
            </summary>
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 group-open:grid-rows-[1fr]">
              <div className="overflow-hidden">
                <ul role="list" className="divide-y divide-line">
                  {expenses.map((expense) => (
                    <ExpenseItem expense={expense} key={expense.id} />
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </Card>
        <Card>
          <h3 className="type-display text-base font-semibold text-ink">Divisão por participantes</h3>
          <BillParticipantsPartList billId={Number(billId)} refreshKey={partsRefreshKey} />
        </Card>
        <Button
          type="button"
          size="lg"
          onClick={() => setShowForm(true)}
          data-testid="new-expense-button"
          className="w-full"
        >
          Nova despesa
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setConfirmDeleteOpen(true)}
          data-testid="delete-bill-button"
          className="w-full"
        >
          Apagar conta
        </Button>
        <Modal open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} title="Apagar conta?">
          <p className="text-sm text-ink-muted">A conta e todas as suas despesas serão apagadas para sempre.</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setConfirmDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" variant="danger" onClick={confirmDeleteBill} data-testid="delete-bill-confirm">
              Apagar
            </Button>
          </div>
        </Modal>
      </div>
    )
  ) : (
    <LoadingGauge />
  );
}
