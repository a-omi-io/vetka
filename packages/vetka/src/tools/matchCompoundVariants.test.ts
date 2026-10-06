import { matchCompoundVariants } from "./matchCompoundVariants";

describe("matchCompoundVariants", () => {
    it("returns class when selected matches a single compound variant", () => {
        const compoundVariants = [
            { class: "bg-primary-sm", type: "primary", size: "sm" },
        ];

        const selected = { type: "primary", size: "sm" };

        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual(["bg-primary-sm"]);
    });

    it("returns multiple classes when multiple compound variants match", () => {
        const compoundVariants = [
            { class: "bg-primary-sm", type: "primary", size: "sm" },
            { class: "text-bold", weight: "bold" },
        ];

        const selected = { type: "primary", size: "sm", weight: "bold" };

        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual(["bg-primary-sm", "text-bold"]);
    });

    it("returns empty array when no compound variant matches", () => {
        const compoundVariants = [
            { class: "bg-secondary", type: "secondary", size: "lg" },
        ];

        const selected = { type: "primary", size: "sm" };

        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual([]);
    });

    it("does not match on partial matches (requires full condition match)", () => {
        const compoundVariants = [
            { class: "bg-primary-sm", type: "primary", size: "sm" },
        ];

        const selected = { type: "primary", size: "lg" };

        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual([]);
    });

    it("returns empty array when compoundVariants is empty", () => {
        const result = matchCompoundVariants([], { type: "primary" });
        expect(result).toEqual([]);
    });

    it("returns empty array when selected is empty", () => {
        const compoundVariants = [
            { class: "bg-primary-sm", type: "primary", size: "sm" },
        ];

        const result = matchCompoundVariants(compoundVariants, {});
        expect(result).toEqual([]);
    });

    it("handles non-string values in selected and compoundVariants", () => {
        const compoundVariants = [{ class: "rounded", active: true, level: 2 }];

        const selected = { active: true, level: 2 };

        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual(["rounded"]);
    });

    it("handles overlapping compound conditions correctly", () => {
        const compoundVariants = [
            { class: "bg-primary", type: "primary" },
            { class: "bg-primary-sm", type: "primary", size: "sm" },
        ];

        const selected = { type: "primary", size: "sm" };

        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual(["bg-primary", "bg-primary-sm"]);
    });

    it("handles undefined or null values in selected gracefully", () => {
        const compoundVariants = [
            { class: "hidden", disabled: true },
            { class: "bg-disabled", status: null },
        ];

        const selected = { disabled: true, status: null };

        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual(["hidden", "bg-disabled"]);
    });

    it("handles boolean values with", () => {
        const compoundVariants = [
            {
                type: "primary",
                size: "lg",
                disabled: true,
                class: "cursor-not-allowed",
            },
        ];
        const selected = { type: "primary", size: "lg", disabled: "true" };
        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual(["cursor-not-allowed"]);
    });

    it("sevaral", () => {
        const compoundVariants = [
            {
                state: "active",
                type: ["A", "B"],
                class: "special-active-style",
            },
        ];
        const selected = { state: "active", type: "A" };
        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual(["special-active-style"]);
    });

    it("sevaral 2", () => {
        const compoundVariants = [
            {
                state: ["active", "pending"],
                type: ["A", "B"],
                class: "special-active-style",
            },
        ];
        const selected = { state: "pending", type: "A" };
        const result = matchCompoundVariants(compoundVariants, selected);
        expect(result).toEqual(["special-active-style"]);
    });
});
