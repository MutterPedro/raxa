import type Bill from '../../core/entities/Bill';
import BillItem from './BillItem';
import Skeleton from '../common/Skeleton';

export interface BillsListProps {
  bills: Bill[];
  isLoading?: boolean;
}

export default function BillsList({ bills, isLoading = false }: BillsListProps) {
  if (isLoading) {
    return (
      <div
        className="mx-auto flex w-full max-w-2xl flex-col gap-3"
        data-testid="bills-list-skeleton"
        role="status"
        aria-label="Carregando contas…"
      >
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[76px] w-full rounded-[var(--radius-card)]" />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
      {bills.map((bill) => (
        <BillItem bill={bill} key={`${bill.id}-bi`} />
      ))}
    </div>
  );
}
