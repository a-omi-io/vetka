import clsx from "clsx";
import { getBaseClasses } from "./tools/getBaseClasses";
import { resolveConfig } from "./tools/resolveConfig";
import { selectedVariation } from "./tools/selectedVariation";
import { matchCompoundVariants } from "./tools/matchCompoundVariants";
import { mergeDefaultVariantsDeep } from "./tools/mergeDefaultVariantsDeep";

import type { IAnyVetkaConfig, IClassProp, Vetka } from "./types";

// Gives every function a stable identity, so a parent reached through
// several `extends` paths is only counted once.
let nextId = 0;

export const vetka: Vetka = ((config: IAnyVetkaConfig = {}) => {
    const resolved = resolveConfig(config);
    const {
        variants = {},
        defaultVariants = {},
        compoundVariants = [],
    } = resolved;

    const apply = (
        props?: (Record<string, unknown> & IClassProp) | null
    ): string => {
        const {
            class: classProp,
            className: classNameProp,
            ...variantProps
        }: Record<string, unknown> & IClassProp = props ?? {};

        const selected = mergeDefaultVariantsDeep(
            defaultVariants,
            variantProps
        );

        return clsx(
            getBaseClasses(apply, new Set()),
            selectedVariation(variants, selected),
            matchCompoundVariants(compoundVariants, selected),
            classProp,
            classNameProp
        );
    };

    apply._id = nextId++;
    apply.config = resolved;

    return apply;
}) as Vetka;
