# Team Reference

## Purpose

Shared collaboration notes for Family-Circles. Keep this file useful to every
teammate by recording verified repository state and integration-relevant work.
After each push by any collaborator, append a timestamped entry describing
what was pushed since the previously recorded baseline.

## Current verified baseline

- Active branch: `Family-Manny`
- The last verified published baseline is `b07dce82732f9d3fbde3345caa1721cd27c06212` on local `main`, `origin/main`, and `origin/Family-Manny`.
- Local `Family-Manny` has advanced beyond that baseline with unpushed work, including managed-profile feature commit `4c3f456`.
- PR #3 is merged. The branch was rebuilt as a linear history preserving the
  three distinct feature commits; its file tree matched the pre-rebuild tree
  exactly (`08cc1b2de36bf173b42b43afb42785dac9192124`).
- Local recovery ref `recovery/Family-Manny-before-linear` retains the prior
  tip `9c34ea39394b4692f0de7c457c3bee29a113e1fa`.
- `Family-Circles.code-workspace` remains an intentionally untracked local
  workspace file.
- The local, ignored `docs/TEAM-REFERENCE-CHANGE.md` retains the detailed
  teammate handoff from baseline `c92fa38779b24f40d1eb1b152ef152511a5a290e`;
  preserve its local-only tracking policy.

# Date and Timestamp of Push

## 2026-09-27T03:58:42-04:00

- `Family-Manny`: `8a60ab2` → `9c34ea3` (`8a60ab2..9c34ea3`). Published the
  profile/navigation references and implementation plus the initial ancestry
  integration; this opened PR #3. GitHub push-event metadata verified the
  timestamp.

## 2026-09-27T04:17:56-04:00

- `Family-Manny`: `9c34ea3` → `6fb869a`. Replaced the merge-containing history
  with three linear feature commits while preserving the exact file tree.
  Production build, focused search-parser check, and whitespace check passed;
  GitHub push-event metadata verified the timestamp.

## 2026-09-27T04:20:11-04:00

- `main`: `9cc6de7` → `b07dce8` through merged PR #3 after all PR checks passed.
  GitHub push-event metadata verified the timestamp.

## 2026-09-27T04:21:11-04:00

- `Family-Manny`: `6fb869a` → `b07dce8`, aligned to the merged `main` tip.
  Both local and remote branch refs now resolve to the same commit. GitHub
  push-event metadata verified the timestamp.

### Superseded baseline notes retained from the earlier handoff

- The previous handoff recorded the `main` baseline `9cc6de7` and
  `Family-Manny` baseline `8a60ab2` with push timestamps unverified. The
  current verified baseline and subsequent dated push records above supersede
  those status notes; the original event-time uncertainty is retained here
  rather than silently rewriting the earlier record.

## Entry format for future pushes

Append one entry per verified push with:

- Timestamp in ISO 8601 with local UTC offset.
- Previous and resulting commit IDs and the pushed commit range.
- Commit subjects or a concise summary of the changes and affected behavior.
- Relevant files, validation results, and teammate integration notes.
- Any remaining limitations or follow-up needed.

If push time or remote state cannot be verified, label it unverified and say
which check is missing. Never claim local-only changes were pushed.
