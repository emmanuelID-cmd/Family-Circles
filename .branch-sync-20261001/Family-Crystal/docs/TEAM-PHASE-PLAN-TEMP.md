# Family-Circles Temporary Team Phase Plan

**Status:** Temporary coordination document
**Application repository:** Family-Circles
**External instructions:** `C:\Users\Github\AGENTS` remains a separate repository and workspace.

## Team lanes

### Crystal — Circles phases 1–4

- **Branch:** `Family-Crystal`
- **Phases:**
  - Phase 1 — Circles Foundation
  - Phase 2 — Circles Name Management UI
  - Phase 3 — Circles Integrity
  - Phase 4 — Circles Verification
- **Lane ownership:** Stable account identity, temporary name metadata, name-management UI, membership/follow integrity, and Circles verification.
- **Boundary:** Keep Circles work separate from the synthetic video feed and Video Time-Slider implementation.

### Mo — Video phases 5–10

- **Branch:** `Family-Mo`
- **Phases:**
  - Phase 5 — Video Synthetic Feed Harness
  - Phase 6 — Video Time-Slider P0
  - Phase 7 — Video Visual Preview P1
  - Phase 8 — Video Playback Controls P0
  - Phase 9 — Video Precision and Persistent Speed P2
  - Phase 10 — Video Time-Slider Verification
- **Lane ownership:** Synthetic Home feed, still-image-backed synthetic video windows, slider behavior, previews, playback controls, precision controls, and Video verification.
- **Boundary:** Synthetic media is demonstration data only; do not claim real social-platform feed or media integration.

### Emmanuel — integration and seamless formation

- **Branch:** `Family-Manny`
- **Ownership:** Integration, conflict resolution, shared contracts, cross-lane compatibility, byte-identical formation where required, final regression review, and merge coordination.
- **Boundary:** Do not independently rewrite Crystal or Mo feature work. Integrate their completed branch changes while preserving approved PRD behavior and existing application conventions.

## Coordination rules

These rules are lightweight helpers, not mandatory approval gates.

1. Work in the assigned branch and keep changes inside the assigned phase lane whenever possible.
2. Before changing a shared file, check the current branch and Git status, then announce the file and intended scope to the team.
3. When a lane needs a new URL, route, fixture, media item, migration, configuration value, or shared contract, create a new file where practical instead of editing another teammate’s active file.
4. If a new file is not appropriate, request the file or contract from the integration owner before changing a shared implementation file. This is coordination guidance, not a blocking approval gate.
5. Prefer additive changes, stable names, and small focused commits so the integration branch can compare changes cleanly.
6. Do not rename, delete, or broadly reformat files owned by another lane.
7. Use explicit synthetic identifiers and deterministic fixtures for shared examples so both lanes can reproduce the same result.
8. Record unresolved decisions in the applicable phase file or PR description rather than silently choosing behavior.
9. Work that intentionally involves all three lanes is shared work. Do not impose lane gates or wait for one contributor’s phase approval before discussing, designing, or validating that shared work.
10. Integration may identify conflicts, compatibility issues, or required follow-up, but it should preserve each lane’s approved scope and avoid unrelated refactoring.
11. Do not modify the external AGENTS repository from the Family-Circles workspace.
12. Do not commit, push, merge, or create branches for another contributor’s lane without explicit authorization from the repository owner.

## Shared-file guidance

- `src/App.jsx`, `src/Dashboard.jsx`, `src/styles.css`, `src/consistency.css`, `src/lib/familyData.js`, and Supabase migrations are high-conflict surfaces.
- Prefer new focused modules/components under `src/` for video behavior and new focused helpers for Circles behavior.
- If a shared file must change, keep the diff narrow and document the integration point in the pull request.
- Do not duplicate routes, URL patterns, fixture identifiers, or persistence keys across lanes.

## Integration checklist

- Confirm both feature branches are pushed and their pull requests identify their phase scope.
- Compare changed files before merging; separate overlapping edits from unrelated work.
- Verify shared URL/route, data, media, and CSS contracts.
- Run focused tests and the production build.
- Verify that synthetic video behavior remains clearly separate from real social-platform integration.
- Perform final responsive, accessibility, loading, empty, error, and recovery checks.
- Record the final integration result in the active project’s `docs/TEAM-REFERENCE.md` after a verified push.

## Temporary-document note

This file is intended for team distribution during the split-work period. Keep it separate from the external AGENTS repository. Remove or archive it only after the team no longer needs the lane assignments and coordination rules.
