import type { IAnyVetkaConfig, IAnyVetkaFn } from "../types";

export const toParentList = (
    parents: IAnyVetkaConfig["extends"]
): Array<IAnyVetkaFn> => {
    if (Array.isArray(parents)) return parents;
    return parents ? [parents] : [];
};
