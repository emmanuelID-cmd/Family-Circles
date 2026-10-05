# Team Reference

## 2026-10-01 — `Family-Mo` synchronization and Reels time-frame work

- Pulled `origin/Family-Mo` (already current), then merged the fetched `origin/main` updates into `Family-Mo` at `80df02f`. Resolved the App and Dashboard conflicts by retaining account-scoped profile support, safe profile routing, and generic avatars.
- `Family-Mo` feature commit `6a41e10` adds a synthetic Reels feed and an accessible time-frame slider with deterministic samples in all four approved duration bands. README and Phase 5/6 implementation notes were updated.
- The merge push (`7a8e9d6..80df02f`) and feature push (`80df02f..6a41e10`) both succeeded. Current verification timestamp: `2026-10-01T11:35:24-04:00`; this is not an independently measured GitHub push-event timestamp.
- Validation: production build and `git diff --check` passed. Build reports a non-blocking bundle-size advisory (>500 kB). Actual video, preview frames, interval gestures, and persistent playback speed are not implemented; the Reels samples use local still images and simulated time.
- `supabase/.DS_Store` remains untracked and was excluded.

## Family-Mo update

- Updated the profile layout to replace profile and friends-list photos with generic SVG avatar placeholders, and replaced specific mutual names with generic followed-by text.
- Added a standalone visited-user profile page with a dedicated route, generic avatar placeholders, profile stats, bio, Follow/Message actions, and back navigation. `src/Dashboard.jsx` remains untouched.

## Push verified — `Family-Mo` at `e51a2da`

- Verification timestamp: `2026-09-27T13:53:06-04:00`. The push command confirmed the remote update; this is the verification time, not an independently measured server-side push timestamp.
- Previous remote commit: `c92fa38779b24f40d1eb1b152ef152511a5a290e`.
- Resulting remote commit: `e51a2da` (`refactor: use generic profile and friend avatars`).
- Pushed range: `c92fa38..e51a2da`, including the latest `origin/main` changes and the Family-Mo avatar update.
- Updated `src/Dashboard.jsx`, `src/consistency.css`, and `src/styles.css` to use generic SVG silhouettes and followed-by copy. Owner-managed account names and handles remain visible in relationship lists so search and organization continue to work.
- Updated this team reference. `git diff --check` passed before the feature commit; no build or tests were run.

## Push verified — `Family-Mo` at `74a7212`

- Verification timestamp: `2026-09-28T07:33:35-04:00`. The push command confirmed the remote update; this is the verification time, not an independently measured server-side push timestamp.
- Previous remote commit: `67cc6d2`.
- Resulting remote commit: `74a7212` (`feat: add standalone visited user profile page`).
- Updated `src/App.jsx` with a separate `#/user/:username` route; added `src/pages/UserProfile.jsx` and its stylesheet. `src/Dashboard.jsx` was not modified.
- `npm run build` and `git diff --check` passed before the feature commit. No tests were run.

## Purpose

Shared collaboration notes for Family-Circles. Keep this file useful to every
teammate by recording verified repository state and integration-relevant work.
After each push by any collaborator, append a timestamped entry describing
what was pushed since the previously recorded baseline.

## Verified integration baseline (2026-10-03, after PR #12)

- Active integration branch: `feat/profile-reels-integration`; its profile,
  avatar upload/cropping, shared media-grid, and synthetic-profile Reels work
  was published through `eda118f`; its PR into main is next.
- At this baseline, `main` was `4f63bcd` and the three teammate branches were
  synchronized to its file tree after PR #12.
- PR #8 is merged into `main` as `80cec31`; PR #10 supplies the Reels
  expiration countdown and video-load fix at `18e8aac`. PRs #3 through #7
  and #9 also remain merged. PR #11 is merged into `main` at `6d8129f`.
- PR #3 is merged. The branch was rebuilt as a linear history preserving the
  three distinct feature commits; its file tree matched the pre-rebuild tree
  exactly (`08cc1b2de36bf173b42b43afb42785dac9192124`).
- Local recovery ref `recovery/Family-Manny-before-linear` retains the prior
  tip `9c34ea39394b4692f0de7c457c3bee29a113e1fa`.
- `Family-Circles.code-workspace`, reference images, and the
  `.branch-sync-20261001/Family-Crystal` snapshot were explicitly tracked in
  `cce8b18`; their later dependency-hygiene review remains separate.
- Shared back-arrow styling was published in `ccc0ef5`; the earlier
  position/alignment issue remains deferred unless separately verified.
- The local, ignored `docs/TEAM-REFERENCE-CHANGE.md` retains the detailed
  teammate handoff from baseline `c92fa38779b24f40d1eb1b152ef152511a5a290e`;
  preserve its local-only tracking policy.

# Date and Timestamp of Push

All push entries below are ordered by date and time in descending order: the
newest changes appear first, followed by progressively older entries.

## 2026-10-05T10:23:16-04:00

- Published `feat/complete-remaining-phases` from local baseline `58c68dc`
  through `72cb76d` (`58c68dc..72cb76d`); the remote-tracking ref matches
  the pushed branch. Added 38 deterministic synthetic previous-name cues,
  linked username/display-name identity on account and visited-profile views,
  and the ten-slide editable product presentation at
  `docs/presentations/output/Family-Circles-Product-Build-2026-10-05.pptx`.
- Merged current `main` (`28eb401`, profile Reels) into the feature branch
  without conflicts. The production build and all 51 automated tests passed
  after integration; the working tree was clean. No database or external
  platform integration changed. Timestamp is the local verification time.

## 2026-10-03T19:21:48-04:00

- Resynchronized `Family-Manny` (`3a4b277..4e5fdbb`), `Family-Crystal`
  (`912e7d7..0548310`), and `Family-Mo` (`18c99e1..5c75c3e`) after PR #12
  updated the shared Team Reference. Each branch merged the same `main`
  commit and preserved its prior history. Verified their trees match
  `main` at `4f63bcd`, as well as the integration branch. No application
  files changed.
- Timestamp is the local verification time, not an independently verified
  GitHub push-event timestamp.

## 2026-10-03T19:15:17-04:00

- Merged PR #11 into `main` as squash commit `6d8129f` after GitHub rejected
  merge-commit mode. Synchronized `Family-Manny` (`b289232..3a4b277`),
  `Family-Crystal` (`6e3065c..912e7d7`), and `Family-Mo`
  (`09bb766..18c99e1`) with merge commits from main. Verified that `main`, all
  three teammate branches, and `feat/profile-reels-integration` have identical
  file trees. No files were deleted or discarded.
- Also pushed the Team Reference follow-up on `feat/profile-reels-integration`
  (`eda118f..ca05416`).
- Timestamp is the local verification time, not an independently verified
  GitHub push-event timestamp.

## 2026-10-03T19:07:55-04:00

- Pushed `feat/profile-reels-integration` from `cce8b18` to `eda118f`
  (`cce8b18..eda118f`). This integrates the host/visited profile media grid,
  avatar upload and crop, synthetic-profile Reels, main's Reels expiration
  fix, and the preserved Manny, Crystal, and Mo commit histories. The tracked
  Crystal branch snapshot and reference assets remain included for the later
  dependency-hygiene review.
- Validation before push: 24 Node tests and production build passed; local
  browser checks covered profile routing, settings, mobile three-column grid,
  JPEG crop output, video playback/seeking, and countdown; no browser console
  errors. `git diff --check` reports pre-existing trailing whitespace in the
  imported archived HTML snapshot; no whitespace was changed in that snapshot.
- Timestamp is the local push verification time, not an independently
  verified GitHub push-event timestamp.

## 2026-10-01T15:58:24-04:00

- Atomically synchronized `Family-Manny` (`f87b3de..e9c6a5c`) and
  `Family-Crystal` (`ae03e80..6e3065c`) with `main` at `a600024`. The only
  merge conflict was in `docs/TEAM-REFERENCE.md`; both branches' push history
  was retained. GitHub confirmed both resulting branch refs. Validation:
  merge previews were clean except for that documented conflict, and
  `git diff --check` passed. No new application behavior was added.
- Timestamp is the local post-push verification time, not a GitHub push-event
  timestamp.

## 2026-10-01T12:01:20-04:00

- `Family-Manny`: `f17ac6b` → `e01ed9c` (`f17ac6b..e01ed9c`). Integrated
  `origin/main` at PR #7’s squash merge `ef83f14` and reconciled the Team
  Reference baseline and merge history. The only file conflict was in
  `docs/TEAM-REFERENCE.md`; its current baseline and prior push entries were
  combined. Validation: no conflict markers remained, the staged whitespace
  check passed, and the push succeeded. No application files changed.
- Timestamp is the local verification time, not an independently verified
  GitHub push-event timestamp.

## 2026-09-30T15:38:03-04:00

- `Family-Manny`: `ce70590` → `28be5b0` (`ce70590..28be5b0`). Reconciled
  `docs/TEAM-REFERENCE.md` with `origin/main` after PR #5’s squash merge so
  PR #7 could merge cleanly. No application behavior changed. Validation:
  conflict markers were removed, whitespace checks passed, and the push
  succeeded. PR #7 subsequently merged into `main` as `ef83f14`.
- Timestamp is the local verification time, not an independently verified
  GitHub push-event timestamp.

## 2026-10-01T08:27:15-04:00

- `Family-Crystal`: `625a078` → `9b9f765` (`625a078..9b9f765`). Pushed the
  Crystal Phase 1–2 managed-account name continuity foundation and Profile
  name editor in PR #9, covering the six approved implementation files.
  Validation included focused name-change tests, production build, whitespace
  and static checks, two local SECURITY rounds, local migration reapplication,
  authenticated local name-change/cooldown validation, and successful browser
  review. Hosted Supabase was not modified; no merge was performed.
- GitHub push-event metadata verified the timestamp and commit range.

## 2026-09-30T15:33:24-04:00

- `Family-Manny`: `812fada` → `864c837` (`812fada..864c837`). Added the
  temporary three-member team phase plan at
  `docs/TEAM-PHASE-PLAN-TEMP.md`, assigning Crystal to Circles Phases 1–4,
  Mo to Video Phases 5–10, and Family-Manny to integration. The document also
  records lightweight shared-file and URL coordination guidance without
  gating work that involves all contributors. Validation: tree was checked,
  only the requested document was committed, and the push to
  `origin/Family-Manny` succeeded. The intentionally untracked workspace file
  was excluded.
- Timestamp is the local verification time, not an independently verified
  GitHub push-event timestamp.

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
