import clsx from "clsx";

import { toParentList } from "./toParentList";

import type { IAnyVetkaFn } from "../types";

export const getBaseClasses = (fn: IAnyVetkaFn, seen: Set<number>): string => {
    if (!fn || seen.has(fn._id)) return "";
    seen.add(fn._id);

    // Parents are walked last-to-first, so the last one listed ends up
    // closest to the child's own base.
    const parentClasses = toParentList(fn.config.extends)
        .slice()
        .reverse()
        .map(parent => getBaseClasses(parent, seen));

    return clsx(fn.config.base, ...parentClasses);
};
