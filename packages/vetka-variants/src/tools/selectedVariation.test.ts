import { selectedVariation } from "./selectedVariation";

import type { VariantSchema } from "../types";

describe("selectedVariation", () => {
    const variants: VariantSchema = {
        type: {
            primary: "bg-primary",
            secondary: "bg-secondary",
        },
        size: {
            sm: "text-sm",
            lg: "text-lg",
        },
    };

    it("returns the correct class for a single selected variant", () => {
        const selected = { type: "primary" };
        const result = selectedVariation(variants, selected);

        expect(result).toEqual(["bg-primary"]);
    });

    it("returns multiple classes for multiple selected variants", () => {
        const selected = { type: "secondary", size: "lg" };
        const result = selectedVariation(variants, selected);

        expect(result).toEqual(["bg-secondary", "text-lg"]);
    });

    it("skips falsy selected values (null, undefined, empty string)", () => {
        const selected = { type: null, size: "", color: undefined };
        const result = selectedVariation(variants, selected);

        expect(result).toEqual([]);
    });

    it("skips variants/options not found in the variant definitions", () => {
        const selected = { type: "unknown", size: "lg", color: "red" };
        const result = selectedVariation(variants, selected);

        expect(result).toEqual(["text-lg"]);
    });

    it("returns an empty array if no selected options are passed", () => {
        const selected = {};
        const result = selectedVariation(variants, selected);

        expect(result).toEqual([]);
    });

    it("handles completely empty variants and selected objects", () => {
        const result = selectedVariation({}, {});
        expect(result).toEqual([]);
    });

    it("ignores non-string selected values that are truthy", () => {
        const selected = { type: 1, size: true };
        const result = selectedVariation(variants, selected);

        expect(result).toEqual([]); // "type:1" and "size:true" not found
    });
});
