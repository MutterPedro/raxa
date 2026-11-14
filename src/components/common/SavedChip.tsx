/**
 * On-device reassurance: after a write lands, this chip stays on screen so the
 * user knows the data is theirs and safe, online or not.
 */
export default function SavedChip() {
  return (
    <p
      data-testid="saved-chip"
      className="flex w-fit items-center gap-1 rounded-full border border-success/30 bg-success/10 px-3 py-1 text-xs font-medium text-success"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <polyline points="20 6 9 17 4 12" />
      </svg>
      Guardado no seu aparelho
    </p>
  );
}
