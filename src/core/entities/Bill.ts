import { auto_increment_field, field, table } from '../utils/decorators/database';

export interface BillProps {
  id: number;
  name: string;
  date: string;
  ownerId: number;
}

@table('bill')
export default class Bill {
  @auto_increment_field(1, 'id')
  id: number = 0;

  @field(1, 'name')
  name: string = '';

  @field(1, 'date')
  date: Date = new Date();

  @field(1, 'ownerId')
  ownerId: number = 0;
}
