import { RefObject, useEffect, useRef } from 'react';

/**
 * Infinite-feed loading: watches a 1px sentinel below the list and calls `onLoadMore`
 * while it is in view. Pass null when there is nothing more to load (no observer is
 * attached). The effect re-registers on every content change (`rowCount`), so it fires
 * again while the sentinel stays visible — the feed must guard its own in-flight state.
 * jsdom has no IntersectionObserver; loading directly keeps component tests
 * deterministic there.
 */
export function useSentinel(onLoadMore: (() => void) | null, rowCount: number): RefObject<HTMLDivElement | null> {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(
    function () {
      const node = sentinelRef.current;
      if (!node || !onLoadMore) return;
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
    [onLoadMore, rowCount],
  );

  return sentinelRef;
}
