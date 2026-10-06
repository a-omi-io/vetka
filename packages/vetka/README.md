# vetka

Class variants with inheritance. Describe a component's class names as a base, variants, default variants and compound variants, then build new utilities on top of existing ones with `extends`.

## Usage

```ts
import { vetka } from "vetka";

const button = vetka({
    base: "font-semibold rounded",
    variants: {
        size: { sm: "text-sm px-2", md: "text-base px-4" },
        disabled: { true: "opacity-50" },
    },
    defaultVariants: { size: "md" },
    compoundVariants: [
        { size: "sm", disabled: true, class: "cursor-not-allowed" },
    ],
});

button();
// "font-semibold rounded text-base px-4"

button({ size: "sm", disabled: true, class: "mt-2" });
// "font-semibold rounded text-sm px-2 opacity-50 cursor-not-allowed mt-2"
```

## Extending

`extends` takes one utility or a list of them. The child inherits their base classes, variants, defaults and compound variants, and can add its own on top.

```ts
const primary = vetka({
    extends: button,
    base: "bg-blue-500",
    variants: { size: { lg: "text-lg px-6" } },
    defaultVariants: { size: "lg" },
});

primary();
// "bg-blue-500 font-semibold rounded text-lg px-6"

primary({ size: "sm" });
// "bg-blue-500 font-semibold rounded text-sm px-2"
```

## Types

Variant names and values are inferred from the config and from everything it extends, so props, `defaultVariants` and `compoundVariants` are checked against the merged set.

```ts
import type { VariantPropsOf } from "vetka";

type PrimaryProps = VariantPropsOf<typeof primary>;
// size?: "sm" | "md" | "lg" | null; disabled?: boolean | null; class?: string; className?: string

primary({ size: "xl" });
// error: "xl" is not a size of `button` or `primary`
```
