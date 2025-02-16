import { auto_increment_field, field, table } from '../utils/decorators/database';

export interface UserProps {
  id: number;
  name: string;
  email: string;
}

@table('user')
export default class User {
  @auto_increment_field(1, 'id')
  id: number = 0;

  @field(1, 'name')
  name: string = '';

  @field(1, 'email')
  email: string = '';

  logged_in: boolean = false;
}
