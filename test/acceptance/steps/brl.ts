/** Expected pt-BR money rendering (e.g. 'R$ 1.234,56') — kept independent from the app
 *  so acceptance assertions stay honest; the formatter itself is pinned by unit tests. */
const numberFormat = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const brl = (value: number): string => `R$ ${numberFormat.format(value)}`;
