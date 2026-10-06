import type { VariantSchema } from "./schema";

/** A compound entry as the tools read it, with conditions not tied to a schema. */
export interface ICompoundVariantRuntime {
    class: string;
    [variantKey: string]: unknown;
}

/** What the tools read from any vetka function, whatever its schema. */
export interface IAnyVetkaConfig {
    extends?: IAnyVetkaFn | Array<IAnyVetkaFn>;
    base?: string;
    variants?: VariantSchema;
    defaultVariants?: Record<string, unknown>;
    compoundVariants?: Array<ICompoundVariantRuntime>;
}

/**
 * Supertype of every `IVetkaFn<…>`, and what `extends` accepts.
 * `IVetkaFn` is invariant in its schema, so no instantiation of it can play this role.
 */
export interface IAnyVetkaFn {
    (props?: never): string;
    readonly _id: number;
    readonly config: IAnyVetkaConfig;
}

/** One parent or a list of them; later parents override earlier ones. */
export type VetkaExtends = IAnyVetkaFn | ReadonlyArray<IAnyVetkaFn>;
