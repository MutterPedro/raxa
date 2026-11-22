import { auto_increment_field, field, table } from '../utils/decorators/database';

export interface UserProps {
  id: number;
  name: string;
  email: string;
  /** Firebase account the local row is bound to; absent until the first login. */
  firebase_uid?: string;
  /** Profile picture URL (Google sign-in); absent for password-only accounts. */
  photo_url?: string;
  /** When the row last matched the server; absent means local changes not yet synced. */
  synced_at?: number;
}

@table('user')
export default class User {
  // Version 2 adds firebase_uid. Dexie *replaces* (never merges) the schema of a
  // table listed in a new version — indexes not re-declared are deleted — so every
  // field must be re-decorated under version 2 as well. Version 3 adds photo_url
  // and version 4 synced_at, repeating the same drill.
  @auto_increment_field(1, 'id')
  @auto_increment_field(2, 'id')
  @auto_increment_field(3, 'id')
  @auto_increment_field(4, 'id')
  id: number = 0;

  @field(1, 'name')
  @field(2, 'name')
  @field(3, 'name')
  @field(4, 'name')
  name: string = '';

  @field(1, 'email')
  @field(2, 'email')
  @field(3, 'email')
  @field(4, 'email')
  email: string = '';

  @field(2, 'firebase_uid')
  @field(3, 'firebase_uid')
  @field(4, 'firebase_uid')
  firebase_uid: string = '';

  @field(3, 'photo_url')
  @field(4, 'photo_url')
  photo_url: string = '';

  @field(4, 'synced_at')
  synced_at?: number;

  logged_in: boolean = false;
}
