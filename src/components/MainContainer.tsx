import { useCallback, useEffect, useRef, useState } from 'react';

import NewBillJumboButton from './expense/NewBillJumboButton';
import NewBillForm, { NewBillFormValues } from './expense/NewBillForm';
import BillsList from './expense/BillsList';
import Bill from '../core/entities/Bill';
import NewBillFloatButton from './expense/NewBillFloatButton';
import { useBillService } from './state/useBillService';
import EmptyState from './common/EmptyState';
import SavedChip from './common/SavedChip';
import SyncHint from './login/SyncHint';
import { parseInputDate } from '../core/utils/localDate';
import { normalizeForSearch } from '../core/utils/search';

/** How long the user must pause typing before the list re-filters. */
const SEARCH_DEBOUNCE_MS = 250;

/**
 * The home feed state lives as one object: page loads, appends and the total
 * counter change together, and a split-state update could strand `hasMore`
 * derived from stale pieces.
 */
interface BillFeed {
  bills: Bill[];
  /** Highest page fully merged into `bills`. */
  page: number;
  /** Total rows matching the current filter (from countBills). */
  total: number;
  /** The debounced filter `bills`/`total` belong to; null until the first load lands. */
  filter: string | null;
  /** A later page is in flight. */
  loadingMore: boolean;
}

const initialFeed: BillFeed = { bills: [], page: 1, total: 0, filter: null, loadingMore: false };

export default function MainContainer() {
  const [showingForm, showForm] = useState(false);
  const billService = useBillService();
  const [feed, setFeed] = useState<BillFeed>(initialFeed);
  // Stays true after the first created bill on this visit — on-device reassurance.
  const [saved, setSaved] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Always-current filter, so a page whose fetch raced a filter change can drop
  // its result instead of merging rows from two different searches.
  const searchRef = useRef('');

  useEffect(
    function () {
      const timer = setTimeout(() => setDebouncedSearch(search), SEARCH_DEBOUNCE_MS);
      return () => clearTimeout(timer);
    },
    [search],
  );

  useEffect(
    function () {
      let cancelled = false;
      searchRef.current = debouncedSearch;
      Promise.all([
        billService.getBills(1, { search: debouncedSearch }),
        billService.countBills({ search: debouncedSearch }),
      ])
        .then(([bills, total]) => {
          if (cancelled) return;
          setFeed({ bills, page: 1, total, filter: debouncedSearch, loadingMore: false });
        })
        .catch((error) => {
          // A failed first load still settles the feed (empty list beats a stuck skeleton).
          console.error(error);
          if (!cancelled) setFeed((feed) => ({ ...feed, filter: debouncedSearch }));
        });
      return () => {
        cancelled = true;
      };
    },
    [billService, debouncedSearch],
  );

  // Loading is derived, not set in the effect: `cold` means nothing has ever loaded,
  // `stale` means a re-filter is in flight and the rows shown belong to the old term.
  const cold = feed.filter === null;
  const stale = !cold && feed.filter !== debouncedSearch;
  const hasMore = !stale && feed.bills.length < feed.total;

  // Guarded synchronously (not via feed.loadingMore): state updates batch, and two
  // quick sentinel triggers must not fetch the same page twice.
  const loadingMoreRef = useRef(false);
  const loadMore = useCallback(
    async function () {
      const searchAtCall = debouncedSearch;
      if (loadingMoreRef.current || stale || !hasMore) return;
      loadingMoreRef.current = true;
      setFeed((feed) => ({ ...feed, loadingMore: true }));
      try {
        const next = await billService.getBills(feed.page + 1, { search: searchAtCall });
        if (searchRef.current !== searchAtCall) return; // filter moved on mid-flight
        setFeed((feed) => {
          const bills = [...feed.bills, ...next];
          // An empty page means the earlier count was already stale — stop asking.
          const total = next.length === 0 ? bills.length : feed.total;
          return { ...feed, bills, page: feed.page + 1, total, loadingMore: false };
        });
      } catch (error) {
        console.error(error);
        setFeed((feed) => ({ ...feed, loadingMore: false }));
      } finally {
        loadingMoreRef.current = false;
      }
    },
    [billService, debouncedSearch, stale, feed.page, hasMore],
  );

  async function handleSubmitBill(values: NewBillFormValues) {
    try {
      const date = values.date ? parseInputDate(values.date) : new Date();
      const bill = await billService.createBill({
        name: values.name,
        date,
        ownerId: 0,
      });

      if (values.amount > 0) {
        try {
          await billService.addExpense(bill.id, {
            name: values.name,
            amount: values.amount,
            date: date.toISOString(),
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

      // Newest-first feed: a new bill heads the list — but only when it matches the
      // filter still on screen; the SavedChip reassures even when it does not show.
      const term = normalizeForSearch(debouncedSearch);
      if (!term || normalizeForSearch(bill.name).includes(term)) {
        setFeed((feed) => ({ ...feed, bills: [bill, ...feed.bills], total: feed.total + 1 }));
      }
      setSaved(true);
      showForm(false);
    } catch (billError) {
      console.error(billError); // form stays open so the user can retry
    }
  }

  const searching = debouncedSearch !== '';
  // Skeleton only while cold; while re-filtering, the old list (or the no-results
  // message) stays on screen so typing never blanks the page mid-fetch.
  const showSearchBar = !cold && (feed.bills.length > 0 || feed.total > 0 || search !== '');

  return (
    <div className="container mx-auto flex flex-col items-center gap-6">
      {!showingForm && (
        <>
          {saved && <SavedChip />}
          <SyncHint />
        </>
      )}
      {showingForm ? (
        <NewBillForm handleSubmitBill={handleSubmitBill} handleCancel={() => showForm(!showingForm)} />
      ) : cold ? (
        <BillsList bills={[]} isLoading />
      ) : (
        <>
          {showSearchBar && (
            <div className="mx-auto w-full max-w-2xl">
              <input
                type="search"
                data-testid="bills-search-input"
                aria-label="Buscar contas"
                placeholder="Buscar conta por nome…"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full h-11 rounded-[var(--radius-field)] border border-line bg-surface-raised px-3 text-ink placeholder:text-ink-faint focus-ring"
              />
            </div>
          )}
          {feed.bills.length === 0 && searching ? (
            <EmptyState title="Nenhuma conta encontrada" hint="Nenhuma conta combina com a busca." />
          ) : feed.bills.length === 0 ? (
            <EmptyState
              title="Nenhuma conta ainda"
              hint="Crie a primeira conta e chame quem está por perto — tudo funciona offline."
              action={<NewBillJumboButton handleOnClick={() => showForm(!showingForm)} />}
            />
          ) : (
            <>
              <NewBillFloatButton handleOnClick={() => showForm(!showingForm)} />
              <BillsList bills={feed.bills} hasMore={hasMore} isLoadingMore={feed.loadingMore} onLoadMore={loadMore} />
            </>
          )}
        </>
      )}
    </div>
  );
}
