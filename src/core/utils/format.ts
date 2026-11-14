/** pt-BR money/date display for everything the user sees; entities keep raw numbers/Date.
 *  The currency symbol is prepended with a plain space on purpose: Intl's `currency` style
 *  inserts a non-breaking space, which makes assertions and text matching needlessly tricky. */
const currencyFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function formatCurrency(amount: number): string {
  return `R$ ${currencyFormat.format(amount)}`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR');
}
