import { parseInputDate, todayInputValue } from '../../../src/core/utils/localDate';

describe('localDate.ts', function () {
  const originalTz = process.env.TZ;

  afterEach(function () {
    jest.useRealTimers();
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
  });

  it('parses a date input value as local midnight, not UTC midnight #unit', function () {
    process.env.TZ = 'America/Sao_Paulo';

    const date = parseInputDate('2026-11-13');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(13);
    expect(date.getHours()).toBe(0);
    // America/Sao_Paulo is a permanent UTC-3, so local midnight lands at 03:00Z
    expect(date.toISOString()).toBe('2026-11-13T03:00:00.000Z');
  });

  it('formats today as the local calendar day, even when UTC is already tomorrow #unit', function () {
    process.env.TZ = 'America/Sao_Paulo';
    // 23:30 local on Jan 31 — still Jan 31 locally, but already Feb 1 in UTC
    jest.useFakeTimers({ now: new Date('2026-02-01T02:30:00Z') });

    expect(todayInputValue()).toBe('2026-01-31');
  });
});
