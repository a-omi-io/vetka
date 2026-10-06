import type { ICompoundVariantRuntime } from "../types";

const isConditionMet = (condition: any, selected: any): boolean => {
    if (
        typeof condition !== "object" ||
        condition === null ||
        selected === undefined
    ) {
        return false;
    }
    if (typeof selected !== "object" || selected === null) {
        return condition === selected;
    }

    return Object.entries(condition).every(([key, expected]) => {
        if (!Object.prototype.hasOwnProperty.call(selected, key)) {
            return false;
        }
        const actual = selected[key];

        if (Array.isArray(expected)) {
            return expected.includes(actual);
        }
        if (typeof expected === "object" && expected !== null) {
            return isConditionMet(expected, actual);
        }
        // Variant keys "true" / "false" arrive as strings, while the compound
        // is written with real booleans.
        if (typeof expected === "boolean" && typeof actual === "string") {
            return String(expected) === actual;
        }
        return expected === actual;
    });
};

export const matchCompoundVariants = (
    compoundVariants: Array<ICompoundVariantRuntime> = [],
    selected: Record<string, any>
): Array<string> => {
    const matched: Array<string> = [];

    for (const { class: className, ...conditions } of compoundVariants) {
        const isMatch = Object.entries(conditions).every(([key, value]) =>
            isConditionMet({ [key]: value }, selected)
        );

        if (isMatch) matched.push(className);
    }
    return matched;
};
