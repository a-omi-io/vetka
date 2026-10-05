#!/usr/bin/env bash
# Parse GITHUB_REF_NAME (release/<pkg>/<semver>) into release metadata for workflows.
#
# Outputs (appended to $GITHUB_OUTPUT, GitHub Actions key=value format):
#   pkg, version, project, tag, scope_commit_name
#
# Optional for tests only:
#   MOCK_NX_PROJECTS — newline-separated project IDs to use instead of `yarn nx show projects`.

set -euo pipefail

if [[ -z "${GITHUB_OUTPUT:-}" ]]; then
  echo 'GITHUB_OUTPUT is not set (required for GitHub Actions output file)' >&2
  exit 1
fi

BRANCH="${GITHUB_REF_NAME:-}"
if [[ ! "${BRANCH}" =~ ^release/([^/]+)/([0-9]+\.[0-9]+\.[0-9]+)$ ]]; then
  echo 'Expected branch format: release/<pkg>/<x.y.z>'
  echo "Actual branch: ${BRANCH}"
  exit 1
fi

PKG="${BASH_REMATCH[1]}"
VERSION="${BASH_REMATCH[2]}"
PACKAGE_JSON_PATH="packages/${PKG}/package.json"

if [[ ! -f "${PACKAGE_JSON_PATH}" ]]; then
  echo "Package manifest not found at: ${PACKAGE_JSON_PATH}"
  exit 1
fi

# node -p prints the literal \"undefined\" when .name is absent; treat as empty.
PROJECT="$(
  node -p "const n=require('./${PACKAGE_JSON_PATH}').name;(n===undefined||n===null)?'':String(n)"
)"
if [[ -z "${PROJECT}" ]]; then
  echo "Missing \"name\" in ${PACKAGE_JSON_PATH}"
  exit 1
fi

# Use ${var+x} so this works on Bash 3.2 (macOS) as well as newer Bash.
if [[ -n "${MOCK_NX_PROJECTS+x}" ]]; then
  nx_projects="${MOCK_NX_PROJECTS}"
else
  nx_projects="$(yarn nx show projects)"
fi

if ! printf '%s\n' "${nx_projects}" | grep -Fx "${PROJECT}" >/dev/null; then
  echo "Nx project not found for package: ${PROJECT}"
  echo '(expected root package.json "name" to match an Nx project id)'
  exit 1
fi

SCOPE_COMMIT_NAME="$(node -p "const p=require('./${PACKAGE_JSON_PATH}'); p.scopeCommitName || p.name")"

echo "pkg=${PKG}" >>"${GITHUB_OUTPUT}"
echo "version=${VERSION}" >>"${GITHUB_OUTPUT}"
echo "project=${PROJECT}" >>"${GITHUB_OUTPUT}"
echo "tag=${PROJECT}@${VERSION}" >>"${GITHUB_OUTPUT}"
echo "scope_commit_name=${SCOPE_COMMIT_NAME}" >>"${GITHUB_OUTPUT}"
