# Phase 8 — Video Playback Controls P0

## Scope

Implement approved video-area controls, subject to the unresolved gesture decision gate.

## Work

- Playing: left/right interval skips, center pause, center hold no-op.
- Playing right-hold: temporary 2.00× and restore saved speed on release.
- Paused: left/right single-frame steps and center resume.
- Preserve paused state during frame stepping.

## Acceptance criteria

- Controls remain distinct from slider gestures.
- Temporary 2× does not overwrite saved speed.
- Paused frame steps are exactly one frame per tap.
- No unapproved threshold or double-tap precedence rule is invented.

## Out of scope

- P2 hold acceleration, Story completion, interval timing decisions, and unresolved Favorite conflict.

## Validation

Deterministic gesture tests and browser/device checks after product timing decisions are approved.
