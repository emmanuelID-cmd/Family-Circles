# Phase 6 — Video Time-Slider P0

## Scope

Implement the reusable timeline and basic seeking behavior on approved video surfaces.

## Work

- Add touch, pointer, and keyboard slider interaction.
- Show selected timestamp and total duration.
- Seek and play from the selected position.
- Separate slider gestures from video-area gestures.
- Preserve permission, metadata, loading, error, and accessibility behavior.

## Acceptance criteria

- Every approved supported surface has consistent P0 slider behavior.
- Touch does not depend on hover.
- Invalid or missing duration is not presented as accurate.
- Unauthorized media does not expose previews or playback.

## Out of scope

- P1 previews, P2 precision mode, unresolved gesture thresholds, and unapproved surfaces.

## Validation

Unit/component tests plus browser checks for touch, pointer, keyboard, permission, metadata, loading, and error states.

## Implementation progress — 2026-10-01

- Added a native range timeline to each synthetic media viewer. It supports browser-provided pointer, touch, and keyboard input, shows the selected timestamp and total duration, and lets the user play or pause a local timing simulation from the selected position.
- Invalid duration values hide the slider and show an unavailable-duration fallback. If a local poster image fails, the fallback leaves the timeline usable.
- This demo uses still images and a simulated clock; it does not seek or play actual video. Visual frame previews, interval gestures, speed controls, and frame stepping remain in later phases or require unresolved product decisions.
- Production build passed. Touch, pointer, keyboard, and failure-state browser checks remain outstanding.
