import type { EmptySchema } from "./schema";

// Hovers and errors should show a merged schema as a plain object, not as a chain of
// aliases that grows with every `extends`. TypeScript prints an alias name for a type
// that comes straight out of an alias, so the mapped types below end in `& unknown`,
// and `MergedSchema` goes through `infer`.

/** Options of one variant: the child's are spread over the parent's, not merged deeper. */
type MergeBranches<A, B> = {
    [K in keyof A | keyof B]: K extends keyof B
        ? B[K]
        : K extends keyof A
          ? A[K]
          : never;
} & unknown;

/**
 * Type-level mirror of `tools/mergeVariants`: variant names are united, and a variant
 * declared on both sides gets the options of both (the child's win on a clash).
 */
export type MergeVariantSchemas<A, B> = {
    [K in keyof A | keyof B]: K extends keyof B
        ? K extends keyof A
            ? MergeBranches<A[K], B[K]>
            : B[K]
        : K extends keyof A
          ? A[K]
          : never;
} & unknown;

/** Merged schema of a vetka function, read from its resolved `config`. */
export type SchemaOf<F> = F extends { readonly config: { variants?: infer S } }
    ? S
    : EmptySchema;

type UnionToIntersection<U> = (
    U extends unknown ? (arg: U) => void : never
) extends (arg: infer I) => void
    ? I
    : never;

type MergeParents<
    TParents extends ReadonlyArray<unknown>,
    TAcc = EmptySchema,
> = TParents extends readonly [infer TFirst, ...infer TRest]
    ? MergeParents<TRest, MergeVariantSchemas<TAcc, SchemaOf<TFirst>>>
    : TParents extends readonly []
      ? TAcc
      : // Not a tuple, so the order is unknown: unite the options of every parent.
        MergeVariantSchemas<
            TAcc,
            UnionToIntersection<SchemaOf<TParents[number]>>
        >;

type ParentsSchema<TExtends> =
    TExtends extends ReadonlyArray<unknown>
        ? MergeParents<TExtends>
        : SchemaOf<TExtends>;

/** Schema of the `extends` chain with the config's own `variants` applied on top. */
export type MergedSchema<TExtends, TVariants> =
    ParentsSchema<TExtends> extends infer TParents
        ? MergeVariantSchemas<TParents, TVariants>
        : never;
