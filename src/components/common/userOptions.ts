import type { UserService } from '../../core/services/UserService';
import type { SelectOption } from './SelectField';

/**
 * Shared plumbing for the creatable user selects (participants and payer). Names typed
 * into a creatable select live as options with placeholder ids until the form submits,
 * and only then do they become users.
 */

/** Value prefix marking an option as a typed name that does not exist yet. */
export const PLACE_HOLDER_ID = 'place_holder_id';

/** A user as a select option. */
export const toOption = (user: { id: number; name: string }): SelectOption => ({
  value: user.id.toString(),
  label: user.name,
});

/** New option for a name typed into the creatable select. */
export const placeholderOption = (label: string, seq: number): SelectOption => ({
  label,
  value: `${PLACE_HOLDER_ID}-${seq}`,
});

/** Merge option groups into one list, keeping a single entry per value (first wins). */
export const mergeOptions = (...groups: SelectOption[][]): SelectOption[] =>
  Array.from(new Map(groups.flat().map((option) => [option.value, option])).values());

/**
 * Resolve selected options to user ids. Placeholder entries become users here, and their
 * ids are also returned keyed by placeholder value so another select referencing the same
 * unsaved name (the payer, say) resolves to the very same user.
 */
export async function resolveUserIds(
  options: SelectOption[],
  userService: UserService,
): Promise<{ ids: number[]; placeholderIds: Map<string, number> }> {
  const placeholderIds = new Map<string, number>();
  const ids: number[] = [];
  await Promise.all(
    options.map(async (option) => {
      if (option.value.startsWith(PLACE_HOLDER_ID)) {
        const user = await userService.createUser({ name: option.label, email: '' });
        placeholderIds.set(option.value, user.id);
        ids.push(user.id);
      } else {
        ids.push(Number(option.value));
      }
    }),
  );
  return { ids, placeholderIds };
}

/**
 * Id of the user an option points to, reusing the map built by resolveUserIds.
 * Undefined when the placeholder was never resolved.
 */
export const toUserId = (option: SelectOption, placeholderIds: Map<string, number>): number | undefined =>
  option.value.startsWith(PLACE_HOLDER_ID) ? placeholderIds.get(option.value) : Number(option.value);
