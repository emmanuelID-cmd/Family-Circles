# Team Reference

## Family-Mo update

- Updated the profile layout to replace profile and friends-list photos with generic SVG avatar placeholders, and replaced specific mutual names with generic followed-by text.

## Purpose

Shared collaboration notes for Family-Circles. Keep this file useful to every
teammate by recording verified repository state and integration-relevant work.
After each push by any collaborator, append a timestamped entry describing
what was pushed since the previously recorded baseline.

## Current verified baseline

- Active branch: `Family-Manny`
- Local `HEAD` and `origin/Family-Manny`:
  `8a60ab2e23b4b52a509df8df2e72895c09334c6e`
- `main` and `origin/main`:
  `9cc6de76b1f33d5f95747c470b3a68eaa1b4955f`
- The local and remote branch pointers were checked after `git fetch origin`;
  this verifies commit synchronization, not the time of the push event.
- Local commits `b63aa78` and `7889401` add the supplied profile/navigation
  references and integrate the approved profile, search, and identity work.
  They are not pushed and are not part of either remote baseline above.
- Keep the separate local workspace file untracked. Do not treat these local
  commits as pushed; append a timestamped entry only after a verified push.

# Date and Timestamp of Push

## Push timestamp unverified — `main` baseline `9cc6de7`

- The remote push time for this baseline was not independently verified.
- The branch is synchronized with `origin/main` at the recorded commit.
- The local `docs/TEAM-REFERENCE-CHANGE.md` contains a detailed handoff from
  teammate baseline `c92fa38779b24f40d1eb1b152ef152511a5a290e` through this
  baseline. It is intentionally ignored by Git; preserve that local-only
  tracking behavior.
- No newer push is recorded here. Do not infer a push from uncommitted work.

## Push timestamp unverified — `Family-Manny` baseline `8a60ab2`

- The fetched `origin/Family-Manny` branch points to `8a60ab2`.
- The push event timestamp was not independently verified; do not substitute
  the commit timestamp.
- No newer push is recorded here. Do not infer a push from uncommitted work.

## Entry format for future pushes

Append one entry per verified push with:

- Timestamp in ISO 8601 with local UTC offset.
- Previous and resulting commit IDs and the pushed commit range.
- Commit subjects or a concise summary of the changes and affected behavior.
- Relevant files, validation results, and teammate integration notes.
- Any remaining limitations or follow-up needed.

If push time or remote state cannot be verified, label it unverified and say
which check is missing. Never claim local-only changes were pushed.
