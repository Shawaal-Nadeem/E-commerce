export type Nil = null | undefined;

export type Maybe<T> = T | Nil;

export type stringDatatype = string;

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
