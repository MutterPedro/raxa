/**
 * Makes the next call of a jest mock return a promise that stays pending until
 * the returned function is called. For tests that need to inspect the UI while
 * an async service call is still in flight (pending buttons, spinners):
 *
 * ```ts
 * const release = holdNextCall<Expense>(billService.quickAddExpense as jest.Mock);
 * // …interact with the UI, assert the pending state…
 * release(createExpense({ id: 2 }));
 * ```
 */
export function holdNextCall<T = undefined>(mock: jest.Mock): (value?: T) => void {
  let resolve: (value: T | undefined) => void = () => {};
  mock.mockImplementationOnce(
    () =>
      new Promise<T | undefined>((r) => {
        resolve = r;
      }),
  );
  return (value?: T) => resolve(value);
}
