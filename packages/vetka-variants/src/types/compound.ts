import type { LeafValue, NonEmpty } from "./selection";

/** A value, or a list of values matched as "any of". */
type OneOrMany<T> = [T] extends [never] ? never : T | ReadonlyArray<T>;

type CompoundCondition<N> = N extends string
    ? never
    : OneOrMany<LeafValue<N>> | NonEmpty<CompoundConditions<N>>;

/** Mirrors `tools/matchCompoundVariants`: conditions have the shape of a selection. */
type CompoundConditions<B> = {
    [K in keyof B as B[K] extends string ? never : K]?: CompoundCondition<B[K]>;
};

export type CompoundVariant<TSchema> = CompoundConditions<TSchema> & {
    class: string;
};
