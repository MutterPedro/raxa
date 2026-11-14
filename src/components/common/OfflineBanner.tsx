/**
 * Slim reassurance strip shown while the browser is offline. Raxa keeps working
 * from the device either way, so the banner only explains that nothing else
 * changes — calm brand tint, never an alarm.
 */
export default function OfflineBanner() {
  return (
    <div
      role="status"
      data-testid="offline-banner"
      className="flex items-center justify-center gap-2 bg-brand-100 px-4 py-2 text-center text-sm font-medium text-brand-900 dark:bg-brand-900 dark:text-brand-100"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <line x1="2" y1="2" x2="22" y2="22" />
        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </svg>
      Sem internet — suas contas continuam funcionando neste aparelho.
    </div>
  );
}
