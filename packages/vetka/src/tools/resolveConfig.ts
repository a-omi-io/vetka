import { getUniqueParents } from "./getUniqueParents";
import { mergeDefaultVariantsDeep } from "./mergeDefaultVariantsDeep";
import { mergeVariants } from "./mergeVariants";
import { toParentList } from "./toParentList";

import type { IAnyVetkaConfig } from "../types";

type ParentsMerged = Omit<IAnyVetkaConfig, "base" | "extends">;

/** Merges the `extends` chain into one config; the config's own values are applied last. */
export const resolveConfig = (config: IAnyVetkaConfig): IAnyVetkaConfig => {
    const { extends: parents, ...own } = config;

    const uniqueParents = getUniqueParents(
        toParentList(parents),
        new Set(),
        []
    );

    const fromParents = uniqueParents.reduce<ParentsMerged>(
        (acc, parent) => ({
            variants: mergeVariants(acc.variants, parent.config.variants),
            defaultVariants: mergeDefaultVariantsDeep(
                acc.defaultVariants,
                parent.config.defaultVariants
            ),
            compoundVariants: [
                ...(acc.compoundVariants ?? []),
                ...(parent.config.compoundVariants ?? []),
            ],
        }),
        { variants: {}, defaultVariants: {}, compoundVariants: [] }
    );

    return {
        extends: parents,
        base: own.base,
        variants: mergeVariants(fromParents.variants, own.variants),
        defaultVariants: mergeDefaultVariantsDeep(
            fromParents.defaultVariants,
            own.defaultVariants
        ),
        compoundVariants: [
            ...(fromParents.compoundVariants ?? []),
            ...(own.compoundVariants ?? []),
        ],
    };
};
