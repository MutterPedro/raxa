import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { useBillService } from '../state/useBillService';
import { useToast } from '../common/Toast';
import { Modal } from '../common/Modal';
import Bill from '../../core/entities/Bill';
import LoadingGauge from '../common/LoadingGuage';
import NewExpenseForm from './NewExpenseForm';
import EditExpenseForm from './EditExpenseForm';
import Expense from '../../core/entities/Expense';
import ExpenseItem from './ExpenseItem';
import BillParticipantsPartList from './BillParticipantsPartList';
import Card from '../common/Card';
import Button from '../common/Button';
import Field from '../common/Field';
import SavedChip from '../common/SavedChip';
import { formatCurrency, formatDate } from '../../core/utils/format';
import { parseInputDate, toDateInputValue } from '../../core/utils/localDate';

export default function BillDetail() {
  const { billId } = useParams();
  const billService = useBillService();
  const navigate = useNavigate();
  const { notify } = useToast();

  const [bill, setBill] = useState<Bill | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingBill, setEditingBill] = useState<boolean>(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState<boolean>(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  // Stays true after the first successful write on this visit — on-device reassurance.
  const [saved, setSaved] = useState<boolean>(false);
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
    setSaved(true);
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

  async function handleBillUpdate(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const name = (formData.get('name') as string).trim();
    const date = formData.get('date') as string;

    try {
      const updated = await billService.updateBill(bill?.id ?? Number(billId), {
        ...(name ? { name } : {}),
        ...(date ? { date: parseInputDate(date) } : {}),
      });
      if (!updated) throw new Error(`Bill ${billId} no longer exists`);
      setBill(updated);
      setEditingBill(false);
      setSaved(true);
      notify('Conta atualizada');
    } catch (error) {
      console.error(error);
      notify('Não foi possível salvar a conta');
    }
  }

  function onExpenseSaved(updated: Expense) {
    setEditingExpense(null);
    setSaved(true);
    setExpenses((current) => current.map((e) => (e.id === updated.id ? updated : e)));
    // The amount may have changed — refetch the total instead of patching it optimistically.
    billService.getTotal(Number(billId)).then(setTotal).catch(console.error);
    refreshParts();
    notify('Despesa atualizada');
  }

  return bill ? (
    showForm ? (
      <NewExpenseForm bill={bill} handleCancel={() => setShowForm(false)} onExpenseCreated={onExpenseCreated} />
    ) : editingExpense ? (
      <EditExpenseForm
        expense={editingExpense}
        handleCancel={() => setEditingExpense(null)}
        onExpenseSaved={onExpenseSaved}
      />
    ) : (
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 py-6">
        {saved && <SavedChip />}
        <Card>
          {editingBill ? (
            <form data-testid="edit-bill-form" onSubmit={handleBillUpdate} className="flex flex-col gap-4">
              <Field
                label="Nome da conta"
                name="name"
                defaultValue={bill.name}
                autoFocus
                data-testid="edit-bill-form-name-input"
              />
              <Field
                label="Data"
                type="date"
                name="date"
                defaultValue={toDateInputValue(bill.date)}
                data-testid="edit-bill-form-date-input"
              />
              <div className="flex gap-2">
                <Button type="submit" size="lg" className="flex-1" data-testid="edit-bill-form-submit">
                  Salvar
                </Button>
                <Button type="button" variant="ghost" size="lg" onClick={() => setEditingBill(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          ) : (
            <>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="type-display text-2xl font-bold break-words text-ink">{bill.name}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{formatDate(bill.date)}</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setEditingBill(true)}
                  data-testid="edit-bill-button"
                  className="shrink-0"
                >
                  Editar
                </Button>
              </div>
              <p className="mt-4 text-3xl font-bold tabular-nums text-ink" data-testid="bill-total-span">
                <span className="text-sm font-medium uppercase tracking-wide text-ink-muted">Total</span>{' '}
                {formatCurrency(total)}
              </p>
            </>
          )}
        </Card>
        <Card>
          <details className="group" open>
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between focus-ring">
              <h3 className="type-display text-base font-semibold text-ink">Despesas</h3>
              <svg
                className="transition-transform ease-soft group-open:rotate-180"
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
            <div className="grid grid-rows-[0fr] transition-[grid-template-rows] ease-soft duration-200 group-open:grid-rows-[1fr]">
              <div className="overflow-hidden">
                <ul role="list" className="divide-y divide-line">
                  {expenses.map((expense) => (
                    <ExpenseItem expense={expense} key={expense.id} onEdit={setEditingExpense} />
                  ))}
                </ul>
              </div>
            </div>
          </details>
        </Card>
        <Card>
          <h3 className="type-display text-base font-semibold text-ink">Quem fica com quanto</h3>
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
          <p className="text-sm text-ink-muted">
            Isso apaga a conta e todas as despesas de uma vez — sem como voltar atrás.
          </p>
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
