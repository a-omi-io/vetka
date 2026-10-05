#!/usr/bin/env bats
# Guards release settings whose correct value depends on an Nx default that has
# already changed once.

setup() {
  REPO_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/../../.." && pwd)"
}

@test "nx.json pins updateDependents to never" {
  # Nx 22 changed the default for release.version.updateDependents to "always"
  # (nx/dist/src/command-line/release/config/config.js: `?? 'always'`), which
  # patch-bumps and commits every dependent when one project is released. The
  # release/<pkg>/<semver> workflow publishes exactly one project, so the cascade
  # would push versions that were never published. Pin it explicitly.
  cd "$REPO_ROOT"
  run node -p "require('./nx.json').release.version.updateDependents"
  [ "$status" -eq 0 ]
  [ "$output" = "never" ]
}
