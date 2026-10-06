const isPlainObject = (item: unknown): boolean =>
    item !== null && typeof item === "object" && !Array.isArray(item);

/**
 * Merges default variant trees when extending configs: sibling keys at the same level
 * (e.g. `sm` vs `lg`) replace the branch instead of merging incompatible choices.
 */
export const mergeDefaultVariantsDeep = (target: any, source: any): any => {
    if (source === undefined || source === null) {
        return target;
    }

    if (!isPlainObject(target)) {
        return isPlainObject(source)
            ? mergeDefaultVariantsDeep({}, source)
            : source;
    }

    if (!isPlainObject(source)) {
        return source;
    }

    const output: Record<string, any> = { ...target };

    for (const key of Object.keys(source)) {
        const sourceValue = source[key];
        if (sourceValue === undefined) {
            continue;
        }

        const targetValue = target[key];

        if (sourceValue === null) {
            output[key] = null;
            continue;
        }

        if (isPlainObject(sourceValue) && isPlainObject(targetValue)) {
            const sourceKeys = Object.keys(sourceValue);
            const targetKeys = Object.keys(targetValue);
            const hasDisjointChoices =
                sourceKeys.length > 0 &&
                !sourceKeys.every(k => targetKeys.includes(k));

            if (hasDisjointChoices) {
                output[key] = sourceValue;
            } else {
                output[key] = mergeDefaultVariantsDeep(
                    targetValue,
                    sourceValue
                );
            }
        } else {
            output[key] = sourceValue;
        }
    }

    return output;
};
