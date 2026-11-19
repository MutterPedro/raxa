import { useEffect, useRef } from 'react';

import type Bill from '../../core/entities/Bill';
import BillItem from './BillItem';
import Skeleton from '../common/Skeleton';

export interface BillsListProps {
  bills: Bill[];
  isLoading?: boolean;
  /** There are older bills beyond what is shown; the feed watches for the end. */
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
}

export default function BillsList({
  bills,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: BillsListProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Infinite feed: the sentinel sits below the last card and loads the next page
  // as it enters view. The effect re-runs after every append, so the observer is
  // re-registered and fires again while the sentinel stays in view — the feed
  // chains until the viewport is full or the rows run out.
  useEffect(
    function () {
      const node = sentinelRef.current;
      if (!node || !onLoadMore) return;
      // jsdom has no IntersectionObserver; loading directly keeps the chain (and
      // tests over it) deterministic there.
      if (typeof IntersectionObserver === 'undefined') {
        onLoadMore();
        return;
      }
      const observer = new IntersectionObserver(function (entries) {
        if (entries.some((entry) => entry.isIntersecting)) onLoadMore();
      });
      observer.observe(node);
      return () => observer.disconnect();
    },
    [onLoadMore, hasMore, bills.length],
  );

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
      {isLoadingMore && (
        <div role="status" aria-label="Carregando mais contas…" className="flex flex-col gap-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-[76px] w-full rounded-[var(--radius-card)]" />
          ))}
        </div>
      )}
      {hasMore && (
        <div ref={sentinelRef} data-testid="bills-list-sentinel" aria-hidden="true" className="h-px w-full" />
      )}
    </div>
  );
}
