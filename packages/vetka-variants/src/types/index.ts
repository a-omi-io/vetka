/**
 * The types follow what the runtime does in `tools/` (merging, `extends`,
 * nested selection), so a change on either side needs the other to follow.
 *
 * Nested variants are typed recursively. Very deep trees can hit TypeScript's
 * instantiation limit; around 4–5 levels has been fine so far.
 */
export type * from "./compound";
export type * from "./config";
export type * from "./merge";
export type * from "./runtime";
export type * from "./schema";
export type * from "./selection";
