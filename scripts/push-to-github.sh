#!/usr/bin/env bash
set -euo pipefail

# Pushes the current branch to GitHub using environment variables for credentials.
# Required env vars:
# - GITHUB_USERNAME: your GitHub username or org
# - GITHUB_REPO:     repository name
# - GITHUB_TOKEN:    a token with repo write access (e.g., classic token or PAT)
# Optional env vars:
# - GITHUB_REMOTE:   remote name to use (default: origin)
# - GIT_BRANCH:      branch to push (default: main)

REMOTE_NAME="${GITHUB_REMOTE:-origin}"
BRANCH_NAME="${GIT_BRANCH:-main}"

if [[ -z "${GITHUB_USERNAME:-}" || -z "${GITHUB_REPO:-}" || -z "${GITHUB_TOKEN:-}" ]]; then
  echo "GITHUB_USERNAME, GITHUB_REPO и GITHUB_TOKEN обязательны." >&2
  exit 1
fi

REMOTE_URL="https://${GITHUB_TOKEN}@github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"

if git remote get-url "$REMOTE_NAME" >/dev/null 2>&1; then
  git remote set-url "$REMOTE_NAME" "$REMOTE_URL"
else
  git remote add "$REMOTE_NAME" "$REMOTE_URL"
fi

git checkout -B "$BRANCH_NAME"
git push -u "$REMOTE_NAME" "$BRANCH_NAME"

echo "Пуш выполнен в ${GITHUB_USERNAME}/${GITHUB_REPO} (ветка ${BRANCH_NAME})."
