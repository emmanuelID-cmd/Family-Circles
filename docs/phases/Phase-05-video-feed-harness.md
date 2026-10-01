# Phase 5 — Video Synthetic Feed Harness

## Scope

Create a synthetic Home feed used only to demonstrate the Video Time-Slider.

## Work

- Add a Home/feed surface using still images inside synthetic video windows.
- Support synthetic post, collage, live, and Story variants.
- Generate durations from the approved bands: 10–30, 31–60, 61–120, and 120–300 seconds.
- Label behavior as prototype-local; do not integrate a real social platform.

## Acceptance criteria

- Synthetic media can be opened in the video surface used by the slider.
- Duration metadata is deterministic or inspectably generated from the approved bands.
- Still-image media remains usable as a slider demonstration.
- Feed construction is separate from Circles availability and deactivation logic.

## Out of scope

- Real feed synchronization, real availability claims, external media, and unresolved long-video policy.

## Validation

Browser verification of each synthetic media type, duration band, loading, empty, and error state.

## Implementation progress — 2026-10-01

- Added a prototype-local Reels feed with post-video, collage, live-replay, and Circle Story samples. It is independent of Circle membership and availability state.
- The four deterministic durations are 26, 48, 96, and 180 seconds, covering each approved duration band. Local still-image assets are used; there is no real video or social-platform connection.
- The synthetic feed is available from the Reels bottom-navigation item. A separate Home feed is still out of scope for this implementation slice.
