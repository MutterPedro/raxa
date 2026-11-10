import {
  FIELDS,
  TABLES,
  TABLE_FIELDS,
  TABLE_NAME,
  auto_increment_field,
  field,
  list_field,
  table,
  unique_field,
} from '../../../../src/core/utils/decorators/database';

describe('database decorators', function () {
  describe('Unit tests', function () {
    it('should register a unique field with the & prefix on schema versions and a sanitized name on table fields #unit', function () {
      class Target {}

      unique_field(1, 'email')(Target.prototype, 'email');

      const versions = Reflect.getMetadata(FIELDS, Target) as Record<number, Set<string>>;
      expect(versions[1].has('&email')).toBe(true);

      const tableFields = Reflect.getMetadata(TABLE_FIELDS, Target) as Set<string>;
      expect(tableFields.has('email')).toBe(true);
    });

    it('should register prefixed fields on their versions #unit', function () {
      class Target {}

      auto_increment_field(1, 'id')(Target.prototype, 'id');
      field(1, 'name')(Target.prototype, 'name');
      field(2, 'extra')(Target.prototype, 'extra');
      list_field(1, 'items')(Target.prototype, 'items');

      const versions = Reflect.getMetadata(FIELDS, Target) as Record<number, Set<string>>;
      expect(versions[1]).toEqual(new Set(['++id', 'name', '*items']));
      expect(versions[2]).toEqual(new Set(['extra']));
    });

    it('should build a table schema from the registered field versions #unit', function () {
      class Target {}
      field(1, 'name')(Target.prototype, 'name');
      field(2, 'extra')(Target.prototype, 'extra');

      table('decorator_test_table')(Target);

      expect(Reflect.getMetadata(TABLE_NAME, Target)).toBe('decorator_test_table');

      const tables = Reflect.getMetadata(TABLES, globalThis) as Record<string, Record<string, string>>;
      expect(tables['decorator_test_table']['1']).toBe('name');
      expect(tables['decorator_test_table']['2']).toBe('extra');
    });

    it('should register a table without any decorated field #unit', function () {
      class Target {}

      table('decorator_test_empty_table')(Target);

      expect(Reflect.getMetadata(TABLE_NAME, Target)).toBe('decorator_test_empty_table');

      const tables = Reflect.getMetadata(TABLES, globalThis) as Record<string, Record<string, string>>;
      expect(tables['decorator_test_empty_table']).toEqual({});
    });
  });
});
