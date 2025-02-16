export type WithId<T> = T & { id: number };

export type MaybeWithId<T> = T & { id?: number };
