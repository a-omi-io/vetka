/** Object keys are always strings, so `true`/`false` options are declared as "true"/"false" but passed as booleans. */
export type StringToBoolean<T> = T extends "true" | "false" ? boolean : T;

export interface IClassProp {
    class?: string;
    className?: string;
}

/** A string is a class list; an object is the next level of options. */
export interface IVariantBranch {
    [key: string]: string | IVariantBranch;
}

export type VariantSchema = Record<string, IVariantBranch>;

/** An empty object, so `keyof` is `never`, not `string` (unlike `Record<string, never>`). */
export type EmptySchema = Record<never, never>;
