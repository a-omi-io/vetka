import { vetka } from "./vetka";

describe("vetka", () => {
    describe("extends: single parent", () => {
        const base = vetka({
            base: "btn",
            variants: {
                size: { sm: "text-sm", md: "text-md" },
            },
            defaultVariants: { size: "md" },
            compoundVariants: [{ size: "sm", class: "p-1" }],
        });

        const extended = vetka({
            extends: base,
            variants: {
                color: { primary: "text-blue-500" },
                size: { lg: "text-lg" },
            },
            defaultVariants: { color: "primary" },
            compoundVariants: [
                { size: "lg", color: "primary", class: "font-bold" },
            ],
        });

        it("inherits variants from the parent", () => {
            expect(extended({ size: "sm" })).toContain("text-sm");
        });

        it("lets the child add values to a variant the parent already defines", () => {
            expect(extended({ size: "lg" })).toContain("text-lg");
        });

        it("runs compound variants from both parent and child", () => {
            expect(extended({ size: "sm" })).toContain("p-1");
            expect(extended({ size: "lg", color: "primary" })).toContain(
                "font-bold"
            );
        });

        it("combines parent and child defaults", () => {
            const result = extended();
            expect(result).toContain("text-md");
            expect(result).toContain("text-blue-500");
        });

        it("ignores values the variant doesn't define", () => {
            const result = extended({ size: "xxl" as any });
            expect(result).not.toContain("text-lg");
            expect(result).not.toContain("text-sm");
        });

        it("always includes the parent's base class", () => {
            expect(extended()).toContain("btn");
        });

        it("doesn't repeat a class contributed by more than one source", () => {
            const classNames = extended({ size: "md" }).split(" ");
            expect(new Set(classNames).size).toBe(classNames.length);
        });
    });

    describe("extends: several parents", () => {
        const buttonBase = vetka({
            base: "font-sans",
            variants: {
                size: { sm: "text-sm", md: "text-md" },
            },
            defaultVariants: { size: "md" },
            compoundVariants: [{ size: "sm", class: "px-2 py-1" }],
        });

        const colorStyles = vetka({
            base: "theme-light",
            variants: {
                color: {
                    primary: "bg-blue-500 text-white",
                    secondary: "bg-gray-500 text-white",
                },
            },
            defaultVariants: { color: "primary" },
            compoundVariants: [
                { color: "primary", class: "hover:bg-blue-600" },
            ],
        });

        const extended = vetka({
            extends: [buttonBase, colorStyles],
            base: "btn",
            variants: {
                size: { lg: "text-lg" },
                rounded: { true: "rounded-full" },
            },
            defaultVariants: { size: "lg" },
            compoundVariants: [
                { size: "lg", color: "primary", class: "shadow-lg" },
            ],
        });

        it("inherits variants from every parent", () => {
            expect(extended({ size: "sm" })).toContain("text-sm");
            expect(extended({ color: "secondary" })).toContain("bg-gray-500");
        });

        it("keeps every parent's base class next to the child's", () => {
            const result = extended();
            expect(result).toContain("btn");
            expect(result).toContain("font-sans");
            expect(result).toContain("theme-light");
        });

        it("replaces a parent's default with the child's own variant", () => {
            const result = extended({ size: "lg" });
            expect(result).toContain("text-lg");
            expect(result).not.toContain("text-md");
            expect(result).not.toContain("text-sm");
        });

        it("prefers the child's defaults over the parents'", () => {
            const result = extended();
            expect(result).toContain("text-lg");
            expect(result).toContain("bg-blue-500");
        });

        it("runs compound variants from every parent and the child", () => {
            expect(extended({ size: "sm" })).toContain("px-2 py-1");
            expect(extended({ color: "primary" })).toContain(
                "hover:bg-blue-600"
            );
            expect(extended({ size: "lg", color: "primary" })).toContain(
                "shadow-lg"
            );
        });

        it("combines variants coming from different parents and the child", () => {
            const result = extended({
                size: "sm",
                color: "secondary",
                rounded: true,
            });

            expect(result).toContain("btn");
            expect(result).toContain("text-sm");
            expect(result).toContain("bg-gray-500");
            expect(result).toContain("rounded-full");
            expect(result).toContain("px-2 py-1");
        });

        it("applies a parent that is listed twice only once", () => {
            const doubled = vetka({
                extends: [buttonBase, buttonBase],
                base: "unique-base",
            });

            expect(doubled({ size: "sm" })).toBe(
                "unique-base font-sans text-sm px-2 py-1"
            );
        });

        it("orders classes across a diamond-shaped hierarchy", () => {
            const color = vetka({ base: "color" });
            const text = vetka({ extends: color, base: "text" });
            const btn = vetka({ extends: text, base: "btn" });
            const anchor = vetka({ extends: text, base: "anchor" });
            const multi = vetka({ extends: [btn, anchor], base: "multi" });

            expect(multi()).toBe("multi anchor text color btn");
        });

        it("keeps both compound classes when two parents target the same state", () => {
            const parentA = vetka({
                variants: { state: { active: "state-active1" } },
                compoundVariants: [{ state: "active", class: "font-bold" }],
            });
            const parentB = vetka({
                variants: { state: { active: "state-active2" } },
                compoundVariants: [{ state: "active", class: "text-red-500" }],
            });
            const child = vetka({ extends: [parentA, parentB] });

            // Compounds are additive, so neither parent wins.
            const result = child({ state: "active" });
            expect(result).toContain("font-bold");
            expect(result).toContain("text-red-500");
        });
    });

    describe("nested variants", () => {
        const deepNested = vetka({
            variants: {
                size: {
                    sm: {
                        rounded: { full: "rounded-full", none: "rounded-none" },
                        p: { box: "p-1", badge: "p-0.5" },
                    },
                    lg: {
                        rounded: { full: "rounded-lg-full" },
                        p: { box: "p-4" },
                    },
                },
            },
            defaultVariants: {
                size: { sm: { rounded: "full", p: "badge" } },
            },
            compoundVariants: [
                {
                    size: { sm: { rounded: "full" } },
                    class: "text-xs",
                },
                {
                    size: { sm: { p: "box", rounded: "full" } },
                    class: "compound-badge-box",
                },
            ],
        });

        describe("resolution", () => {
            it("follows a fully specified path", () => {
                const result = deepNested({
                    size: { sm: { rounded: "full", p: "box" } },
                });
                expect(result).toContain("rounded-full");
                expect(result).toContain("p-1");
            });

            it("skips branches the input leaves out", () => {
                const result = deepNested({
                    size: { sm: { rounded: "none" } },
                });
                expect(result).toContain("rounded-none");
                expect(result).toContain("p-0.5");
                expect(result).not.toContain("p-1");
            });

            it("resolves a path under a different top-level value", () => {
                const result = deepNested({
                    size: { lg: { rounded: "full" } },
                });
                expect(result).toContain("rounded-lg-full");
            });

            it("resolves boolean values at a nested level", () => {
                const card = vetka({
                    variants: {
                        card: {
                            shadow: { true: "shadow-lg", false: "shadow-none" },
                        },
                    },
                });

                expect(card({ card: { shadow: true } })).toBe("shadow-lg");
                expect(card({ card: { shadow: false } })).toBe("shadow-none");
            });
        });

        describe("defaults", () => {
            it("applies every nested default for empty input", () => {
                const result = deepNested({});
                expect(result).toContain("rounded-full");
                expect(result).toContain("p-0.5");
            });

            it("applies defaults when the top-level key is undefined", () => {
                const result = deepNested({ size: undefined });
                expect(result).toContain("rounded-full");
                expect(result).toContain("p-0.5");
            });

            it("fills in only the properties the input left out", () => {
                const result = deepNested({ size: { sm: { p: "box" } } });
                expect(result).toContain("p-1");
                expect(result).toContain("rounded-full");
            });

            it("lets input override one nested default and keeps the others", () => {
                const result = deepNested({
                    size: { sm: { rounded: "none" } },
                });
                expect(result).toContain("rounded-none");
                expect(result).not.toContain("rounded-full");
                expect(result).toContain("p-0.5");
            });

            it("drops the sm defaults once the input switches to lg", () => {
                const result = deepNested({
                    size: { lg: { rounded: "full", p: "box" } },
                });
                expect(result).toContain("rounded-lg-full");
                expect(result).toContain("p-4");
                expect(result).not.toContain("rounded-full");
                expect(result).not.toContain("p-0.5");
            });
        });

        describe("compound variants", () => {
            it("matches on default values", () => {
                expect(deepNested({})).toContain("text-xs");
            });

            it("matches on a mix of input and defaults", () => {
                // p comes from the input, rounded from the defaults.
                const result = deepNested({ size: { sm: { p: "box" } } });
                expect(result).toContain("compound-badge-box");
            });

            it("stops matching when the input changes a value it depends on", () => {
                const result = deepNested({
                    size: { sm: { rounded: "none" } },
                });
                expect(result).not.toContain("text-xs");
            });
        });

        describe("unexpected input", () => {
            it("returns the defaults for null and undefined", () => {
                expect(deepNested(null)).toContain(
                    "rounded-full p-0.5 text-xs"
                );
                expect(deepNested(undefined)).toContain(
                    "rounded-full p-0.5 text-xs"
                );
            });

            it("produces no classes when a nested level isn't an object", () => {
                // Passing `size` at all turns the defaults off, and the string
                // gives nothing to resolve, so the result is empty.
                // @ts-expect-error not allowed by the types, the runtime ignores it
                const result = deepNested({ size: { sm: "invalid-string" } });
                expect(result.trim()).toBe("");
            });

            it("ignores paths and keys that aren't declared", () => {
                const result = deepNested({
                    size: {
                        sm: {
                            rounded: "full",
                            // @ts-expect-error not a declared nested variant
                            border: "red",
                        },
                        xl: { p: "xl-padding" },
                    },
                    color: "red",
                });
                expect(result).toContain("rounded-full");
                expect(result).not.toContain("red");
                expect(result).not.toContain("xl-padding");
            });

            it("falls back to the defaults for an empty nested object", () => {
                const result = deepNested({ size: { sm: {} } });
                expect(result).toContain("rounded-full");
                expect(result).toContain("p-0.5");
                expect(result).toContain("text-xs");
            });
        });
    });
});
