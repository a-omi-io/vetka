# vetka

Class variants with inheritance. Describe a component's class names as a base, variants, default variants and compound variants, then build new utilities on top of existing ones with `extends`.

```ts
import { vetka } from "vetka-variants";

const button = vetka({
    base: "font-semibold rounded",
    variants: { size: { sm: "text-sm px-2", md: "text-base px-4" } },
    defaultVariants: { size: "md" },
});

const primary = vetka({ extends: button, base: "bg-blue-500" });

button();
// "font-semibold rounded text-base px-4"

primary({ size: "sm" });
// "bg-blue-500 font-semibold rounded text-sm px-2"
```

The usage guide is in [`packages/vetka-variants`](packages/vetka-variants/README.md).

## Repository layout

A Yarn workspaces monorepo run by [Nx](https://nx.dev). The library is its only package:

- [`packages/vetka-variants`](packages/vetka-variants) — the `vetka-variants` package that is published to npm.

The root package, `vetka-monorepo`, is private. It holds the shared tooling: ESLint, Commitlint, Husky, and the CI and release workflows. Packages are built with `omi-io-pkg` from `@omi-io/pkg-scripts`.

## Development

Requires Node ≥ 20; `.nvmrc` has the version used for development. Yarn 4.1 is pinned through `packageManager` and `.yarn/releases`, so `corepack enable` is enough to get it.

```bash
corepack enable
yarn install
```

CI runs these checks on every pull request and on `main`:

```bash
yarn lint
yarn tsc-check
yarn test
yarn build
yarn test:ci-scripts   # BATS tests for scripts/ci
```

CI installs with `yarn install --immutable`, so commit `yarn.lock` whenever dependencies change.

Commit messages follow Conventional Commits with a mandatory scope, enforced by Commitlint: `variants` for the library, `root` for the repository itself, or `any`.

## Releasing

Push a branch named `release/vetka-variants/<x.y.z>`, for example `release/vetka-variants/1.0.0`. The release workflow builds the package, sets its version, writes the changelog and the GitHub release, publishes to npm with provenance, and pushes the release commit and the `vetka-variants@<x.y.z>` tag to `main`.

Publishing needs the `NPM_TOKEN` repository secret.

To debug the workflow locally with [act](https://github.com/nektos/act), pass your own event file; `.act-release-event.json` in the repo root is gitignored.
