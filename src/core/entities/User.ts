import { auto_increment_field, field, table } from '../utils/decorators/database';

export interface UserProps {
  id: number;
  name: string;
  email: string;
  /** Firebase account the local row is bound to; absent until the first login. */
  firebase_uid?: string;
}

@table('user')
export default class User {
  // Version 2 adds firebase_uid. Dexie *replaces* (never merges) the schema of a
  // table listed in a new version — indexes not re-declared are deleted — so every
  // field must be re-decorated under version 2 as well.
  @auto_increment_field(1, 'id')
  @auto_increment_field(2, 'id')
  id: number = 0;

  @field(1, 'name')
  @field(2, 'name')
  name: string = '';

  @field(1, 'email')
  @field(2, 'email')
  email: string = '';

  @field(2, 'firebase_uid')
  firebase_uid: string = '';

  logged_in: boolean = false;
}
