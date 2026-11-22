import { amountToInputValue, formatCurrency, formatDate, parseAmount } from '../../../src/core/utils/format';

describe('formatCurrency', () => {
  it('renders pt-BR decimals with two digits #unit', () => {
    expect(formatCurrency(0)).toBe('R$ 0,00');
    expect(formatCurrency(150.5)).toBe('R$ 150,50');
    expect(formatCurrency(80)).toBe('R$ 80,00');
  });

  it('groups thousands with dots #unit', () => {
    expect(formatCurrency(1234.56)).toBe('R$ 1.234,56');
    expect(formatCurrency(1234567.891)).toBe('R$ 1.234.567,89');
  });

  it('keeps negative balances with a leading minus #unit', () => {
    expect(formatCurrency(-50.25)).toBe('R$ -50,25');
  });
});

describe('formatDate', () => {
  it('renders dd/mm/yyyy in pt-BR #unit', () => {
    expect(formatDate(new Date(2026, 0, 15))).toBe('15/01/2026');
    expect(formatDate(new Date(2026, 11, 1))).toBe('01/12/2026');
  });
});

describe('parseAmount', () => {
  it('reads comma decimals and dot thousands like a pt-BR keyboard types them #unit', () => {
    expect(parseAmount('10,5')).toBe(10.5);
    expect(parseAmount('1.234,56')).toBe(1234.56);
    expect(parseAmount('0,05')).toBe(0.05);
  });

  it('also reads dot decimals from pastes and code #unit', () => {
    expect(parseAmount('10.5')).toBe(10.5);
    expect(parseAmount('10')).toBe(10);
  });

  it('returns NaN for empty and junk input #unit', () => {
    expect(parseAmount('')).toBeNaN();
    expect(parseAmount('   ')).toBeNaN();
    expect(parseAmount('abc')).toBeNaN();
    expect(parseAmount('10,5abc')).toBeNaN();
  });
});

describe('amountToInputValue', () => {
  it('writes amounts with a comma for text inputs #unit', () => {
    expect(amountToInputValue(120.5)).toBe('120,5');
    expect(amountToInputValue(80)).toBe('80');
  });
});
