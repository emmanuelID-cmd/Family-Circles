# Phase 9 — Video Precision and Persistent Speed P2

## Scope

Implement approved P2 precision behavior after all timing and gesture decisions are resolved.

## Work

- Stationary slider hold reveals a shorter precision range.
- Add a return marker with distinct shape or label.
- Add frame-step hold acceleration.
- Add persistent speed choices from 0.25× through 3.00×.
- Preserve paused state when changing speed while paused.

## Acceptance criteria

- Expanded mode, dismissal, release behavior, marker lifetime, and acceleration match approved decisions.
- Saved speed persists at the approved profile/session scope.
- Playing right-hold temporarily uses 2× without changing the saved speed.
- Paused right-hold accelerates frame stepping instead.

## Out of scope

- Any unresolved behavior, unapproved speed scope, or real media integration.

## Validation

Unit, component, accessibility, and browser tests for all speed and precision states.
