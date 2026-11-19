import { buildNameMatcher, normalizeForSearch } from '../../../src/core/utils/search';

describe('search.ts', function () {
  describe('Unit tests', function () {
    it('should normalize case, accents and surrounding space #unit', function () {
      expect(normalizeForSearch('  Açaí No Parque  ')).toBe('acai no parque');
      expect(normalizeForSearch('ENTRADAS — R$ 10')).toBe('entradas — r$ 10');
    });

    it('should match names ignoring case and accents #unit', function () {
      expect(buildNameMatcher('acai')({ name: 'Açaí' })).toBe(true);
      expect(buildNameMatcher('ÇINEMA')({ name: 'cinema à tarde' })).toBe(true);
      expect(buildNameMatcher('pizza')({ name: 'Açaí' })).toBe(false);
    });

    it('should not match entities without a usable name #unit', function () {
      expect(buildNameMatcher('anything')({ name: undefined })).toBe(false);
      expect(buildNameMatcher('anything')({ name: 42 })).toBe(false);
    });
  });
});
