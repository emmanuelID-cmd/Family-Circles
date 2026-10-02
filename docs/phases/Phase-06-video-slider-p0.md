# Phase 6 — Video Time-Slider P0

## Scope

Replace the native-only timeline in the Phase 5 synthetic profile Reels demo with the reusable P0 time slider, then apply it consistently to any additional video surfaces approved for this phase.

## Work

- Add touch, pointer, and keyboard slider interaction to the profile Reel video player.
- Show the selected timestamp and total duration; seek and allow playback from the selected position.
- Keep slider gestures distinct from the video-area tap/hold controls defined in the Video Time Slider PRD.
- Preserve applicable permissions, metadata, loading, error, and accessibility behavior.
- Keep supported media surfaces explicit; profile Reels is the initial confirmed demo surface, while any additional surfaces require confirmation before implementation.

## Acceptance criteria

- The confirmed profile Reels surface has consistent P0 slider behavior; any other approved supported surface uses the same implementation.
- Touch does not depend on hover.
- Invalid or missing duration is not presented as accurate.
- Unauthorized media does not expose previews or playback.

## Out of scope

- P1 previews, P2 precision mode, unresolved gesture thresholds, and unapproved surfaces.

## Validation

- Unit/component tests plus browser checks for touch, pointer, keyboard, selected-time seeking, playback, permission, metadata, loading, and error states. Validate separately on each surface included in the phase.

## Implementation progress — 2026-10-01

- The standalone Reels demo uses a native range input to seek real bundled MP4 files; duration and position come from video metadata and playback events.
- Visited-profile Reels currently use the browser's native video controls. A shared custom P0 slider has not yet been integrated on that profile surface.
- No frame previews, video-area interval gestures, persistent speed options, or frame stepping are implemented here. Touch emulation was reported as working by the user; this audit has not independently runtime-verified it.
- The production build previously passed. Re-run build and focused checks after this integration before treating it as verified.
