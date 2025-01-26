export const FIELDS = Symbol('fields');
export const TABLES = Symbol('tables');
export const TABLE_NAME = Symbol('table_name');
export const TABLE_FIELDS = Symbol('table_fields');

function addToTableFields(target: object, name: string) {
  const fields = Reflect.getMetadata(TABLE_FIELDS, target.constructor) || new Set();
  fields.add(name.replace(/\W/gi, ''));

  Reflect.defineMetadata(TABLE_FIELDS, fields, target.constructor);
}

export function field(version: number, name: string) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return function (target: object, _: string | symbol) {
    addToTableFields(target, name);

    const fields = Reflect.getMetadata(FIELDS, target.constructor) || {};
    fields[version] = fields[version] || new Set();
    fields[version].add(name);

    Reflect.defineMetadata(FIELDS, fields, target.constructor);
  };
}

export function auto_increment_field(version: number, name: string) {
  return field(version, `++${name}`);
}

export function unique_field(version: number, name: string) {
  return field(version, `&${name}`);
}

export function list_field(version: number, name: string) {
  return field(version, `*${name}`);
}

export function table(name: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return function <T extends { new (...args: any[]): unknown }>(constructor: T) {
    Reflect.defineMetadata(TABLE_NAME, name, constructor);

    const tables = Reflect.getMetadata(TABLES, globalThis) || {};
    tables[name] = tables[name] || {};

    const fields = Reflect.getMetadata(FIELDS, constructor) || {};

    for (const [version, attributes] of Object.entries<Set<string>>(fields)) {
      tables[name][version] = Array.from(attributes).join(',');
    }

    Reflect.defineMetadata(TABLES, tables, globalThis);
  };
}
