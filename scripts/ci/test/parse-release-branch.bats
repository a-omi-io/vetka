#!/usr/bin/env bats
# BATS tests for scripts/ci/parse-release-branch.sh

setup() {
  REPO_ROOT="$(cd "$(dirname "${BATS_TEST_FILENAME}")/../../.." && pwd)"
  TEST_TMPDIR="$(mktemp -d "${BATS_TEST_TMPDIR}/parse-release-branch.XXXXXX")"
  export GITHUB_OUTPUT="$(mktemp "${BATS_TEST_TMPDIR}/github-output.XXXXXX")"
  cd "$TEST_TMPDIR" || exit 1
}

teardown() {
  rm -rf "${TEST_TMPDIR:-}"
  rm -f "${GITHUB_OUTPUT:-}"
}

@test "fails when branch does not match release/<pkg>/<semver>" {
  mkdir -p packages/foo
  printf '%s\n' '{"name":"@scope/foo"}' >packages/foo/package.json

  run env GITHUB_REF_NAME=wrong/foo/1.0.0 MOCK_NX_PROJECTS=$'@scope/foo' \
    bash "$REPO_ROOT/scripts/ci/parse-release-branch.sh"
  [ "$status" -ne 0 ]
  [[ "$output" == *'Expected branch format'* ]]
}

@test "fails when package.json is missing" {
  run env GITHUB_REF_NAME=release/foo/1.0.0 MOCK_NX_PROJECTS=$'@scope/foo' \
    bash "$REPO_ROOT/scripts/ci/parse-release-branch.sh"
  [ "$status" -ne 0 ]
  [[ "$output" == *'Package manifest not found'* ]]
}

@test "fails when name is missing in package.json" {
  mkdir -p packages/foo
  printf '%s\n' '{}' >packages/foo/package.json

  run env GITHUB_REF_NAME=release/foo/1.0.0 MOCK_NX_PROJECTS=$'anything' \
    bash "$REPO_ROOT/scripts/ci/parse-release-branch.sh"
  [ "$status" -ne 0 ]
  [[ "$output" == *'Missing "name"'* ]]
}

@test "fails when project is not in Nx list" {
  mkdir -p packages/foo
  printf '%s\n' '{"name":"@scope/foo"}' >packages/foo/package.json

  run env GITHUB_REF_NAME=release/foo/1.0.0 MOCK_NX_PROJECTS=$'other-project' \
    bash "$REPO_ROOT/scripts/ci/parse-release-branch.sh"
  [ "$status" -ne 0 ]
  [[ "$output" == *'Nx project not found'* ]]
}

@test "writes expected GITHUB_OUTPUT lines" {
  mkdir -p packages/foo
  printf '%s\n' '{"name":"@scope/foo","scopeCommitName":"@:foo"}' >packages/foo/package.json

  run env GITHUB_REF_NAME=release/foo/2.3.4 MOCK_NX_PROJECTS=$'a\n@scope/foo\nb' \
    bash "$REPO_ROOT/scripts/ci/parse-release-branch.sh"
  [ "$status" -eq 0 ]

  run sort "$GITHUB_OUTPUT"
  [ "$status" -eq 0 ]
  [ "${lines[0]}" = 'pkg=foo' ]
  [ "${lines[1]}" = 'project=@scope/foo' ]
  [ "${lines[2]}" = 'scope_commit_name=@:foo' ]
  [ "${lines[3]}" = 'tag=@scope/foo@2.3.4' ]
  [ "${lines[4]}" = 'version=2.3.4' ]
}

@test "scope_commit_name falls back to name when scopeCommitName absent" {
  mkdir -p packages/foo
  printf '%s\n' '{"name":"@scope/foo"}' >packages/foo/package.json

  run env GITHUB_REF_NAME=release/foo/1.0.0 MOCK_NX_PROJECTS=$'@scope/foo' \
    bash "$REPO_ROOT/scripts/ci/parse-release-branch.sh"
  [ "$status" -eq 0 ]

  run grep '^scope_commit_name=' "$GITHUB_OUTPUT"
  [ "$status" -eq 0 ]
  [ "$output" = 'scope_commit_name=@scope/foo' ]
}
