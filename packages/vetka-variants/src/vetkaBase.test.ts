import { vetka } from "./vetka";

describe("vetka base behavior", () => {
    describe("variants", () => {
        const button = vetka({
            base: "font-semibold border rounded",
            variants: {
                intent: {
                    primary:
                        "bg-blue-500 text-white border-transparent hover:bg-blue-600",
                    secondary:
                        "bg-white text-gray-800 border-gray-400 hover:bg-gray-100",
                },
                size: {
                    small: "text-sm py-1 px-2",
                    medium: "text-base py-2 px-4",
                },
            },
        });

        it("returns only the base classes without props", () => {
            expect(button()).toBe("font-semibold border rounded");
        });

        it("appends the class of each selected variant", () => {
            expect(button({ intent: "primary", size: "medium" })).toBe(
                "font-semibold border rounded bg-blue-500 text-white border-transparent hover:bg-blue-600 text-base py-2 px-4"
            );
        });

        it("skips a variant passed as null", () => {
            expect(button({ intent: "primary", size: null })).toBe(
                "font-semibold border rounded bg-blue-500 text-white border-transparent hover:bg-blue-600"
            );
        });

        it("accepts extra classes through class and className", () => {
            expect(button({ intent: "primary", class: "custom-class" })).toBe(
                "font-semibold border rounded bg-blue-500 text-white border-transparent hover:bg-blue-600 custom-class"
            );
            expect(
                button({ intent: "secondary", className: "another-class" })
            ).toBe(
                "font-semibold border rounded bg-white text-gray-800 border-gray-400 hover:bg-gray-100 another-class"
            );
        });
    });

    describe("variant selection", () => {
        const button = vetka({
            base: "btn",
            variants: {
                type: { primary: "bg-blue", secondary: "bg-gray" },
                size: { sm: "text-sm", lg: "text-lg" },
            },
        });

        it("applies a single variant", () => {
            expect(button({ size: "lg" })).toBe("btn text-lg");
        });

        it("applies several variants together", () => {
            expect(button({ type: "primary", size: "lg" })).toBe(
                "btn bg-blue text-lg"
            );
        });

        it("ignores undefined and unknown values", () => {
            // @ts-expect-error "invalid" isn't a declared type, the runtime skips it
            expect(button({ type: "invalid", size: undefined })).toBe("btn");
        });

        it("doesn't resolve conflicts between the base and a variant", () => {
            const withConflict = vetka({
                base: "btn bg-default",
                variants: { type: { primary: "bg-blue" } },
            });

            // Both stay in the output. Merging is left to something like tailwind-merge.
            expect(withConflict({ type: "primary" })).toBe(
                "btn bg-default bg-blue"
            );
        });
    });

    describe("defaultVariants", () => {
        const card = vetka({
            base: "p-4 rounded-md shadow",
            variants: {
                theme: {
                    light: "bg-white text-black",
                    dark: "bg-gray-800 text-white",
                },
            },
            defaultVariants: { theme: "light" },
        });

        const button = vetka({
            base: "btn",
            variants: {
                type: { primary: "bg-blue", secondary: "bg-gray" },
            },
            defaultVariants: { type: "primary" },
        });

        it("applies the default when no props are given", () => {
            expect(card()).toBe("p-4 rounded-md shadow bg-white text-black");
        });

        it("lets an explicit prop replace the default", () => {
            expect(card({ theme: "dark" })).toBe(
                "p-4 rounded-md shadow bg-gray-800 text-white"
            );
            expect(button({ type: "secondary" })).toBe("btn bg-gray");
        });

        it("keeps the default when only unrelated props are passed", () => {
            expect(card({ class: "my-4" })).toBe(
                "p-4 rounded-md shadow bg-white text-black my-4"
            );
        });

        it("applies the default when the variant is left out", () => {
            expect(button()).toBe("btn bg-blue");
        });

        it("treats an explicit null as 'no variant', not as a request for the default", () => {
            expect(button({ type: null })).toBe("btn");
        });

        it("produces nothing for defaults that don't match any declared variant", () => {
            const config = vetka({
                variants: { size: { sm: "text-sm" } },
                defaultVariants: {
                    // @ts-expect-error "lg" isn't a size
                    size: "lg",
                    // `color` isn't a variant at all
                    color: "red",
                },
            });

            expect(config()).toBe("");
        });
    });

    describe("boolean and numeric variants", () => {
        const alert = vetka({
            base: "p-4 rounded",
            variants: {
                dismissible: { true: "pr-8", false: "" },
                level: { 0: "bg-gray-100", 1: "bg-yellow-100" },
            },
            defaultVariants: { dismissible: false },
        });

        it("maps true to its class", () => {
            expect(alert({ dismissible: true })).toBe("p-4 rounded pr-8");
        });

        it("falls back to the false default, which adds nothing", () => {
            expect(alert()).toBe("p-4 rounded");
        });

        it("handles numeric keys, including 0", () => {
            expect(alert({ level: 0 })).toBe("p-4 rounded bg-gray-100");
            expect(alert({ level: 1 })).toBe("p-4 rounded bg-yellow-100");
        });
    });

    describe("compoundVariants", () => {
        it("adds the compound class when every condition matches", () => {
            const button = vetka({
                base: "btn",
                variants: {
                    type: { primary: "bg-blue", secondary: "bg-gray" },
                    size: { sm: "text-sm", lg: "text-lg" },
                },
                compoundVariants: [
                    { type: "primary", size: "lg", class: "shadow-lg" },
                ],
            });

            expect(button({ type: "primary", size: "lg" })).toBe(
                "btn bg-blue text-lg shadow-lg"
            );
        });

        it("supports more than two conditions", () => {
            const button = vetka({
                base: "btn",
                variants: {
                    type: { primary: "bg-blue", secondary: "bg-gray" },
                    size: { sm: "text-sm", lg: "text-lg" },
                    disabled: { true: "opacity-50", false: "" },
                },
                compoundVariants: [
                    {
                        type: "primary",
                        size: "lg",
                        disabled: true,
                        class: "cursor-not-allowed",
                    },
                ],
            });

            expect(
                button({ type: "primary", size: "lg", disabled: true })
            ).toBe("btn bg-blue text-lg opacity-50 cursor-not-allowed");
        });

        it("adds every matching compound in the order it was declared", () => {
            const button = vetka({
                base: "btn",
                variants: {
                    type: { primary: "bg-blue", secondary: "bg-gray" },
                    size: { sm: "text-sm", lg: "text-lg" },
                },
                compoundVariants: [
                    { type: "primary", size: "lg", class: "shadow-md" },
                    { type: "primary", class: "border" },
                ],
            });

            expect(button({ type: "primary", size: "lg" })).toBe(
                "btn bg-blue text-lg shadow-md border"
            );
        });
    });

    describe("compoundVariants combined with defaults", () => {
        const button = vetka({
            base: "font-semibold",
            variants: {
                intent: { primary: "text-white", secondary: "text-gray-800" },
                size: { small: "text-sm", medium: "text-base" },
                disabled: { true: "opacity-50 cursor-not-allowed" },
            },
            compoundVariants: [
                { intent: "primary", disabled: true, class: "bg-blue-300" },
                { intent: "primary", size: "medium", class: "bg-blue-500" },
                { intent: "secondary", size: "medium", class: "bg-gray-200" },
            ],
            defaultVariants: { intent: "primary", size: "medium" },
        });

        it("matches compounds against the defaults", () => {
            expect(button()).toBe(
                "font-semibold text-white text-base bg-blue-500"
            );
        });

        it("matches compounds against a mix of input and defaults", () => {
            expect(button({ intent: "secondary" })).toBe(
                "font-semibold text-gray-800 text-base bg-gray-200"
            );
        });

        it("applies every compound that matches, here two for a disabled primary", () => {
            expect(button({ disabled: true })).toBe(
                "font-semibold text-white text-base opacity-50 cursor-not-allowed bg-blue-300 bg-blue-500"
            );
        });

        it("skips a compound when one of its conditions fails", () => {
            expect(button({ intent: "secondary", size: "small" })).toBe(
                "font-semibold text-gray-800 text-sm"
            );
        });
    });

    describe("compoundVariants with an array of values", () => {
        const item = vetka({
            base: "item",
            variants: {
                state: { active: "state-active", inactive: "state-inactive" },
                type: { A: "type-a", B: "type-b", C: "type-c" },
            },
            compoundVariants: [
                {
                    state: "active",
                    type: ["A", "B"],
                    class: "special-active-style",
                },
            ],
        });

        it("matches when the prop equals any value in the array", () => {
            expect(item({ state: "active", type: "A" })).toBe(
                "item state-active type-a special-active-style"
            );
            expect(item({ state: "active", type: "B" })).toBe(
                "item state-active type-b special-active-style"
            );
        });

        it("doesn't match a value outside the array", () => {
            expect(item({ state: "active", type: "C" })).toBe(
                "item state-active type-c"
            );
        });

        it("doesn't match when another condition fails", () => {
            expect(item({ state: "inactive", type: "A" })).toBe(
                "item state-inactive type-a"
            );
        });
    });

    describe("without variants", () => {
        const simple = vetka({ base: "a b c" });

        it("returns the base plus any extra classes", () => {
            expect(simple()).toBe("a b c");
            expect(simple({ class: "d e" })).toBe("a b c d e");
            expect(simple({ className: "f g" })).toBe("a b c f g");
        });
    });

    describe("undefined props", () => {
        const button = vetka({
            base: "base",
            variants: {
                intent: {
                    primary: "intent-primary",
                    secondary: "intent-secondary",
                },
                size: { small: "size-small", medium: "size-medium" },
            },
            compoundVariants: [
                { intent: "primary", class: "compound-primary" },
            ],
            defaultVariants: { intent: "primary", size: "medium" },
        });

        it("doesn't stop a compound from matching", () => {
            // The compound only looks at `intent`, so `size: undefined`
            // (which falls back to its default) must not affect it.
            expect(button({ intent: "primary", size: undefined })).toBe(
                "base intent-primary size-medium compound-primary"
            );
        });
    });
});
