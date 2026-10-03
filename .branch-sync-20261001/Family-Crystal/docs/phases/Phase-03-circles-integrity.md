# Phase 3 — Circles Integrity

## Scope

Verify and protect Circle membership, avatar association, and follow separation.

## Work

- Confirm memberships and avatars remain attached to stable IDs after name changes.
- Confirm Circle removal does not unfollow.
- Preserve multiple-circle membership, union behavior, and current account labels.
- Add focused tests for membership and follow independence.

## Acceptance criteria

- Removing a person from a Circle leaves the app-local follow state unchanged.
- Name changes preserve membership and avatar references.
- Untouched memberships remain unchanged during edits.

## Out of scope

- Real social-platform relationships, new feed infrastructure, availability rechecks, and paid capacity.

## Validation

Focused data tests and runtime checks on Circle editing and relationship confirmation flows.
