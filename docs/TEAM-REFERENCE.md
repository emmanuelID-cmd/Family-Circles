# Team Reference

## Purpose

Shared collaboration notes for Family-Circles. Keep this file useful to every
teammate by recording verified repository state and integration-relevant work.
After each push by any collaborator, append a timestamped entry describing
what was pushed since the previously recorded baseline.

## Current verified baseline

- Active branch: `Family-Manny`
- The last verified published baseline is `e18d46602feebae69ff5bd5ab2ec959178e5bf06` on `origin/Family-Manny`.
- `main` is at `625a07806bbc90cbe1e54203999e97f4ca2cd19c`, advanced by PR #6 (`feat: add standalone visited user profile page`). PR #5 remains open for `Family-Manny` and GitHub currently reports it as mergeable; it has not been merged into `main`.
- PR #3 is merged. The branch was rebuilt as a linear history preserving the
  three distinct feature commits; its file tree matched the pre-rebuild tree
  exactly (`08cc1b2de36bf173b42b43afb42785dac9192124`).
- Local recovery ref `recovery/Family-Manny-before-linear` retains the prior
  tip `9c34ea39394b4692f0de7c457c3bee29a113e1fa`.
- `Family-Circles.code-workspace` remains an intentionally untracked local
  workspace file.
- Deferred back-arrow changes in `src/Dashboard.jsx` and `src/consistency.css`
  are local and have not been pushed.
- The local, ignored `docs/TEAM-REFERENCE-CHANGE.md` retains the detailed
  teammate handoff from baseline `c92fa38779b24f40d1eb1b152ef152511a5a290e`;
  preserve its local-only tracking policy.

# Date and Timestamp of Push

All push entries below are ordered by date and time in descending order: the
newest changes appear first, followed by progressively older entries.

## 2026-09-29T20:38:18-04:00

- `Family-Manny`: `faf9a58` → `e18d466` (`faf9a58..e18d466`). Merged the latest
  `main` commit `625a078` into the feature branch, preserving both the
  standalone visited-profile route and managed-profile behavior. A separate
  follow-up commit makes malformed profile-route encoding fail safely and
  adds focused tests. Validation: production build passed with a bundle-size
  advisory; all 11 focused tests passed; whitespace checks passed. PR #5 is
  open and GitHub reports it mergeable; no merge into `main` was performed.
- Timestamp is the local verification time, not an independently verified
  GitHub push-event timestamp.

## 2026-09-29T20:34:09-04:00

- `Family-Manny`: `f3ea129` → `faf9a58` (`f3ea129..faf9a58`). Pushed four
  committed changes: comma-separated Circle creation, clearing stale action
  errors on navigation, dated revised PRDs/evidence report, and refreshed
  branch/PR status documentation. The deferred back-arrow edits and local
  workspace file were excluded.
- Timestamp is the local verification time, not an independently verified
  GitHub push-event timestamp.

## 2026-09-28T06:42:18-04:00

- Branch and push: `Family-Manny`, `b07dce8` to `f3ea129` (`b07dce8..f3ea129`).
- Feature commit `4c3f456` adds app-level managed profiles: profile switching and account-scoped relationship/Circle data, with Supabase migrations for profile schema, security/indexes, and default profile provisioning. The UI and styling were updated in `src/App.jsx`, `src/Dashboard.jsx`, `src/consistency.css`, and `src/styles.css`; `src/lib/familyData.js` contains the associated data behavior. `README.md` and this reference document were also updated.
- Follow-up commit `f3ea129` refreshes the branch/push handoff in this document.
- Validation: production build passed; `git diff --check origin/main...HEAD` passed. Build emitted a bundle-size advisory (>500 kB), not a failure.
- Integration: PR #5 is open to `main`. No merge was performed, and no `Family-Mo` changes are included.
- Timestamp is the local verification time, not an independently verified GitHub push-event timestamp.

## 2026-09-27T04:21:11-04:00

- `Family-Manny`: `6fb869a` → `b07dce8`, aligned to the merged `main` tip.
  Both local and remote branch refs now resolve to the same commit. GitHub
  push-event metadata verified the timestamp.

## 2026-09-27T04:20:11-04:00

- `main`: `9cc6de7` → `b07dce8` through merged PR #3 after all PR checks passed.
  GitHub push-event metadata verified the timestamp.

## 2026-09-27T04:17:56-04:00

- `Family-Manny`: `9c34ea3` → `6fb869a`. Replaced the merge-containing history
  with three linear feature commits while preserving the exact file tree.
  Production build, focused search-parser check, and whitespace check passed;
  GitHub push-event metadata verified the timestamp.

## 2026-09-27T03:58:42-04:00

- `Family-Manny`: `8a60ab2` → `9c34ea3` (`8a60ab2..9c34ea3`). Published the
  profile/navigation references and implementation plus the initial ancestry
  integration; this opened PR #3. GitHub push-event metadata verified the
  timestamp.

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
