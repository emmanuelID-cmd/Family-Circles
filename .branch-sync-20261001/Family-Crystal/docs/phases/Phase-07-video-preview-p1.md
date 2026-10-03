# Phase 7 — Video Visual Preview P1

## Scope

Add synchronized visual previews while scrubbing.

## Work

- Render a preview frame synchronized to the selected timestamp.
- Keep timestamp and preview position aligned.
- Provide a fallback when preview frames cannot load.

## Acceptance criteria

- Preview updates during scrubbing without requiring full playback.
- Preview failures do not block normal playback or recovery.
- Preview access obeys media permissions.

## Out of scope

- P2 expanded timeline, marker lifecycle, and unresolved preview pipeline decisions.

## Validation

Browser verification across every approved surface and preview success/failure state.
