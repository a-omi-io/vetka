import type { CompoundVariant } from "./compound";
import type { MergedSchema, SchemaOf } from "./merge";
import type { IAnyVetkaFn, VetkaExtends } from "./runtime";
import type { EmptySchema, VariantSchema } from "./schema";
import type { DefaultVariants, VariantProps } from "./selection";

/**
 * `variants` and `extends` are inferred from the argument; `defaultVariants` and
 * `compoundVariants` are then checked against the merged schema, so they may
 * reference variants that only a parent declares.
 */
export interface IVetkaConfig<
    TVariants extends VariantSchema = EmptySchema,
    TExtends extends VetkaExtends = readonly [],
> {
    extends?: TExtends;
    base?: string;
    variants?: TVariants;
    defaultVariants?: NoInfer<
        DefaultVariants<MergedSchema<TExtends, TVariants>>
    >;
    compoundVariants?: ReadonlyArray<
        NoInfer<CompoundVariant<MergedSchema<TExtends, TVariants>>>
    >;
}

/** Config after merging the `extends` chain: what `fn.config` holds. */
export interface IResolvedConfig<TSchema> {
    extends?: IAnyVetkaFn | Array<IAnyVetkaFn>;
    base?: string;
    variants?: TSchema;
    defaultVariants?: DefaultVariants<TSchema>;
    compoundVariants?: Array<CompoundVariant<TSchema>>;
}

export interface IVetkaFn<TSchema> {
    (props?: VariantProps<TSchema> | null): string;
    readonly _id: number;
    readonly config: IResolvedConfig<TSchema>;
}

export type Vetka = <
    TVariants extends VariantSchema = EmptySchema,
    const TExtends extends VetkaExtends = readonly [],
>(
    config?: IVetkaConfig<TVariants, TExtends>
) => IVetkaFn<MergedSchema<TExtends, TVariants>>;

export type VariantPropsOf<F> = F extends IAnyVetkaFn
    ? VariantProps<SchemaOf<F>>
    : never;
