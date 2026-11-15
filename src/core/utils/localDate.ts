/** Today's local calendar date as a `yyyy-mm-dd` value for `<input type="date">`. */
export function todayInputValue(): string {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

/**
 * Parses a `yyyy-mm-dd` date-input value as local midnight.
 *
 * Plain `new Date('yyyy-mm-dd')` interprets the value as UTC midnight, which shows up as the
 * previous day for any timezone west of Greenwich; the time part (without an offset) forces
 * local-time parsing.
 */
export function parseInputDate(value: string): Date {
  return new Date(`${value}T00:00:00`);
}
