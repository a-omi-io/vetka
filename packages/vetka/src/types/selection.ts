import type { IClassProp, StringToBoolean } from "./schema";

/** Keys of a branch that hold a class string: chosen by value (`size: "sm"`). */
type LeafKeys<B> = keyof {
    [K in keyof B as [Extract<B[K], string>] extends [never]
        ? never
        : K]: unknown;
};

export type LeafValue<B> = StringToBoolean<LeafKeys<B>>;

/** Drops `{}` from a union, where it would accept any non-null value. */
export type NonEmpty<T> = keyof T extends never ? never : T;

/**
 * What a node offers: nothing in a leaf; in a branch, its leaves by key
 * or its nested branches by object.
 */
type VariantChoice<N> = N extends string
    ? never
    : LeafValue<N> | NonEmpty<VariantSelection<N>>;

/**
 * Deeply partial choice of variant values, mirroring `tools/selectedVariation`.
 * `null` picks nothing (dropping a default); `undefined` leaves the default in place.
 */
export type VariantSelection<B> = {
    [K in keyof B as B[K] extends string ? never : K]?:
        | VariantChoice<B[K]>
        | null
        | undefined;
};

/** Without variants there is nothing to default, and a bare `{}` would let any key through. */
export type DefaultVariants<TSchema> = keyof TSchema extends never
    ? Record<string, never>
    : VariantSelection<TSchema>;

/** Every variant is optional: a missing key falls back to its default, or to no class. */
export type VariantProps<TSchema> = IClassProp & VariantSelection<TSchema>;
