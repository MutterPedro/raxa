/** pt-BR money/date display for everything the user sees; entities keep raw numbers/Date.
 *  The currency symbol is prepended with a plain space on purpose: Intl's `currency` style
 *  inserts a non-breaking space, which makes assertions and text matching needlessly tricky. */
const currencyFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatCurrency(amount: number): string {
  return `R$ ${currencyFormat.format(amount)}`;
}

/**
 * Parses an amount typed into a text field, accepting what pt-BR keyboards produce
 * ("10,5", "1.234,56") as well as dot decimals from pastes and code ("10.5"). With a
 * comma present, dots are thousands grouping; without one, a dot is the decimal point.
 * Returns NaN for anything that isn't a plain number (empty included), so callers keep
 * guarding with `> 0`.
 */
export function parseAmount(value: string): number {
  const trimmed = value.trim();
  if (!trimmed) return NaN;
  const normalized = trimmed.includes(',') ? trimmed.replace(/\./g, '').replace(',', '.') : trimmed;
  return Number(normalized);
}

/** Amount as it should sit inside a pt-BR text input: bare number, comma decimals. */
export function amountToInputValue(amount: number): string {
  return String(amount).replace('.', ',');
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}
