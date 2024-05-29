import { IDGenerator } from '../../../src/infra/IDGenerator';
import { word } from 'casual';

export class FixedIDGenerator implements IDGenerator {
  constructor(public value: string = word) {}

  generate(): string {
    return this.value;
  }
}
