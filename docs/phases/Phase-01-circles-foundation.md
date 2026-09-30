# Phase 1 — Circles Foundation

## Scope

Implement stable account identity and temporary name metadata for app-controlled accounts.

## Work

- Add `temp_user_name`, `temp_screen_name`, and `name_changed_at` through a new migration.
- Preserve stable account IDs for memberships and avatar associations.
- Add data-layer update, cooldown, expiry, and lazy-cleanup behavior.
- Keep new-user temporary fields empty with no timestamp.

## Acceptance criteria

- Name changes do not create a new account identity.
- Both fields changed in one save share one timestamp and cooldown.
- No-op saves do not start or extend the cooldown.
- Expired temporary metadata is ignored or cleared on access.
- No searchable historical-name log is created.

## Out of scope

- Profile editing UI, availability UI, feed work, external platform integration, commits, and pushes.

## Validation

Focused data/helper tests and migration/static review. Do not commit until the phase is complete and explicitly approved.
