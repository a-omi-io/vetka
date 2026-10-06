import { toParentList } from "./toParentList";

import type { IAnyVetkaFn } from "../types";

/** Flattens the `extends` tree, grandparents first, visiting each function once. */
export const getUniqueParents = (
    fns: Array<IAnyVetkaFn>,
    seen: Set<number>,
    result: Array<IAnyVetkaFn>
): Array<IAnyVetkaFn> => {
    fns.forEach(fn => {
        if (!fn || seen.has(fn._id)) return;

        getUniqueParents(toParentList(fn.config.extends), seen, result);

        // A shared ancestor may have been added while walking its own parents.
        if (!seen.has(fn._id)) {
            seen.add(fn._id);
            result.push(fn);
        }
    });
    return result;
};
