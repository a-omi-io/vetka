import type { VariantSchema } from "../types";

const hasOwn = (obj: object, key: PropertyKey): boolean =>
    Object.prototype.hasOwnProperty.call(obj, key);

/** Collects the class of every variant value in `selected`, walking nested branches. */
export const selectedVariation = (
    variants: VariantSchema,
    selected: Record<string, any>
): Array<string> => {
    const classes: Array<string> = [];

    const collect = (variantLevel: any, selectedLevel: any) => {
        if (typeof variantLevel !== "object" || variantLevel === null) {
            return;
        }

        for (const key in selectedLevel) {
            if (!hasOwn(variantLevel, key)) continue;

            const choice = selectedLevel[key];
            const options = variantLevel[key];

            if (typeof choice === "object" && choice !== null) {
                collect(options, choice);
            } else if (
                options &&
                typeof options === "object" &&
                hasOwn(options, choice)
            ) {
                // A default can name a branch whose next level the user never
                // picked. That is an object, not a class, and adds nothing.
                if (typeof options[choice] === "string") {
                    classes.push(options[choice]);
                }
            }
        }
    };

    collect(variants, selected);
    return classes;
};
