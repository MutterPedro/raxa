import { nanoid } from 'nanoid';

export interface IDGenerator {
  generate(length?: number): string;
}

export class NanoIDGenerator implements IDGenerator {
  generate(length: number = 12): string {
    return nanoid(length);
  }
}
