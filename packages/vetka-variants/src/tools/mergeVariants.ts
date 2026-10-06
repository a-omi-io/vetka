import type { VariantSchema } from "../types";

export const mergeVariants = (
    parent: VariantSchema = {},
    child: VariantSchema = {}
): VariantSchema => {
    const merged = { ...parent };
    for (const key in child) {
        merged[key] = {
            ...(parent[key] || {}),
            ...child[key],
        };
    }
    return merged;
};
