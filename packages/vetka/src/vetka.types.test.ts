/**
 * Compile-time checks for vetka types.
 * Run: yarn tsc-check
 */
import { vetka } from "./vetka";
import type { IAnyVetkaFn, VariantPropsOf } from "./types";

// --- flat + defaultVariants ---

const sized = vetka({
    variants: { size: { sm: "text-sm", md: "text-md" } },
    defaultVariants: { size: "md" },
});

sized({ size: "sm" });
sized({});
// @ts-expect-error invalid size value
sized({ size: "invalid" });
// @ts-expect-error unknown prop
sized({ foo: 123 });

vetka({
    variants: { size: { sm: "a", md: "b" } },
    // @ts-expect-error invalid compound value
    compoundVariants: [{ size: "xl", class: "oops" }],
});

// --- variant props are optional, with or without a default ---

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
    defaultVariants: {
        intent: "primary",
    },
});

button();
button({});
// `size` has no default: it is simply not applied
button({ intent: "primary" });
button({ size: "small" });
button({ intent: null, size: undefined });

// --- defaultVariants are checked against the schema ---

vetka({
    variants: {
        size: {
            sm: "text-sm",
            md: "text-md",
        },
    },
    // @ts-expect-error invalid default value
    defaultVariants: { size: "dm" },
    compoundVariants: [{ class: "p-1", size: "md" }],
});

vetka({
    variants: { size: { sm: "a" } },
    // @ts-expect-error unknown variant key
    defaultVariants: { unknown: "sm" },
});

vetka({
    base: "no-variants",
    // @ts-expect-error nothing to default without variants
    defaultVariants: { size: "sm" },
});

// --- extends + merged compound ---

const base = vetka({
    variants: { size: { sm: "text-sm", md: "text-md" } },
    defaultVariants: { size: "md" },
});

const ext = vetka({
    extends: base,
    variants: { color: { primary: "text-blue", secondary: "text-gray" } },
    defaultVariants: { color: "primary" },
    compoundVariants: [{ size: "sm", color: "primary", class: "x" }],
});

ext({ size: "sm", color: "primary" });
ext({ size: "sm" });
// compound may reference parent-only keys
vetka({
    extends: base,
    compoundVariants: [{ size: "sm", class: "p-1" }],
});

vetka({
    variants: { size: { sm: "a" } },
    // @ts-expect-error unknown compound field
    compoundVariants: [{ size: "sm", typo: "x", class: "c" }],
});

// defaults may reference parent-only keys, and override the parent's default
vetka({
    extends: base,
    defaultVariants: { size: "sm" },
});

vetka({
    extends: base,
    // @ts-expect-error not an option of the parent's `size`
    defaultVariants: { size: "lg" },
});

// --- nested ---

const nested = vetka({
    variants: {
        size: {
            sm: {
                rounded: { full: "rounded-full", none: "rounded-none" },
                p: { box: "p-1", badge: "p-0.5" },
            },
        },
    },
    defaultVariants: { size: { sm: { rounded: "full" } } },
    compoundVariants: [
        { size: { sm: { rounded: "full" } }, class: "text-xs" },
        {
            size: { sm: { rounded: "full", p: ["box", "badge"] } },
            class: "text-sm",
        },
    ],
});

nested({ size: { sm: { rounded: "none" } } });
nested({});
// @ts-expect-error invalid nested leaf
nested({ size: { sm: { rounded: "invalid" } } });
// @ts-expect-error unknown nested key
nested({ size: { sm: { border: "red" } } });
// @ts-expect-error `sm` is a branch, not a value of `size`
nested({ size: "sm" });

vetka({
    variants: { size: { sm: { p: { box: "p-1" } } } },
    // @ts-expect-error invalid nested default
    defaultVariants: { size: { sm: { p: 999 } } },
});

vetka({
    variants: { size: { sm: { p: { box: "p-1" } } } },
    // @ts-expect-error invalid nested condition
    compoundVariants: [{ size: { sm: { p: "invalid" } }, class: "oops" }],
});

// nested variants are inherited: the child adds `lg` next to the parent's `sm`
const nestedExt = vetka({
    extends: nested,
    variants: { size: { lg: { rounded: { full: "rounded-lg-full" } } } },
    defaultVariants: { size: { lg: { rounded: "full" } } },
});

nestedExt({ size: { sm: { p: "box" } } });
nestedExt({ size: { lg: { rounded: "full" } } });
// @ts-expect-error `none` exists under `sm` only
nestedExt({ size: { lg: { rounded: "none" } } });

// --- boolean + number ---

const alert = vetka({
    variants: {
        dismissible: { true: "pr-8", false: "" },
        level: { 0: "bg-gray-100", 1: "bg-yellow-100" },
    },
    defaultVariants: { dismissible: false },
    compoundVariants: [{ dismissible: true, level: [0, 1], class: "shadow" }],
});

alert({ dismissible: true, level: 0 });
alert({ level: 1 });
// @ts-expect-error string where boolean expected
alert({ dismissible: "true", level: 0 });
// @ts-expect-error not a declared level
alert({ level: 2 });

// --- multi-extends ---

const p1 = vetka({
    variants: { size: { sm: "text-sm", md: "text-md" } },
});
const p2 = vetka({
    variants: { color: { primary: "bg-blue" } },
});
const multi = vetka({
    extends: [p1, p2],
    variants: { size: { lg: "text-lg" } },
});

multi({ size: "lg" });
// the parents' options and variants stay next to the child's own
multi({ size: "sm", color: "primary" });
// @ts-expect-error not an option of the parents or of the child
multi({ size: "xl" });

// defaults and compounds of the child see the variants of every parent
vetka({
    extends: [p1, p2],
    variants: { rounded: { true: "rounded-full" } },
    defaultVariants: { size: "md", color: "primary" },
    compoundVariants: [
        { size: ["sm", "md"], color: "primary", rounded: true, class: "x" },
    ],
});

// --- multi-extends without overrides ---

const ex1 = vetka({
    variants: { size: { sm: "text-sm", md: "text-md" } },
});
const ex2 = vetka({
    variants: { color: { primary: "bg-blue" } },
});
const multiEx = vetka({
    extends: [ex1, ex2],
    variants: {},
});

multiEx({ size: "sm" });
multiEx({ color: "primary" });

const inherited = vetka({ extends: [ex1, ex2] });

inherited({ size: "md", color: "primary" });
// @ts-expect-error no parent declares `lg`
inherited({ size: "lg" });

// --- extends chain ---

const chained = vetka({
    extends: multi,
    variants: { tone: { muted: "opacity-50" } },
    defaultVariants: { size: "sm", color: "primary", tone: "muted" },
    compoundVariants: [
        { size: "lg", color: "primary", tone: "muted", class: "x" },
    ],
});

chained({ size: "md", color: "primary", tone: "muted" });
// @ts-expect-error not a declared tone
chained({ tone: "loud" });
// @ts-expect-error not declared anywhere in the chain
chained({ weight: "bold" });

// --- extends from a list built elsewhere (an array, not a tuple) ---

const parents = [p1, p2];
const fromList = vetka({ extends: parents });

fromList({ size: "sm", color: "primary" });
// @ts-expect-error not an option of any parent
fromList({ size: "xl" });

// --- extends accepts vetka functions only ---

const anyUtilities: Array<IAnyVetkaFn> = [
    sized,
    ext,
    nested,
    alert,
    multi,
    chained,
];

// Never called: these would throw at runtime, only their types are checked.
const compileOnly = () => {
    // @ts-expect-error a plain function is not a vetka function
    vetka({ extends: () => "x" });
    // @ts-expect-error neither is one inside the list
    vetka({ extends: [base, () => "x"] });
};

void anyUtilities;
void compileOnly;

// --- VariantPropsOf helper ---

type BtnProps = VariantPropsOf<typeof sized>;
const _propsCheck: BtnProps = { size: "sm" };

// @ts-expect-error invalid size
const _badProps: BtnProps = { size: "xl" };

type MultiProps = VariantPropsOf<typeof multi>;
const _multiProps: MultiProps = { size: "md", color: "primary", class: "x" };

void _propsCheck;
void _badProps;
void _multiProps;

describe("vetka type fixtures", () => {
    it("keeps runtime smoke for typed utilities", () => {
        expect(sized({ size: "sm" })).toContain("text-sm");
        expect(ext({ size: "sm" })).toContain("text-sm");
        expect(button({ intent: "primary" })).not.toContain("text-sm");
        expect(multi({ size: "sm", color: "primary" })).toBe("text-sm bg-blue");
        expect(multiEx({ size: "sm" })).toBe("text-sm");
        expect(chained()).toBe("text-sm bg-blue opacity-50");
        expect(fromList({ size: "sm", color: "primary" })).toBe(
            "text-sm bg-blue"
        );
        expect(nestedExt({ size: { sm: { p: "box" } } })).toContain("p-1");
    });
});
