import { mergeDefaultVariantsDeep } from "./mergeDefaultVariantsDeep";

describe("mergeDefaultVariantsDeep", () => {
    it("should skip the same level entities (default-variant tree merge)", () => {
        const target = { size: { sm: { rounded: "full", p: "badge" } } };
        const source = { size: { lg: { rounded: "full", p: "box" } } };

        const result = mergeDefaultVariantsDeep(target, source);
        expect(result).toEqual({ size: { lg: { rounded: "full", p: "box" } } });
    });

    it("should replace a nested object if the source introduces disjoint keys (default-variant tree)", () => {
        const target = { size: { sm: { p: "2" } } };
        const source = { size: { lg: { p: "4" } } }; // `lg` is disjoint from `sm`
        const expected = { size: { lg: { p: "4" } } };
        expect(mergeDefaultVariantsDeep(target, source)).toEqual(expected);
    });

    it("should merge nested objects if the keys are compatible (subsets or same)", () => {
        const target = { size: { sm: { p: "2", rounded: "md" } } };
        const source = { size: { sm: { p: "4" } } }; // `p` exists in target, so merge
        const expected = { size: { sm: { p: "4", rounded: "md" } } };
        expect(mergeDefaultVariantsDeep(target, source)).toEqual(expected);
    });
});
