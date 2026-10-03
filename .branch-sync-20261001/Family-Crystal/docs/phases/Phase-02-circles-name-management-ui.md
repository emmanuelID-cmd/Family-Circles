# Phase 2 — Circles Name Management UI

## Scope

Expose the approved app-controlled Display name and Username editing workflow.

## Work

- Add clearly labeled Display name and Username fields.
- Show the shared cooldown rule and next eligible date before saving.
- Show only the immediately previous changed value crossed out, privately.
- Add validation, loading, error, keyboard, and accessible feedback states.

## Acceptance criteria

- Users can distinguish the two fields.
- Cooldown guidance appears before a blocked or eligible save.
- The previous-value cue is private, temporary, and field-specific.
- A no-op save behaves as specified.

## Out of scope

- Availability states, feed construction, external naming rules, and historical-name search.

## Validation

Component tests and browser verification of eligible, blocked, changed, no-op, loading, and error states.
